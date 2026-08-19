<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class NotificationLogResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id_notification_log' => $this->id_notification_log,
            'id_users' => $this->id_users,
            'jenis' => $this->jenis,
            'channel' => $this->channel,
            'isi_pesan' => $this->isi_pesan,
            'status_kirim' => $this->status_kirim,
            'retry_count' => $this->retry_count,
            'related_entity_type' => $this->related_entity_type,
            'id_related_entity' => $this->id_related_entity,
            'sent_at' => $this->sent_at?->toIso8601String(),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
