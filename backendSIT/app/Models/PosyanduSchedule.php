<?php

namespace App\Models;

use App\Models\Concerns\HasSequentialId;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PosyanduSchedule extends Model
{
    use HasSequentialId;

    public const ID_PREFIX = 'PSY';

    const UPDATED_AT = null;

    protected $table = 'posyandu_schedule';

    protected $primaryKey = 'id_posyandu_schedule';

    protected $fillable = [
        'id_wilayah',
        'tanggal_jadwal',
        'jam_mulai',
        'nama_kegiatan',
        'lokasi',
        'keterangan',
        'penyelenggara',
    ];

    protected $casts = [
        'tanggal_jadwal' => 'date',
    ];

    public function wilayah(): BelongsTo
    {
        return $this->belongsTo(Wilayah::class, 'id_wilayah', 'id_wilayah');
    }
}
