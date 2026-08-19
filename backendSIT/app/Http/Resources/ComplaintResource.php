<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ComplaintResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id_complaint' => $this->id_complaint,
            'nomor_tiket' => $this->nomor_tiket,
            'id_pengirim_user' => $this->id_pengirim_user,
            'judul' => $this->judul,
            'kategori' => $this->kategori,
            'deskripsi' => $this->deskripsi,
            'lokasi' => $this->lokasi,
            'urgensi' => $this->urgensi,
            'status' => $this->status,
            'rating' => $this->rating,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
            'pengirim' => $this->whenLoaded('pengirim', fn () => new UserResource($this->pengirim)),
        ];
    }
}
