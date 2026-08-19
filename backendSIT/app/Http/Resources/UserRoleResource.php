<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserRoleResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id_user_role' => $this->id_user_role,
            'id_users' => $this->id_users,
            'id_role' => $this->id_role,
            'id_wilayah' => $this->id_wilayah,
            'periode_mulai' => $this->periode_mulai?->toDateString(),
            'periode_selesai' => $this->periode_selesai?->toDateString(),
            'status' => $this->status,
            'assigned_by' => $this->assigned_by,
            'assigned_at' => $this->assigned_at?->toIso8601String(),
            'role' => $this->whenLoaded('role', fn () => new RoleResource($this->role)),
            'wilayah' => $this->whenLoaded('wilayah', fn () => new WilayahResource($this->wilayah)),
        ];
    }
}
