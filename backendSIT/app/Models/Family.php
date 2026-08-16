<?php

namespace App\Models;

use App\Models\Concerns\HasUuidPrimaryKey;
use Illuminate\Database\Eloquent\Model;

class Family extends Model
{
    use HasUuidPrimaryKey;

    protected $table = 'family';
    protected $primaryKey = 'id_family';
    protected $fillable = ['id_family', 'no_kk', 'id_kepala_keluarga', 'id_wilayah', 'status'];

    public function members()
    {
        return $this->hasMany(Citizen::class, 'id_family', 'id_family');
    }
}
