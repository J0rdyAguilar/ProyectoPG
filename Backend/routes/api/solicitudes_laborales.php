<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\SolicitudLaboralController;

Route::get('/solicitudes-laborales', [SolicitudLaboralController::class, 'index']);
Route::post('/solicitudes-laborales', [SolicitudLaboralController::class, 'store']);
Route::put('/solicitudes-laborales/{id}', [SolicitudLaboralController::class, 'update']);
Route::put('/solicitudes-laborales/{id}/desactivar', [SolicitudLaboralController::class, 'desactivar']);
Route::put('/solicitudes-laborales/{id}/aprobar', [SolicitudLaboralController::class, 'aprobar']);
Route::put('/solicitudes-laborales/{id}/validar', [SolicitudLaboralController::class, 'validar']);
