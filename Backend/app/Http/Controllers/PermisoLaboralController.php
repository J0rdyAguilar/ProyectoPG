<?php

namespace App\Http\Controllers;

use App\Models\PermisoLaboral;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Exception;

class PermisoLaboralController extends Controller
{
    public function index(Request $request)
    {
        try {
            $query = PermisoLaboral::with(['empleado', 'aprobador']);

            if ($request->filled('empleado_id')) {
                $query->where('empleado_id', $request->empleado_id);
            }

            if ($request->has('estado') && $request->estado !== '') {
                $query->where('ESTADO', (int) $request->estado);
            }


            if ($request->filled('buscar')) {
                $query->where('motivo', 'like', '%'.$request->buscar.'%');
            }

            $permisos = $query->orderByDesc('id')->paginate(15);

            return response()->json($permisos);
        } catch (Exception $e) {
            Log::error('Error al obtener permisos laborales: ' . $e->getMessage());
            return response()->json(['message' => 'Ocurrió un error en el servidor.'], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            // Validación
            $request->validate([
                'empleado_id' => 'required|exists:empleados,id',
                'motivo' => 'required|string',
                'fecha_inicio' => 'required|date',
                'fecha_fin' => 'nullable|date|after_or_equal:fecha_inicio',
            ]);

            // Obtener usuario autenticado
            $user = auth()->user();
            if (!$user) {
                return response()->json(['error' => 'Usuario no autenticado'], 401);
            }

            // Crear permiso
            $permiso = new PermisoLaboral();
            $permiso->empleado_id = $request->empleado_id;
            $permiso->motivo = $request->motivo;
            $permiso->fecha_inicio = $request->fecha_inicio;
            $permiso->fecha_fin = $request->fecha_fin;
            $permiso->estado = 1;
            $permiso->aprobado_por_jefe = 0;
            $permiso->validado_por_rrhh = 0;
            $permiso->usuario_ingreso = $user->id;
            $permiso->fecha_ingreso = now();
            $permiso->save();

            return response()->json(['mensaje' => 'Permiso creado'], 201);
        } catch (\Throwable $e) {
            return response()->json([
                'error' => 'Ocurrió un error',
                'mensaje' => $e->getMessage(),
                'linea' => $e->getLine()
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            $permiso = PermisoLaboral::with(['empleado', 'aprobador'])->findOrFail($id);
            return response()->json($permiso);
        } catch (ModelNotFoundException $e) {
            return response()->json(['message' => 'Permiso laboral no encontrado.'], 404);
        } catch (Exception $e) {
            Log::error("Error al obtener el permiso laboral $id: " . $e->getMessage());
            return response()->json(['message' => 'Ocurrió un error en el servidor.'], 500);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $permiso = PermisoLaboral::findOrFail($id);

            $validatedData = $request->validate([
                'motivo'        => 'required|string|max:255',
                'fecha_inicio'  => 'required|date',
                'fecha_fin'     => 'required|date|after_or_equal:fecha_inicio',
                'aprobado_por'  => 'nullable|exists:usuarios,id',
            ]);

            $dataToUpdate = array_merge($validatedData, [
                'USUARIO_MODIFICA' => Auth::id(),
                'FECHA_MODIFICA'   => now(),
            ]);

            $permiso->update($dataToUpdate);

            return response()->json($permiso);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Error de validación',
                'errors'  => $e->errors()
            ], 422);
        } catch (Exception $e) {
            Log::error("Error al actualizar el permiso laboral $id: " . $e->getMessage());
            return response()->json(['message' => 'Ocurrió un error al actualizar el permiso.'], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $permiso = PermisoLaboral::findOrFail($id);

            // 🔴 IMPORTANTE: actualizar ESTADO (mayúsculas)
            $permiso->update([
                'ESTADO'           => 0,
                'USUARIO_MODIFICA' => Auth::id(),
                'FECHA_MODIFICA'   => now(),
            ]);

            return response()->json(['message' => 'Permiso laboral desactivado correctamente.']);
        } catch (ModelNotFoundException $e) {
            return response()->json(['message' => 'Permiso laboral no encontrado.'], 404);
        } catch (Exception $e) {
            Log::error("Error al desactivar el permiso laboral $id: " . $e->getMessage());
            return response()->json(['message' => 'Ocurrió un error al desactivar el permiso.'], 500);
        }
    }

    public function aprobar($id)
    {
        try {
            $usuario = Auth::user();

            // Solo rol 2 = jefe inmediato
            if ($usuario->rol_id != 2) {
                return response()->json(['message' => 'No autorizado'], 403);
            }

            $permiso = PermisoLaboral::findOrFail($id);

            if ($permiso->aprobado_por_jefe) {
                return response()->json(['message' => 'Ya fue aprobado por jefe.'], 400);
            }

            // Marcar como aprobado por jefe
            $permiso->aprobado_por_jefe = 1;
            $permiso->fecha_aprobacion_jefe = now();
            $permiso->save();

            return response()->json(['message' => 'Permiso aprobado correctamente.']);
        } catch (\Exception $e) {
            \Log::error("Error al aprobar permiso: " . $e->getMessage());
            return response()->json(['message' => 'Error al aprobar permiso.'], 500);
        }
}

    public function validar($id)
    {
        try {
            $usuario = Auth::user();

            // Solo RRHH (rol 1) puede validar
            if ($usuario->rol_id != 1) {
                return response()->json(['message' => 'No autorizado'], 403);
            }

            $permiso = PermisoLaboral::findOrFail($id);

            // Ya validado
            if ($permiso->validado_por_rrhh) {
                return response()->json(['message' => 'Este permiso ya fue validado.'], 400);
            }

            // Aún no aprobado por jefe inmediato
            if (!$permiso->aprobado_por_jefe) {
                return response()->json(['message' => 'Este permiso aún no ha sido aprobado por el jefe inmediato.'], 400);
            }

            // Marcar como validado
            $permiso->validado_por_rrhh = 1;
            $permiso->fecha_validacion_rrhh = now();
            $permiso->save();

            return response()->json(['message' => 'Permiso validado correctamente.']);
        } catch (\Exception $e) {
            \Log::error("Error al validar permiso: " . $e->getMessage());
            return response()->json([
                'message' => 'Error al validar permiso.',
                'error' => $e->getMessage() // Mostrar detalle
            ], 500);
        }
    }

}
