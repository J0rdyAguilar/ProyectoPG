<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DependenciaController;

Route::get('/dependencias', [DependenciaController::class, 'index']);
Route::post('/dependencias', [DependenciaController::class, 'store']);
Route::get('/dependencias/{id}', [DependenciaController::class, 'show']);
Route::put('/dependencias/{id}/desactivar', [DependenciaController::class, 'desactivar']);
