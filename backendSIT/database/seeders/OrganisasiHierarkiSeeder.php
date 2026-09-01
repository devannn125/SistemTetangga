<?php

namespace Database\Seeders;

use App\Models\Citizen;
use App\Models\OrganizationMember;
use App\Models\Role;
use App\Models\User;
use App\Models\UserRole;
use App\Models\Wilayah;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

/**
 * Bangun hierarki wilayah KELURAHAN > DUKUH > RW > RT dan akun demo LURAH/DUKUH.
 * Idempotent: aman dijalankan ulang.
 */
class OrganisasiHierarkiSeeder extends Seeder
{
    public function run(): void
    {
        $kelurahan = Wilayah::where('kode_wilayah', 'KEL01')->first()
            ?: Wilayah::where('tipe', 'KELURAHAN')->first();

        if (! $kelurahan) {
            $this->command?->error('Wilayah KELURAHAN tidak ditemukan.');

            return;
        }

        // 1. Node DUKUH di bawah kelurahan
        $dukuhBarat = $this->createWilayah('DUK01', 'Dukuh Barat', 'DUKUH', $kelurahan->id_wilayah);
        $dukuhTimur = $this->createWilayah('DUK02', 'Dukuh Timur', 'DUKUH', $kelurahan->id_wilayah);

        // 2. Pindahkan RW yang langsung di bawah kelurahan ke Dukuh Barat
        //    (dukuh yang jadi anchor akun demo). Dukuh Timur dibiarkan kosong
        //    sebagai contoh dukuh yang belum memiliki RW.
        foreach (Wilayah::where('tipe', 'RW')->get() as $rw) {
            if ($rw->parent_id === null || $rw->parent?->tipe === 'KELURAHAN') {
                if ($rw->parent_id !== $dukuhBarat->id_wilayah) {
                    $rw->update(['parent_id' => $dukuhBarat->id_wilayah]);
                }
            }
        }

        // 3. Akun demo LURAH
        $lurahRole = $this->role('LURAH');
        $lurahCitizen = $this->citizen(
            '3471000000000031',
            'Sutrisno', 'L',
            $kelurahan->id_wilayah
        );
        $this->user('lurah@sukamaju.test', 'Sutrisno', 'password', $lurahCitizen->id_citizen, $lurahRole, $kelurahan->id_wilayah);

        // 5. Akun demo DUKUH (reassign dari KELURAHAN ke node DUKUH)
        $dukuhRole = $this->role('DUKUH');
        $dukuhCitizen = $this->citizen(
            '3471000000000032',
            'Basuki', 'L',
            $dukuhBarat->id_wilayah
        );

        $dukuhUser = User::where('email', 'dukuh@sukamaju.test')->first()
            ?: $this->createUser('dukuh@sukamaju.test', 'Basuki', 'password', $dukuhCitizen->id_citizen, $dukuhRole, $dukuhBarat->id_wilayah);

        if ($dukuhUser->id_citizen !== $dukuhCitizen->id_citizen) {
            $dukuhUser->forceFill(['id_citizen' => $dukuhCitizen->id_citizen, 'nama_users' => 'Basuki'])->save();
        }

        // Matikan role DUKUH lama di bawah KELURAHAN supaya anchor tunggal di node DUKUH.
        UserRole::where('id_users', $dukuhUser->id_users)
            ->where('id_role', $dukuhRole->id_role)
            ->where('id_wilayah', $kelurahan->id_wilayah)
            ->update(['status' => 'ENDED', 'periode_selesai' => now()->toDateString()]);

        $this->assignRole($dukuhUser, $dukuhRole, $dukuhBarat->id_wilayah);

        // 6. Organization_member ber-relasi: Kepala Lurah -> Kepala Dukuh -> Ketua RW -> Ketua RT
        //    Setiap jabatan ditautkan ke node wilayah tempat bertugas (via id_wilayah),
        //    dan node wilayah tersambung parent_id sehingga membentuk alur hierarki.

        // 6a. Perbaiki data existing: nonaktifkan jabatan strategis yang berada di
        //     level wilayah yang salah (mis. "Kepala Dukuh" di node KELURAHAN).
        $this->deactivateMisplaced('Kepala Dukuh', ['DUKUH']);
        $this->deactivateMisplaced('Kepala Lurah', ['KELURAHAN', 'KECAMATAN']);

        $this->orgMember('Kepala Lurah', $lurahCitizen->id_citizen, $kelurahan->id_wilayah);
        $this->orgMember('Kepala Dukuh', $dukuhCitizen->id_citizen, $dukuhBarat->id_wilayah);

        $rw = Wilayah::where('kode_wilayah', 'RW01')->first();
        $rt = Wilayah::where('kode_wilayah', 'RT01')->first();
        $rudi = User::where('email', 'rudi@example.com')->first();
        $budi = User::where('email', 'budi@example.com')->first();

        if ($rw && $rudi?->id_citizen) {
            $this->orgMember('Ketua RW', $rudi->id_citizen, $rw->id_wilayah);
        }
        if ($rt && $budi?->id_citizen) {
            $this->orgMember('Ketua RT', $budi->id_citizen, $rt->id_wilayah);
        }
    }

