<?php

namespace App\Models;

use App\Models\Concerns\HasSequentialId;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DigitalSignature extends Model
{
    use HasSequentialId;

    public const ID_PREFIX = 'DIG';

    const UPDATED_AT = null;

    protected $table = 'digital_signature';

    protected $primaryKey = 'id_digital_signature';

    protected $fillable = [
        'id_letter_request', 'document_hash', 'status', 'id_privy_transaction',
        'qr_code_url', 'signed_document_url', 'signed_at',
    ];

    protected $casts = ['signed_at' => 'datetime'];

    public function letterRequest(): BelongsTo
    {
        return $this->belongsTo(LetterRequest::class, 'id_letter_request', 'id_letter_request');
    }
}
