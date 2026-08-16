<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FamilyResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id_family' => $this->id_family,
            'no_kk' => $this->no_kk,
            'id_kepala_keluarga' => $this->id_kepala_keluarga,
            'id_wilayah' => $this->id_wilayah,
            'status' => $this->status,
            'members_count' => $this->whenCounted('members'),
        ];
    }
}
