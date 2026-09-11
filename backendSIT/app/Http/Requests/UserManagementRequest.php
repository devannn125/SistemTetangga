<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\DB;
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
            'email' => ['nullable', 'email', 'max:150', Rule::unique('users', 'email')->ignore($id, 'id_users')],
            'id_citizen' => ['nullable', 'exists:citizen,id_citizen'],
            'role' => ['nullable', 'string', Rule::in(['WARGA'])],
        ];

        if ($isStore) {
            $rules['nama_users'] = ['required', 'string', 'max:150'];
            $rules['no_hp'] = ['required', 'string', 'max:20', Rule::unique('users', 'no_hp')->ignore($id, 'id_users')];
            $rules['password'] = ['required', 'string', 'min:6'];
            $rules['auth_provider'] = ['required', Rule::in(['EMAIL', 'GOOGLE', 'WHATSAPP_OTP'])];
            $rules['status'] = ['required', Rule::in(['PENDING_VERIFICATION', 'ACTIVE', 'SUSPENDED', 'INACTIVE'])];
        } else {
            $rules['nama_users'] = ['sometimes', 'required', 'string', 'max:150'];
            $rules['no_hp'] = ['sometimes', 'required', 'string', 'max:20', Rule::unique('users', 'no_hp')->ignore($id, 'id_users')];
            $rules['password'] = ['sometimes', 'nullable', 'string', 'min:6'];
            $rules['auth_provider'] = ['sometimes', 'required', Rule::in(['EMAIL', 'GOOGLE', 'WHATSAPP_OTP'])];
            $rules['status'] = ['sometimes', 'required', Rule::in(['PENDING_VERIFICATION', 'ACTIVE', 'SUSPENDED', 'INACTIVE'])];
        }

        if ($isStore) {
            $rules['nik'] = ['required', 'string', 'size:16', 'regex:/^[0-9]{16}$/', 'unique:citizen,nik'];
            $rules['jenis_kelamin'] = ['required', Rule::in(['L', 'P'])];
            $rules['id_wilayah'] = ['required', 'exists:wilayah,id_wilayah'];
        } else {
            $citizenId = null;
            if ($id) {
                $citizenId = DB::table('users')->where('id_users', $id)->value('id_citizen');
            }
            $rules['nik'] = ['sometimes', 'string', 'size:16', 'regex:/^[0-9]{16}$/', Rule::unique('citizen', 'nik')->ignore($citizenId, 'id_citizen')];
            $rules['jenis_kelamin'] = ['sometimes', Rule::in(['L', 'P'])];
            $rules['id_wilayah'] = ['sometimes', 'exists:wilayah,id_wilayah'];
        }

        return $rules;
    }
}
