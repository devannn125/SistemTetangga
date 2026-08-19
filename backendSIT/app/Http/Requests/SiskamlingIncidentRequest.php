<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SiskamlingIncidentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'id_wilayah' => ['required', 'exists:wilayah,id_wilayah'],
            'id_jenis_kejadian' => ['nullable', 'exists:master_data,id_master'],
            'lokasi' => ['nullable', 'string', 'max:255'],
            'deskripsi' => ['nullable', 'string'],
            'foto_url' => ['nullable', 'url', 'max:500'],
            'is_panic' => ['boolean'],
            'status' => ['required', Rule::in(['BARU', 'DITINDAKLANJUTI', 'SELESAI'])],
        ];
    }
}
