<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PermisoLaboral extends Model
{
    protected $table = 'permisos_laborales';

    public $timestamps = false;

    protected $fillable = [
        'empleado_id',
        'motivo',
        'fecha_inicio',
        'fecha_fin',
        'aprobado_por',
        'ESTADO',
        'USUARIO_INGRESO',
        'FECHA_INGRESO',
        'USUARIO_MODIFICA',
        'FECHA_MODIFICA',
        'aprobado_por_jefe',
        'validado_por_rrhh',
        'fecha_aprobacion_jefe',
        'fecha_validacion_rrhh',
    ];

    protected $casts = [
        'FECHA_INGRESO'         => 'datetime',
        'FECHA_MODIFICA'        => 'datetime',
        'fecha_aprobacion_jefe' => 'datetime',
        'fecha_validacion_rrhh' => 'datetime',
    ];


    // Opcional: exponer "estado" en minúsculas para el frontend
    protected $appends = ['estado'];
    public function getEstadoAttribute()
    {
        return (int) ($this->attributes['ESTADO'] ?? 0);
    }

    public function empleado()
    {
        return $this->belongsTo(Empleado::class, 'empleado_id');
    }

    public function aprobador()
    {
        return $this->belongsTo(Usuario::class, 'aprobado_por');
    }
}
