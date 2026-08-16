<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AuthUserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id_users' => $this->resource['id_users'],
            'nama_users' => $this->resource['nama_users'],
            'email' => $this->resource['email'],
            'no_hp' => $this->resource['no_hp'],
            'id_citizen' => $this->resource['id_citizen'],
            'role' => $this->resource['role'],
            'redirect_to' => $this->resource['redirect_to'],
        ];
    }
}
