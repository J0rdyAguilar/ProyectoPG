<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\SancionController;

Route::get('/sanciones', [SancionController::class, 'index']);
Route::post('/sanciones', [SancionController::class, 'store']);
Route::get('/sanciones/{id}', [SancionController::class, 'show']);
Route::put('/sanciones/{id}', [SancionController::class, 'update']);
Route::put('/sanciones/{id}/desactivar', [SancionController::class, 'desactivar']);
