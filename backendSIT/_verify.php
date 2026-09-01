<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\DB;

echo "=== Organization Member (active, struktural) ===\n";
$members = DB::table('organization_member as om')
    ->join('wilayah as w', 'om.id_wilayah', '=', 'w.id_wilayah')
    ->join('citizen as c', 'om.id_citizen', '=', 'c.id_citizen')
    ->select('om.id_organization_member','om.jabatan','om.id_wilayah','w.nama_wilayah','w.tipe','w.parent_id','c.nama_lengkap','om.status_aktif')
    ->where('om.status_aktif', true)
    ->orderBy('w.tipe')
    ->get();

foreach ($members as $m) {
    echo $m->jabatan . ' | ' . $m->nama_lengkap . ' | wilayah=' . $m->nama_wilayah . ' (' . $m->tipe . ') | id_wilayah=' . $m->id_wilayah . ' | parent=' . ($m->parent_id ?? '-') . PHP_EOL;
}
