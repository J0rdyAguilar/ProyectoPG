<?php

namespace App\Http\Controllers;

use App\Models\Empleado;
use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Auth;

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
                'jefe:id,nombre,apellido'
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
                'jefe'                  => $e->jefe ? $e->jefe->nombre . ' ' . $e->jefe->apellido : null,
                'id_jefe'               => $e->id_jefe,
            ];
        });
    }

    /**
     * Obtener lista de posibles jefes (para select)
     */
    public function posiblesJefes($empleadoId = null)
    {
        $query = Empleado::where('ESTADO', 1)
            ->select('id', 'nombre', 'apellido');

        // Excluir al empleado actual para evitar autoreferencia
        if ($empleadoId) {
            $query->where('id', '!=', $empleadoId);
        }

        $empleados = $query->get()->map(function ($e) {
            return [
                'id' => $e->id,
                'nombre_completo' => $e->nombre . ' ' . $e->apellido
            ];
        });

        return response()->json($empleados);
    }

    /**
     * Mostrar un empleado (con relaciones completas)
     */
    public function show($id)
    {
        $empleado = Empleado::with(['dependencia', 'puesto', 'usuario.rol', 'jefe'])->find($id);

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
            'nombre'                => 'required|string|max:100',
            'apellido'              => 'required|string|max:100',
            'numero_identificacion' => 'required|string|max:50|unique:empleados',
            'fecha_nacimiento'      => 'required|date',
            'numero_celular'        => 'required',
            'direccion'             => 'required|string',
            'dependencia_id'        => 'required|exists:dependencias,id',
            'puesto_id'             => 'required|exists:puestos,id',
            'id_jefe'               => 'nullable|exists:empleados,id',
            'USUARIO_INGRESO'       => 'nullable|integer',

            // Datos del usuario
            'usuario.nombre'        => 'required|string|max:100',
            'usuario.usuario'       => ['required','string','max:50', Rule::unique('usuarios', 'usuario')],
            'usuario.contrasena'    => 'required|string|min:6',
            'usuario.rol_id'        => 'required|exists:roles,id',
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
                    'id_jefe'               => $validated['id_jefe'] ?? null,
                    'ESTADO'                => 1,
                    'USUARIO_INGRESO'       => $validated['USUARIO_INGRESO'] ?? null,
                    'FECHA_INGRESO'         => now(),
                ]);

                return [$nuevoUsuario, $empleado];
            });

            [$nuevoUsuario, $empleado] = $result;

            return response()->json(['usuario'  => $nuevoUsuario, 'empleado' => $empleado], 201);
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
            'nombre'                => 'required|string|max:100',
            'apellido'              => 'required|string|max:100',
            'numero_identificacion' => ['required','string','max:50', Rule::unique('empleados','numero_identificacion')->ignore($empleado->id)],
            'fecha_nacimiento'      => 'required|date',
            'numero_celular'        => 'required',
            'direccion'             => 'required|string',
            'dependencia_id'        => 'required|exists:dependencias,id',
            'puesto_id'             => 'required|exists:puestos,id',
            'id_jefe'               => ['nullable', 'exists:empleados,id', function ($attribute, $value, $fail) use ($id) { if ($value == $id) { $fail('Un empleado no puede ser jefe de sí mismo.'); }}],
            'rol_id'                => 'nullable|exists:roles,id',
            'USUARIO_MODIFICA'      => 'nullable|integer',
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
                    'id_jefe'               => $validated['id_jefe'] ?? null,
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
            $e = Empleado::with(['dependencia:id,nombre', 'puesto:id,nombre', 'usuario.rol:id,nombre', 'jefe:id,nombre,apellido'])->find($empleado->id);

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
                'jefe'                  => $e->jefe ? $e->jefe->nombre . ' ' . $e->jefe->apellido : null,
                'id_jefe'               => $e->id_jefe,
            ];

            return response()->json($flat, 200);
        } catch (\Throwable $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Obtener subordinados de un empleado
     */
    public function subordinados($id)
    {
        $empleado = Empleado::findOrFail($id);
        
        $subordinados = $empleado->subordinados()
            ->where('ESTADO', 1)
            ->with(['puesto:id,nombre', 'dependencia:id,nombre'])
            ->get()
            ->map(function ($s) {
                return [
                    'id' => $s->id,
                    'nombre_completo' => $s->nombre . ' ' . $s->apellido,
                    'puesto' => optional($s->puesto)->nombre,
                    'dependencia' => optional($s->dependencia)->nombre,
                ];
            });

        return response()->json($subordinados);
    }

    /**
     * Desactivar (soft) empleado
     */
    public function desactivar($id)
    {
        $empleado = Empleado::findOrFail($id);
        
        // Verificar si tiene subordinados activos
        $tieneSubordinados = $empleado->subordinados()->where('ESTADO', 1)->exists();
        
        if ($tieneSubordinados) {
            return response()->json(['error' => 'No se puede desactivar este empleado porque tiene subordinados activos.'], 400);
        }

        $empleado->ESTADO = 0;
        $empleado->FECHA_MODIFICA = now();
        $empleado->USUARIO_MODIFICA = Auth::id(); // Usar Auth::id() aquí
        $empleado->save();

        return response()->json(['mensaje' => 'Empleado desactivado'], 200);
    }
}

