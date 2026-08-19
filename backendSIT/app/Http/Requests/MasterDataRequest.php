<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class MasterDataRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'tipe' => ['required', Rule::in(['AGAMA', 'PENDIDIKAN', 'PROFESI', 'KATEGORI_BANSOS', 'KATEGORI_KOS', 'JENIS_KEJADIAN_SISKAMLING'])],
            'kode_master' => ['required', 'string', 'max:50', Rule::unique('master_data', 'kode_master')->where('tipe', $this->input('tipe'))->ignore($this->route('master'))],
            'nama_master' => ['required', 'string', 'max:100'],
            'urutan' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['boolean'],
        ];
    }
}
