<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class FeedbackRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'id_pengirim_user' => ['required', 'exists:users,id_users'],
            'isi_pesan' => ['required', 'string'],
            'kategori' => ['required', Rule::in(['MASUKAN', 'KELUHAN', 'APRESIASI', 'LAINNYA'])],
            'is_anonim' => ['boolean'],
            'status' => ['nullable', Rule::in(['BARU', 'DIBACA', 'DITINDAKLANJUTI'])],
        ];
    }
}
