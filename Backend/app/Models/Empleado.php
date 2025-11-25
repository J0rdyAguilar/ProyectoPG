<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Dependencia;
use App\Models\Puesto;
use App\Models\Usuario;

class Empleado extends Model
{
    protected $table = 'empleados';

    protected $fillable = [
        'nombre',
        'apellido',
        'numero_identificacion',
        'fecha_nacimiento',
        'numero_celular',
        'direccion',
        'genero',
        'renglon_presupuestario',
        'salario',
        'usuario_id',
        'dependencia_id',
        'puesto_id',
        'id_jefe',
        'ESTADO',
        'USUARIO_INGRESO',
        'FECHA_INGRESO',
        'USUARIO_MODIFICA',
        'FECHA_MODIFICA',
    ];

    public $timestamps = false;

    // Relación con usuario
    public function usuario()
    {
        return $this->belongsTo(Usuario::class);
    }

    // Relación con dependencia
    public function dependencia()
    {
        return $this->belongsTo(Dependencia::class);
    }

    // Relación con puesto
    public function puesto()
    {
        return $this->belongsTo(Puesto::class);
    }

    // Relación con jefe inmediato
    public function jefe()
    {
        return $this->belongsTo(Empleado::class, 'id_jefe')->withDefault();
    }

    // Relación con subordinados
    public function subordinados()
    {
        return $this->hasMany(Empleado::class, 'id_jefe');
    }

    // Helpers
    public function esJefe()
    {
        return $this->subordinados()->where('ESTADO', 1)->exists();
    }

    public function tieneJefe()
    {
        return !is_null($this->id_jefe);
    }

    // Relación con sanciones
    public function sanciones()
    {
        return $this->hasMany(\App\Models\Sancion::class, 'empleado_id');
    }

}