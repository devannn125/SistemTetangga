<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class KosRoomResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id_kos_room' => $this->id_kos_room,
            'id_house' => $this->id_house,
            'nomor_kamar' => $this->nomor_kamar,
            'status_okupansi' => $this->status_okupansi,
            'id_penghuni_citizen' => $this->id_penghuni_citizen,
            'penghuni' => $this->whenLoaded('penghuni', fn () => new CitizenResource($this->penghuni)),
        ];
    }
}
