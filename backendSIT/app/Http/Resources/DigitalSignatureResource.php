<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DigitalSignatureResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id_digital_signature' => $this->id_digital_signature,
            'id_letter_request' => $this->id_letter_request,
            'document_hash' => $this->document_hash,
            'status' => $this->status,
            'id_privy_transaction' => $this->id_privy_transaction,
            'qr_code_url' => $this->qr_code_url,
            'signed_document_url' => $this->signed_document_url,
            'signed_at' => $this->signed_at?->toIso8601String(),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
