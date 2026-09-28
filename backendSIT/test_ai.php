<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();
$ai = new \App\Services\ChatbotAiService();
echo "Testing ChatGPT (Pollinations)...\n";
echo $ai->getResponse('Halo, saya siapa?', \App\Models\User::with('userRoles.role')->first());
echo "\n";
