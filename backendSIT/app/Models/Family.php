<?php

namespace App\Models;

use App\Models\Concerns\HasSequentialId;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Family extends Model
{
    use HasSequentialId;

    public const ID_PREFIX = 'FAM';

    protected $table = 'family';

    protected $primaryKey = 'id_family';

    protected $fillable = ['no_kk', 'id_kepala_keluarga', 'id_wilayah', 'status'];

    public function members(): HasMany
    {
        return $this->hasMany(Citizen::class, 'id_family', 'id_family');
    }

    public function kepalaKeluarga(): BelongsTo
    {
        return $this->belongsTo(Citizen::class, 'id_kepala_keluarga', 'id_citizen');
    }

    public function wilayah(): BelongsTo
    {
        return $this->belongsTo(Wilayah::class, 'id_wilayah', 'id_wilayah');
    }
}
