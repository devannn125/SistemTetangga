<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Role extends Model
{
    protected $table = 'role';

    protected $primaryKey = 'id_role';

    public $incrementing = false;

    protected $keyType = 'string';

    public $timestamps = false;

    protected $fillable = [
        'id_role',
        'kode',
        'nama_role',
        'level',
        'is_strategic',
        'deskripsi',
    ];

    protected $casts = [
        'is_strategic' => 'boolean',
    ];
}