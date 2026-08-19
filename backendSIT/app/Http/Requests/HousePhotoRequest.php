<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class HousePhotoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'id_house' => ['required', 'exists:house,id_house'],
            'file_url' => ['required', 'url', 'max:500'],
        ];
    }
}
