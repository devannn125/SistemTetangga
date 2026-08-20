<?php

namespace App\Models;

use App\Models\Concerns\HasSequentialId;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InventoryPurchase extends Model
{
    use HasSequentialId;

    public const ID_PREFIX = 'INV-PUR';

    protected $table = 'inventory_purchase';

    protected $primaryKey = 'id_inventory_purchase';

    protected $fillable = [
        'nama_barang', 'jumlah', 'satuan', 'perkiraan_biaya', 'alasan',
        'status', 'id_wilayah', 'diajukan_oleh', 'disetujui_oleh', 'disetujui_at',
    ];

    protected $casts = [
        'jumlah' => 'integer',
        'perkiraan_biaya' => 'decimal:2',
        'disetujui_at' => 'datetime',
    ];

    public function wilayah(): BelongsTo
    {
        return $this->belongsTo(Wilayah::class, 'id_wilayah', 'id_wilayah');
    }

    public function diajukanOleh(): BelongsTo
    {
        return $this->belongsTo(User::class, 'diajukan_oleh', 'id_users');
    }

    public function disetujuiOleh(): BelongsTo
    {
        return $this->belongsTo(User::class, 'disetujui_oleh', 'id_users');
    }
}