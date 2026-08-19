<?php

namespace App\Models;

use App\Models\Concerns\HasSequentialId;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SiskamlingIncident extends Model
{
    use HasSequentialId;

    public const ID_PREFIX = 'SKI';

    const UPDATED_AT = null;

    protected $table = 'siskamling_incident';

    protected $primaryKey = 'id_siskamling_incident';

    protected $fillable = [
        'id_wilayah', 'dilaporkan_oleh', 'id_jenis_kejadian', 'lokasi',
        'deskripsi', 'foto_url', 'is_panic', 'status',
    ];

    protected $casts = ['is_panic' => 'boolean'];

    public function wilayah(): BelongsTo
    {
        return $this->belongsTo(Wilayah::class, 'id_wilayah', 'id_wilayah');
    }

    public function pelapor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'dilaporkan_oleh', 'id_users');
    }

    public function jenisKejadian(): BelongsTo
    {
        return $this->belongsTo(MasterData::class, 'id_jenis_kejadian', 'id_master');
    }
}
