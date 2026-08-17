<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Models\Concerns\HasUuidPrimaryKey;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, HasUuidPrimaryKey, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'id_users',
        'nama_users',
        'email',
        'no_hp',
        'password_hash',
        'telegram_chat_id',
        'telegram_linked_at',
        'auth_provider',
        'status',
        'id_citizen',
        'last_login_at',
    ];

    protected $primaryKey = 'id_users';

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password_hash',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'telegram_linked_at' => 'datetime',
            'last_login_at' => 'datetime',
            'password_hash' => 'hashed',
        ];
    }

    /**
     * Data kependudukan user ini (untuk NIK, nama lengkap, dll).
     */
    public function citizen(): BelongsTo
    {
        return $this->belongsTo(Citizen::class, 'id_citizen', 'id_citizen');
    }

    /**
     * Semua penugasan role user ini (bisa lebih dari satu: RT sekaligus Admin, dst).
     */
    public function userRoles(): HasMany
    {
        return $this->hasMany(UserRole::class, 'id_users', 'id_users');
    }
}