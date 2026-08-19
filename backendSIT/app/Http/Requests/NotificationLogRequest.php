<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class NotificationLogRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'id_users' => ['required', 'exists:users,id_users'],
            'jenis' => ['required', 'string', 'max:50'],
            'channel' => ['required', Rule::in(['TELEGRAM', 'WHATSAPP_OTP', 'EMAIL'])],
            'isi_pesan' => ['required', 'string'],
            'status_kirim' => ['required', Rule::in(['PENDING', 'TERKIRIM', 'GAGAL'])],
            'retry_count' => ['nullable', 'integer', 'min:0'],
            'related_entity_type' => ['nullable', 'string', 'max:50'],
            'id_related_entity' => ['nullable', 'string', 'max:36'],
            'sent_at' => ['nullable', 'date'],
        ];
    }
}
