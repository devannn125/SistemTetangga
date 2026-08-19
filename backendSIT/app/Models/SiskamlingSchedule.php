<?php

namespace App\Models;

use App\Models\Concerns\HasSequentialId;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SiskamlingSchedule extends Model
{
    use HasSequentialId;

    public const ID_PREFIX = 'SKJ';

    const UPDATED_AT = null;

    protected $table = 'siskamling_schedule';

    protected $primaryKey = 'id_siskamling_schedule';

    protected $fillable = ['id_wilayah', 'id_petugas_citizen', 'shift', 'tanggal_jadwal'];

    protected $casts = ['tanggal_jadwal' => 'date'];

    public function wilayah(): BelongsTo
    {
        return $this->belongsTo(Wilayah::class, 'id_wilayah', 'id_wilayah');
    }

    public function petugas(): BelongsTo
    {
        return $this->belongsTo(Citizen::class, 'id_petugas_citizen', 'id_citizen');
    }

    public function checkins()
    {
        return $this->hasMany(SiskamlingCheckin::class, 'id_siskamling_schedule', 'id_siskamling_schedule');
    }
}
