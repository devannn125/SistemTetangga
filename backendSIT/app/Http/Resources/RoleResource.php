<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RoleResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id_role' => $this->id_role,
            'kode' => $this->kode,
            'nama_role' => $this->nama_role,
            'level' => $this->level,
            'is_strategic' => (bool) $this->is_strategic,
            'deskripsi' => $this->deskripsi,
        ];
    }
}
