<?php

namespace App\Models;

use App\Models\Concerns\HasUuidPrimaryKey;
use Illuminate\Database\Eloquent\Model;

class LetterRequest extends Model
{
    use HasUuidPrimaryKey;

    protected $table = 'letter_request';
    protected $primaryKey = 'id_letter_request';
    protected $guarded = [];
}
