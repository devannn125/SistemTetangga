<?php

namespace Database\Seeders;

use App\Models\Citizen;
use App\Models\OrganizationMember;
use App\Models\Role;
use App\Models\User;
use App\Models\UserRole;
use Illuminate\Database\Seeder;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

/**
 * Selaraskan penempatan data warga & role pengurus biar konsisten dgn node
 * jabatan (aturan "Ketua RT di node RT-nya", RW di node RW, dst).
 *
 * 1) citizen.id_wilayah mengikuti node organization_member aktif.
 * 2) Rapikan role tingkat warga (WARGA/PKK/SISKAMLING/KARANG_TARUNA): akhiri
 *    role ganda yang wilayahnya beda dari citizen (mis. WARGA di 2 RT).
 * 3) Akhiri role strategis tanpa organization_member aktif yang cocok
 *    (menghapus jabatan nyasar, mis. RW yang ditempatkan di node RT).
 */
class BackfillSelaraskanWilayahSeeder extends Seeder
{
    private const WARGA_ROLES = ['WARGA', 'PKK', 'SISKAMLING', 'KARANG_TARUNA'];

    public function run(): void
    {
        $orgs = OrganizationMember::query()->where('status_aktif', true)->get();
        $rolesById = Role::all()->keyBy('id_role');
        $roleByCode = $rolesById->keyBy('kode');
        $roleToJabatan = array_flip(OrganizationMember::POSITION_TO_ROLE);

        $syncedCitizen = 0;
        $endedWargaRole = 0;
        $endedStrategicRole = 0;

        // 1) Selaraskan citizen ke node jabatan aktif (kalau ada org member).
        foreach ($orgs as $org) {
            if (! $org->id_wilayah) {
                continue;
            }
            $updated = Citizen::where('id_citizen', $org->id_citizen)
                ->where('id_wilayah', '!=', $org->id_wilayah)
                ->update(['id_wilayah' => $org->id_wilayah]);
            $syncedCitizen += $updated;
        }

        $users = User::query()->whereNotNull('id_citizen')->with('userRoles.role')->get();

        foreach ($users as $user) {
            $citizenWilayahId = DB::table('citizen')->where('id_citizen', $user->id_citizen)->value('id_wilayah');

            // 2) Akhiri role tingkat warga yg wilayahnya beda dari citizen (biar sisa satu yg benar).
            foreach ($user->userRoles as $ur) {
                $roleKode = $ur->role?->kode;
                if (! in_array($roleKode, self::WARGA_ROLES, true)) {
                    continue;
                }
                if ($ur->status === 'ACTIVE' && $citizenWilayahId && $ur->id_wilayah !== $citizenWilayahId) {
                    $ur->update(['status' => 'ENDED', 'periode_selesai' => now()->toDateString()]);
                    $endedWargaRole++;
                }
            }

            // 3) Akhiri role strategis tanpa org member aktif yang cocok.
            foreach ($user->userRoles as $ur) {
                $roleKode = $ur->role?->kode;
                if (! in_array($roleKode, array_values(OrganizationMember::POSITION_TO_ROLE), true)) {
                    continue;
                }
                if (in_array($roleKode, self::WARGA_ROLES, true)) {
                    continue; // sudah ditangani step 2
                }
                if ($ur->status !== 'ACTIVE') {
                    continue;
                }
                $jabatan = $roleToJabatan[$roleKode] ?? null;
                if (! $jabatan) {
                    continue;
                }
                $hasOrg = $orgs->contains(fn ($org) =>
                    $org->id_citizen === $user->id_citizen
                    && $org->jabatan === $jabatan
                    && $org->id_wilayah === $ur->id_wilayah
                );
                if (! $hasOrg) {
                    $ur->update(['status' => 'ENDED', 'periode_selesai' => now()->toDateString()]);
                    $endedStrategicRole++;
                }
            }
        }

        $this->command?->info(
            "Selaras: {$syncedCitizen} citizen dipindah, {$endedWargaRole} role warga diakhiri, {$endedStrategicRole} role strategis nyasar diakhiri."
        );
    }
}
