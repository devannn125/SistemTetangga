<?php

namespace App\Models;

use App\Models\Concerns\HasSequentialId;
use Illuminate\Database\Eloquent\Model;

/**
 * Tabel `master_data` menampung banyak jenis data referensi sekaligus (agama,
 * pendidikan, profesi, kategori bansos/kos, dst — lihat Bab 6.12.4 PRD),
 * dibedakan lewat kolom `tipe`. Unique constraint (tipe, kode_master) memastikan
 * kode tidak bentrok dalam satu tipe yang sama.
 */
class MasterData extends Model
{
    use HasSequentialId;

    public const ID_PREFIX = 'MST';

    protected $table = 'master_data';
    protected $primaryKey = 'id_master';

    protected $fillable = [
        'tipe',
        'kode_master',
        'nama_master',
        'urutan',
        'is_active',
    ];

    protected $casts = [
        'urutan' => 'integer',
        'is_active' => 'boolean',
    ];

    // Tipe yang dipakai relasi di Citizen. Sesuaikan/tambah kalau ada tipe lain
    // (mis. KATEGORI_BANSOS, KATEGORI_KOS) sesuai isi enum `tipe` yang sebenarnya.
    public const TIPE_AGAMA = 'AGAMA';
    public const TIPE_PENDIDIKAN = 'PENDIDIKAN';
    public const TIPE_PROFESI = 'PROFESI';

    public function scopeTipe($query, string $tipe)
    {
        return $query->where('tipe', $tipe);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', 1);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('urutan')->orderBy('nama_master');
    }
}