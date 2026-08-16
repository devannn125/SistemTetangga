<?php

namespace App\Models;

use App\Models\Concerns\HasUuidPrimaryKey;
use Illuminate\Database\Eloquent\Model;

class FeeBill extends Model
{
    use HasUuidPrimaryKey;

    public $timestamps = false;

    protected $table = 'iuran_tagihan';
    protected $primaryKey = 'id_iuran_tagihan';
    protected $guarded = [];
}
