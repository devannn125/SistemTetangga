<?php
namespace App\Console;
use Illuminate\Support\Facades\DB;
use App\Models\Citizen;
use App\Models\User;
use App\Models\Role;
use App\Models\UserRole;
use App\Models\OrganizationMember;
use Illuminate\Support\Facades\Hash;

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

DB::transaction(function() {
    $citizensWithoutUser = Citizen::whereNotIn('id_citizen', User::pluck('id_citizen')->toArray())->get();
    foreach ($citizensWithoutUser as $c) {
        $phone = $c->no_hp ?: '0812' . rand(10000000, 99999999);
        while(User::where('no_hp', $phone)->exists()) {
            $phone = '0812' . rand(10000000, 99999999);
        }
        
        $user = User::create([
            'id_citizen' => $c->id_citizen,
            'nama_users' => $c->nama_lengkap,
            'no_hp' => $phone,
            'password' => Hash::make('123456'),
            'status' => 'ACTIVE',
        ]);
        
        $roleWarga = Role::where('kode', 'WARGA')->first();
        UserRole::create([
            'id_users' => $user->id_users,
            'id_role' => $roleWarga->id_role,
            'id_wilayah' => $c->id_wilayah,
            'periode_mulai' => now(),
            'status' => 'ACTIVE',
            'assigned_by' => null,
            'assigned_at' => now(),
        ]);
    }

    $roleSek = Role::where('kode', 'SEKRETARIS')->first();
    $roleBen = Role::where('kode', 'BENDAHARA')->first();
    UserRole::whereIn('id_role', [$roleSek->id_role, $roleBen->id_role])->update(['status' => 'ENDED', 'periode_selesai' => now()]);

    $members = OrganizationMember::where('status_aktif', true)->get();
    foreach ($members as $m) {
        $roleCode = $m->getRoleCode();
        if ($roleCode) {
            $role = Role::where('kode', $roleCode)->first();
            $user = User::where('id_citizen', $m->id_citizen)->first();
            if ($role && $user) {
                UserRole::create([
                    'id_users' => $user->id_users,
                    'id_role' => $role->id_role,
                    'id_wilayah' => $m->id_wilayah,
                    'periode_mulai' => $m->periode_mulai,
                    'status' => 'ACTIVE',
                    'assigned_at' => now(),
                ]);
            }
        }
    }
});

echo "Success syncing users and organization roles.\n";