<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PermissionOverrideResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id_permission_override' => $this->id_permission_override,
            'id_users' => $this->id_users,
            'id_module' => $this->id_module,
            'id_permission_action' => $this->id_permission_action,
            'id_wilayah' => $this->id_wilayah,
            'is_granted' => (bool) $this->is_granted,
            'reason' => $this->reason,
            'created_by' => $this->created_by,
            'created_at' => $this->created_at?->toIso8601String(),
            'expires_at' => $this->expires_at?->toIso8601String(),
            'module' => $this->whenLoaded('module', fn () => new ModuleResource($this->module)),
            'action' => $this->whenLoaded('action', fn () => new PermissionActionResource($this->action)),
        ];
    }
}
