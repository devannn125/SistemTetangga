<?php

namespace App\Models;

use App\Models\Concerns\HasSequentialId;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PermissionOverride extends Model
{
    use HasSequentialId;

    public const ID_PREFIX = 'POV';

    const UPDATED_AT = null;

    protected $table = 'permission_override';

    protected $primaryKey = 'id_permission_override';

    protected $fillable = [
        'id_users', 'id_module', 'id_permission_action', 'id_wilayah',
        'is_granted', 'reason', 'created_by', 'expires_at',
    ];

    protected $casts = [
        'is_granted' => 'boolean',
        'expires_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'id_users', 'id_users');
    }

    public function module(): BelongsTo
    {
        return $this->belongsTo(Module::class, 'id_module', 'id_module');
    }

    public function action(): BelongsTo
    {
        return $this->belongsTo(PermissionAction::class, 'id_permission_action', 'id_permission_action');
    }
}
