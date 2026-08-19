<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UserManagementRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $id = $this->route('user');

        return [
            'nama_users' => ['required', 'string', 'max:150'],
            'email' => ['nullable', 'email', 'max:150', Rule::unique('users', 'email')->ignore($id, 'id_users')],
            'no_hp' => ['required', 'string', 'max:20', Rule::unique('users', 'no_hp')->ignore($id, 'id_users')],
            'password' => ['nullable', 'string', 'min:6'],
            'id_citizen' => ['nullable', 'exists:citizen,id_citizen'],
            'auth_provider' => ['required', Rule::in(['EMAIL', 'GOOGLE', 'WHATSAPP_OTP'])],
            'status' => ['required', Rule::in(['PENDING_VERIFICATION', 'ACTIVE', 'SUSPENDED', 'INACTIVE'])],
        ];
    }
}
