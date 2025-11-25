<?php

namespace App\Http\Controllers;

use App\Models\Sancion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class SancionController extends Controller
{
    // LISTAR SOLAMENTE ACTIVOS
    public function index()
    {
        return Sancion::with('empleado')
            ->where('ESTADO', 1)
            ->get();
    }

    // LISTAR TODOS (ACTIVOS + INACTIVOS) - opcional
    public function all()
    {
        return Sancion::with('empleado')->get();
    }

    // CREAR SANCIÓN
    public function store(Request $request)
    {
        $request->validate([
            'empleado_id' => 'required|integer',
            'nombre' => 'required|string|max:100',
            'descripcion' => 'nullable|string',
        ]);

        $sancion = Sancion::create([
            'empleado_id' => $request->empleado_id,
            'nombre' => $request->nombre,
            'descripcion' => $request->descripcion,
            'ESTADO' => 1,

            'USUARIO_INGRESO' => Auth::id(),
            'FECHA_INGRESO' => Carbon::now(),
        ]);

        return response()->json($sancion, 201);
    }

    // ACTUALIZAR
    public function update(Request $request, $id)
    {
        $request->validate([
            'empleado_id' => 'required|integer',
            'nombre' => 'required|string|max:100',
            'descripcion' => 'nullable|string',
            'ESTADO' => 'nullable|boolean',
        ]);

        $sancion = Sancion::findOrFail($id);

        $sancion->update([
            'empleado_id' => $request->empleado_id,
            'nombre' => $request->nombre,
            'descripcion' => $request->descripcion,
            'ESTADO' => $request->ESTADO ?? $sancion->ESTADO,

            'USUARIO_MODIFICA' => Auth::id(),
            'FECHA_MODIFICA' => Carbon::now(),
        ]);

        return response()->json($sancion);
    }

    // ELIMINACIÓN LÓGICA (ESTADO = 0)
    public function destroy($id)
    {
        $sancion = Sancion::findOrFail($id);

        $sancion->update([
            'ESTADO' => 0,
            'USUARIO_MODIFICA' => Auth::id(),
            'FECHA_MODIFICA' => Carbon::now(),
        ]);

        return response()->json(['message' => 'Sanción desactivada (ESTADO = 0)']);
    }
}
