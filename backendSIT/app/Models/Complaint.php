<?php

namespace App\Models;

use App\Models\Concerns\HasUuidPrimaryKey;
use Illuminate\Database\Eloquent\Model;

class Complaint extends Model
{
    use HasUuidPrimaryKey;

    protected $table = 'complaint';
    protected $primaryKey = 'id_complaint';
    protected $guarded = [];
}
