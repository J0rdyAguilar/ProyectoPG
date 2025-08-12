<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Empleado;
use App\Models\Puesto;
use App\Models\Dependencia;

class DashboardController extends Controller
{
    public function index()
    {
        // Ejemplo de KPIs reales (ajusta según tu BD)
        $kpis = [
            'profit'      => 82373.21, // Puedes calcular ventas o presupuesto
            'orders'      => 7234,     // Ejemplo: total registros de alguna tabla
            'impressions' => "3.1M",   // Métrica ficticia
            'targetPct'   => 75        // % de meta
        ];

        // Ejemplo gráfico mensual
        $chart = [
            ['m' => 'Jan', 'v' => 320],
            ['m' => 'Feb', 'v' => 290],
            ['m' => 'Mar', 'v' => 360],
            ['m' => 'Apr', 'v' => 340],
            ['m' => 'May', 'v' => 450],
            ['m' => 'Jun', 'v' => 380],
            ['m' => 'Jul', 'v' => 600],
        ];

        // Productos o métricas top (puedes poner top puestos, top dependencias, etc.)
        $products = [
            ['name' => 'Maneki Neko Poster', 'sold' => 1249, 'change' => +15.2],
            ['name' => 'Echoes Necklace',    'sold' => 1145, 'change' => +13.9],
            ['name' => 'Spiky Ring',         'sold' => 1073, 'change' => +9.5],
            ['name' => 'Pastel Petals Poster','sold' => 1022,'change' => +2.3],
        ];

        return response()->json([
            'kpis'     => $kpis,
            'chart'    => $chart,
            'products' => $products,
        ]);
    }
}
