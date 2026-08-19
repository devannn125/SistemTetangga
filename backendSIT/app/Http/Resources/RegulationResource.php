<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RegulationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id_regulation' => $this->id_regulation,
            'kategori' => $this->kategori,
            'judul' => $this->judul,
            'isi' => $this->isi,
            'lampiran_url' => $this->lampiran_url,
            'id_wilayah' => $this->id_wilayah,
            'versi' => $this->versi,
            'tanggal_berlaku' => $this->tanggal_berlaku?->toDateString(),
            'status' => $this->status,
            'created_by' => $this->created_by,
            'created_at' => $this->created_at?->toIso8601String(),
            'wilayah' => $this->whenLoaded('wilayah', fn () => new WilayahResource($this->wilayah)),
        ];
    }
}
