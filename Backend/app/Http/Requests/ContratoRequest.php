<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ContratoRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Si usas policies/roles puedes validar aquí; por ahora dejamos permitido.
        return true;
    }

    public function rules(): array
    {
        // Si es actualización, el archivo es opcional; al crear, es requerido.
        $isUpdate = (bool) $this->route('contrato');

        return [
            'empleado_id'   => ['required','integer','exists:empleados,id'],
            'tipo_contrato' => ['required','string','max:100'],
            'fecha_inicio'  => ['required','date'],
            'fecha_fin'     => ['nullable','date','after_or_equal:fecha_inicio'],
            'plantilla'     => ['nullable','string'],
            'archivo'       => [$isUpdate ? 'sometimes' : 'required', 'file', 'mimes:pdf,doc,docx', 'max:5120'],
            'ESTADO'        => ['sometimes','boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'empleado_id.required'   => 'El empleado es obligatorio.',
            'empleado_id.exists'     => 'El empleado no existe.',
            'tipo_contrato.required' => 'El tipo de contrato es obligatorio.',
            'fecha_inicio.required'  => 'La fecha de inicio es obligatoria.',
            'fecha_fin.after_or_equal' => 'La fecha fin no puede ser anterior a la fecha de inicio.',
            'archivo.required'       => 'Debes adjuntar el archivo del contrato.',
            'archivo.mimes'          => 'El archivo debe ser PDF, DOC o DOCX.',
            'archivo.max'            => 'El archivo no debe superar 5 MB.',
        ];
    }
}
