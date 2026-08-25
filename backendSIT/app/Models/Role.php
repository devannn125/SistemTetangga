<?php

namespace App\Models;

use App\Models\Concerns\HasSequentialId;
use Illuminate\Database\Eloquent\Model;

class Role extends Model
{
    use HasSequentialId;

    public const ID_PREFIX = 'ROLE';

    protected $table = 'role';

    protected $primaryKey = 'id_role';

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