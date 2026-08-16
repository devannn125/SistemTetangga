<?php

namespace App\Models;

use App\Models\Concerns\HasUuidPrimaryKey;
use Illuminate\Database\Eloquent\Model;

class House extends Model
{
    use HasUuidPrimaryKey;

    protected $table = 'house';
    protected $primaryKey = 'id_house';
    protected $guarded = [];
}
