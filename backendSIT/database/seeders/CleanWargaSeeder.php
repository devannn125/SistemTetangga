<?php

namespace Database\Seeders;

use App\Models\Citizen;
use App\Models\Family;
use App\Models\House;
use App\Models\Role;
use App\Models\User;
use App\Models\Wilayah;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

/**
 * Seed satu akun warga "bersih": punya citizen, keluarga (KK) sendiri, dan
 * rumah sendiri — TANPA data tamu. Buat keperluan demo/uji halaman Tamu
 * dengan daftar kosong. Idempotent (aman dijalankan ulang).
 */
class CleanWargaSeeder extends Seeder
{
    public function run(): void
    {
        $kel = Wilayah::firstOrCreate(
            ['kode_wilayah' => 'KEL01'],
            ['nama_wilayah' => 'Kelurahan Sukamaju', 'tipe' => 'KELURAHAN']
        );
        $rw = Wilayah::firstOrCreate(
            ['kode_wilayah' => 'RW01'],
            ['nama_wilayah' => 'RW 01', 'tipe' => 'RW', 'parent_id' => $kel->id_wilayah]
        );
        $rt = Wilayah::firstOrCreate(
            ['kode_wilayah' => 'RT01'],
            ['nama_wilayah' => 'RT 01', 'tipe' => 'RT', 'parent_id' => $rw->id_wilayah]
        );

        $role = Role::firstOrCreate(
            ['kode' => 'WARGA'],
            ['nama_role' => 'Warga', 'level' => 5, 'is_strategic' => false, 'deskripsi' => 'Pengguna umum']
        );

        $citizen = Citizen::firstOrCreate(
            ['nik' => '3471000000000021'],
            [
                'nama_lengkap' => 'Eko Purnomo',
                'tempat_lahir' => 'Sleman',
                'tanggal_lahir' => '1990-05-12',
                'jenis_kelamin' => 'L',
                'status_nikah' => 'KAWIN',
                'status_warga' => 'TETAP',
                'kewarganegaraan' => 'WNI',
                'status_ekonomi' => 'MAMPU',
                'penerima_bansos' => false,
                'tanggal_masuk_rt' => '2020-01-01',
                'id_wilayah' => $rt->id_wilayah,
                'alamat_kk_luar_rt' => false,
                'berdomisili_luar_rt' => false,
                'status_hidup' => 'HIDUP',
                'status_aktif' => true,
            ]
        );

        $family = Family::firstOrCreate(
            ['no_kk' => '3471000000000020'],
            [
                'id_kepala_keluarga' => $citizen->id_citizen,
                'id_wilayah' => $rt->id_wilayah,
                'status' => 'ACTIVE',
            ]
        );

        if (! $citizen->id_family) {
            $citizen->update(['id_family' => $family->id_family, 'hubungan_keluarga' => 'KEPALA_KELUARGA']);
        }

        $house = House::firstOrCreate(
            ['alamat' => 'Jl. Melati No. 88'],
            [
                'tipe' => 'NON_KOS',
                'id_wilayah' => $rt->id_wilayah,
                'id_pemilik_citizen' => $citizen->id_citizen,
                'status_kepemilikan' => 'MILIK_SENDIRI',
                'status_pajak' => 'LUNAS',
                'status_aktif' => true,
            ]
        );

        $user = User::firstOrCreate(
            ['email' => 'eko@example.com'],
            [
                'id_users' => 'USR-CLN',
                'nama_users' => 'Eko Purnomo',
                'no_hp' => '081234567099',
                'password_hash' => Hash::make('password'),
                'auth_provider' => 'EMAIL',
                'status' => 'ACTIVE',
                'id_citizen' => $citizen->id_citizen,
            ]
        );

        DB::table('user_role')->updateOrInsert(
            ['id_users' => $user->id_users, 'id_role' => $role->id_role, 'id_wilayah' => $rt->id_wilayah],
            ['status' => 'ACTIVE', 'assigned_at' => now()]
        );

        // Akun demo Sekretaris RT (verifikasi surat), terhubung ke CIT-002 (RT01).
        $sekRole = Role::firstOrCreate(
            ['kode' => 'SEKRETARIS'],
            ['id_role' => 'ROLE-SEKRETARIS', 'nama_role' => 'Sekretaris RT', 'level' => 4, 'is_strategic' => true, 'deskripsi' => 'Sekretaris tingkat RT']
        );
        $sek = User::firstOrCreate(
            ['email' => 'sekretaris@example.com'],
            [
                'id_users' => 'USR-SEK',
                'nama_users' => 'Sekretaris RT',
                'no_hp' => '081234567088',
                'password_hash' => Hash::make('password'),
                'auth_provider' => 'EMAIL',
                'status' => 'ACTIVE',
                'id_citizen' => 'CIT-002',
            ]
        );
        DB::table('user_role')->updateOrInsert(
            ['id_users' => $sek->id_users, 'id_role' => $sekRole->id_role, 'id_wilayah' => $rt->id_wilayah],
            ['status' => 'ACTIVE', 'assigned_at' => now()]
        );
    }
}