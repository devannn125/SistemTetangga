<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LetterRequestResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id_letter_request' => $this->id_letter_request,
            'nomor_surat' => $this->nomor_surat,
            'jenis_surat' => $this->jenis_surat,
            'id_pemohon_citizen' => $this->id_pemohon_citizen,
            'keperluan' => $this->keperluan,
            'nama_usaha' => $this->nama_usaha,
            'status' => $this->status,
            'document_url' => $this->document_url,
            'tanggal_terbit' => $this->tanggal_terbit,
            'id_wilayah' => $this->id_wilayah,
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
