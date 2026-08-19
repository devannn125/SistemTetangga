<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CitizenHistory extends Model
{
    const UPDATED_AT = null;

    protected $table = 'citizen_history';

    protected $primaryKey = 'id_citizen_history';

    protected $guarded = [];

    protected $casts = ['changed_at' => 'datetime'];

    public function citizen(): BelongsTo
    {
        return $this->belongsTo(Citizen::class, 'id_citizen', 'id_citizen');
    }
}
