<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Tests\TestCase;

class AuthLoginTest extends TestCase
{
    use RefreshDatabase;

    private string $wilayahId;

    protected function setUp(): void
    {
        parent::setUp();

        $this->wilayahId = (string) Str::uuid();
        DB::table('wilayah')->insert([
            'id_wilayah' => $this->wilayahId,
            'nama_wilayah' => 'RT 001 / RW 001',
            'tipe' => 'RT',
            'kode_wilayah' => 'RT001',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('role')->insert([
            [
                'id_role' => 'ROLE-ADMIN',
                'kode' => 'ADMIN',
                'nama_role' => 'Administrator',
                'level' => 1,
                'is_strategic' => 1,
                'deskripsi' => 'Administrator sistem',
            ],
            [
                'id_role' => 'ROLE-RT',
                'kode' => 'RT',
                'nama_role' => 'Ketua RT',
                'level' => 4,
                'is_strategic' => 0,
                'deskripsi' => 'Ketua RT',
            ],
            [
                'id_role' => 'ROLE-RW',
                'kode' => 'RW',
                'nama_role' => 'Ketua RW',
                'level' => 3,
                'is_strategic' => 0,
                'deskripsi' => 'Ketua RW',
            ],
            [
                'id_role' => 'ROLE-WARGA',
                'kode' => 'WARGA',
                'nama_role' => 'Warga',
                'level' => 5,
                'is_strategic' => 0,
                'deskripsi' => 'Warga',
            ],
        ]);
    }

    public function test_user_can_login_as_warga(): void
    {
        $citizenId = (string) Str::uuid();
        DB::table('citizen')->insert([
            'id_citizen' => $citizenId,
            'nik' => '3471000000000001',
            'nama_lengkap' => 'Budi Warga',
            'jenis_kelamin' => 'L',
            'status_warga' => 'TETAP',
            'kewarganegaraan' => 'WNI',
            'id_wilayah' => $this->wilayahId,
            'status_hidup' => 'HIDUP',
            'status_aktif' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $userId = (string) Str::uuid();
        User::create([
            'id_users' => $userId,
            'nama_users' => 'Budi Warga',
            'email' => 'budi@warga.test',
            'no_hp' => '081234567891',
            'password_hash' => Hash::make('password123'),
            'status' => 'ACTIVE',
            'id_citizen' => $citizenId,
        ]);

        $response = $this->postJson('/api/auth/login', [
            'identifier' => '3471000000000001',
            'password' => 'password123',
            'role' => 'warga',
        ]);

        $response->assertOk()
            ->assertJsonPath('data.id_users', $userId)
            ->assertJsonPath('data.role.kode', 'WARGA')
            ->assertJsonPath('data.redirect_to', '/warga');
    }

    public function test_user_can_login_as_admin(): void
    {
        $userId = (string) Str::uuid();
        User::create([
            'id_users' => $userId,
            'nama_users' => 'Admin Sistem',
            'email' => 'admin@rt.test',
            'no_hp' => '081200000001',
            'password_hash' => Hash::make('secretpass'),
            'status' => 'ACTIVE',
        ]);

        DB::table('user_role')->insert([
            'id_user_role' => (string) Str::uuid(),
            'id_users' => $userId,
            'id_role' => 'ROLE-ADMIN',
            'id_wilayah' => $this->wilayahId,
            'status' => 'ACTIVE',
            'assigned_at' => now(),
        ]);

        $response = $this->postJson('/api/auth/login', [
            'identifier' => 'admin@rt.test',
            'password' => 'secretpass',
            'role' => 'ADMIN',
        ]);

        $response->assertOk()
            ->assertJsonPath('data.id_users', $userId)
            ->assertJsonPath('data.role.kode', 'ADMIN')
            ->assertJsonPath('data.redirect_to', '/dashboard');
    }

    public function test_user_can_login_as_dukuh(): void
    {
        DB::table('role')->insert([
            'id_role' => 'ROLE-DUKUH',
            'kode' => 'DUKUH',
            'nama_role' => 'Kepala Dukuh',
            'level' => 2,
            'is_strategic' => 1,
            'deskripsi' => 'Kepala Dukuh',
        ]);

        $userId = (string) Str::uuid();
        User::create([
            'id_users' => $userId,
            'nama_users' => 'Dukuh Sukamaju',
            'email' => 'dukuh@rt.test',
            'no_hp' => '081200000002',
            'password_hash' => Hash::make('secretpass'),
            'status' => 'ACTIVE',
        ]);

        DB::table('user_role')->insert([
            'id_user_role' => (string) Str::uuid(),
            'id_users' => $userId,
            'id_role' => 'ROLE-DUKUH',
            'id_wilayah' => $this->wilayahId,
            'status' => 'ACTIVE',
            'assigned_at' => now(),
        ]);

        $response = $this->postJson('/api/auth/login', [
            'identifier' => 'dukuh@rt.test',
            'password' => 'secretpass',
            'role' => 'DUKUH',
        ]);

        $response->assertOk()
            ->assertJsonPath('data.id_users', $userId)
            ->assertJsonPath('data.role.kode', 'DUKUH')
            ->assertJsonPath('data.redirect_to', '/dashboard');
    }

    public function test_login_fails_with_invalid_credentials(): void
    {
        $response = $this->postJson('/api/auth/login', [
            'identifier' => 'nonexistent@example.com',
            'password' => 'wrongpass',
            'role' => 'WARGA',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['identifier']);
    }

    public function test_login_fails_with_unassigned_role(): void
    {
        $userId = (string) Str::uuid();
        User::create([
            'id_users' => $userId,
            'nama_users' => 'Warga Biasa',
            'email' => 'warga@example.com',
            'no_hp' => '081299998888',
            'password_hash' => Hash::make('password123'),
            'status' => 'ACTIVE',
        ]);

        $response = $this->postJson('/api/auth/login', [
            'identifier' => 'warga@example.com',
            'password' => 'password123',
            'role' => 'ADMIN',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['role']);
    }
}
