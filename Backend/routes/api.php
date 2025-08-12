<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\DependenciaController;
use App\Http\Controllers\PuestoController;
use App\Http\Controllers\RolController;
use App\Http\Controllers\EmpleadoController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\UsuarioController;


// -------------------------------
// Ruta de prueba
// -------------------------------
Route::get('/test', function () {
    return response()->json(['mensaje' => 'Funciona']);
});

// -------------------------------
// Login token (público)
// -------------------------------
Route::post('/login', [AuthController::class, 'login']);

// -------------------------------
// Rutas protegidas con Sanctum
// -------------------------------
Route::middleware('auth:sanctum')->group(function () {

    // -------------------------------
    // Perfil y logout
    // -------------------------------
    Route::get('/perfil', [AuthController::class, 'perfil']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // -------------------------------
    // Dependencias
    // -------------------------------
    Route::get('/dependencias', [DependenciaController::class, 'index']);
    Route::post('/dependencias', [DependenciaController::class, 'store']);
    Route::put('/dependencias/{id}/desactivar', [DependenciaController::class, 'desactivar']);

    // -------------------------------
    // Puestos
    // -------------------------------
    Route::get('/puestos', [PuestoController::class, 'index']);
    Route::post('/puestos', [PuestoController::class, 'store']);
    Route::put('/puestos/{id}/desactivar', [PuestoController::class, 'desactivar']);

    // -------------------------------
    // Roles
    // -------------------------------
    Route::get('/roles', [RolController::class, 'index']);
    Route::post('/roles', [RolController::class, 'store']);
    Route::put('/roles/{id}/desactivar', [RolController::class, 'desactivar']);

    // -------------------------------
    // Empleados
    // -------------------------------
    Route::get('/empleados', [EmpleadoController::class, 'index']);
    Route::post('/empleados', [EmpleadoController::class, 'store']);
    Route::put('/empleados/{id}', [EmpleadoController::class, 'update']);
    Route::get('/empleados/{id}', [EmpleadoController::class, 'show']);
    Route::put('/empleados/{id}/desactivar', [EmpleadoController::class, 'desactivar']);

    // -------------------------------
    // Usuarios
    // -------------------------------
    /*Route::get('/usuarios', [UsuarioController::class, 'index']);
    Route::post('/usuarios', [UsuarioController::class, 'store']);
    Route::put('/usuarios/{id}/desactivar', [UsuarioController::class, 'desactivar']);
    */

    Route::middleware('auth:sanctum')->get('/dashboard', [DashboardController::class, 'index']);

    });
