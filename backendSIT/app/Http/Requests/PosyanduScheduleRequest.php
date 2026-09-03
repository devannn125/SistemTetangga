<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PosyanduScheduleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'id_wilayah' => ['required', 'exists:wilayah,id_wilayah'],
            'tanggal_jadwal' => ['required', 'date'],
            'jam_mulai' => ['nullable', 'date_format:H:i'],
            'nama_kegiatan' => ['required', 'string', 'max:150'],
            'lokasi' => ['nullable', 'string', 'max:255'],
            'keterangan' => ['nullable', 'string'],
            'penyelenggara' => ['nullable', 'string', 'max:150'],
        ];
    }
}
