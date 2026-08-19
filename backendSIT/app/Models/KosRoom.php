<?php

namespace App\Models;

use App\Models\Concerns\HasSequentialId;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class KosRoom extends Model
{
    use HasSequentialId;

    public const ID_PREFIX = 'KRM';

    public $timestamps = false;

    protected $table = 'kos_room';

    protected $primaryKey = 'id_kos_room';

    protected $fillable = ['id_house', 'nomor_kamar', 'status_okupansi', 'id_penghuni_citizen'];

    public function house(): BelongsTo
    {
        return $this->belongsTo(House::class, 'id_house', 'id_house');
    }

    public function penghuni(): BelongsTo
    {
        return $this->belongsTo(Citizen::class, 'id_penghuni_citizen', 'id_citizen');
    }
}
