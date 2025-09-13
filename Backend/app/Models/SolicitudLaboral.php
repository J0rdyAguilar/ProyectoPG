<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SolicitudLaboral extends Model
{
    protected $table = 'solicitudes_laborales';
    public $timestamps = false;

    protected $fillable = [
        'empleado_id',
        'tipo',
        'motivo',
        'fecha_inicio',
        'fecha_fin',
        'dias_disfrutados',
        'tipo_licencia',
        'documento_url',
        'observaciones',
        'aprobado_por',
        'fecha_aprobado',
        'validado_por',
        'fecha_validado',
        'ESTADO',
        'USUARIO_INGRESO',
        'FECHA_INGRESO',
        'USUARIO_MODIFICA',
        'FECHA_MODIFICA',
    ];

    protected $casts = [
        'fecha_inicio'       => 'date',
        'fecha_fin'          => 'date',
        'fecha_aprobado'     => 'datetime',
        'fecha_validado'     => 'datetime',
        'FECHA_INGRESO'      => 'datetime',
        'FECHA_MODIFICA'     => 'datetime',
    ];

    protected $appends = ['estado'];

    public function getEstadoAttribute()
    {
        return (int) ($this->attributes['ESTADO'] ?? 0);
    }

    // Relaciones
    public function empleado()
    {
        return $this->belongsTo(Empleado::class, 'empleado_id');
    }

    public function aprobador()
    {
        return $this->belongsTo(Usuario::class, 'aprobado_por');
    }

    public function validador()
    {
        return $this->belongsTo(Usuario::class, 'validado_por');
    }
}
