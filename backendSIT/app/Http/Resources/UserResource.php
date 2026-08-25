<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id_users' => $this->id_users,
            'nama_users' => $this->nama_users,
            'email' => $this->email,
            'no_hp' => $this->no_hp,
            'id_citizen' => $this->id_citizen,
            // 'nik' dan 'role' diisi manual di controller lewat setAttribute()
            // sebelum resource ini dibuat, karena bukan kolom asli tabel users.
            'nik' => $this->nik,
            'telegram_chat_id' => $this->telegram_chat_id,
            'telegram_linked_at' => $this->telegram_linked_at,
            'auth_provider' => $this->auth_provider,
            'status' => $this->status,
            'role' => $this->active_role,
            'roles' => $this->available_roles ?? [],
            'user_roles' => $this->whenLoaded('userRoles', fn () => $this->userRoles
                ->map(fn ($ur) => [
                    'id_user_role' => $ur->id_user_role,
                    'kode' => $ur->role?->kode,
                    'nama_role' => $ur->role?->nama_role,
                    'id_wilayah' => $ur->id_wilayah,
                    'status' => $ur->status,
                ])
                ->values()
                ->all()),
            'last_login_at' => $this->last_login_at,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}