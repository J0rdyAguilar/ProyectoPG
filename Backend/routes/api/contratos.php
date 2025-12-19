<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ContratoController;
use App\Models\Contrato;
use Illuminate\Http\Request;

// CRUD
Route::get('/contratos', [ContratoController::class, 'index']);
Route::post('/contratos', [ContratoController::class, 'store']);
Route::get('/contratos/{contrato}', [ContratoController::class, 'show']);
Route::put('/contratos/{contrato}', [ContratoController::class, 'update']);
Route::post('/contratos/{contrato}', [ContratoController::class, 'update']);

// Estado
Route::put('/contratos/{contrato}/estado', [ContratoController::class, 'cambiarEstado']);

Route::put('/contratos/{contrato}/desactivar', function (Request $r, Contrato $contrato) {
    $r->merge(['ESTADO' => false]);
    return app(ContratoController::class)->cambiarEstado($r, $contrato);
});

// Descargar
Route::get('/contratos/{contrato}/download', [ContratoController::class, 'download']);
