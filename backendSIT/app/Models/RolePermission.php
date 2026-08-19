<?php

namespace App\Models;

use App\Models\Concerns\HasSequentialId;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RolePermission extends Model
{
    use HasSequentialId;

    public const ID_PREFIX = 'RP';

    public $timestamps = false;

    protected $table = 'role_permission';

    protected $primaryKey = 'id_role_permission';

    protected $fillable = ['id_role', 'id_module', 'id_permission_action', 'resource_scope', 'scope_level'];

    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class, 'id_role', 'id_role');
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
