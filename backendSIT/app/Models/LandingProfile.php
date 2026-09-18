<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LandingProfile extends Model
{
    protected $fillable = [
        'brand_name',
        'hero_title',
        'hero_subtitle',
        'hero_image_path',
        'visi',
        'misi',
        'sejarah',
        'video_path',
        'kontak_email',
        'kontak_hp',
        'kontak_alamat',
    ];
}

