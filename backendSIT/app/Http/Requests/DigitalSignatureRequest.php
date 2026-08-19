<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class DigitalSignatureRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'id_letter_request' => ['required', 'exists:letter_request,id_letter_request'],
            'document_hash' => ['required', 'string', 'max:255'],
            'status' => ['required', Rule::in(['MENUNGGU', 'DITANDATANGANI', 'GAGAL'])],
            'id_privy_transaction' => ['nullable', 'string', 'max:100'],
            'qr_code_url' => ['nullable', 'url', 'max:500'],
            'signed_document_url' => ['nullable', 'url', 'max:500'],
            'signed_at' => ['nullable', 'date'],
        ];
    }
}
