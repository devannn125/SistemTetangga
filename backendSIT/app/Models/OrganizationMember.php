<?php

namespace App\Models;

use App\Models\Concerns\HasSequentialId;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrganizationMember extends Model
{
    use HasSequentialId;

    public const ID_PREFIX = 'ORG';

    public $timestamps = false;

    protected $table = 'organization_member';

    protected $primaryKey = 'id_organization_member';

    protected $fillable = [
        'id_citizen', 'jabatan', 'id_wilayah',
        'periode_mulai', 'periode_selesai', 'foto_url', 'status_aktif',
    ];

    protected $casts = [
        'periode_mulai' => 'date',
        'periode_selesai' => 'date',
        'status_aktif' => 'boolean',
    ];

    public function citizen(): BelongsTo
    {
        return $this->belongsTo(Citizen::class, 'id_citizen', 'id_citizen');
    }

    public function wilayah(): BelongsTo
    {
        return $this->belongsTo(Wilayah::class, 'id_wilayah', 'id_wilayah');
    }
}
