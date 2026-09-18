<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$p = App\Models\LandingProfile::first();
if (!$p) $p = new App\Models\LandingProfile();
$p->fill(['video_path' => 'test_path']);
$p->save();
echo "OK\n";
