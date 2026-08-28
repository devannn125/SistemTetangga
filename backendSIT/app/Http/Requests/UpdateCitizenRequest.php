<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCitizenRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Otorisasi utama diverifikasi via RbacService di controller.
        return true;
    }

    public function rules(): array
    {
        $id = $this->route('citizen');

        $rules = [
            'nik' => ['required', 'string', 'max:32', Rule::unique('citizen', 'nik')->ignore($id, 'id_citizen')],
            'id_family' => ['nullable', 'exists:family,id_family'],
            'nama_lengkap' => ['required', 'string', 'max:150'],
            'hubungan_keluarga' => ['nullable', Rule::in(['KEPALA_KELUARGA', 'ISTRI', 'ANAK', 'LAINNYA'])],
            'tempat_lahir' => ['nullable', 'string', 'max:100'],
            'tanggal_lahir' => ['nullable', 'date'],
            'jenis_kelamin' => ['required', Rule::in(['L', 'P'])],
            'id_agama' => ['nullable', Rule::exists('master_data', 'id_master')->where('tipe', 'AGAMA')],
            'status_nikah' => ['nullable', Rule::in(['BELUM_KAWIN', 'KAWIN', 'CERAI_HIDUP', 'CERAI_MATI'])],
            'id_pendidikan' => ['nullable', Rule::exists('master_data', 'id_master')->where('tipe', 'PENDIDIKAN')],
            'id_profesi' => ['nullable', Rule::exists('master_data', 'id_master')->where('tipe', 'PROFESI')],
            'no_hp' => ['nullable', 'string', 'max:20'],
            'email' => ['nullable', 'email', 'max:150'],
            'status_warga' => ['nullable', Rule::in(['TETAP', 'TIDAK_TETAP'])],
            'kewarganegaraan' => ['nullable', Rule::in(['WNI', 'WNA'])],
            'status_ekonomi' => ['nullable', Rule::in(['MAMPU', 'KURANG_MAMPU'])],
            'penerima_bansos' => ['nullable', 'boolean'],
            'tanggal_masuk_rt' => ['nullable', 'date'],
            'tanggal_keluar_rt' => ['nullable', 'date', 'after_or_equal:tanggal_masuk_rt'],
            // Wilayah tidak wajib dari client: CitizenService::update() selalu
            // mempertahankan wilayah lama (perpindahan RT = workflow terpisah).
            'id_wilayah' => ['nullable', 'exists:wilayah,id_wilayah'],
            'alamat_kk_luar_rt' => ['nullable', 'boolean'],
            'berdomisili_luar_rt' => ['nullable', 'boolean'],
            'status_hidup' => ['nullable', Rule::in(['HIDUP', 'MENINGGAL'])],
            'status_aktif' => ['nullable', 'boolean'],
            'status_verifikasi' => ['nullable', Rule::in(['PENDING', 'VERIFIED_RW', 'APPROVED_DUKUH', 'REJECTED'])],
        ];

        if ($this->isMethod('PATCH')) {
            foreach ($rules as $field => $rule) {
                array_unshift($rules[$field], 'sometimes');
            }
        }

        return $rules;
    }

    public function messages(): array
    {
        return [
            'nik.unique' => 'NIK sudah terdaftar untuk warga lain.',
        ];
    }
}
