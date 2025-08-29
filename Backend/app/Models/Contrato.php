<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Contrato extends Model
{
    protected $table = 'contratos';   // nombre exacto de la tabla

    protected $fillable = [
        'empleado_id',
        'tipo_contrato',
        'fecha_inicio',
        'fecha_fin',
        'plantilla',
        'archivo_url',
        'ESTADO',
        'USUARIO_INGRESO',
        'FECHA_INGRESO',
        'USUARIO_MODIFICA',
        'FECHA_MODIFICA',
    ];

    public $timestamps = false; // usamos nuestras columnas de auditoría

    // Relación: un contrato pertenece a un empleado
    public function empleado()
    {
        return $this->belongsTo(Empleado::class, 'empleado_id');
    }
}
