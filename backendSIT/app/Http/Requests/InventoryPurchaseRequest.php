<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class InventoryPurchaseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $id = $this->route('inventory_purchase')?->id_inventory_purchase ?? $this->route('inventory_purchase') ?? '';
        $required = $this->isMethod('PATCH') ? 'sometimes' : 'required';

        return [
            'nama_barang' => [$required, 'string', 'max:150'],
            'jumlah' => [$required, 'integer', 'min:1'],
            'satuan' => ['nullable', 'string', 'max:50'],
            'perkiraan_biaya' => ['nullable', 'numeric', 'min:0'],
            'alasan' => ['nullable', 'string'],
            'status' => ['sometimes', 'nullable', Rule::in(['DIAJUKAN', 'DISETUJUI', 'DITOLAK'])],
            'id_wilayah' => ['sometimes', 'exists:wilayah,id_wilayah'],
        ];
    }
}