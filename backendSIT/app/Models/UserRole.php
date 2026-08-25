<?php

namespace App\Models;

use App\Models\Concerns\HasSequentialId;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserRole extends Model
{
    use HasSequentialId;

    public const ID_PREFIX = 'UR';

    protected $table = 'user_role';

    protected $primaryKey = 'id_user_role';

    public $timestamps = false;

    protected $fillable = [
        'id_user_role',
        'id_users',
        'id_role',
        'id_wilayah',
        'periode_mulai',
        'periode_selesai',
        'status',
        'assigned_by',
        'assigned_at',
    ];

    protected $casts = [
        'periode_mulai' => 'date',
        'periode_selesai' => 'date',
        'assigned_at' => 'datetime',
    ];

    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class, 'id_role', 'id_role');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'id_users', 'id_users');
    }

    public function wilayah(): BelongsTo
    {
        return $this->belongsTo(Wilayah::class, 'id_wilayah', 'id_wilayah');
    }
}
