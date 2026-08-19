<?php

namespace App\Models;

use App\Models\Concerns\HasSequentialId;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Module extends Model
{
    use HasSequentialId;

    public const ID_PREFIX = 'MOD';

    public $timestamps = false;

    protected $table = 'module';

    protected $primaryKey = 'id_module';

    protected $fillable = ['kode_module', 'nama_module', 'urutan'];

    protected $casts = ['urutan' => 'integer'];

    public function rolePermissions(): HasMany
    {
        return $this->hasMany(RolePermission::class, 'id_module', 'id_module');
    }
}
