<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\EmpleadoController;

Route::get('/empleados', [EmpleadoController::class, 'index']);
Route::post('/empleados', [EmpleadoController::class, 'store']);
Route::get('/empleados/{id}', [EmpleadoController::class, 'show']);
Route::put('/empleados/{id}', [EmpleadoController::class, 'update']);
Route::put('/empleados/{id}/desactivar', [EmpleadoController::class, 'desactivar']);

// Jerarquía
Route::get('/empleados/{id}/subordinados', [EmpleadoController::class, 'subordinados']);
Route::get('/posibles-jefes/{empleadoId?}', [EmpleadoController::class, 'posiblesJefes']);
