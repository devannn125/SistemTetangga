<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SiskamlingIncidentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id_siskamling_incident' => $this->id_siskamling_incident,
            'id_wilayah' => $this->id_wilayah,
            'dilaporkan_oleh' => $this->dilaporkan_oleh,
            'id_jenis_kejadian' => $this->id_jenis_kejadian,
            'lokasi' => $this->lokasi,
            'deskripsi' => $this->deskripsi,
            'foto_url' => $this->foto_url,
            'is_panic' => (bool) $this->is_panic,
            'status' => $this->status,
            'created_at' => $this->created_at?->toIso8601String(),
            'wilayah' => $this->whenLoaded('wilayah', fn () => new WilayahResource($this->wilayah)),
            'jenis_kejadian' => $this->whenLoaded('jenisKejadian', fn () => new MasterDataResource($this->jenisKejadian)),
        ];
    }
}
