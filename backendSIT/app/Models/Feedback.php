<?php

namespace App\Models;

use App\Models\Concerns\HasSequentialId;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Feedback extends Model
{
    use HasSequentialId;

    public const ID_PREFIX = 'FDB';

    const UPDATED_AT = null;

    protected $table = 'feedback';

    protected $primaryKey = 'id_feedback';

    protected $fillable = ['id_pengirim_user', 'isi_pesan', 'kategori', 'is_anonim', 'status'];

    protected $casts = ['is_anonim' => 'boolean'];

    public function pengirim(): BelongsTo
    {
        return $this->belongsTo(User::class, 'id_pengirim_user', 'id_users');
    }
}
