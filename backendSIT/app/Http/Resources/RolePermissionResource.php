<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RolePermissionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id_role_permission' => $this->id_role_permission,
            'id_role' => $this->id_role,
            'id_module' => $this->id_module,
            'id_permission_action' => $this->id_permission_action,
            'resource_scope' => $this->resource_scope,
            'scope_level' => $this->scope_level,
            'role' => $this->whenLoaded('role', fn () => new RoleResource($this->role)),
            'module' => $this->whenLoaded('module', fn () => new ModuleResource($this->module)),
            'action' => $this->whenLoaded('action', fn () => new PermissionActionResource($this->action)),
        ];
    }
}
