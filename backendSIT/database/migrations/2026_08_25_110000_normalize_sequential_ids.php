<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Normalisasi sekali-jalan: seluruh primary key memakai format PREFIX-###
 * (USR-, CIT-, WIL-, ROLE-, MST-, UR-, dst) beserta semua referensi foreign key.
 *
 * Hanya berjalan di MySQL (guard driver); SQLite jalur test tidak tersentuh.
 * FOREIGN_KEY_CHECKS dimatikan sementara dalam transaksi karena satu rename PK
 * menyentuh banyak tabel anak sekaligus; jejak audit tetap utuh.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (DB::getDriverName() !== 'mysql') {
            return;
        }

        DB::statement('SET FOREIGN_KEY_CHECKS=0');

        try {
            // ===== users: akun seed ber-suffix teks -> nomor urut =====
            $userMap = [
                'USR-BEN' => 'USR-009',
                'USR-CLN' => 'USR-010',
                'USR-RT' => 'USR-011',
                'USR-SEK' => 'USR-012',
            ];
            foreach ($userMap as $old => $new) {
                DB::table('users')->where('id_users', $old)->update(['id_users' => $new]);
            }
            foreach ([
                ['user_role', 'id_users'],
                ['user_session', 'id_users'],
                ['audit_log', 'id_users'],
                ['permission_override', 'id_users'],
                ['permission_override', 'created_by'],
                ['guest', 'approved_by'],
                ['letter_request', 'verified_by'],
                ['letter_request', 'approved_by'],
                ['siskamling_incident', 'dilaporkan_oleh'],
                ['keuangan_transaksi', 'dicatat_oleh'],
                ['regulation', 'created_by'],
                ['announcement', 'created_by'],
                ['notification_log', 'id_users'],
                ['feedback', 'id_pengirim_user'],
                ['iuran_tagihan', 'dikonfirmasi_oleh'],
                ['inventory', 'created_by'],
                ['inventory_purchase', 'diajukan_oleh'],
                ['inventory_purchase', 'disetujui_oleh'],
                ['complaint', 'id_pengirim_user'],
            ] as [$table, $column]) {
                $this->renameValues($table, $column, $userMap);
            }
            DB::table('personal_access_tokens')
                ->where('tokenable_type', 'like', '%User%')
                ->where('tokenable_id', 'like', 'USR-%')
                ->where('tokenable_id', 'not like', 'USR-[0-9][0-9][0-9]')
                ->get(['id', 'tokenable_id'])
                ->each(function ($row) use ($userMap) {
                    if (isset($userMap[$row->tokenable_id])) {
                        DB::table('personal_access_tokens')->where('id', $row->id)
                            ->update(['tokenable_id' => $userMap[$row->tokenable_id]]);
                    }
                });

            // ===== wilayah: KEL01/RW01/RTxx -> WIL-### =====
            $wilayahMap = [
                'KEL01' => 'WIL-001',
                'RW01' => 'WIL-002',
                'RW02' => 'WIL-003',
                'RT01' => 'WIL-004',
                'RT02' => 'WIL-005',
                'RT03' => 'WIL-006',
                'RT04' => 'WIL-007',
            ];
            foreach ($wilayahMap as $old => $new) {
                DB::table('wilayah')->where('id_wilayah', $old)->update(['id_wilayah' => $new]);
            }
            foreach ([
                ['wilayah', 'parent_id'],
                ['citizen', 'id_wilayah'],
                ['family', 'id_wilayah'],
                ['house', 'id_wilayah'],
                ['letter_request', 'id_wilayah'],
                ['siskamling_schedule', 'id_wilayah'],
                ['siskamling_incident', 'id_wilayah'],
                ['organization_member', 'id_wilayah'],
                ['regulation', 'id_wilayah'],
                ['announcement', 'id_wilayah'],
                ['keuangan_transaksi', 'id_wilayah'],
                ['inventory', 'id_wilayah'],
                ['inventory_purchase', 'id_wilayah'],
                ['user_role', 'id_wilayah'],
                ['permission_override', 'id_wilayah'],
            ] as [$table, $column]) {
                $this->renameValues($table, $column, $wilayahMap);
            }

            // ===== role: ROLE-KODE -> ROLE-### =====
            $roleMap = [
                'ROLE-ADMIN' => 'ROLE-001',
                'ROLE-DUKUH' => 'ROLE-002',
                'ROLE-RW' => 'ROLE-003',
                'ROLE-RT' => 'ROLE-004',
                'ROLE-SEKRETARIS' => 'ROLE-005',
                'ROLE-BENDAHARA' => 'ROLE-006',
                'ROLE-WARGA' => 'ROLE-007',
                'ROLE-SISKAMLING' => 'ROLE-008',
                'ROLE-PKK' => 'ROLE-009',
                'ROLE-KARANG_TARUNA' => 'ROLE-010',
            ];
            foreach ($roleMap as $old => $new) {
                DB::table('role')->where('id_role', $old)->update(['id_role' => $new]);
            }
            foreach ([
                ['user_role', 'id_role'],
                ['role_permission', 'id_role'],
            ] as [$table, $column]) {
                $this->renameValues($table, $column, $roleMap);
            }

            // ===== user_role: baris UUID -> UR-### lanjutan =====
            $maxUr = (int) DB::table('user_role')
                ->where('id_user_role', 'like', 'UR-%')
                ->get(['id_user_role'])
                ->map(fn ($row) => (int) preg_replace('/\D/', '', (string) $row->id_user_role))
                ->max() ?: 0;
            DB::table('user_role')
                ->where('id_user_role', 'not like', 'UR-%')
                ->orderBy('id_user_role')
                ->get(['id_user_role'])
                ->each(function ($row) use (&$maxUr) {
                    $maxUr++;
                    DB::table('user_role')->where('id_user_role', $row->id_user_role)
                        ->update(['id_user_role' => 'UR-'.str_pad((string) $maxUr, 3, '0', STR_PAD_LEFT)]);
                });

            // ===== master_data: MST-TIPE-### -> MST-### =====
            $masterRows = DB::table('master_data')
                ->orderBy('tipe')->orderBy('urutan')->orderBy('kode_master')
                ->get(['id_master']);
            $masterMap = [];
            $i = 0;
            foreach ($masterRows as $row) {
                $i++;
                $new = 'MST-'.str_pad((string) $i, 3, '0', STR_PAD_LEFT);
                if ($row->id_master !== $new) {
                    $masterMap[$row->id_master] = $new;
                }
            }
            foreach ([
                ['master_data', 'id_master'],
                ['citizen', 'id_agama'],
                ['citizen', 'id_pendidikan'],
                ['citizen', 'id_profesi'],
                ['house', 'id_kategori_kos'],
                ['siskamling_incident', 'id_jenis_kejadian'],
            ] as [$table, $column]) {
                $this->renameValues($table, $column, $masterMap);
            }

            // ===== inventory: item seed bernama panjang -> INV-### =====
            $inventoryMap = [
                'INV-AC-STANDING-2PK-006' => 'INV-006',
                'INV-TENDA-PESTA-4X4-001' => 'INV-007',
            ];
            $this->renameValues('inventory', 'id_inventory', $inventoryMap);
        } finally {
            DB::statement('SET FOREIGN_KEY_CHECKS=1');
        }
    }

    public function down(): void
    {
        // Pembalikan tidak didukung penuh (penomoran UUID/master_data hilang
        // setelah dinormalisasi); migration ini one-way untuk data dev/demo.
    }

    private function renameValues(string $table, string $column, array $map): void
    {
        if (! \Illuminate\Support\Facades\Schema::hasTable($table)
            || ! \Illuminate\Support\Facades\Schema::hasColumn($table, $column)) {
            return;
        }

        foreach ($map as $old => $new) {
            DB::table($table)->where($column, $old)->update([$column => $new]);
        }
    }
};
