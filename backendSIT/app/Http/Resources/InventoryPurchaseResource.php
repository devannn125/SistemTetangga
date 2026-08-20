<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class InventoryPurchaseResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id_inventory_purchase' => $this->id_inventory_purchase,
            'nama_barang' => $this->nama_barang,
            'jumlah' => $this->jumlah,
            'satuan' => $this->satuan,
            'perkiraan_biaya' => $this->perkiraan_biaya,
            'alasan' => $this->alasan,
            'status' => $this->status,
            'id_wilayah' => $this->id_wilayah,
            'diajukan_oleh' => $this->diajukan_oleh,
            'disetujui_oleh' => $this->disetujui_oleh,
            'disetujui_at' => $this->disetujui_at?->toIso8601String(),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
            'diajukanOleh' => $this->whenLoaded('diajukanOleh', fn () => new UserResource($this->diajukanOleh)),
            'disetujuiOleh' => $this->whenLoaded('disetujuiOleh', fn () => new UserResource($this->disetujuiOleh)),
            'wilayah' => $this->whenLoaded('wilayah', fn () => new WilayahResource($this->wilayah)),
        ];
    }
}