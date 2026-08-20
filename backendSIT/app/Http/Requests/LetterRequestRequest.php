<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class LetterRequestRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $id = $this->route('letter_request')?->id_letter_request ?? $this->route('letter_request') ?? '';
        $required = $this->isMethod('PATCH') ? 'sometimes' : 'required';

        return [
            'nomor_surat' => ['nullable', 'string', 'max:50', Rule::unique('letter_request', 'nomor_surat')->ignore($id, 'id_letter_request')],
            'jenis_surat' => [$required, Rule::in(['DOMISILI', 'USAHA'])],
            'id_pemohon_citizen' => ['sometimes', 'exists:citizen,id_citizen'],
            'keperluan' => ['nullable', 'string', 'max:255'],
            'nama_usaha' => ['required_if:jenis_surat,USAHA', 'nullable', 'string', 'max:150'],
            'jenis_usaha' => ['required_if:jenis_surat,USAHA', 'nullable', 'string', 'max:150'],
            'alamat_usaha' => ['required_if:jenis_surat,USAHA', 'nullable', 'string', 'max:255'],
            'lama_usaha_tahun' => ['nullable', 'numeric', 'min:0', 'max:99.9'],
            'status' => ['sometimes', 'nullable', Rule::in(['DIAJUKAN', 'DIVERIFIKASI', 'DISETUJUI', 'DITANDATANGANI', 'TERBIT', 'DITOLAK'])],
            'id_wilayah' => ['sometimes', 'exists:wilayah,id_wilayah'],
        ];
    }
}
