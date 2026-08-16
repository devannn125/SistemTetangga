<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CitizenResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id_citizen' => $this->id_citizen,
            'nik' => $this->nik,
            'nama_lengkap' => $this->nama_lengkap,
            'jenis_kelamin' => $this->jenis_kelamin,
            'status_warga' => $this->status_warga,
            'kewarganegaraan' => $this->kewarganegaraan,
            'status_hidup' => $this->status_hidup,
            'status_aktif' => (bool) $this->status_aktif,
            'no_hp' => $this->no_hp,
            'email' => $this->email,
            'tanggal_lahir' => $this->tanggal_lahir?->toDateString(),
            'id_family' => $this->id_family,
            'id_wilayah' => $this->id_wilayah,
        ];
    }
}
