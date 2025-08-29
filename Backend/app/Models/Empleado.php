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
        'usuario_id',
        'dependencia_id',
        'puesto_id',
        'id_jefe',  // Campo agregado para jerarquía
        'ESTADO',
        'USUARIO_INGRESO',
        'FECHA_INGRESO',
        'USUARIO_MODIFICA',
        'FECHA_MODIFICA',
    ];

    public $timestamps = false;

    // Relaciones existentes
    public function usuario()
    {
        return $this->belongsTo(Usuario::class);
    }

    public function dependencia()
    {
        return $this->belongsTo(Dependencia::class);
    }

    public function puesto()
    {
        return $this->belongsTo(Puesto::class);
    }

    // Nuevas relaciones para jerarquía
    public function jefe()
    {
        return $this->belongsTo(Empleado::class, 'id_jefe');
    }

    public function subordinados()
    {
        return $this->hasMany(Empleado::class, 'id_jefe');
    }

    // Métodos útiles para jerarquía
    public function esJefe()
    {
        return $this->subordinados()->where('ESTADO', 1)->exists();
    }

    public function tieneJefe()
    {
        return !is_null($this->id_jefe);
    }
}