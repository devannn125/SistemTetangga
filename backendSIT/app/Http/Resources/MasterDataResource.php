<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MasterDataResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id_master' => $this->id_master,
            'tipe' => $this->tipe,
            'kode_master' => $this->kode_master,
            'nama_master' => $this->nama_master,
            'urutan' => $this->urutan,
            'is_active' => (bool) $this->is_active,
        ];
    }
}
