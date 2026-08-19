<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class OrganizationMemberRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'id_citizen' => ['required', 'exists:citizen,id_citizen'],
            'jabatan' => ['required', 'string', 'max:100'],
            'id_wilayah' => ['required', 'exists:wilayah,id_wilayah'],
            'periode_mulai' => ['required', 'date'],
            'periode_selesai' => ['nullable', 'date', 'after_or_equal:periode_mulai'],
            'foto_url' => ['nullable', 'url', 'max:500'],
            'status_aktif' => ['boolean'],
        ];
    }
}
