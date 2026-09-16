<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LandingArticle extends Model
{
    protected $primaryKey = 'id_article';
    
    protected $fillable = [
        'judul',
        'slug',
        'konten',
        'image_path',
        'is_published',
        'published_at',
    ];

    protected $casts = [
        'is_published' => 'boolean',
        'published_at' => 'datetime',
    ];
}
