<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class LoginRequest extends FormRequest
{
    /**
     * Kode role yang valid, sesuai isi tabel `role`.
     */
    public const VALID_ROLES = ['ADMIN', 'LURAH', 'DUKUH', 'RW', 'RT', 'SEKRETARIS', 'BENDAHARA', 'WARGA'];

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'email' => ['required', 'string'],
            'password' => ['required', 'string'],
            // Opsional: jika tidak dikirim, backend auto-pilih role aktif akun.
            'role' => ['sometimes', 'string', Rule::in(self::VALID_ROLES)],
        ];
    }

    public function messages(): array
    {
        return [
            'email.required' => 'Email wajib diisi.',
            'password.required' => 'Password wajib diisi.',
            'role.required' => 'Pilih masuk sebagai apa.',
            'role.in' => 'Role yang dipilih tidak valid.',
        ];
    }

    /**
     * Normalisasi input sebelum divalidasi (email di-trim/lowercase, role uppercase).
     */
    protected function prepareForValidation(): void
    {
        $this->merge([
            'email' => strtolower(trim((string) $this->input('email'))),
            'role' => strtoupper(trim((string) $this->input('role'))),
        ]);
    }
}
