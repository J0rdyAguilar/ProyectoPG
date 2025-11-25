<?php

namespace App\Http\Controllers;

use App\Http\Requests\ContratoRequest;
use App\Models\Contrato;
use App\Models\Empleado; // Asegúrate de que esta línea esté presente
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Pagination\LengthAwarePaginator;

class ContratoController extends Controller
{
    /**
     * Listar contratos (filtrado por rol, empleado, estado y búsqueda)
     */
    public function index(Request $request)
    {
        try {
            /** @var \App\Models\Usuario $usuario */
            $usuario = Auth::user()->load('empleado');
            $rolId = $usuario->rol_id;

            $q = Contrato::with('empleado')->orderByDesc('id');

            // --- INICIO: LÓGICA DE ROLES MEJORADA ---
            if ($rolId == 2) { // Jefe Inmediato
                if ($usuario->empleado) {
                    $subordinadosIds = Empleado::where('id_jefe', $usuario->empleado->id)
                        ->where('ESTADO', 1)
                        ->pluck('id');
                    $subordinadosIds->push($usuario->empleado->id);
                    $q->whereIn('empleado_id', $subordinadosIds);
                } else {
                    // Si el jefe no tiene un registro de empleado, la consulta no devolverá resultados.
                    $q->whereRaw('1 = 0');
                }
            } elseif ($rolId != 1) { // Usuario Común y otros roles (no RRHH)
                if ($usuario->empleado) {
                    $q->where('empleado_id', $usuario->empleado->id);
                } else {
                    // Si el usuario no tiene un registro de empleado, la consulta no devolverá resultados.
                    $q->whereRaw('1 = 0');
                }
            }
            // RRHH (rolId == 1) no necesita filtro, ve todo.
            // --- FIN: LÓGICA DE ROLES ---

            // Filtro por empleado (solo para RRHH)
            if ($rolId == 1 && $request->filled('empleado_id')) {
                $q->where('empleado_id', $request->empleado_id);
            }

            // Filtro por estado
            if ($request->filled('estado')) {
                $q->where('ESTADO', (int) $request->estado);
            }

            // Barra de búsqueda
            if ($request->filled('search')) {
                $search = $request->search;
                $q->where(function ($query) use ($search) {
                    $searchTerm = '%' . $search . '%';
                    $query->where('tipo_contrato', 'like', $searchTerm)
                        ->orWhere('plantilla', 'like', $searchTerm);
                    $query->orWhereHas('empleado', function ($subQuery) use ($searchTerm) {
                        $subQuery->where('nombres', 'like', $searchTerm)
                            ->orWhere('apellidos', 'like', $searchTerm);
                    });
                });
            }

            $perPage = $request->get('per_page', 15);
            $contratos = $q->paginate($perPage);

            return response()->json($contratos);
        } catch (\Exception $e) {
            Log::error('Error al listar contratos: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error al obtener los contratos',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mostrar un contrato específico con seguridad de roles
     */
    public function show(Contrato $contrato)
    {
        try {
            /** @var \App\Models\Usuario $usuario */
            $usuario = Auth::user()->load('empleado');
            $rolId = $usuario->rol_id;

            $canView = false;

            if ($rolId == 1) { // RRHH puede ver cualquier contrato
                $canView = true;
            } elseif ($rolId == 2 && $usuario->empleado) { // Jefe puede ver el suyo o el de sus subordinados
                $isOwnContract = $contrato->empleado_id == $usuario->empleado->id;
                $isSubordinateContract = Empleado::where('id_jefe', $usuario->empleado->id)
                    ->where('id', $contrato->empleado_id)
                    ->exists();
                if ($isOwnContract || $isSubordinateContract) {
                    $canView = true;
                }
            } else { // Usuario Común solo puede ver el suyo
                if ($usuario->empleado && $contrato->empleado_id == $usuario->empleado->id) {
                    $canView = true;
                }
            }

            if (!$canView) {
                return response()->json(['message' => 'No autorizado para ver este contrato.'], 403);
            }

            return response()->json($contrato->load('empleado'));
        } catch (\Exception $e) {
            Log::error('Error al mostrar contrato: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error al obtener el contrato',
                'error' => $e->getMessage()
            ], 500);
        }
    }


    /**
     * Crear contrato nuevo
     */
    public function store(ContratoRequest $request)
    {
        try {
            $userId = Auth::id() ?? 0;

            return DB::transaction(function () use ($request, $userId) {
                $path = null;
                
                if ($request->hasFile('archivo')) {
                    $file = $request->file('archivo');
                    $path = $file->store('contratos', 'public');
                }

                $contrato = Contrato::create([
                    'empleado_id'     => $request->empleado_id,
                    'tipo_contrato'   => $request->tipo_contrato,
                    'fecha_inicio'    => $request->fecha_inicio,
                    'fecha_fin'       => $request->fecha_fin,
                    'plantilla'       => $request->plantilla,
                    'archivo_url'     => $path ? ('storage/' . $path) : null,
                    'ESTADO'          => $request->boolean('ESTADO', true),
                    'USUARIO_INGRESO' => $userId,
                    'FECHA_INGRESO'   => now(),
                ]);

                $contrato->load('empleado');

                return response()->json([
                    'message' => 'Contrato creado exitosamente',
                    'contrato' => $contrato
                ], 201);
            });
        } catch (\Exception $e) {
            Log::error('Error al crear contrato: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error al crear el contrato',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Actualizar contrato existente
     */
    public function update(ContratoRequest $request, Contrato $contrato)
    {
        try {
            $validatedData = $request->validated();
            $userId = Auth::id() ?? 0;

            return DB::transaction(function () use ($validatedData, $contrato, $userId, $request) {
                if ($request->hasFile('archivo')) {
                    if ($contrato->archivo_url) {
                        $relativePath = str_replace('storage/', '', $contrato->archivo_url);
                        if (Storage::disk('public')->exists($relativePath)) {
                            Storage::disk('public')->delete($relativePath);
                        }
                    }
                    $path = $request->file('archivo')->store('contratos', 'public');
                    $validatedData['archivo_url'] = 'storage/' . $path;
                }

                $validatedData['USUARIO_MODIFICA'] = $userId;
                $validatedData['FECHA_MODIFICA'] = now();
                $contrato->update($validatedData);
                $contrato->load('empleado');

                return response()->json([
                    'message' => 'Contrato actualizado exitosamente',
                    'contrato' => $contrato
                ]);
            });
        } catch (\Exception $e) {
            Log::error('Error al actualizar contrato: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error al actualizar el contrato',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Eliminar contrato
     */
    public function destroy(Contrato $contrato)
    {
        try {
            return DB::transaction(function () use ($contrato) {
                if ($contrato->archivo_url) {
                    $relative = str_replace('storage/', '', $contrato->archivo_url);
                    if (Storage::disk('public')->exists($relative)) {
                        Storage::disk('public')->delete($relative);
                    }
                }
                $contrato->delete();
                return response()->json(['message' => 'Contrato eliminado exitosamente']);
            });
        } catch (\Exception $e) {
            Log::error('Error al eliminar contrato: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error al eliminar el contrato',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Cambiar estado
     */
    public function cambiarEstado(Request $request, Contrato $contrato)
    {
        try {
            $request->validate(['ESTADO' => ['required', 'boolean']]);
            $contrato->ESTADO = $request->boolean('ESTADO');
            $contrato->USUARIO_MODIFICA = Auth::id() ?? 0;
            $contrato->FECHA_MODIFICA   = now();
            $contrato->save();

            return response()->json([
                'message' => 'Estado actualizado exitosamente',
                'contrato' => $contrato
            ]);
        } catch (\Exception $e) {
            Log::error('Error al cambiar estado del contrato: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error al cambiar el estado del contrato',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Descargar archivo
     */
    public function download(Contrato $contrato)
    {
        try {
            if (!$contrato->archivo_url) {
                return response()->json(['message' => 'Este contrato no tiene archivo asociado'], 404);
            }

            $relative = str_replace('storage/', '', $contrato->archivo_url);
            if (!Storage::disk('public')->exists($relative)) {
                return response()->json(['message' => 'El archivo del contrato no fue encontrado'], 404);
            }

            $filePath = storage_path('app/public/' . $relative);
            $fileName = 'contrato_' . $contrato->id . '_' . basename($relative);

            return response()->download($filePath, $fileName, [
                'Content-Type' => 'application/pdf',
            ]);
        } catch (\Exception $e) {
            \Log::error('Error al descargar archivo del contrato: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error al descargar el archivo',
                'error' => $e->getMessage()
            ], 500);
        }
    }


    /**
     * Obtener estadísticas
     */
    public function estadisticas()
    {
        try {
            $stats = [
                'total' => Contrato::count(),
                'activos' => Contrato::where('ESTADO', true)->count(), // Corregido aquí
                'inactivos' => Contrato::where('ESTADO', false)->count(),
                'por_vencer' => Contrato::where('ESTADO', true)
                    ->whereNotNull('fecha_fin')
                    ->where('fecha_fin', '<=', now()->addDays(30))
                    ->where('fecha_fin', '>=', now())
                    ->count(),
                'vencidos' => Contrato::where('ESTADO', true)
                    ->whereNotNull('fecha_fin')
                    ->where('fecha_fin', '<', now())
                    ->count()
            ];
            return response()->json($stats);
        } catch (\Exception $e) {
            Log::error('Error al obtener estadísticas de contratos: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error al obtener las estadísticas',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Renovar contrato
     */
    public function renovar(Request $request, Contrato $contrato)
    {
        try {
            $request->validate([
                'fecha_inicio' => ['required', 'date'],
                'fecha_fin' => ['nullable', 'date', 'after:fecha_inicio'],
                'tipo_contrato' => ['nullable', 'string', 'max:255']
            ]);
            $userId = Auth::id() ?? 0;
            return DB::transaction(function () use ($request, $contrato, $userId) {
                $contrato->ESTADO = false;
                $contrato->USUARIO_MODIFICA = $userId;
                $contrato->FECHA_MODIFICA = now();
                $contrato->save();

                $nuevoContrato = Contrato::create([
                    'empleado_id'     => $contrato->empleado_id,
                    'tipo_contrato'   => $request->tipo_contrato ?? $contrato->tipo_contrato,
                    'fecha_inicio'    => $request->fecha_inicio,
                    'fecha_fin'       => $request->fecha_fin,
                    'plantilla'       => $contrato->plantilla,
                    'archivo_url'     => null,
                    'ESTADO'          => true,
                    'USUARIO_INGRESO' => $userId,
                    'FECHA_INGRESO'   => now(),
                ]);
                $nuevoContrato->load('empleado');
                return response()->json([
                    'message' => 'Contrato renovado exitosamente',
                    'contrato_anterior' => $contrato,
                    'contrato_nuevo' => $nuevoContrato
                ]);
            });
        } catch (\Exception $e) {
            Log::error('Error al renovar contrato: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error al renovar el contrato',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}