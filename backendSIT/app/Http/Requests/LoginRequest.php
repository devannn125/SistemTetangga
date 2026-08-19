<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class LoginRequest extends FormRequest
{
    /**
     * Kode role yang valid, sesuai isi tabel `role`.
     */
    public const VALID_ROLES = ['ADMIN', 'DUKUH', 'RT', 'RW', 'WARGA'];

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            // Login bisa pakai NIK, email, ATAU no_hp — salah satu wajib diisi
            'identifier' => ['required', 'string'],
            'password' => ['required', 'string'],
            // Opsional: jika tidak dikirim, backend auto-pilih role aktif akun.
            'role' => ['sometimes', 'string', Rule::in(self::VALID_ROLES)],
        ];
    }

    public function messages(): array
    {
        return [
            'identifier.required' => 'NIK, email, atau nomor HP wajib diisi.',
            'password.required' => 'Password wajib diisi.',
            'role.required' => 'Pilih masuk sebagai apa.',
            'role.in' => 'Role yang dipilih tidak valid.',
        ];
    }

    /**
     * Normalisasi input sebelum divalidasi (role selalu uppercase).
     */
    protected function prepareForValidation(): void
    {
        $this->merge([
            'role' => strtoupper(trim((string) $this->input('role'))),
        ]);
    }
}
