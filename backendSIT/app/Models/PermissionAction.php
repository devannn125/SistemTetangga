<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PermissionAction extends Model
{
    public $incrementing = true;

    public $timestamps = false;

    protected $table = 'permission_action';

    protected $primaryKey = 'id_permission_action';

    protected $fillable = ['kode_permission', 'deskripsi'];
}
