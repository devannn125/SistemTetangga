<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class LogoutRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Route sudah dilindungi middleware auth:sanctum,
        // jadi kalau sampai ke sini berarti user sudah login.
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [];
    }
}