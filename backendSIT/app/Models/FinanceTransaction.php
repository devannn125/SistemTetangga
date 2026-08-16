<?php

namespace App\Models;

use App\Models\Concerns\HasUuidPrimaryKey;
use Illuminate\Database\Eloquent\Model;

class FinanceTransaction extends Model
{
    use HasUuidPrimaryKey;

    const UPDATED_AT = null;

    protected $table = 'keuangan_transaksi';
    protected $primaryKey = 'id_keuangan_transaksi';
    protected $guarded = [];
}