    /**
     * Nonaktifkan organization_member dengan jabatan tertentu yang berada di
     * level wilayah yang tidak sesuai (mis. Kepala Dukuh di node KELURAHAN).
     */
    private function deactivateMisplaced(string $jabatan, array $validTipes): void
    {
        $ids = OrganizationMember::where('jabatan', $jabatan)
            ->where('status_aktif', true)
            ->get()
            ->filter(function ($m) use ($validTipes) {
                return ! in_array($m->wilayah?->tipe, $validTipes, true);
            })
            ->pluck('id_organization_member');

        OrganizationMember::whereIn('id_organization_member', $ids)
            ->update(['status_aktif' => false, 'periode_selesai' => now()->toDateString()]);
    }

    /**
     * Buat/tetap keep satu organization_member aktif per jabatan per wilayah.
     * Idempotent: jika sudah ada jabatan aktif di wilayah tsb, tidak menimpa.
     */
    private function orgMember(string $jabatan, string $idCitizen, string $idWilayah): void
    {
        $exists = OrganizationMember::where('jabatan', $jabatan)
            ->where('id_wilayah', $idWilayah)
            ->where('status_aktif', true)
            ->exists();

        if ($exists) {
            return;
        }

        OrganizationMember::create([
            'id_citizen' => $idCitizen,
            'jabatan' => $jabatan,
            'id_wilayah' => $idWilayah,
            'periode_mulai' => now()->toDateString(),
            'status_aktif' => true,
        ]);
    }

    private function createWilayah(string $kode, string $nama, string $tipe, string $parentId): Wilayah
    {
        $existing = Wilayah::where('kode_wilayah', $kode)->first();
        if ($existing) {
            $existing->update(['parent_id' => $parentId]);

            return $existing;
        }

        return Wilayah::create([
            'nama_wilayah' => $nama,
            'tipe' => $tipe,
            'kode_wilayah' => $kode,
            'parent_id' => $parentId,
        ]);
    }

    private function role(string $kode): Role
    {
        return Role::firstOrCreate(['kode' => $kode], [
            'nama_role' => $kode === 'LURAH' ? 'Kepala Lurah' : 'Kepala Dukuh',
            'level' => $kode === 'LURAH' ? 1 : 2,
            'is_strategic' => true,
        ]);
    }

    private function citizen(string $nik, string $nama, string $jk, string $idWilayah): Citizen
    {
        return Citizen::firstOrCreate(
            ['nik' => $nik],
            [
                'nama_lengkap' => $nama,
                'tempat_lahir' => 'Sleman',
                'tanggal_lahir' => '1975-06-15',
                'jenis_kelamin' => $jk,
                'status_nikah' => 'KAWIN',
                'status_warga' => 'TETAP',
                'kewarganegaraan' => 'WNI',
                'status_ekonomi' => 'MAMPU',
                'penerima_bansos' => false,
                'tanggal_masuk_rt' => now()->toDateString(),
                'id_wilayah' => $idWilayah,
                'alamat_kk_luar_rt' => false,
                'berdomisili_luar_rt' => false,
                'status_hidup' => 'HIDUP',
                'status_aktif' => true,
                'status_verifikasi' => 'APPROVED_DUKUH',
            ]
        );
    }

    private function user(string $email, string $nama, string $password, string $idCitizen, Role $role, string $idWilayah): void
    {
        $user = $this->createUser($email, $nama, $password, $idCitizen, $role, $idWilayah);
        $this->assignRole($user, $role, $idWilayah);
    }

    private function createUser(string $email, string $nama, string $password, string $idCitizen, Role $role, string $idWilayah): User
    {
        $user = User::where('email', $email)->first();
        if ($user) {
            return $user;
        }

        return User::create([
            'nama_users' => $nama,
            'email' => $email,
            'no_hp' => $role->kode === 'LURAH' ? '081234567011' : '081234567012',
            'password_hash' => Hash::make($password),
            'auth_provider' => 'EMAIL',
            'status' => 'ACTIVE',
            'id_citizen' => $idCitizen,
        ]);
    }

    private function assignRole(User $user, Role $role, string $idWilayah): void
    {
        UserRole::updateOrCreate(
            ['id_users' => $user->id_users, 'id_role' => $role->id_role, 'id_wilayah' => $idWilayah],
            ['status' => 'ACTIVE', 'assigned_at' => now()]
        );
    }
}
