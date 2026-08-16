<?php

namespace App\Models;

use App\Models\Concerns\HasUuidPrimaryKey;
use Illuminate\Database\Eloquent\Model;

class Wilayah extends Model
{
    use HasUuidPrimaryKey;

    protected $table = 'wilayah';
    protected $primaryKey = 'id_wilayah';
    protected $fillable = ['id_wilayah', 'nama_wilayah', 'tipe', 'kode_wilayah', 'parent_id'];
}
