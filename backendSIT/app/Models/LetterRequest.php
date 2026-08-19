<?php

namespace App\Models;

use App\Models\Concerns\HasSequentialId;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class LetterRequest extends Model
{
    use HasSequentialId;

    public const ID_PREFIX = 'LTR';

    protected $table = 'letter_request';

    protected $primaryKey = 'id_letter_request';

    protected $fillable = [
        'nomor_surat', 'jenis_surat', 'id_pemohon_citizen', 'keperluan',
        'nama_usaha', 'jenis_usaha', 'alamat_usaha', 'lama_usaha_tahun',
        'status', 'verified_by', 'verified_at', 'approved_by', 'approved_at',
        'document_url', 'tanggal_terbit', 'id_wilayah',
    ];

    protected $casts = [
        'lama_usaha_tahun' => 'float',
        'verified_at' => 'datetime',
        'approved_at' => 'datetime',
        'tanggal_terbit' => 'date',
    ];

    public function pemohon(): BelongsTo
    {
        return $this->belongsTo(Citizen::class, 'id_pemohon_citizen', 'id_citizen');
    }

    public function wilayah(): BelongsTo
    {
        return $this->belongsTo(Wilayah::class, 'id_wilayah', 'id_wilayah');
    }

    public function signature(): HasOne
    {
        return $this->hasOne(DigitalSignature::class, 'id_letter_request', 'id_letter_request');
    }
}
