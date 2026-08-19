<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class HouseResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id_house' => $this->id_house,
            'tipe' => $this->tipe,
            'alamat' => $this->alamat,
            'id_wilayah' => $this->id_wilayah,
            'latitude' => $this->latitude,
            'longitude' => $this->longitude,
            'id_pemilik_citizen' => $this->id_pemilik_citizen,
            'status_kepemilikan' => $this->status_kepemilikan,
            'jumlah_kamar' => $this->jumlah_kamar,
            'jumlah_penghuni' => $this->jumlah_penghuni,
            'status_pajak' => $this->status_pajak,
            'status_aktif' => (bool) $this->status_aktif,
            'pemilik' => $this->whenLoaded('pemilik', fn () => new CitizenResource($this->pemilik)),
            'wilayah' => $this->whenLoaded('wilayah', fn () => new WilayahResource($this->wilayah)),
            'photos' => $this->whenLoaded('photos', fn () => HousePhotoResource::collection($this->photos)),
            'rooms' => $this->whenLoaded('rooms', fn () => KosRoomResource::collection($this->rooms)),
        ];
    }
}
