<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class WilayahResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id_wilayah' => $this->id_wilayah,
            'nama_wilayah' => $this->nama_wilayah,
            'tipe' => $this->tipe,
            'kode_wilayah' => $this->kode_wilayah,
            'parent_id' => $this->parent_id,
            'parent' => $this->whenLoaded('parent', fn () => new WilayahResource($this->parent)),
            'children' => $this->whenLoaded('children', fn () => WilayahResource::collection($this->children)),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
