<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Dependencia;

class DependenciaController extends Controller
{
    public function index()
    {
        // Retorna solo las activas
        return Dependencia::where('ESTADO', 1)->get();
    }

    public function store(Request $request)
    {
        // Validación básica
        $data = $request->validate([
            'nombre' => 'required|string|max:100',
            'descripcion' => 'nullable|string',
            'USUARIO_INGRESO' => 'nullable|integer',
        ]);

        $data['ESTADO'] = 1;
        $data['FECHA_INGRESO'] = now();

        $dependencia = Dependencia::create($data);

        return response()->json($dependencia, 201);
    }

    public function desactivar($id)
    {
        $dependencia = Dependencia::findOrFail($id);
        $dependencia->ESTADO = 0;
        $dependencia->FECHA_MODIFICA = now();
        $dependencia->USUARIO_MODIFICA = 1; // si usas auth, cámbialo dinámicamente
        $dependencia->save();

        return response()->json(['mensaje' => 'Dependencia desactivada'], 200);
    }

    public function show($id)
    {
    try {
        $dependencia = \App\Models\Dependencia::findOrFail($id);
        return response()->json($dependencia);
        } catch (\Exception $e) {
        \Log::error("Error al obtener dependencia: " . $e->getMessage());
        return response()->json(['message' => 'Dependencia no encontrada'], 404);
         }
    }

}
