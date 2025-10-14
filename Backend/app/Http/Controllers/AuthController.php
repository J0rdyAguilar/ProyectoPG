<?php

namespace App\Http\Controllers;

use App\Models\Usuario;
use App\Models\Empleado;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'usuario'     => 'required|string',
            'contrasena'  => 'required|string',
        ]);

        $usuario = Usuario::where('usuario', $request->usuario)
            ->where('ESTADO', 1)
            ->with('rol') // para traer rol en la misma consulta
            ->first();

        if (!$usuario || !Hash::check($request->contrasena, $usuario->contrasena)) {
            return response()->json(['error' => 'Credenciales inválidas'], 401);
        }

        $token = $usuario->createToken('auth_token')->plainTextToken;

        // Buscar el empleado vinculado
        $empleado = Empleado::with(['puesto:id,nombre', 'dependencia:id,nombre', 'jefe:id,nombre,apellido'])
            ->where('usuario_id', $usuario->id)
            ->first();

        return response()->json([
            'token'    => $token,
            'usuario'  => [
                'id'         => $usuario->id,
                'usuario'    => $usuario->usuario,
                'rol_id'     => $usuario->rol_id,
                'rol_nombre' => $usuario->rol->nombre ?? null,
            ],
            'empleado' => $empleado
        ]);
    }

    /**
     * Perfil del usuario autenticado
     */
    public function perfil(Request $request)
    {
        $usuario = $request->user();
        $usuario->load('rol', 'empleado.puesto', 'empleado.dependencia', 'empleado.jefe');

        return response()->json($usuario);
    }

    /**
     * Logout: elimina todos los tokens activos del usuario
     */
    public function logout(Request $request)
    {
        $request->user()->tokens()->delete();
        return response()->json(['mensaje' => 'Sesión cerrada']);
    }
}
