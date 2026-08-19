<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AnnouncementResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id_announcement' => $this->id_announcement,
            'judul' => $this->judul,
            'isi' => $this->isi,
            'kategori' => $this->kategori,
            'id_wilayah' => $this->id_wilayah,
            'target' => $this->target,
            'lampiran_url' => $this->lampiran_url,
            'is_pinned' => (bool) $this->is_pinned,
            'status_approval' => $this->status_approval,
            'created_by' => $this->created_by,
            'created_at' => $this->created_at?->toIso8601String(),
            'wilayah' => $this->whenLoaded('wilayah', fn () => new WilayahResource($this->wilayah)),
        ];
    }
}
