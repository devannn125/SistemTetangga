<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Foundation\Auth\User as Authenticatable;

class User extends Authenticatable
{
    use HasUuids;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'name', 'email', 'no_hp', 'password', 'telegram_chat_id',
        'auth_provider', 'status', 'citizen_id',
    ];

    protected $hidden = ['password', 'remember_token'];
}