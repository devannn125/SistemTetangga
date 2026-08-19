<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SiskamlingScheduleResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id_siskamling_schedule' => $this->id_siskamling_schedule,
            'id_wilayah' => $this->id_wilayah,
            'id_petugas_citizen' => $this->id_petugas_citizen,
            'shift' => $this->shift,
            'tanggal_jadwal' => $this->tanggal_jadwal?->toDateString(),
            'created_at' => $this->created_at?->toIso8601String(),
            'wilayah' => $this->whenLoaded('wilayah', fn () => new WilayahResource($this->wilayah)),
            'petugas' => $this->whenLoaded('petugas', fn () => new CitizenResource($this->petugas)),
            'checkins' => $this->whenLoaded('checkins', fn () => SiskamlingCheckinResource::collection($this->checkins)),
        ];
    }
}
