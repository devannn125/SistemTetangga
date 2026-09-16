<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LandingUmkm extends Model
{
    protected $primaryKey = 'id_umkm';
    
    protected $fillable = [
        'nama_usaha',
        'deskripsi',
        'nama_pemilik',
        'no_hp',
        'image_path',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];
}
