<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LandingProfile extends Model
{
    protected $fillable = [
        'hero_title',
        'hero_subtitle',
        'visi',
        'misi',
        'sejarah',
        'kontak_email',
        'kontak_hp',
        'kontak_alamat',
    ];
}
