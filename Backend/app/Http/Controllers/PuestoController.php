<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Puesto;

class PuestoController extends Controller
{
    /**
     * Muestra una lista de Puestos.
     * Si se provee ?dependencia_id=X en la URL, filtra por esa dependencia.
     */
    public function index(Request $request)
    {
        // Iniciamos una consulta base para obtener solo puestos activos y su dependencia
        $query = Puesto::where('ESTADO', 1)->with('dependencia');

        // Verificamos si la petición URL incluye el parámetro 'dependencia_id'
        if ($request->has('dependencia_id')) {
            
            // Validamos que el ID sea un entero válido y exista en la tabla dependencias
            $request->validate([
                'dependencia_id' => 'required|integer|exists:dependencias,id'
            ]);
            
            // Si existe, añadimos el filtro a nuestra consulta
            $query->where('dependencia_id', $request->dependencia_id);
        }

        // Ejecutamos la consulta (con o sin el filtro) y devolvemos los resultados
        return $query->get();
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