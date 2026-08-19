<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class KosRoomRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'id_house' => ['required', 'exists:house,id_house'],
            'nomor_kamar' => ['required', 'string', 'max:20'],
            'status_okupansi' => ['required', Rule::in(['KOSONG', 'TERISI'])],
            'id_penghuni_citizen' => ['nullable', 'exists:citizen,id_citizen'],
        ];
    }
}
