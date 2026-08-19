<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CitizenHistoryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id_citizen_history' => $this->id_citizen_history,
            'id_citizen' => $this->id_citizen,
            'field_changed' => $this->field_changed,
            'old_value' => $this->old_value,
            'new_value' => $this->new_value,
            'changed_by' => $this->changed_by,
            'changed_at' => $this->changed_at?->toIso8601String(),
        ];
    }
}
