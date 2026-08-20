<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class FinanceTransactionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'id_wilayah' => ['sometimes', 'exists:wilayah,id_wilayah'],
            'tipe' => ['required', Rule::in(['PEMASUKAN', 'PENGELUARAN'])],
            'kategori' => ['nullable', 'string', 'max:100'],
            'jumlah' => ['required', 'numeric', 'min:0.01'],
            'deskripsi' => ['nullable', 'string', 'max:255'],
            'bukti_url' => ['nullable', 'url', 'max:500'],
            'tanggal' => ['required', 'date'],
            'dicatat_oleh' => ['sometimes', 'exists:users,id_users'],
        ];
    }
}
