<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class FamilyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $id = $this->route('family')?->id_family ?? $this->route('family');

        return [
            'no_kk' => ['required', 'string', 'max:32', Rule::unique('family', 'no_kk')->ignore($id, 'id_family')],
            'id_kepala_keluarga' => ['nullable', 'exists:citizen,id_citizen'],
            'id_wilayah' => ['nullable', 'exists:wilayah,id_wilayah'],
            'status' => ['required', Rule::in(['ACTIVE', 'PINDAH', 'DIHAPUS'])],
        ];
    }
}
