<?php

namespace App\Models;

use App\Models\Concerns\HasSequentialId;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Citizen extends Model
{
    use HasFactory, HasSequentialId;

    public const ID_PREFIX = 'CIT';

    protected $table = 'citizen';

    protected $primaryKey = 'id_citizen';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'nik',
        'id_family',
        'nama_lengkap',
        'hubungan_keluarga',
        'tempat_lahir',
        'tanggal_lahir',
        'jenis_kelamin',
        'id_agama',
        'status_nikah',
        'id_pendidikan',
        'id_profesi',
        'no_hp',
        'email',
        'status_warga',
        'kewarganegaraan',
        'status_ekonomi',
        'penerima_bansos',
        'tanggal_masuk_rt',
        'tanggal_keluar_rt',
        'id_wilayah',
        'alamat_kk_luar_rt',
        'berdomisili_luar_rt',
        'status_hidup',
        'status_aktif',
    ];

    protected $casts = [
        'tanggal_lahir' => 'date',
        'tanggal_masuk_rt' => 'date',
        'tanggal_keluar_rt' => 'date',
        'penerima_bansos' => 'boolean',
        'alamat_kk_luar_rt' => 'boolean',
        'berdomisili_luar_rt' => 'boolean',
        'status_aktif' => 'boolean',
    ];

    /**
     * Kolom yang dianggap "data sensitif" sesuai Batasan_Role_RT_Digital.md (Business Rule #3):
     * hanya boleh diakses Ketua RT, Sekretaris, dan Bendahara.
     * Catatan: kategori "penyakit" belum ada di tabel ini (di luar scope MVP).
     */
    public const SENSITIVE_FIELDS = [
        'status_ekonomi',
        'penerima_bansos',
        'kewarganegaraan',
    ];

    protected static function boot()
    {
        parent::boot();
    }

    // id_agama, id_pendidikan, id_profesi semuanya menunjuk ke tabel `master_data`
    // (satu tabel referensi bertipe, lihat App\Models\MasterData), dibedakan lewat
    // kolom `tipe` supaya tidak salah ambil master data tipe lain.

    public function agama()
    {
        return $this->belongsTo(MasterData::class, 'id_agama', 'id_master')
            ->where('tipe', MasterData::TIPE_AGAMA);
    }

    public function pendidikan()
    {
        return $this->belongsTo(MasterData::class, 'id_pendidikan', 'id_master')
            ->where('tipe', MasterData::TIPE_PENDIDIKAN);
    }

    public function profesi()
    {
        return $this->belongsTo(MasterData::class, 'id_profesi', 'id_master')
            ->where('tipe', MasterData::TIPE_PROFESI);
    }

    public function wilayah()
    {
        return $this->belongsTo(Wilayah::class, 'id_wilayah', 'id_wilayah');
    }

    public function family()
    {
        return $this->belongsTo(Family::class, 'id_family', 'id_family');
    }

    public function scopeActive($query)
    {
        return $query->where('status_aktif', 1);
    }

    public function scopeSearch($query, ?string $term)
    {
        if (! $term) {
            return $query;
        }

        return $query->where(function ($q) use ($term) {
            $q->where('nama_lengkap', 'like', "%{$term}%")
                ->orWhere('nik', 'like', "%{$term}%")
                ->orWhere('no_hp', 'like', "%{$term}%");
        });
    }

    public function scopeOwnedBy($query, string $citizenId)
    {
        return $query->where('id_citizen', $citizenId);
    }
}
