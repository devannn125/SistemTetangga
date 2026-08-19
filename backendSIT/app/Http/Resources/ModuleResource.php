<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ModuleResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id_module' => $this->id_module,
            'kode_module' => $this->kode_module,
            'nama_module' => $this->nama_module,
            'urutan' => $this->urutan,
        ];
    }
}
