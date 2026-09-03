<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PosyanduScheduleResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id_posyandu_schedule' => $this->id_posyandu_schedule,
            'id_wilayah' => $this->id_wilayah,
            'tanggal_jadwal' => $this->tanggal_jadwal?->toDateString(),
            'jam_mulai' => $this->jam_mulai,
            'nama_kegiatan' => $this->nama_kegiatan,
            'lokasi' => $this->lokasi,
            'keterangan' => $this->keterangan,
            'penyelenggara' => $this->penyelenggara,
            'created_at' => $this->created_at?->toIso8601String(),
            'wilayah' => $this->whenLoaded('wilayah', fn () => new WilayahResource($this->wilayah)),
        ];
    }
}
