<?php

use Illuminate\Support\Facades\Route;

// Ruta de prueba
Route::get('/test', fn () => response()->json(['mensaje' => 'Funciona']));

// Login público
require __DIR__.'/api/auth.php';

// Rutas protegidas
Route::middleware('auth:sanctum')->group(function () {

    require __DIR__.'/api/dependencias.php';
    require __DIR__.'/api/puestos.php';
    require __DIR__.'/api/roles.php';
    require __DIR__.'/api/empleados.php';
    require __DIR__.'/api/contratos.php';
    require __DIR__.'/api/sanciones.php';
    require __DIR__.'/api/solicitudes_laborales.php';
    require __DIR__.'/api/dashboard.php';

});
