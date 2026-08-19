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
            'kepala_keluarga' => $this->whenLoaded('kepalaKeluarga', fn () => new CitizenResource($this->kepalaKeluarga)),
            'wilayah' => $this->whenLoaded('wilayah', fn () => new WilayahResource($this->wilayah)),
            'members' => $this->whenLoaded('members', fn () => CitizenResource::collection($this->members)),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
