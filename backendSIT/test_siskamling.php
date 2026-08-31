<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$request = Illuminate\Http\Request::create('/api/siskamling-schedules', 'POST', [
    'id_wilayah' => App\Models\Wilayah::first()->id_wilayah,
    'id_petugas_citizen' => App\Models\Citizen::first()->id_citizen,
    'shift' => 'MALAM',
    'tanggal_jadwal' => '2026-08-31'
]);
$user = App\Models\User::where('nama_users', 'Budi Santoso')->first();
Illuminate\Support\Facades\Auth::login($user);
$response = $kernel->handle($request);
echo $response->getContent();
