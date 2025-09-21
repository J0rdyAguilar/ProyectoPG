<?php

namespace App\Http\Controllers;

use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'usuario' => 'required|string',
            'contrasena' => 'required|string',
        ]);

        $usuario = Usuario::where('usuario', $request->usuario)
            ->where('ESTADO', 1)
            ->first();

        if (!$usuario || !Hash::check($request->contrasena, $usuario->contrasena)) {
            return response()->json(['error' => 'Credenciales inválidas'], 401);
        }

        $token = $usuario->createToken('auth_token')->plainTextToken;

        // Carga la información del rol para la respuesta inicial del login
        $usuario->load('rol');

        return response()->json([
            'token' => $token,
            'usuario' => [
                'id' => $usuario->id,
                'usuario' => $usuario->usuario,
                'rol_id' => $usuario->rol_id,
                'rol_nombre' => $usuario->rol->nombre ?? null,
            ]
        ]);
    }

    /**
     * ✅ MÉTODO MEJORADO
     * Este método ahora carga todas las relaciones necesarias para la página de perfil.
     */
    public function perfil(Request $request)
    {
        // Obtiene el usuario autenticado
        $usuario = $request->user();

        // Carga las relaciones del rol y también las del empleado (puesto y dependencia)
        $usuario->load('rol', 'empleado.puesto', 'empleado.dependencia');

        // Devuelve el objeto de usuario completo con toda la información anidada
        return response()->json($usuario);
    }

    public function logout(Request $request)
    {
        $request->user()->tokens()->delete();
        return response()->json(['mensaje' => 'Sesión cerrada']);
    }
}
