<?php

namespace App\Models;

use App\Models\Concerns\HasSequentialId;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FinanceTransaction extends Model
{
    use HasSequentialId;

    public const ID_PREFIX = 'KEU';

    const UPDATED_AT = null;

    protected $table = 'keuangan_transaksi';

    protected $primaryKey = 'id_keuangan_transaksi';

    protected $fillable = ['id_wilayah', 'tipe', 'kategori', 'jumlah', 'deskripsi', 'bukti_url', 'tanggal', 'dicatat_oleh'];

    protected $casts = ['jumlah' => 'float', 'tanggal' => 'date'];

    public function wilayah(): BelongsTo
    {
        return $this->belongsTo(Wilayah::class, 'id_wilayah', 'id_wilayah');
    }

    public function pencatat(): BelongsTo
    {
        return $this->belongsTo(User::class, 'dicatat_oleh', 'id_users');
    }
}
