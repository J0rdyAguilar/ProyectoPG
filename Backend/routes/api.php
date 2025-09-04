<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\DependenciaController;
use App\Http\Controllers\PuestoController;
use App\Http\Controllers\RolController;
use App\Http\Controllers\EmpleadoController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ContratoController;
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
    
    // Nuevas rutas para jerarquía de empleados
    Route::get('/empleados/{id}/subordinados', [EmpleadoController::class, 'subordinados']);
    Route::get('/posibles-jefes/{empleadoId?}', [EmpleadoController::class, 'posiblesJefes']);

    // -------------------------------
    // Contratos
    // -------------------------------
    Route::get('/contratos', [ContratoController::class, 'index']);                // listar (opcional: ?empleado_id=&estado=)
    Route::post('/contratos', [ContratoController::class, 'store']);               // crear (con archivo)
    Route::get('/contratos/{contrato}', [ContratoController::class, 'show']);      // ver detalle
    Route::put('/contratos/{contrato}', [ContratoController::class, 'update']);    // actualizar (archivo opcional)
    Route::post('/contratos/{contrato}', [ContratoController::class, 'update']); 

    // Activar/Desactivar (manteniendo tu estilo "desactivar")
    Route::put('/contratos/{contrato}/estado', [ContratoController::class, 'cambiarEstado']); // body: { "ESTADO": true|false }
    Route::put('/contratos/{contrato}/desactivar', function (\Illuminate\Http\Request $r, \App\Models\Contrato $contrato) {
        $r->merge(['ESTADO' => false]);
        return app(ContratoController::class)->cambiarEstado($r, $contrato);
    });

    // Descargar archivo del contrato
    Route::get('/contratos/{contrato}/download', [ContratoController::class, 'download']);


    Route::middleware('auth:sanctum')->get('/dashboard', [DashboardController::class, 'index']);



    //dashboard
    Route::get('/dashboard', [DashboardController::class, 'index']);


    });