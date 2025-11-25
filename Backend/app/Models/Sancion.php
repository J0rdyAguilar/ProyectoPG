<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Sancion extends Model
{
    protected $table = 'sanciones';

    public $timestamps = false; // usamos FECHA_INGRESO y FECHA_MODIFICA

    protected $fillable = [
        'empleado_id',
        'nombre',
        'descripcion',
        'ESTADO',
        'USUARIO_INGRESO',
        'FECHA_INGRESO',
        'USUARIO_MODIFICA',
        'FECHA_MODIFICA',
    ];

    public function empleado()
    {
        return $this->belongsTo(Empleado::class, 'empleado_id');
    }
}
