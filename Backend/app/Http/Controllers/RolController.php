<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Rol;

class RolController extends Controller
{
    public function index()
    {
        return Rol::where('ESTADO', 1)->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'nombre' => 'required|string|max:100',
            'descripcion' => 'nullable|string',
            'USUARIO_INGRESO' => 'nullable|integer',
        ]);

        $data['ESTADO'] = 1;
        $data['FECHA_INGRESO'] = now();

        $rol = Rol::create($data);
        return response()->json($rol, 201);
    }

    public function desactivar($id)
    {
        $rol = Rol::findOrFail($id);
        $rol->ESTADO = 0;
        $rol->FECHA_MODIFICA = now();
        $rol->USUARIO_MODIFICA = 1;
        $rol->save();

        return response()->json(['mensaje' => 'Rol desactivado'], 200);
    }
}