<?php

namespace App\Models;

use App\Models\Concerns\HasSequentialId;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Guest extends Model
{
    use HasSequentialId;

    public const ID_PREFIX = 'GST';

    const UPDATED_AT = null;

    protected $table = 'guest';

    protected $primaryKey = 'id_guest';

    protected $fillable = [
        'nama', 'nik', 'asal', 'id_house', 'foto_identitas_url',
        'jam_masuk', 'jam_keluar', 'lama_tinggal_hari', 'status',
        'approved_by', 'approved_at',
    ];

    protected $casts = [
        'jam_masuk' => 'datetime',
        'jam_keluar' => 'datetime',
        'approved_at' => 'datetime',
        'lama_tinggal_hari' => 'integer',
    ];

    public function house(): BelongsTo
    {
        return $this->belongsTo(House::class, 'id_house', 'id_house');
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by', 'id_users');
    }
}
