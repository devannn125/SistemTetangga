<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FeeBillResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id_iuran_tagihan' => $this->id_iuran_tagihan,
            'id_family' => $this->id_family,
            'periode' => $this->periode,
            'jumlah_tagihan' => (float) $this->jumlah_tagihan,
            'status' => $this->status,
            'jatuh_tempo' => $this->jatuh_tempo?->toDateString(),
            'dikonfirmasi_oleh' => $this->dikonfirmasi_oleh,
            'dikonfirmasi_at' => $this->dikonfirmasi_at?->toIso8601String(),
            'family' => $this->whenLoaded('family', fn () => new FamilyResource($this->family)),
        ];
    }
}
