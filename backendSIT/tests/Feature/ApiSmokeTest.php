<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Tests\TestCase;

class ApiSmokeTest extends TestCase
{
    use RefreshDatabase;

    public function test_dashboard_endpoint_returns_frontend_shape(): void
    {
        $this->getJson('/api/dashboard')
            ->assertOk()
            ->assertJsonStructure([
                'user',
                'area',
                'navigation',
                'summaryCards',
                'financeCards',
                'cashflow',
                'complaintsByCategory',
                'activities',
                'quickActions',
            ]);
    }

    public function test_admin_can_manage_citizens(): void
    {
        $this->seedRbac();

        $wilayahId = (string) Str::uuid();
        DB::table('wilayah')->insert([
            'id_wilayah' => $wilayahId,
            'nama_wilayah' => 'RT 005',
            'tipe' => 'RT',
            'kode_wilayah' => 'RT005',
        ]);

        $login = $this->postJson('/api/login', [
            'identifier' => 'admin@rt.test',
            'password' => 'secretpass',
        ])->assertOk();

        $token = $login->json('access_token');

        $this->withToken($token)
            ->postJson('/api/citizens', [
                'nik' => '3374010101010001',
                'nama_lengkap' => 'Budi Santoso',
                'jenis_kelamin' => 'L',
                'status_warga' => 'TETAP',
                'kewarganegaraan' => 'WNI',
                'id_wilayah' => $wilayahId,
                'status_hidup' => 'HIDUP',
                'status_aktif' => true,
            ])
            ->assertCreated()
            ->assertJsonPath('data.nama_lengkap', 'Budi Santoso')
            ->assertJsonPath('data.status_aktif', true);

        // Warga (tanpa hak akses WARGA CREATE) ditolak.
        $this->seedWargaAccount($wilayahId);
    }

    public function test_warga_cannot_create_citizen(): void
    {
        $this->seedRbac();

        $wilayahId = DB::table('wilayah')->value('id_wilayah');

        $this->seedWargaAccount($wilayahId);

        $login = $this->postJson('/api/login', [
            'identifier' => 'warga@rt.test',
            'password' => 'secretpass',
        ])->assertOk();

        $this->withToken($login->json('access_token'))
            ->postJson('/api/citizens', [
                'nik' => '3374010101010002',
                'nama_lengkap' => 'Warga Tanpa Hak',
                'jenis_kelamin' => 'P',
                'status_warga' => 'TETAP',
                'kewarganegaraan' => 'WNI',
                'id_wilayah' => $wilayahId,
                'status_hidup' => 'HIDUP',
                'status_aktif' => true,
            ])
            ->assertForbidden();
    }

    private function seedRbac(): void
    {
        $wilayahId = (string) Str::uuid();
        DB::table('wilayah')->insert([
            'id_wilayah' => $wilayahId,
            'nama_wilayah' => 'RT 001',
            'tipe' => 'RT',
            'kode_wilayah' => 'RT-A',
        ]);

        DB::table('module')->insert([
            'id_module' => 'MOD-WARGA',
            'kode_module' => 'WARGA',
            'nama_module' => 'Data Warga',
            'urutan' => 2,
        ]);

        DB::table('permission_action')->insert([
            ['id_permission_action' => 1, 'kode_permission' => 'VIEW', 'deskripsi' => 'Melihat'],
            ['id_permission_action' => 2, 'kode_permission' => 'CREATE', 'deskripsi' => 'Menambah'],
        ]);

        DB::table('role')->insert([
            ['id_role' => 'ROLE-ADMIN', 'kode' => 'ADMIN', 'nama_role' => 'Administrator', 'level' => 1, 'is_strategic' => 1],
            ['id_role' => 'ROLE-WARGA', 'kode' => 'WARGA', 'nama_role' => 'Warga', 'level' => 5, 'is_strategic' => 0],
        ]);

        // ADMIN boleh buat warga (CRUD WARGA).
        DB::table('role_permission')->insert([
            'id_role_permission' => 'RP-T-1',
            'id_role' => 'ROLE-ADMIN',
            'id_module' => 'MOD-WARGA',
            'id_permission_action' => 2,
            'resource_scope' => '*',
            'scope_level' => 'ALL',
        ]);

        $adminId = (string) Str::uuid();
        User::create([
            'id_users' => $adminId,
            'nama_users' => 'Admin Sistem',
            'email' => 'admin@rt.test',
            'no_hp' => '081200000001',
            'password_hash' => Hash::make('secretpass'),
            'status' => 'ACTIVE',
        ]);
        DB::table('user_role')->insert([
            'id_user_role' => (string) Str::uuid(),
            'id_users' => $adminId,
            'id_role' => 'ROLE-ADMIN',
            'id_wilayah' => $wilayahId,
            'status' => 'ACTIVE',
            'assigned_at' => now(),
        ]);
    }

    private function seedWargaAccount(string $wilayahId): void
    {
        $userId = (string) Str::uuid();
        User::create([
            'id_users' => $userId,
            'nama_users' => 'Warga Biasa',
            'email' => 'warga@rt.test',
            'no_hp' => '081200000099',
            'password_hash' => Hash::make('secretpass'),
            'status' => 'ACTIVE',
        ]);
        DB::table('user_role')->insert([
            'id_user_role' => (string) Str::uuid(),
            'id_users' => $userId,
            'id_role' => 'ROLE-WARGA',
            'id_wilayah' => $wilayahId,
            'status' => 'ACTIVE',
            'assigned_at' => now(),
        ]);
    }
}
