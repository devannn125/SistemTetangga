<?php

namespace App\Models;

use App\Models\Concerns\HasSequentialId;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Announcement extends Model
{
    use HasSequentialId;

    public const ID_PREFIX = 'ANN';

    const UPDATED_AT = null;

    protected $table = 'announcement';

    protected $primaryKey = 'id_announcement';

    protected $fillable = [
        'judul', 'isi', 'kategori', 'id_wilayah', 'target',
        'lampiran_url', 'is_pinned', 'status_approval', 'created_by',
    ];

    protected $casts = ['is_pinned' => 'boolean'];

    public function wilayah(): BelongsTo
    {
        return $this->belongsTo(Wilayah::class, 'id_wilayah', 'id_wilayah');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by', 'id_users');
    }

    public function readStatuses(): HasMany
    {
        return $this->hasMany(AnnouncementReadStatus::class, 'id_announcement_read_status', 'id_announcement');
    }
}
