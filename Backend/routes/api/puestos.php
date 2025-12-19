<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PuestoController;

Route::get('/puestos', [PuestoController::class, 'index']);
Route::post('/puestos', [PuestoController::class, 'store']);
Route::put('/puestos/{id}/desactivar', [PuestoController::class, 'desactivar']);
