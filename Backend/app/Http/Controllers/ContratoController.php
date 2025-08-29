<?php

namespace App\Http\Controllers;

use App\Http\Requests\ContratoRequest;
use App\Models\Contrato;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class ContratoController extends Controller
{
    /**
     * Listar contratos (todos o filtrados)
     */
    public function index(Request $request)
    {
        try {
            $q = Contrato::with('empleado')->orderByDesc('id');

            // Filtro por empleado
            if ($request->filled('empleado_id')) {
                $q->where('empleado_id', $request->empleado_id);
            }

            // Filtro por estado
            if ($request->filled('estado')) {
                $q->where('ESTADO', (int) $request->estado);
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
     * Mostrar un contrato específico
     */
    public function show(Contrato $contrato)
    {
        try {
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
                
                // Subir archivo si se envió
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
     * Actualizar contrato existente (Versión mejorada)
     */
    public function update(ContratoRequest $request, Contrato $contrato)
    {
        try {
            // El ContratoRequest ya validó los datos, ahora los obtenemos de forma segura.
            $validatedData = $request->validated();
            
            $userId = Auth::id() ?? 0;

            // Usamos una transacción para asegurar la integridad de los datos.
            return DB::transaction(function () use ($validatedData, $contrato, $userId, $request) {
                
                // 1. Manejar el archivo si se envió uno nuevo
                if ($request->hasFile('archivo')) {
                    // Eliminar archivo anterior si existe
                    if ($contrato->archivo_url) {
                        $relativePath = str_replace('storage/', '', $contrato->archivo_url);
                        if (Storage::disk('public')->exists($relativePath)) {
                            Storage::disk('public')->delete($relativePath);
                        }
                    }

                    // Subir el nuevo archivo y añadir la ruta a los datos validados
                    $path = $request->file('archivo')->store('contratos', 'public');
                    $validatedData['archivo_url'] = 'storage/' . $path;
                }

                // 2. Añadir los campos de auditoría
                $validatedData['USUARIO_MODIFICA'] = $userId;
                $validatedData['FECHA_MODIFICA'] = now();

                // 3. Actualizar el modelo con todos los datos validados de una sola vez
                $contrato->update($validatedData);

                // Cargar la relación empleado para la respuesta
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
     * Eliminar contrato (soft delete si está configurado)
     */
    public function destroy(Contrato $contrato)
    {
        try {
            return DB::transaction(function () use ($contrato) {
                // Eliminar archivo asociado si existe
                if ($contrato->archivo_url) {
                    $relative = str_replace('storage/', '', $contrato->archivo_url);
                    if (Storage::disk('public')->exists($relative)) {
                        Storage::disk('public')->delete($relative);
                    }
                }

                $contrato->delete();

                return response()->json([
                    'message' => 'Contrato eliminado exitosamente'
                ]);
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
     * Cambiar estado (activar/desactivar)
     */
    public function cambiarEstado(Request $request, Contrato $contrato)
    {
        try {
            $request->validate([
                'ESTADO' => ['required', 'boolean']
            ]);

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
     * Descargar archivo del contrato
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

            return response()->download($filePath, $fileName);
        } catch (\Exception $e) {
            Log::error('Error al descargar archivo del contrato: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error al descargar el archivo',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener estadísticas de contratos
     */
    public function estadisticas()
    {
        try {
            $stats = [
                'total' => Contrato::count(),
                'activos' => Contrato::where('ESTADO', true)->count(),
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
     * Renovar contrato (crear uno nuevo basado en uno existente)
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
                // Desactivar contrato anterior
                $contrato->ESTADO = false;
                $contrato->USUARIO_MODIFICA = $userId;
                $contrato->FECHA_MODIFICA = now();
                $contrato->save();

                // Crear nuevo contrato
                $nuevoContrato = Contrato::create([
                    'empleado_id'     => $contrato->empleado_id,
                    'tipo_contrato'   => $request->tipo_contrato ?? $contrato->tipo_contrato,
                    'fecha_inicio'    => $request->fecha_inicio,
                    'fecha_fin'       => $request->fecha_fin,
                    'plantilla'       => $contrato->plantilla,
                    'archivo_url'     => null, // Requerirá nuevo archivo
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
