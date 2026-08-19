<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class GuestResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id_guest' => $this->id_guest,
            'nama' => $this->nama,
            'nik' => $this->nik,
            'asal' => $this->asal,
            'id_house' => $this->id_house,
            'foto_identitas_url' => $this->foto_identitas_url,
            'jam_masuk' => $this->jam_masuk?->toIso8601String(),
            'jam_keluar' => $this->jam_keluar?->toIso8601String(),
            'lama_tinggal_hari' => $this->lama_tinggal_hari,
            'status' => $this->status,
            'approved_by' => $this->approved_by,
            'approved_at' => $this->approved_at?->toIso8601String(),
            'created_at' => $this->created_at?->toIso8601String(),
            'house' => $this->whenLoaded('house', fn () => new HouseResource($this->house)),
        ];
    }
}
