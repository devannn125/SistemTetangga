<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ComplaintRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'id_pengirim_user' => ['required', 'exists:users,id_users'],
            'judul' => ['required', 'string', 'min:10', 'max:100'],
            'kategori' => ['required', Rule::in(['INFRASTRUKTUR', 'KEAMANAN', 'KEBERSIHAN', 'SOSIAL', 'LAINNYA'])],
            'deskripsi' => ['required', 'string', 'min:30', 'max:1000'],
            'lokasi' => ['nullable', 'string', 'max:255'],
            'urgensi' => ['required', Rule::in(['RENDAH', 'SEDANG', 'TINGGI', 'DARURAT'])],
            'status' => ['nullable', Rule::in(['PENDING', 'DIPROSES', 'ESKALASI', 'SELESAI', 'DITOLAK'])],
            'rating' => ['nullable', 'integer', 'between:1,5'],
        ];
    }
}
