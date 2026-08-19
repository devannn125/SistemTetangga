<?php

namespace App\Models;

use App\Models\Concerns\HasSequentialId;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FeeBill extends Model
{
    use HasSequentialId;

    public const ID_PREFIX = 'IUR';

    public $timestamps = false;

    protected $table = 'iuran_tagihan';

    protected $primaryKey = 'id_iuran_tagihan';

    protected $fillable = ['id_family', 'periode', 'jumlah_tagihan', 'status', 'jatuh_tempo', 'dikonfirmasi_oleh', 'dikonfirmasi_at'];

    protected $casts = ['jumlah_tagihan' => 'float', 'jatuh_tempo' => 'date', 'dikonfirmasi_at' => 'datetime'];

    public function family(): BelongsTo
    {
        return $this->belongsTo(Family::class, 'id_family', 'id_family');
    }
}
