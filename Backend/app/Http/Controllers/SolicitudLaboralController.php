<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\SolicitudLaboral;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Exception;

class SolicitudLaboralController extends Controller
{
    // ✅ Listar con filtros y paginación
    public function index(Request $request)
    {
        $query = SolicitudLaboral::with(['empleado', 'aprobador', 'validador']);

        if ($request->has('tipo')) {
            $query->where('tipo', $request->tipo);
        }

        if ($request->has('estado')) {
            $query->where('ESTADO', $request->estado);
        }

        if ($request->has('empleado_id')) {
            $query->where('empleado_id', $request->empleado_id);
        }

        if ($request->has('buscar')) {
            $buscar = $request->buscar;
            $query->where('motivo', 'like', "%$buscar%");
        }

        $solicitudes = $query->orderBy('id', 'desc')->paginate(10);
        return response()->json($solicitudes);
    }

    // ✅ Crear nueva solicitud (arranca como pendiente)
    public function store(Request $request)
    {
        try {
            $usuario = Auth::user();

            $solicitud = SolicitudLaboral::create([
                'empleado_id'      => $request->empleado_id,
                'tipo'             => $request->tipo,
                'motivo'           => $request->motivo,
                'fecha_inicio'     => $request->fecha_inicio,
                'fecha_fin'        => $request->fecha_fin,
                'dias_disfrutados' => $request->dias_disfrutados,
                'tipo_licencia'    => $request->tipo_licencia,
                'documento_url'    => $request->documento_url,
                'observaciones'    => $request->observaciones,
                'ESTADO'           => 1, // 👈 Siempre inicia como pendiente
                'USUARIO_INGRESO'  => $usuario->id,
                'FECHA_INGRESO'    => now(),
            ]);

            return response()->json([
                'message' => 'Solicitud registrada correctamente.',
                'data'    => $solicitud
            ]);
        } catch (Exception $e) {
            Log::error("Error al crear solicitud laboral: " . $e->getMessage());
            return response()->json(['message' => 'Error al registrar solicitud.'], 500);
        }
    }

    // ✅ Actualizar solicitud
    public function update(Request $request, $id)
    {
        try {
            $usuario = Auth::user();
            $solicitud = SolicitudLaboral::findOrFail($id);

            $solicitud->update([
                'motivo'           => $request->motivo,
                'fecha_inicio'     => $request->fecha_inicio,
                'fecha_fin'        => $request->fecha_fin,
                'dias_disfrutados' => $request->dias_disfrutados,
                'tipo_licencia'    => $request->tipo_licencia,
                'documento_url'    => $request->documento_url,
                'observaciones'    => $request->observaciones,
                'USUARIO_MODIFICA' => $usuario->id,
                'FECHA_MODIFICA'   => now(),
            ]);

            return response()->json(['message' => 'Solicitud actualizada correctamente.']);
        } catch (Exception $e) {
            Log::error("Error al actualizar solicitud laboral: " . $e->getMessage());
            return response()->json(['message' => 'Error al actualizar.'], 500);
        }
    }

    // ✅ Desactivar solicitud
    public function desactivar($id)
    {
        try {
            $solicitud = SolicitudLaboral::findOrFail($id);
            $solicitud->ESTADO = 0;
            $solicitud->save();

            return response()->json(['message' => 'Solicitud desactivada.']);
        } catch (Exception $e) {
            Log::error("Error al desactivar solicitud: " . $e->getMessage());
            return response()->json(['message' => 'Error al desactivar.'], 500);
        }
    }

    // ✅ Aprobación por Jefe inmediato
    public function aprobar($id)
    {
        try {
            $usuario = Auth::user();
            // rol_id = 2 → Jefe inmediato
            if ($usuario->rol_id != 2) {
                return response()->json(['message' => 'No autorizado'], 403);
            }

            $solicitud = SolicitudLaboral::findOrFail($id);
            if ($solicitud->aprobado_por) {
                return response()->json(['message' => 'Ya fue aprobada.'], 400);
            }

            $solicitud->aprobado_por = $usuario->id;
            $solicitud->fecha_aprobado = now();
            $solicitud->save();

            return response()->json([
                'message' => 'Solicitud aprobada correctamente.',
                'data'    => $solicitud
            ]);
        } catch (Exception $e) {
            Log::error("Error al aprobar solicitud: " . $e->getMessage());
            return response()->json(['message' => 'Error al aprobar solicitud.'], 500);
        }
    }

    // ✅ Validación por RRHH (y activar)
    public function validar($id)
    {
        try {
            $usuario = Auth::user();
            // rol_id = 1 → RRHH
            if ($usuario->rol_id != 1) {
                return response()->json(['message' => 'No autorizado'], 403);
            }

            $solicitud = SolicitudLaboral::findOrFail($id);
            if (!$solicitud->aprobado_por) {
                return response()->json(['message' => 'Debe aprobarse antes.'], 400);
            }
            if ($solicitud->validado_por) {
                return response()->json(['message' => 'Ya fue validada.'], 400);
            }

            $solicitud->validado_por = $usuario->id;
            $solicitud->fecha_validado = now();
            $solicitud->ESTADO = 1; // 👈 Se activa al validar
            $solicitud->save();

            return response()->json([
                'message' => 'Solicitud validada correctamente.',
                'data'    => $solicitud
            ]);
        } catch (Exception $e) {
            Log::error("Error al validar solicitud: " . $e->getMessage());
            return response()->json(['message' => 'Error al validar solicitud.'], 500);
        }
    }
}
