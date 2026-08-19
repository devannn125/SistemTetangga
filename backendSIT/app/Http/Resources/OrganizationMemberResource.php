<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrganizationMemberResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id_organization_member' => $this->id_organization_member,
            'id_citizen' => $this->id_citizen,
            'jabatan' => $this->jabatan,
            'id_wilayah' => $this->id_wilayah,
            'periode_mulai' => $this->periode_mulai?->toDateString(),
            'periode_selesai' => $this->periode_selesai?->toDateString(),
            'foto_url' => $this->foto_url,
            'status_aktif' => (bool) $this->status_aktif,
            'citizen' => $this->whenLoaded('citizen', fn () => new CitizenResource($this->citizen)),
            'wilayah' => $this->whenLoaded('wilayah', fn () => new WilayahResource($this->wilayah)),
        ];
    }
}
