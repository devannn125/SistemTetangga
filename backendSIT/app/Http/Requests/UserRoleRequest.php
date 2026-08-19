<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UserRoleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'id_users' => ['required', 'exists:users,id_users'],
            'id_role' => ['required', 'exists:role,id_role'],
            'id_wilayah' => ['required', 'exists:wilayah,id_wilayah'],
            'periode_mulai' => ['nullable', 'date'],
            'periode_selesai' => ['nullable', 'date', 'after_or_equal:periode_mulai'],
            'status' => ['required', Rule::in(['ACTIVE', 'ENDED', 'REVOKED'])],
            'assigned_by' => ['nullable', 'exists:users,id_users'],
        ];
    }
}
