<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class RegulationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'kategori' => ['required', Rule::in(['WARGA_TETAP', 'PENGHUNI_TIDAK_TETAP', 'LINGKUNGAN', 'TAMU'])],
            'judul' => ['required', 'string', 'max:200'],
            'isi' => ['required', 'string'],
            'lampiran_url' => ['nullable', 'url', 'max:500'],
            'id_wilayah' => ['required', 'exists:wilayah,id_wilayah'],
            'versi' => ['nullable', 'integer', 'min:1'],
            'tanggal_berlaku' => ['required', 'date'],
            'status' => ['required', Rule::in(['AKTIF', 'NONAKTIF'])],
        ];
    }
}
