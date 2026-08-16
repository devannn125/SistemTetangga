<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class HouseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'tipe' => ['required', Rule::in(['NON_KOS', 'KOS'])],
            'alamat' => ['required', 'string', 'max:255'],
            'id_wilayah' => ['required', 'exists:wilayah,id_wilayah'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'id_pemilik_citizen' => ['nullable', 'exists:citizen,id_citizen'],
            'status_kepemilikan' => ['nullable', Rule::in(['MILIK_SENDIRI', 'KONTRAK'])],
            'id_kategori_kos' => ['nullable', 'exists:master_data,id_master'],
            'jumlah_kamar' => ['nullable', 'integer', 'min:0'],
            'jumlah_penghuni' => ['integer', 'min:0'],
            'status_pajak' => ['nullable', Rule::in(['LUNAS', 'BELUM_LUNAS'])],
            'status_aktif' => ['boolean'],
        ];
    }
}
