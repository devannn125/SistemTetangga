<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AnnouncementReadStatusResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id_announcement_read_status' => $this->id_announcement_read_status,
            'id_users' => $this->id_users,
            'read_at' => $this->read_at?->toIso8601String(),
        ];
    }
}
