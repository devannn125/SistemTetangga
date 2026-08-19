<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class HousePhotoResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id_house_photo' => $this->id_house_photo,
            'id_house' => $this->id_house,
            'file_url' => $this->file_url,
            'uploaded_at' => $this->uploaded_at?->toIso8601String(),
        ];
    }
}
