<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CitizenRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $id = $this->route('citizen')?->id_citizen ?? $this->route('citizen');

        return [
            'nik' => ['required', 'string', 'max:32', Rule::unique('citizen', 'nik')->ignore($id, 'id_citizen')],
            'nama_lengkap' => ['required', 'string', 'max:150'],
            'id_family' => ['nullable', 'exists:family,id_family'],
            'hubungan_keluarga' => ['nullable', Rule::in(['KEPALA_KELUARGA', 'ISTRI', 'ANAK', 'LAINNYA'])],
            'tempat_lahir' => ['nullable', 'string', 'max:100'],
            'tanggal_lahir' => ['nullable', 'date'],
            'jenis_kelamin' => ['required', Rule::in(['L', 'P'])],
            'status_nikah' => ['nullable', Rule::in(['BELUM_KAWIN', 'KAWIN', 'CERAI_HIDUP', 'CERAI_MATI'])],
            'no_hp' => ['nullable', 'string', 'max:20'],
            'email' => ['nullable', 'email', 'max:150'],
            'status_warga' => ['required', Rule::in(['TETAP', 'TIDAK_TETAP'])],
            'kewarganegaraan' => ['required', Rule::in(['WNI', 'WNA'])],
            'status_ekonomi' => ['nullable', Rule::in(['MAMPU', 'KURANG_MAMPU'])],
            'penerima_bansos' => ['boolean'],
            'tanggal_masuk_rt' => ['nullable', 'date'],
            'tanggal_keluar_rt' => ['nullable', 'date', 'after_or_equal:tanggal_masuk_rt'],
            'id_wilayah' => ['required', 'exists:wilayah,id_wilayah'],
            'alamat_kk_luar_rt' => ['boolean'],
            'berdomisili_luar_rt' => ['boolean'],
            'status_hidup' => ['required', Rule::in(['HIDUP', 'MENINGGAL'])],
            'status_aktif' => ['boolean'],
        ];
    }
}
