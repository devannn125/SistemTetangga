<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class FeeBillRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $required = $this->isMethod('PATCH') ? 'sometimes' : 'required';

        return [
            'id_family' => [$required, 'exists:family,id_family'],
            'periode' => [$required, 'date_format:Y-m'],
            'jumlah_tagihan' => [$required, 'numeric', 'min:0'],
            'status' => ['sometimes', 'required', Rule::in(['LUNAS', 'BELUM_BAYAR', 'SEBAGIAN'])],
            'jatuh_tempo' => [$required, 'date'],
            'dikonfirmasi_oleh' => ['nullable', 'exists:users,id_users'],
            'dikonfirmasi_at' => ['nullable', 'date'],
        ];
    }
}
