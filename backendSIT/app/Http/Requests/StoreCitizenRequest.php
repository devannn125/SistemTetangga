<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCitizenRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Otorisasi utama sudah dicek via CitizenPolicy di controller ($this->authorize()),
        // tapi tetap true di sini karena controller yang men-trigger authorize().
        return true;
    }

    public function rules(): array
    {
        return [
            'nik' => ['required', 'string', 'size:16', 'max:32', 'unique:citizen,nik'],
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
            'no_hp' => ['required', 'string', 'max:20'],
            'email' => ['required', 'email', 'max:150', Rule::unique('users', 'email')],
            'status_warga' => ['nullable', Rule::in(['TETAP', 'TIDAK_TETAP'])],
            'kewarganegaraan' => ['nullable', Rule::in(['WNI', 'WNA'])],
            'status_ekonomi' => ['nullable', Rule::in(['MAMPU', 'KURANG_MAMPU'])],
            'penerima_bansos' => ['nullable', 'boolean'],
            'tanggal_masuk_rt' => ['nullable', 'date'],
            'tanggal_keluar_rt' => ['nullable', 'date', 'after_or_equal:tanggal_masuk_rt'],
            'alamat_kk_luar_rt' => ['nullable', 'boolean'],
            'berdomisili_luar_rt' => ['nullable', 'boolean'],
            'status_hidup' => ['nullable', Rule::in(['HIDUP', 'MENINGGAL'])],
            'status_aktif' => ['nullable', 'boolean'],
            'status_verifikasi' => ['nullable', Rule::in(['PENDING', 'VERIFIED_RW', 'APPROVED_DUKUH', 'REJECTED'])],
        ];
    }

    /**
     * Field yang boleh diisi user dengan role selain Ketua RT/Sekretaris (mis. via impor Sekretaris)
     * tetap divalidasi sama; pembatasan siapa yang boleh mengisi status_ekonomi/penerima_bansos/
     * kewarganegaraan dilakukan di CitizenService::stripSensitiveInputIfUnauthorized(), bukan di sini,
     * supaya request tidak butuh tahu identitas role secara langsung.
     */
    public function messages(): array
    {
        return [
            'nik.size' => 'NIK harus terdiri dari 16 digit.',
            'nik.unique' => 'NIK sudah terdaftar untuk warga lain.',
            'email.required' => 'Email wajib diisi agar warga bisa login.',
            'email.unique' => 'Email sudah digunakan akun lain.',
            'no_hp.required' => 'Nomor HP wajib diisi agar warga bisa login.',
        ];
    }
}
