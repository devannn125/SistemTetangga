<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

/**
 * Role kustom tingkat warga (Batasan_Role_RT_Digital.md §8-10):
 * - SISKAMLING : baseline Warga + SISKAMLING.CREATE @OWN (usul jadwal ronda,
 *                check-in presensi GPS+foto, lapor kejadian/panic button).
 *                Tanpa UPDATE/APPROVE — pengesahan jadwal final & penutupan
 *                kejadian tetap wewenang Ketua RT.
 * - PKK / KARANG_TARUNA : salinan baseline Warga (modul tambahan di luar scope MVP).
 *
 * Grant baseline disalin langsung dari baris role_permission milik WARGA agar
 * selalu mengikuti perubahan matriks RolePermissionSeeder. Idempotent.
 */
class AdditionalRolesSeeder extends Seeder
{
    public const CUSTOM_ROLES = [
        ['kode' => 'SISKAMLING', 'nama_role' => 'Pengurus Siskamling (Warga Ronda)', 'deskripsi' => 'Warga dengan wewenang operasional siskamling'],
        ['kode' => 'PKK', 'nama_role' => 'Ibu PKK', 'deskripsi' => 'Warga standar; modul kesehatan di luar scope MVP'],
        ['kode' => 'KARANG_TARUNA', 'nama_role' => 'Karang Taruna', 'deskripsi' => 'Warga standar; agenda kepemudaan di luar scope MVP'],
    ];

    public function run(): void
    {
        foreach (self::CUSTOM_ROLES as $role) {
            Role::firstOrCreate(
                ['kode' => $role['kode']],
                [
                    'nama_role' => $role['nama_role'],
                    'level' => 5,
                    'is_strategic' => false,
                    'deskripsi' => $role['deskripsi'],
                ]
            );
        }

        $actions = DB::table('permission_action')->pluck('id_permission_action', 'kode_permission');
        $roles = DB::table('role')->whereIn('kode', array_merge(['WARGA'], array_column(self::CUSTOM_ROLES, 'kode')))->pluck('id_role', 'kode');

        $wargaId = $roles['WARGA'] ?? null;
        if (! $wargaId) {
            return;
        }

        $wargaGrants = DB::table('role_permission')->where('id_role', $wargaId)->get();

        $max = (int) DB::table('role_permission')
            ->pluck('id_role_permission')
            ->map(fn ($id) => (int) preg_replace('/\D/', '', (string) $id))
            ->max() ?: 0;

        foreach (self::CUSTOM_ROLES as $custom) {
            $roleId = $roles[$custom['kode']];

            foreach ($wargaGrants as $grant) {
                $exists = DB::table('role_permission')
                    ->where('id_role', $roleId)
                    ->where('id_module', $grant->id_module)
                    ->where('id_permission_action', $grant->id_permission_action)
                    ->where('resource_scope', $grant->resource_scope)
                    ->exists();

                if ($exists) {
                    continue;
                }

                $max++;
                DB::table('role_permission')->insert([
                    'id_role_permission' => 'RP-'.str_pad((string) $max, 3, '0', STR_PAD_LEFT),
                    'id_role' => $roleId,
                    'id_module' => $grant->id_module,
                    'id_permission_action' => $grant->id_permission_action,
                    'resource_scope' => $grant->resource_scope,
                    'scope_level' => $grant->scope_level,
                ]);
            }
        }

        $siskamlingRoleId = $roles['SISKAMLING'];
        $siskamlingModuleId = DB::table('module')->where('kode_module', 'SISKAMLING')->value('id_module');
        $createActionId = $actions['CREATE'] ?? null;

        if ($siskamlingModuleId && $createActionId) {
            $exists = DB::table('role_permission')
                ->where('id_role', $siskamlingRoleId)
                ->where('id_module', $siskamlingModuleId)
                ->where('id_permission_action', $createActionId)
                ->where('resource_scope', '*')
                ->exists();

            if (! $exists) {
                $max++;
                DB::table('role_permission')->insert([
                    'id_role_permission' => 'RP-'.str_pad((string) $max, 3, '0', STR_PAD_LEFT),
                    'id_role' => $siskamlingRoleId,
                    'id_module' => $siskamlingModuleId,
                    'id_permission_action' => $createActionId,
                    'resource_scope' => '*',
                    'scope_level' => 'OWN',
                ]);
            }
        }
    }
}
