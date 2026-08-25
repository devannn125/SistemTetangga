<?php

namespace App\Models;

use App\Models\Concerns\HasSequentialId;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Wilayah extends Model
{
    use HasSequentialId;

    public const ID_PREFIX = 'WIL';

    protected $table = 'wilayah';

    protected $primaryKey = 'id_wilayah';

    protected $fillable = ['nama_wilayah', 'tipe', 'kode_wilayah', 'parent_id'];

    public function parent(): BelongsTo
    {
        return $this->belongsTo(Wilayah::class, 'parent_id', 'id_wilayah');
    }

    public function children(): HasMany
    {
        return $this->hasMany(Wilayah::class, 'parent_id', 'id_wilayah');
    }
}
