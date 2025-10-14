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
     * Listado de empleados filtrado por rol
     */
    public function index(Request $request)
    {
        $usuario = Auth::user()->load('empleado');
        $rolId = $usuario->rol_id;

        $query = Empleado::where('ESTADO', 1)
            ->with(['dependencia:id,nombre', 'puesto:id,nombre', 'usuario.rol:id,nombre', 'jefe:id,nombre,apellido']);

        if ($rolId == 1) {
            // RRHH ve todo
        } elseif ($rolId == 2 && $usuario->empleado) {
            $query->where('id_jefe', $usuario->empleado->id);
        } else {
            if ($usuario->empleado) {
                $query->where('id', $usuario->empleado->id);
            } else {
                $query->whereRaw('1 = 0');
            }
        }

        $empleados = $query->get();

        return response()->json(
            $empleados->map(function ($e) {
                return [
                    'id'                    => $e->id,
                    'nombre'                => $e->nombre,
                    'apellido'              => $e->apellido,
                    'numero_identificacion' => $e->numero_identificacion,
                    'numero_celular'        => $e->numero_celular,
                    'direccion'             => $e->direccion,
                    'genero'                => $e->genero,
                    'renglon_presupuestario'=> $e->renglon_presupuestario,
                    'salario'               => $e->salario,
                    'dependencia'           => optional($e->dependencia)->nombre,
                    'puesto'                => optional($e->puesto)->nombre,
                    'rol'                   => optional(optional($e->usuario)->rol)->nombre,
                    'jefe'                  => $e->jefe ? $e->jefe->nombre . ' ' . $e->jefe->apellido : null,
                    'id_jefe'               => $e->id_jefe,
                ];
            })
        );
    }

    /**
     * Listado simple para selects (respetando roles)
     */
    public function listadoParaSeleccion()
    {
        $usuario = Auth::user()->load('empleado');
        $rolId = $usuario->rol_id;

        $query = Empleado::where('ESTADO', 1);

        if ($rolId == 1) {
            // RRHH ve todos
        } elseif ($rolId == 2 && $usuario->empleado) {
            $subordinadosIds = Empleado::where('id_jefe', $usuario->empleado->id)->pluck('id');
            $subordinadosIds->push($usuario->empleado->id);
            $query->whereIn('id', $subordinadosIds);
        } else {
            if ($usuario->empleado) {
                $query->where('id', $usuario->empleado->id);
            } else {
                $query->whereRaw('1 = 0');
            }
        }

        $empleados = $query->orderBy('nombre')->get();

        return response()->json(
            $empleados->map(fn($e) => [
                'id' => $e->id,
                'nombre_completo' => $e->nombre . ' ' . $e->apellido
            ])
        );
    }

    /**
     * Posibles jefes (excluyendo al mismo empleado)
     */
    public function posiblesJefes($empleadoId = null)
    {
        $query = Empleado::where('ESTADO', 1)
            ->select('id', 'nombre', 'apellido');

        if ($empleadoId) {
            $query->where('id', '!=', $empleadoId);
        }

        $empleados = $query->get()->map(fn($e) => [
            'id' => $e->id,
            'nombre_completo' => $e->nombre . ' ' . $e->apellido
        ]);

        return response()->json($empleados);
    }

    /**
     * Mostrar empleado con todas sus relaciones
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
     * Crear empleado + usuario
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nombre'                => 'required|string|max:100',
            'apellido'              => 'required|string|max:100',
            'numero_identificacion' => 'required|string|max:50|unique:empleados',
            'fecha_nacimiento'      => 'required|date',
            'numero_celular'        => 'required',
            'direccion'             => 'required|string',
            'genero'                => 'required|in:Masculino,Femenino',
            'renglon_presupuestario'=> 'required|string|max:20',
            'salario'               => 'required|numeric|min:0',
            'dependencia_id'        => 'required|exists:dependencias,id',
            'puesto_id'             => 'required|exists:puestos,id',
            'id_jefe'               => 'nullable|exists:empleados,id',
            'USUARIO_INGRESO'       => 'nullable|integer',

            // Usuario
            'usuario.nombre'        => 'required|string|max:100',
            'usuario.usuario'       => ['required', 'string', 'max:50', Rule::unique('usuarios', 'usuario')],
            'usuario.contrasena'    => 'required|string|min:6',
            'usuario.rol_id'        => 'required|exists:roles,id',
        ]);

        try {
            $result = DB::transaction(function () use ($validated) {
                $nuevoUsuario = Usuario::create([
                    'nombre'          => $validated['usuario']['nombre'],
                    'usuario'         => $validated['usuario']['usuario'],
                    'contrasena'      => Hash::make($validated['usuario']['contrasena']),
                    'rol_id'          => $validated['usuario']['rol_id'],
                    'ESTADO'          => 1,
                    'USUARIO_INGRESO' => $validated['USUARIO_INGRESO'] ?? null,
                    'FECHA_INGRESO'   => now(),
                ]);

                $empleado = Empleado::create([
                    'nombre'                => $validated['nombre'],
                    'apellido'              => $validated['apellido'],
                    'numero_identificacion' => $validated['numero_identificacion'],
                    'fecha_nacimiento'      => $validated['fecha_nacimiento'],
                    'numero_celular'        => $validated['numero_celular'],
                    'direccion'             => $validated['direccion'],
                    'genero'                => $validated['genero'],
                    'renglon_presupuestario'=> $validated['renglon_presupuestario'],
                    'salario'               => $validated['salario'],
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
            return response()->json(['usuario' => $nuevoUsuario, 'empleado' => $empleado], 201);

        } catch (\Throwable $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Actualizar empleado (y su rol si aplica)
     */
    public function update(Request $request, $id)
    {
        $empleado = Empleado::with('usuario')->findOrFail($id);

        $validated = $request->validate([
            'nombre'                => 'required|string|max:100',
            'apellido'              => 'required|string|max:100',
            'numero_identificacion' => ['required', 'string', 'max:50', Rule::unique('empleados', 'numero_identificacion')->ignore($empleado->id)],
            'fecha_nacimiento'      => 'required|date',
            'numero_celular'        => 'required',
            'direccion'             => 'required|string',
            'genero'                => 'required|in:Masculino,Femenino',
            'renglon_presupuestario'=> 'required|string|max:20',
            'salario'               => 'required|numeric|min:0',
            'dependencia_id'        => 'required|exists:dependencias,id',
            'puesto_id'             => 'required|exists:puestos,id',
            'id_jefe'               => ['nullable', 'exists:empleados,id', function ($attribute, $value, $fail) use ($id) {
                if ($value == $id) $fail('Un empleado no puede ser su propio jefe.');
            }],
            'rol_id'                => 'nullable|exists:roles,id',
            'USUARIO_MODIFICA'      => 'nullable|integer',
        ]);

        try {
            DB::transaction(function () use ($empleado, $validated) {
                $empleado->update([
                    'nombre'                => $validated['nombre'],
                    'apellido'              => $validated['apellido'],
                    'numero_identificacion' => $validated['numero_identificacion'],
                    'fecha_nacimiento'      => $validated['fecha_nacimiento'],
                    'numero_celular'        => $validated['numero_celular'],
                    'direccion'             => $validated['direccion'],
                    'genero'                => $validated['genero'],
                    'renglon_presupuestario'=> $validated['renglon_presupuestario'],
                    'salario'               => $validated['salario'],
                    'dependencia_id'        => $validated['dependencia_id'],
                    'puesto_id'             => $validated['puesto_id'],
                    'id_jefe'               => $validated['id_jefe'] ?? null,
                    'USUARIO_MODIFICA'      => $validated['USUARIO_MODIFICA'] ?? null,
                    'FECHA_MODIFICA'        => now(),
                ]);

                if (isset($validated['rol_id']) && $empleado->usuario) {
                    $empleado->usuario->rol_id = $validated['rol_id'];
                    $empleado->usuario->save();
                }
            });

            $e = Empleado::with(['dependencia:id,nombre', 'puesto:id,nombre', 'usuario.rol:id,nombre', 'jefe:id,nombre,apellido'])
                ->find($empleado->id);

            return response()->json([
                'id'          => $e->id,
                'nombre'      => $e->nombre,
                'apellido'    => $e->apellido,
                'genero'      => $e->genero,
                'renglon_presupuestario'=> $e->renglon_presupuestario,
                'salario'     => $e->salario,
                'dependencia' => optional($e->dependencia)->nombre,
                'puesto'      => optional($e->puesto)->nombre,
                'rol'         => optional(optional($e->usuario)->rol)->nombre,
                'jefe'        => $e->jefe ? $e->jefe->nombre . ' ' . $e->jefe->apellido : null,
            ], 200);

        } catch (\Throwable $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Desactivar empleado
     */
    public function desactivar($id)
    {
        $empleado = Empleado::findOrFail($id);

        if ($empleado->subordinados()->where('ESTADO', 1)->exists()) {
            return response()->json(['error' => 'No se puede desactivar: tiene subordinados activos.'], 400);
        }

        $empleado->update([
            'ESTADO' => 0,
            'FECHA_MODIFICA' => now(),
            'USUARIO_MODIFICA' => Auth::id(),
        ]);

        return response()->json(['mensaje' => 'Empleado desactivado'], 200);
    }
}
