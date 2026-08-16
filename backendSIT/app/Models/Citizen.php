<?php

namespace App\Models;

use App\Models\Concerns\HasUuidPrimaryKey;
use Illuminate\Database\Eloquent\Model;

class Citizen extends Model
{
    use HasUuidPrimaryKey;

    protected $table = 'citizen';
    protected $primaryKey = 'id_citizen';
    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'tanggal_lahir' => 'date',
            'tanggal_masuk_rt' => 'date',
            'tanggal_keluar_rt' => 'date',
            'penerima_bansos' => 'boolean',
            'alamat_kk_luar_rt' => 'boolean',
            'berdomisili_luar_rt' => 'boolean',
            'status_aktif' => 'boolean',
        ];
    }

    public function family()
    {
        return $this->belongsTo(Family::class, 'id_family', 'id_family');
    }
}
