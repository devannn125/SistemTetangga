<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class GuestRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nama' => ['required', 'string', 'max:150'],
            'nik' => ['nullable', 'string', 'max:32'],
            'asal' => ['nullable', 'string', 'max:150'],
            'id_house' => ['required', 'exists:house,id_house'],
            'foto_identitas_url' => ['nullable', 'url', 'max:500'],
            'jam_masuk' => ['required', 'date'],
            'jam_keluar' => ['nullable', 'date', 'after_or_equal:jam_masuk'],
            'status' => ['required', Rule::in(['MENUNGGU', 'DISETUJUI', 'DITOLAK', 'CHECK_OUT'])],
        ];
    }
}
