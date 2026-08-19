<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class NotificationSubscriptionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id_users' => $this->id_users,
            'kategori' => $this->kategori,
            'is_subscribed' => (bool) $this->is_subscribed,
        ];
    }
}
