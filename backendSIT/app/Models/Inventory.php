<?php

namespace App\Models;

use App\Models\Concerns\HasSequentialId;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Inventory extends Model
{
    use HasSequentialId;

    public const ID_PREFIX = 'INV';

    protected $table = 'inventory';

    protected $primaryKey = 'id_inventory';

    protected $fillable = [
        'nama_barang', 'kategori', 'jumlah', 'satuan', 'kondisi',
        'lokasi', 'id_wilayah', 'status_aktif', 'created_by',
    ];

    protected $casts = [
        'jumlah' => 'integer',
        'status_aktif' => 'boolean',
    ];

    public function wilayah(): BelongsTo
    {
        return $this->belongsTo(Wilayah::class, 'id_wilayah', 'id_wilayah');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by', 'id_users');
    }

    public function purchases(): HasMany
    {
        return $this->hasMany(InventoryPurchase::class, 'id_inventory', 'id_inventory');
    }
}