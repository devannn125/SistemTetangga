<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SiskamlingScheduleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'id_wilayah' => ['required', 'exists:wilayah,id_wilayah'],
            'id_petugas_citizen' => ['required', 'exists:citizen,id_citizen'],
            'shift' => ['required', Rule::in(['PAGI', 'SORE', 'MALAM'])],
            'tanggal_jadwal' => ['required', 'date'],
        ];
    }
}
