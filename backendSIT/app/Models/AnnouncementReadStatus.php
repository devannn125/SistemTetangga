<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Tabel pivot: menandai pengumuman yang sudah dibaca user.
 * Composite key (id_announcement_read_status, id_users).
 */
class AnnouncementReadStatus extends Model
{
    public $incrementing = false;

    public $timestamps = false;

    protected $table = 'announcement_read_status';

    protected $fillable = ['id_announcement_read_status', 'id_users', 'read_at'];

    protected $casts = ['read_at' => 'datetime'];

    public function announcement()
    {
        return $this->belongsTo(Announcement::class, 'id_announcement_read_status', 'id_announcement');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'id_users', 'id_users');
    }
}
