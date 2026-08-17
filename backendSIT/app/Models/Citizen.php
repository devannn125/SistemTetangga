<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Citizen extends Model
{
    protected $table = 'citizen';

    protected $primaryKey = 'id_citizen';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'id_citizen',
        'nik',
        'nama_lengkap',
        'id_family',
        'hubungan_keluarga',
        'no_hp',
        'email',
        'id_wilayah',
        'status_hidup',
        'status_aktif',
    ];

    protected $casts = [
        'status_aktif' => 'boolean',
    ];
}