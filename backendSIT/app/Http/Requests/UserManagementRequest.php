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

        $isStore = $this->isMethod('post') && !$id;

        $rules = [
            'nama_users' => ['required', 'string', 'max:150'],
            'email' => ['nullable', 'email', 'max:150', Rule::unique('users', 'email')->ignore($id, 'id_users')],
            'no_hp' => ['required', 'string', 'max:20', Rule::unique('users', 'no_hp')->ignore($id, 'id_users')],
            'password' => [$isStore ? 'required' : 'nullable', 'string', 'min:6'],
            'id_citizen' => ['nullable', 'exists:citizen,id_citizen'],
            'auth_provider' => ['required', Rule::in(['EMAIL', 'GOOGLE', 'WHATSAPP_OTP'])],
            'status' => ['required', Rule::in(['PENDING_VERIFICATION', 'ACTIVE', 'SUSPENDED', 'INACTIVE'])],
            'role' => ['nullable', 'string', Rule::in(['WARGA'])],
        ];

        if ($isStore) {
            $rules['nik'] = ['required', 'string', 'size:16', 'regex:/^[0-9]{16}$/', 'unique:citizen,nik'];
            $rules['jenis_kelamin'] = ['required', Rule::in(['L', 'P'])];
            $rules['id_wilayah'] = ['required', 'exists:wilayah,id_wilayah'];
        }

        return $rules;
    }
}
