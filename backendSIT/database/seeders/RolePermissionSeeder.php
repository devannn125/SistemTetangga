<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

/**
 * Seeder matriks RBAC lengkap per PRD Bab 3.2 (disesuaikan dengan 6 role yang
 * ada: ADMIN, DUKUH, RW, RT, SEKRETARIS, WARGA). ADMIN diberi akses penuh
 * (ALL) di semua modul. Aman dijalankan ulang (idempotent).
 */
class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        $this->seedRoles();
        $this->seedModules();
        $this->seedPermissions();
    }

    private function seedRoles(): void
    {
        $roles = [
            ['kode' => 'ADMIN', 'nama_role' => 'Administrator', 'level' => 1, 'is_strategic' => true, 'deskripsi' => 'Administrator sistem'],
            ['kode' => 'DUKUH', 'nama_role' => 'Kepala Dukuh', 'level' => 2, 'is_strategic' => true, 'deskripsi' => 'Pengelola tingkat kelurahan/dukuh'],
            ['kode' => 'RW', 'nama_role' => 'Ketua RW', 'level' => 3, 'is_strategic' => false, 'deskripsi' => 'Pengurus tingkat RW'],
            ['kode' => 'RT', 'nama_role' => 'Ketua RT', 'level' => 4, 'is_strategic' => true, 'deskripsi' => 'Pengurus tingkat RT'],
            ['kode' => 'SEKRETARIS', 'nama_role' => 'Sekretaris RT', 'level' => 4, 'is_strategic' => true, 'deskripsi' => 'Sekretaris tingkat RT'],
            ['kode' => 'BENDAHARA', 'nama_role' => 'Bendahara RT', 'level' => 4, 'is_strategic' => true, 'deskripsi' => 'Bendahara tingkat RT'],
            ['kode' => 'WARGA', 'nama_role' => 'Warga', 'level' => 5, 'is_strategic' => false, 'deskripsi' => 'Pengguna umum'],
        ];

        foreach ($roles as $role) {
            \App\Models\Role::firstOrCreate(
                ['kode' => $role['kode']],
                ['id_role' => 'ROLE-'.$role['kode']] + $role
            );
        }
    }

    private function seedModules(): void
    {
        $modules = [
            'DASHBOARD' => 'Dashboard',
            'WARGA' => 'Data Warga',
            'KELUARGA' => 'Data Keluarga',
            'SURAT' => 'Pelayanan Surat',
            'KEUANGAN' => 'Keuangan',
            'IURAN' => 'Iuran Warga',
            'SISKAMLING' => 'Siskamling',
            'PENGUMUMAN' => 'Pengumuman',
            'PERUMAHAN' => 'Perumahan',
            'TAMU' => 'Pendataan Tamu',
            'PENGADUAN' => 'Pengaduan (SIPANDU)',
            'PERATURAN' => 'Peraturan & Tata Tertib',
            'ORGANISASI' => 'Struktur Organisasi',
            'PESAN' => 'Pesan & Kesan',
            'NOTIFIKASI' => 'Notifikasi',
            'MASTER' => 'Master Data',
            'USER' => 'User Management',
            'AUDIT' => 'Audit Log',
        ];

        $urutan = 1;
        $next = DB::table('module')->count() + 1;
        foreach ($modules as $kode => $nama) {
            $exists = DB::table('module')->where('kode_module', $kode)->exists();
            if ($exists) {
                $urutan++;

                continue;
            }

            DB::table('module')->insert([
                'id_module' => 'MOD-'.str_pad((string) $next, 3, '0', STR_PAD_LEFT),
                'kode_module' => $kode,
                'nama_module' => $nama,
                'urutan' => $urutan,
            ]);
            $next++;
            $urutan++;
        }
    }

    private function seedPermissions(): void
    {
        $actions = DB::table('permission_action')->pluck('id_permission_action', 'kode_permission');
        $roles = DB::table('role')->pluck('id_role', 'kode');

        $matrix = $this->buildMatrix();

        // Nomor urut id_role_permission dijamin unik: pakai angka maksimal yang
        // sudah ada (RP-###), bukan jumlah baris — aman bila ada baris dihapus.
        $max = (int) DB::table('role_permission')
            ->pluck('id_role_permission')
            ->map(fn ($id) => (int) preg_replace('/\D/', '', (string) $id))
            ->max() ?: 0;

        foreach ($roles as $roleKode => $roleId) {
            foreach ($matrix[$roleKode] as $module => $grants) {
                $moduleId = DB::table('module')->where('kode_module', $module)->value('id_module');
                if (! $moduleId) {
                    continue;
                }

                foreach ($grants as $grant) {
                    $actionId = $actions[$grant['action']] ?? null;
                    if (! $actionId) {
                        continue;
                    }

                    $exists = DB::table('role_permission')
                        ->where('id_role', $roleId)
                        ->where('id_module', $moduleId)
                        ->where('id_permission_action', $actionId)
                        ->where('resource_scope', $grant['scope'] ?? '*')
                        ->exists();

                    if ($exists) {
                        continue;
                    }

                    $max++;
                    DB::table('role_permission')->insert([
                        'id_role_permission' => 'RP-'.str_pad((string) $max, 3, '0', STR_PAD_LEFT),
                        'id_role' => $roleId,
                        'id_module' => $moduleId,
                        'id_permission_action' => $actionId,
                        'resource_scope' => $grant['scope'] ?? '*',
                        'scope_level' => $grant['level'] ?? 'ALL',
                    ]);
                }
            }
        }
    }

    private function buildMatrix(): array
    {
        $all = ['VIEW', 'CREATE', 'UPDATE', 'DELETE', 'APPROVE', 'VERIFY'];
        $view = fn (string $level = 'ALL', string $scope = '*') => [['action' => 'VIEW', 'level' => $level, 'scope' => $scope]];

        $crud = function (string $level, string $scope = '*') {
            return array_map(fn ($a) => ['action' => $a, 'level' => $level, 'scope' => $scope], ['VIEW', 'CREATE', 'UPDATE', 'DELETE']);
        };

        $admin = [];
        $modules = ['DASHBOARD', 'WARGA', 'KELUARGA', 'SURAT', 'KEUANGAN', 'IURAN', 'SISKAMLING',
            'PENGUMUMAN', 'PERUMAHAN', 'TAMU', 'PENGADUAN', 'PERATURAN', 'ORGANISASI', 'PESAN',
            'NOTIFIKASI', 'MASTER', 'USER', 'AUDIT'];
        foreach ($modules as $m) {
            $admin[$m] = array_map(fn ($a) => ['action' => $a, 'level' => 'ALL', 'scope' => '*'], $all);
        }

        return [
            'ADMIN' => $admin,

            // Kepala Dukuh: read-only lintas wilayah, tanpa data sensitif/operasional.
            'DUKUH' => [
                'DASHBOARD' => $view('KELURAHAN'),
                'WARGA' => $view('KELURAHAN'),
                'KELUARGA' => $view('KELURAHAN'),
                'PERUMAHAN' => $view('KELURAHAN'),
                'KEUANGAN' => $view('KELURAHAN'),
                'PENGUMUMAN' => $view('KELURAHAN'),
                'PERATURAN' => $view('KELURAHAN'),
                'ORGANISASI' => $view('KELURAHAN'),
                'PENGADUAN' => $view('KELURAHAN'),
            ],

            // Ketua RW: agregat seluruh RT di bawahnya + verifikasi warga baru.
            'RW' => [
                'DASHBOARD' => $view('RW'),
                'WARGA' => array_merge($view('RW'), [['action' => 'VERIFY', 'level' => 'RW', 'scope' => 'citizen']]),
                'KELUARGA' => $view('RW'),
                'PERUMAHAN' => $view('RW'),
                'KEUANGAN' => $view('RW'),
                'SURAT' => $view('RW'),
                'PENGUMUMAN' => $view('RW'),
                'PERATURAN' => $view('RW'),
                'ORGANISASI' => $view('RW'),
                'PENGADUAN' => $view('RW'),
            ],

            // Ketua RT: operasional penuh satu RT.
            'RT' => [
                'DASHBOARD' => $view('RT'),
                'WARGA' => $crud('RT'),
                'KELUARGA' => $crud('RT'),
                'PERUMAHAN' => $crud('RT'),
                'TAMU' => array_merge($view('RT'), [['action' => 'APPROVE', 'level' => 'RT']]),
                'KEUANGAN' => $view('RT'),
                'IURAN' => array_merge($view('RT'), [['action' => 'APPROVE', 'level' => 'RT']]),
                'SURAT' => array_merge($view('RT'), [['action' => 'APPROVE', 'level' => 'RT']]),
                'SISKAMLING' => array_merge($view('RT'), [['action' => 'CREATE', 'level' => 'RT'], ['action' => 'UPDATE', 'level' => 'RT'], ['action' => 'APPROVE', 'level' => 'RT']]),
                'PENGUMUMAN' => $crud('RT'),
                'PERATURAN' => $crud('RT'),
                'ORGANISASI' => $crud('RT'),
                'PESAN' => $view('RT'),
                'PENGADUAN' => array_merge($view('RT'), [['action' => 'UPDATE', 'level' => 'RT'], ['action' => 'APPROVE', 'level' => 'RT']]),
                'NOTIFIKASI' => $view('RT'),
                'USER' => $crud('RT'),
                'MASTER' => $crud('RT'),
                'AUDIT' => $view('RT'),
            ],

            // Sekretaris RT: verifikasi data & surat, kelola tata tertib/pengumuman.
            'SEKRETARIS' => [
                'DASHBOARD' => $view('RT'),
                'WARGA' => $crud('RT'),
                'KELUARGA' => $crud('RT'),
                'PERUMAHAN' => $crud('RT'),
                'TAMU' => $view('RT'),
                'KEUANGAN' => $view('RT'),
                'IURAN' => $view('RT'),
                'SURAT' => array_merge($view('RT'), [['action' => 'VERIFY', 'level' => 'RT']]),
                'SISKAMLING' => $view('RT'),
                'PENGUMUMAN' => $crud('RT'),
                'PERATURAN' => $crud('RT'),
                'ORGANISASI' => $view('RT'),
                'PESAN' => $view('RT'),
                'PENGADUAN' => $view('RT'),
            ],

            // Bendahara RT: kelola keuangan & iuran, baca data warga (iuran/bansos),
            // input status pajak rumah (PRD 6.3.1).
            'BENDAHARA' => [
                'DASHBOARD' => $view('RT'),
                'WARGA' => $view('RT'),
                'KELUARGA' => $view('RT'),
                'PERUMAHAN' => array_merge($view('RT'), [['action' => 'UPDATE', 'level' => 'RT']]),
                'KEUANGAN' => $crud('RT'),
                'IURAN' => $crud('RT'),
                'SURAT' => $view('RT'),
                'SISKAMLING' => $view('RT'),
                'PENGUMUMAN' => $view('RT'),
                'PERATURAN' => $view('RT'),
                'ORGANISASI' => $view('RT'),
                'PENGADUAN' => $view('RT'),
            ],

            // Warga: hanya data sendiri + layanan.
            'WARGA' => [
                'DASHBOARD' => $view('OWN'),
                'WARGA' => $view('OWN'),
                'TAMU' => [['action' => 'CREATE', 'level' => 'OWN'], ['action' => 'VIEW', 'level' => 'OWN']],
                'KEUANGAN' => $view('OWN'),
                'IURAN' => $view('OWN'),
                'SURAT' => [['action' => 'CREATE', 'level' => 'OWN'], ['action' => 'VIEW', 'level' => 'OWN']],
                'SISKAMLING' => $view('OWN'),
                'PENGUMUMAN' => $view('OWN'),
                'PERATURAN' => $view('OWN'),
                'ORGANISASI' => $view('OWN'),
                'PESAN' => [['action' => 'CREATE', 'level' => 'OWN']],
                'PENGADUAN' => [['action' => 'CREATE', 'level' => 'OWN'], ['action' => 'VIEW', 'level' => 'OWN']],
                'NOTIFIKASI' => $view('OWN'),
                'USER' => $view('OWN'),
            ],
        ];
    }
}
