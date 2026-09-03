<?php

namespace Database\Seeders;

use App\Models\Citizen;
use App\Models\Role;
use App\Models\User;
use App\Models\UserRole;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

/**
 * Backfill akun login untuk warga lama yang tercatat di tabel citizen tapi
 * belum punya akun di tabel users (mis. dibuat sebelum fitur auto-create akun
 * dipasang, atau lewat jalur impor/seeder yang hanya mengisi citizen).
 *
 * Pola sama seperti CitizenService::autoCreateUserAccount():
 *   - email + no_hp wajib (kalau kosong, dilewati)
 *   - email duplikat di users → dilewati (bukan lempar, biar batch tetap jalan)
 *   - password default "123456", status PENDING_VERIFICATION, role WARGA aktif.
 */
class BackfillUserAccountsSeeder extends Seeder
{
    public function run(): void
    {
        $attached = DB::table('users')->whereNotNull('id_citizen')->pluck('id_citizen')->all();

        $citizens = Citizen::query()
            ->whereNotNull('email')
            ->whereNotNull('no_hp')
            ->whereNotIn('id_citizen', $attached)
            ->get();

        $wargaRole = Role::where('kode', 'WARGA')->first();

        $created = 0;
        $skipped = 0;

        foreach ($citizens as $citizen) {
            if (User::where('email', $citizen->email)->exists()) {
                $skipped++;
                continue;
            }

            DB::transaction(function () use ($citizen, $wargaRole, &$created) {
                $user = User::create([
                    'nama_users' => $citizen->nama_lengkap,
                    'email' => $citizen->email,
                    'no_hp' => $citizen->no_hp,
                    'password_hash' => '123456',
                    'auth_provider' => 'EMAIL',
                    'status' => 'PENDING_VERIFICATION',
                    'id_citizen' => $citizen->id_citizen,
                ]);

                if ($wargaRole) {
                    UserRole::create([
                        'id_users' => $user->id_users,
                        'id_role' => $wargaRole->id_role,
                        'id_wilayah' => $citizen->id_wilayah,
                        'periode_mulai' => now()->toDateString(),
                        'status' => 'ACTIVE',
                        'assigned_at' => now(),
                    ]);
                }

                $created++;
            });
        }

        $this->command?->info("Backfill selesai: {$created} akun dibuat, {$skipped} dilewati (email duplikat).");
    }
}
