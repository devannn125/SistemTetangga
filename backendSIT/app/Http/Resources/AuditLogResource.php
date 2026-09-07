<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AuditLogResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id_action_log' => $this->id_action_log,
            'id_users' => $this->id_users,
            'actor_name' => $this->user?->nama_users,
            'id_module' => $this->id_module,
            'id_permission_action' => $this->id_permission_action,
            'entity_type' => $this->entity_type,
            'entity_id' => $this->entity_id,
            'old_value' => $this->old_value,
            'new_value' => $this->new_value,
            'ip_address' => $this->ip_address,
            'created_at' => $this->created_at?->toIso8601String(),
            'module' => $this->whenLoaded('module', fn () => new ModuleResource($this->module)),
        ];
    }
}
