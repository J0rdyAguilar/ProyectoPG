<?php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class VerificarRol
{
    public function handle(Request $request, Closure $next, ...$rolesPermitidos)
    {
        $usuario = Auth::user();

        if (!$usuario || !in_array($usuario->rol_id, $rolesPermitidos)) {
            return response()->json(['message' => 'Acceso denegado'], 403);
        }

        return $next($request);
    }
}

