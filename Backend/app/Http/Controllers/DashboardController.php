<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        // Totales simples
        $totales = [
            'empleados'  => DB::table('empleados')->count(),
            'activos'    => DB::table('empleados')->where('ESTADO', 1)->count(),
            'inactivos'  => DB::table('empleados')->where('ESTADO', 0)->count(),
        ];

        // Por dependencia
        $porDependencia = DB::table('empleados as e')
            ->join('dependencias as d', 'd.id', '=', 'e.dependencia_id')
            ->select('d.id', 'd.nombre as dependencia', DB::raw('COUNT(*) as total'))
            ->groupBy('d.id', 'd.nombre')
            ->orderByDesc('total')
            ->get();

        // Por puesto
        $porPuesto = DB::table('empleados as e')
            ->join('puestos as p', 'p.id', '=', 'e.puesto_id')
            ->select('p.id', 'p.nombre as puesto', DB::raw('COUNT(*) as total'))
            ->groupBy('p.id', 'p.nombre')
            ->orderByDesc('total')
            ->get();

        return response()->json([
            'totales'        => $totales,
            'por_dependencia'=> $porDependencia,
            'por_puesto'     => $porPuesto,
        ]);
    }
}
