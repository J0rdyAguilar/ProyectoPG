<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;

Route::post('/login', [AuthController::class, 'login']);

Route::get('/perfil', [AuthController::class, 'perfil']);
Route::post('/logout', [AuthController::class, 'logout']);
