<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FeedbackResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id_feedback' => $this->id_feedback,
            'id_pengirim_user' => $this->when(! $this->is_anonim, $this->id_pengirim_user),
            'isi_pesan' => $this->isi_pesan,
            'kategori' => $this->kategori,
            'is_anonim' => (bool) $this->is_anonim,
            'status' => $this->status,
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
