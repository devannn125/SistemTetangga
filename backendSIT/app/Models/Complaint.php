<?php

namespace App\Models;

use App\Models\Concerns\HasSequentialId;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Complaint extends Model
{
    use HasSequentialId;

    public const ID_PREFIX = 'CMP';

    protected $table = 'complaint';

    protected $primaryKey = 'id_complaint';

    protected $fillable = [
        'nomor_tiket', 'id_pengirim_user', 'judul', 'kategori', 'deskripsi',
        'lokasi', 'urgensi', 'status', 'rating',
    ];

    protected $casts = ['rating' => 'integer'];

    public function pengirim(): BelongsTo
    {
        return $this->belongsTo(User::class, 'id_pengirim_user', 'id_users');
    }
}
