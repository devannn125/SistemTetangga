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
            'jenis_usaha' => $this->jenis_usaha,
            'alamat_usaha' => $this->alamat_usaha,
            'lama_usaha_tahun' => $this->lama_usaha_tahun,
            'status' => $this->status,
            'verified_by' => $this->verified_by,
            'verified_at' => $this->verified_at?->toIso8601String(),
            'approved_by' => $this->approved_by,
            'approved_at' => $this->approved_at?->toIso8601String(),
            'document_url' => $this->document_url,
            'tanggal_terbit' => $this->tanggal_terbit?->toDateString(),
            'id_wilayah' => $this->id_wilayah,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
            'pemohon' => $this->whenLoaded('pemohon', fn () => new CitizenResource($this->pemohon)),
            'signature' => $this->whenLoaded('signature', fn () => new DigitalSignatureResource($this->signature)),
        ];
    }
}
