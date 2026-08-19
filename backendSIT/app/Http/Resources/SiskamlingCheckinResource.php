<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SiskamlingCheckinResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id_siskamling_checkin' => $this->id_siskamling_checkin,
            'id_siskamling_schedule' => $this->id_siskamling_schedule,
            'checkin_time' => $this->checkin_time?->toIso8601String(),
            'latitude' => $this->latitude,
            'longitude' => $this->longitude,
            'foto_url' => $this->foto_url,
        ];
    }
}
