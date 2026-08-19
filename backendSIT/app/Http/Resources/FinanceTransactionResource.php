<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FinanceTransactionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id_keuangan_transaksi' => $this->id_keuangan_transaksi,
            'id_wilayah' => $this->id_wilayah,
            'tipe' => $this->tipe,
            'kategori' => $this->kategori,
            'jumlah' => (float) $this->jumlah,
            'deskripsi' => $this->deskripsi,
            'bukti_url' => $this->bukti_url,
            'tanggal' => $this->tanggal?->toDateString(),
            'dicatat_oleh' => $this->dicatat_oleh,
            'wilayah' => $this->whenLoaded('wilayah', fn () => new WilayahResource($this->wilayah)),
        ];
    }
}
