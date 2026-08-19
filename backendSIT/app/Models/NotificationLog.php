<?php

namespace App\Models;

use App\Models\Concerns\HasSequentialId;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class NotificationLog extends Model
{
    use HasSequentialId;

    public const ID_PREFIX = 'NOT';

    const UPDATED_AT = null;

    protected $table = 'notification_log';

    protected $primaryKey = 'id_notification_log';

    protected $fillable = [
        'id_users', 'jenis', 'channel', 'isi_pesan', 'status_kirim',
        'retry_count', 'related_entity_type', 'id_related_entity', 'sent_at',
    ];

    protected $casts = [
        'retry_count' => 'integer',
        'sent_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'id_users', 'id_users');
    }
}
