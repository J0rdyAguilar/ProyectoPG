<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Puesto;

class PuestoController extends Controller
{
    public function index()
    {
        return Puesto::where('ESTADO', 1)->with('dependencia')->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'nombre' => 'required|string|max:100',
            'descripcion' => 'nullable|string',
            'dependencia_id' => 'required|exists:dependencias,id',
            'USUARIO_INGRESO' => 'nullable|integer',
        ]);

        $data['ESTADO'] = 1;
        $data['FECHA_INGRESO'] = now();

        $puesto = Puesto::create($data);
        return response()->json($puesto, 201);
    }

    public function desactivar($id)
    {
        $puesto = Puesto::findOrFail($id);
        $puesto->ESTADO = 0;
        $puesto->FECHA_MODIFICA = now();
        $puesto->USUARIO_MODIFICA = 1; // puedes cambiarlo si usas auth
        $puesto->save();

        return response()->json(['mensaje' => 'Puesto desactivado'], 200);
    }
}
    