<?php

namespace App\Models;

use App\Models\Concerns\HasSequentialId;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserSession extends Model
{
    use HasSequentialId;

    public const ID_PREFIX = 'SES';

    const UPDATED_AT = null;

    protected $table = 'user_session';

    protected $primaryKey = 'id_user_session';

    protected $fillable = ['id_users', 'refresh_token_hash', 'device_info', 'ip_address', 'is_active', 'expires_at'];

    protected $hidden = ['refresh_token_hash'];

    protected $casts = [
        'is_active' => 'boolean',
        'expires_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'id_users', 'id_users');
    }
}
