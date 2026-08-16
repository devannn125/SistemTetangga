<?php

namespace App\Models;

use App\Models\Concerns\HasUuidPrimaryKey;
use Illuminate\Database\Eloquent\Model;

class Feedback extends Model
{
    use HasUuidPrimaryKey;

    const UPDATED_AT = null;

    protected $table = 'feedback';
    protected $primaryKey = 'id_feedback';
    protected $guarded = [];
}
