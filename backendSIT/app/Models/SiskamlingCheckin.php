<?php

namespace App\Models;

use App\Models\Concerns\HasSequentialId;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SiskamlingCheckin extends Model
{
    use HasSequentialId;

    public const ID_PREFIX = 'SKC';

    public $timestamps = false;

    protected $table = 'siskamling_checkin';

    protected $primaryKey = 'id_siskamling_checkin';

    protected $fillable = ['id_siskamling_schedule', 'checkin_time', 'latitude', 'longitude', 'foto_url'];

    protected $casts = [
        'checkin_time' => 'datetime',
        'latitude' => 'float',
        'longitude' => 'float',
    ];

    public function schedule(): BelongsTo
    {
        return $this->belongsTo(SiskamlingSchedule::class, 'id_siskamling_schedule', 'id_siskamling_schedule');
    }
}
