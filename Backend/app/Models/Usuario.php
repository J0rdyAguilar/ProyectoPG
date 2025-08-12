<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\Rol;
use App\Models\Empleado;

class Usuario extends Authenticatable
{
    use HasApiTokens, HasFactory;

    protected $table = 'usuarios';

    protected $fillable = [
        'nombre',
        'usuario',
        'contrasena',
        'rol_id',
        'puesto_id',
        'ESTADO',
        'USUARIO_INGRESO',
        'FECHA_INGRESO',
        'USUARIO_MODIFICA',
        'FECHA_MODIFICA'
    ];

    protected $hidden = [
        'contrasena',
        'remember_token',
    ];

    public $timestamps = false;

    /**
     * Para indicar a Laravel que usamos "contrasena" como campo de autenticación.
     */
    public function getAuthPassword()
    {
        return $this->contrasena;
    }

    /**
     * Relación uno a uno con el modelo Empleado.
     */
    public function empleado()
    {
        return $this->hasOne(Empleado::class, 'usuario_id');
    }

    /**
     * Relación muchos a uno con el modelo Rol.
     */
    public function rol()
    {
        return $this->belongsTo(Rol::class, 'rol_id');
    }
}
