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

    /**
     * ID rumah yang "dimiliki" warga: milik anggota KK yang sama PLUS rumah kos
     * tempat warga menjadi penghuni. Tanpa perubahan skema — tetap via
     * citizen.id_family, house.id_pemilik_citizen, dan kos_room.id_penghuni_citizen.
     */
    public static function idsAccessibleByCitizen(string $idCitizen): array
    {
        $citizenIds = [$idCitizen];
        $familyId = Citizen::where('id_citizen', $idCitizen)->value('id_family');
        if ($familyId) {
            $citizenIds = Citizen::where('id_family', $familyId)->pluck('id_citizen')->all();
        }

        $owned = static::query()
            ->whereIn('id_pemilik_citizen', $citizenIds)
            ->where('status_aktif', 1)
            ->pluck('id_house');

        // Rumah kos tempat user sendiri jadi penghuni (keluarga TIDAK ikut
        // berbagi — kos adalah hunian pribadi, bukan rumah KK).
        $resided = KosRoom::query()
            ->where('id_penghuni_citizen', $idCitizen)
            ->whereHas('house', fn ($house) => $house->where('status_aktif', 1))
            ->pluck('id_house');

        return collect($owned)->merge($resided)->unique()->values()->all();
    }

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
