<?php

namespace App\Http\Controllers;

use App\Models\Empleado;
use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class EmpleadoController extends Controller
{
    /**
     * Listado para la tabla (respuesta aplanada)
     */
    public function index()
    {
        $empleados = Empleado::where('ESTADO', 1)
            ->with([
                'dependencia:id,nombre',
                'puesto:id,nombre',
                'usuario.rol:id,nombre',
            ])
            ->get();

        // Aplanar a forma amigable para tabla
        return $empleados->map(function ($e) {
            return [
                'id'                    => $e->id,
                'nombre'                => $e->nombre,
                'apellido'              => $e->apellido,
                'numero_identificacion' => $e->numero_identificacion,
                'numero_celular'        => $e->numero_celular,
                'direccion'             => $e->direccion,
                'dependencia'           => optional($e->dependencia)->nombre,
                'puesto'                => optional($e->puesto)->nombre,
                'rol'                   => optional(optional($e->usuario)->rol)->nombre,
            ];
        });
    }

    /**
     * Mostrar un empleado (con relaciones completas)
     */
    public function show($id)
    {
        $empleado = Empleado::with(['dependencia', 'puesto', 'usuario.rol'])->find($id);

        if (!$empleado) {
            return response()->json(['error' => 'Empleado no encontrado'], 404);
        }

        return response()->json($empleado);
    }

    /**
     * Crear usuario + empleado (transacción)
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            // Datos del empleado
            'nombre'                 => 'required|string|max:100',
            'apellido'               => 'required|string|max:100',
            'numero_identificacion'  => 'required|string|max:50|unique:empleados',
            'fecha_nacimiento'       => 'required|date',
            'numero_celular'         => 'required',
            'direccion'              => 'required|string',
            'dependencia_id'         => 'required|exists:dependencias,id',
            'puesto_id'              => 'required|exists:puestos,id',
            'USUARIO_INGRESO'        => 'nullable|integer',

            // Datos del usuario
            'usuario.nombre'         => 'required|string|max:100',
            'usuario.usuario'        => [
                'required','string','max:50',
                Rule::unique('usuarios', 'usuario'),
            ],
            'usuario.contrasena'     => 'required|string|min:6',
            'usuario.rol_id'         => 'required|exists:roles,id',
        ]);

        try {
            $result = DB::transaction(function () use ($validated) {
                // 1) Usuario
                $nuevoUsuario = Usuario::create([
                    'nombre'          => $validated['usuario']['nombre'],
                    'usuario'         => $validated['usuario']['usuario'],
                    'contrasena'      => Hash::make($validated['usuario']['contrasena']),
                    'rol_id'          => $validated['usuario']['rol_id'],
                    'ESTADO'          => 1,
                    'USUARIO_INGRESO' => $validated['USUARIO_INGRESO'] ?? null,
                    'FECHA_INGRESO'   => now(),
                ]);

                // 2) Empleado
                $empleado = Empleado::create([
                    'nombre'                => $validated['nombre'],
                    'apellido'              => $validated['apellido'],
                    'numero_identificacion' => $validated['numero_identificacion'],
                    'fecha_nacimiento'      => $validated['fecha_nacimiento'],
                    'numero_celular'        => $validated['numero_celular'],
                    'direccion'             => $validated['direccion'],
                    'usuario_id'            => $nuevoUsuario->id,
                    'dependencia_id'        => $validated['dependencia_id'],
                    'puesto_id'             => $validated['puesto_id'],
                    'ESTADO'                => 1,
                    'USUARIO_INGRESO'       => $validated['USUARIO_INGRESO'] ?? null,
                    'FECHA_INGRESO'         => now(),
                ]);

                return [$nuevoUsuario, $empleado];
            });

            [$nuevoUsuario, $empleado] = $result;

            return response()->json([
                'usuario'  => $nuevoUsuario,
                'empleado' => $empleado,
            ], 201);
        } catch (\Throwable $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Actualizar empleado (y opcionalmente el rol del usuario)
     * Devuelve el mismo formato aplanado que index()
     */
    public function update(Request $request, $id)
    {
        $empleado = Empleado::with('usuario')->findOrFail($id);

        $validated = $request->validate([
            'nombre'                 => 'required|string|max:100',
            'apellido'               => 'required|string|max:100',
            'numero_identificacion'  => [
                'required','string','max:50',
                Rule::unique('empleados','numero_identificacion')->ignore($empleado->id),
            ],
            'fecha_nacimiento'       => 'required|date',
            'numero_celular'         => 'required',
            'direccion'              => 'required|string',
            'dependencia_id'         => 'required|exists:dependencias,id',
            'puesto_id'              => 'required|exists:puestos,id',
            'rol_id'                 => 'nullable|exists:roles,id',
            'USUARIO_MODIFICA'       => 'nullable|integer',
        ]);

        try {
            DB::transaction(function () use ($empleado, $validated) {
                // Actualizar empleado
                $empleado->update([
                    'nombre'                => $validated['nombre'],
                    'apellido'              => $validated['apellido'],
                    'numero_identificacion' => $validated['numero_identificacion'],
                    'fecha_nacimiento'      => $validated['fecha_nacimiento'],
                    'numero_celular'        => $validated['numero_celular'],
                    'direccion'             => $validated['direccion'],
                    'dependencia_id'        => $validated['dependencia_id'],
                    'puesto_id'             => $validated['puesto_id'],
                    'USUARIO_MODIFICA'      => $validated['USUARIO_MODIFICA'] ?? null,
                    'FECHA_MODIFICA'        => now(),
                ]);

                // Rol del usuario (si viene)
                if (isset($validated['rol_id']) && $empleado->usuario) {
                    $empleado->usuario->rol_id = $validated['rol_id'];
                    $empleado->usuario->save();
                }
            });

            // Refrescar y aplanar
            $e = Empleado::with([
                'dependencia:id,nombre',
                'puesto:id,nombre',
                'usuario.rol:id,nombre',
            ])->find($empleado->id);

            $flat = [
                'id'                    => $e->id,
                'nombre'                => $e->nombre,
                'apellido'              => $e->apellido,
                'numero_identificacion' => $e->numero_identificacion,
                'numero_celular'        => $e->numero_celular,
                'direccion'             => $e->direccion,
                'dependencia'           => optional($e->dependencia)->nombre,
                'puesto'                => optional($e->puesto)->nombre,
                'rol'                   => optional(optional($e->usuario)->rol)->nombre,
            ];

            return response()->json($flat, 200);
        } catch (\Throwable $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Desactivar (soft) empleado
     */
    public function desactivar($id)
    {
        $empleado = Empleado::findOrFail($id);
        $empleado->ESTADO = 0;
        $empleado->FECHA_MODIFICA = now();
        $empleado->USUARIO_MODIFICA = 1; // TODO: reemplazar por el id del usuario autenticado
        $empleado->save();

        return response()->json(['mensaje' => 'Empleado desactivado'], 200);
    }
}