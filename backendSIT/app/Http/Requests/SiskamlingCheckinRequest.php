<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SiskamlingCheckinRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'id_siskamling_schedule' => ['required', 'exists:siskamling_schedule,id_siskamling_schedule'],
            'checkin_time' => ['required', 'date'],
            'latitude' => ['required', 'numeric', 'between:-90,90'],
            'longitude' => ['required', 'numeric', 'between:-180,180'],
            'foto_url' => ['nullable', 'string'],
        ];
    }
}
