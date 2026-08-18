<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Family extends Model
{
    protected $table = 'family';
    protected $primaryKey = 'id_family';
    public $incrementing = false;
    protected $keyType = 'string';
    protected $fillable = ['no_kk'];

    public function members()
    {
        return $this->hasMany(Citizen::class, 'id_family', 'id_family');
    }
}