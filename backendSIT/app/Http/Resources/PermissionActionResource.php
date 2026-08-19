<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PermissionActionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id_permission_action' => $this->id_permission_action,
            'kode_permission' => $this->kode_permission,
            'deskripsi' => $this->deskripsi,
        ];
    }
}
