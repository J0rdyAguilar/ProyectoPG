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
        'ESTADO',
        'USUARIO_INGRESO',
        'FECHA_INGRESO',
        'USUARIO_MODIFICA',
        'FECHA_MODIFICA',
    ];

    public $timestamps = false;

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
}
