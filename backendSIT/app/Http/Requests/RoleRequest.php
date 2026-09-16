<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class RoleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'kode' => ['required', 'string', 'max:50', Rule::unique('role', 'kode')->ignore($this->route('role'), 'id_role')],
            'nama_role' => ['required', 'string', 'max:100'],
            'level' => ['required', 'integer', 'min:1'],
            'is_strategic' => ['boolean'],
            'deskripsi' => ['nullable', 'string', 'max:255'],
        ];
    }
}

