<?php

namespace App\Models;

use App\Models\Concerns\HasSequentialId;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class HousePhoto extends Model
{
    use HasSequentialId;

    public const ID_PREFIX = 'HPH';

    const UPDATED_AT = null;

    protected $table = 'house_photo';

    protected $primaryKey = 'id_house_photo';

    protected $fillable = ['id_house', 'file_url'];

    protected $casts = ['uploaded_at' => 'datetime'];

    public function house(): BelongsTo
    {
        return $this->belongsTo(House::class, 'id_house', 'id_house');
    }
}
