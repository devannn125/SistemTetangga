<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class WilayahRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nama_wilayah' => ['required', 'string', 'max:100'],
            'tipe' => ['required', Rule::in(['PROVINSI', 'KABUPATEN', 'KECAMATAN', 'KELURAHAN', 'RW', 'RT'])],
            'kode_wilayah' => ['required', 'string', 'max:20', Rule::unique('wilayah', 'kode_wilayah')->ignore($this->route('wilayah'))],
            'parent_id' => ['nullable', 'exists:wilayah,id_wilayah'],
        ];
    }
}
