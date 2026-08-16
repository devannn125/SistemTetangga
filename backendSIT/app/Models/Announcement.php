<?php

namespace App\Models;

use App\Models\Concerns\HasUuidPrimaryKey;
use Illuminate\Database\Eloquent\Model;

class Announcement extends Model
{
    use HasUuidPrimaryKey;

    const UPDATED_AT = null;

    protected $table = 'announcement';
    protected $primaryKey = 'id_announcement';
    protected $guarded = [];
}
