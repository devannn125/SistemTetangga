<?php

namespace App\Models;

use App\Models\Concerns\HasSequentialId;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Regulation extends Model
{
    use HasSequentialId;

    public const ID_PREFIX = 'REG';

    const UPDATED_AT = null;

    protected $table = 'regulation';

    protected $primaryKey = 'id_regulation';

    protected $fillable = [
        'kategori', 'judul', 'isi', 'lampiran_url', 'id_wilayah',
        'versi', 'tanggal_berlaku', 'status', 'created_by',
    ];

    protected $casts = [
        'versi' => 'integer',
        'tanggal_berlaku' => 'date',
    ];

    public function wilayah(): BelongsTo
    {
        return $this->belongsTo(Wilayah::class, 'id_wilayah', 'id_wilayah');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by', 'id_users');
    }
}
