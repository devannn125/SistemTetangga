<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NotificationSubscription extends Model
{
    public $incrementing = false;

    public $timestamps = false;

    protected $table = 'notification_subscription';

    protected $fillable = ['id_users', 'kategori', 'is_subscribed'];

    protected $casts = ['is_subscribed' => 'boolean'];

    public function user()
    {
        return $this->belongsTo(User::class, 'id_users', 'id_users');
    }
}
