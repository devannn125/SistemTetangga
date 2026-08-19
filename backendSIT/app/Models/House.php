<?php

namespace App\Models;

use App\Models\Concerns\HasSequentialId;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class House extends Model
{
    use HasSequentialId;

    public const ID_PREFIX = 'HOU';

    protected $table = 'house';

    protected $primaryKey = 'id_house';

    protected $fillable = [
        'tipe', 'alamat', 'id_wilayah', 'latitude', 'longitude',
        'id_pemilik_citizen', 'status_kepemilikan', 'id_kategori_kos',
        'jumlah_kamar', 'jumlah_penghuni', 'status_pajak', 'status_aktif',
    ];

    protected $casts = [
        'latitude' => 'float',
        'longitude' => 'float',
        'jumlah_kamar' => 'integer',
        'jumlah_penghuni' => 'integer',
        'status_aktif' => 'boolean',
    ];

    public function wilayah(): BelongsTo
    {
        return $this->belongsTo(Wilayah::class, 'id_wilayah', 'id_wilayah');
    }

    public function pemilik(): BelongsTo
    {
        return $this->belongsTo(Citizen::class, 'id_pemilik_citizen', 'id_citizen');
    }

    public function kategoriKos(): BelongsTo
    {
        return $this->belongsTo(MasterData::class, 'id_kategori_kos', 'id_master');
    }

    public function photos(): HasMany
    {
        return $this->hasMany(HousePhoto::class, 'id_house', 'id_house');
    }

    public function rooms(): HasMany
    {
        return $this->hasMany(KosRoom::class, 'id_house', 'id_house');
    }
}
