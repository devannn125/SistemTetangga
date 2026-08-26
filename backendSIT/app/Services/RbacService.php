<?php

namespace App\Services;

use App\Models\Module;
use App\Models\RolePermission;
use App\Models\User;
use App\Models\Wilayah;
use Illuminate\Support\Collection;

/**
 * RBAC data-driven dari tabel: user_role (role aktif + periode) × role_permission
 * (role × module × action × scope). Lokasi operasional user diturunkan dari
 * user_role.id_wilayah; scope (OWN/RT/RW/KELURAHAN/ALL) lalu diperluas ke
 * hierarki wilayah.
 */
class RbacService
{
    public const SCOPE_OWN = 'OWN';

    public const SCOPE_RT = 'RT';

    public const SCOPE_RW = 'RW';

    public const SCOPE_KELURAHAN = 'KELURAHAN';

    public const SCOPE_ALL = 'ALL';

    /**
     * Kode role yang diizinkan melihat data sensitif (PRD 3.4).
     */
    public const SENSITIVE_ROLES = ['RT', 'SEKRETARIS', 'BENDAHARA'];

    public function can(User $user, string $moduleCode, string $action): bool
    {
        return $this->permissionFor($user, $moduleCode, $action) !== null;
    }

    /**
     * Scope terbaik yang dimiliki user untuk module+action.
     * Prioritas: ALL > KELURAHAN > RW > RT > OWN.
     */
    public function scopeFor(User $user, string $moduleCode, string $action): string
    {
        $permission = $this->permissionFor($user, $moduleCode, $action);

        if (! $permission) {
            return self::SCOPE_OWN;
        }

        $order = [
            self::SCOPE_ALL => 5,
            self::SCOPE_KELURAHAN => 4,
            self::SCOPE_RW => 3,
            self::SCOPE_RT => 2,
            self::SCOPE_OWN => 1,
        ];

        $scopes = $this->activePermissions($user)
            ->where('module.kode_module', $moduleCode)
            ->where('action.kode_permission', $action)
            ->pluck('scope_level')
            ->map(fn ($scope) => strtoupper((string) $scope))
            ->filter(fn ($scope) => isset($order[$scope]));

        if ($scopes->isEmpty()) {
            return self::SCOPE_OWN;
        }

        return $scopes->sortByDesc(fn ($scope) => $order[$scope])->first();
    }

    /**
     * ID wilayah yang menjadi jangkar operasional user (wilayah tempat dia
     * di-assign role aktif).
     */
    public function anchorWilayahId(User $user): ?string
    {
        return $user->userRoles
            ->filter(fn ($ur) => $this->isActivePeriod($ur))
            ->sortBy(fn ($ur) => $ur->role?->level)
            ->first()
            ?->id_wilayah;
    }

    protected function isActivePeriod($userRole): bool
    {
        if ($userRole->status !== 'ACTIVE') {
            return false;
        }

        $today = now()->toDateString();

        return (! $userRole->periode_mulai || $userRole->periode_mulai->toDateString() <= $today)
            && (! $userRole->periode_selesai || $userRole->periode_selesai->toDateString() >= $today);
    }

    /**
     * Daftar id_wilayah yang masuk lingkup user untuk suatu module+action.
     * `null` berarti tanpa filter (ALL). Fail-closed (PRD 5.3 Zero Trust):
     * scope selain ALL tanpa anchor wilayah mengembalikan array kosong
     * (hasil query kosong), BUKAN null — akun tanpa penugasan aktif tidak
     * boleh melihat data lintas RT.
     */
    public function wilayahScopeIds(User $user, string $moduleCode, string $action): ?array
    {
        $scope = $this->scopeFor($user, $moduleCode, $action);

        if ($scope === self::SCOPE_ALL) {
            return null;
        }

        $anchor = $this->anchorWilayahId($user);
        if (! $anchor) {
            return [];
        }

        return $this->expandWilayah($anchor, $scope);
    }

    /**
     * Lingkup operasional berbasis anchor user tanpa bergantung module+action,
     * untuk dashboard/statistik agregat per-user. Null = tanpa filter
     * (admin/dukuh/kelurahan atau akun tanpa role aktif).
     */
    public function operationalScopeIds(?User $user): ?array
    {
        if (! $user) {
            return null;
        }

        $anchor = $this->anchorWilayahId($user);
        if (! $anchor) {
            return null;
        }

        $tipe = strtoupper((string) Wilayah::query()->where('id_wilayah', $anchor)->value('tipe'));

        $scopeByTipe = [
            'RT' => self::SCOPE_RT,
            'RW' => self::SCOPE_RW,
            'KELURAHAN' => self::SCOPE_KELURAHAN,
            'KECAMATAN' => self::SCOPE_KELURAHAN,
        ];

        $scope = $scopeByTipe[$tipe] ?? self::SCOPE_ALL;

        if ($scope === self::SCOPE_ALL) {
            return null;
        }

        return $this->expandWilayah($anchor, $scope);
    }

    /**
     * Apakah user diperbolehkan melihat data sensitif (kurang mampu, bansos, WNA).
     * Hanya Ketua RT, Sekretaris & Bendahara (PRD 3.4).
     */
    public function canViewSensitive(User $user): bool
    {
        return $this->hasAnyRole($user, ['RT', 'SEKRETARIS', 'BENDAHARA']);
    }

    public function hasAnyRole(User $user, array $roleCodes): bool
    {
        $active = $user->userRoles
            ->filter(fn ($ur) => $this->isActivePeriod($ur))
            ->pluck('role.kode')
            ->filter();

        return $active->intersect($roleCodes)->isNotEmpty();
    }

    /**
     * List kode role aktif user.
     */
    public function activeRoleCodes(User $user): array
    {
        return $user->userRoles
            ->filter(fn ($ur) => $this->isActivePeriod($ur))
            ->pluck('role.kode')
            ->filter()
            ->values()
            ->all();
    }

    /**
     * Pasangan permission terbaik (role_permission) untuk user di module+action.
     */
    protected function permissionFor(User $user, string $moduleCode, string $action): ?RolePermission
    {
        return $this->activePermissions($user)
            ->filter(fn ($rp) => $rp->module?->kode_module === $moduleCode
                && $rp->action?->kode_permission === $action)
            ->sortByDesc(fn ($rp) => $this->scopeRank($rp->scope_level))
            ->first();
    }

    protected function activePermissions(User $user): Collection
    {
        $roleIds = $user->userRoles
            ->filter(fn ($ur) => $this->isActivePeriod($ur))
            ->pluck('id_role')
            ->unique()
            ->values();

        return Collection::make(
            RolePermission::with(['module', 'action'])
                ->whereIn('id_role', $roleIds)
                ->get()
        );
    }

    protected function scopeRank(?string $scope): int
    {
        return match (strtoupper((string) $scope)) {
            self::SCOPE_ALL => 5,
            self::SCOPE_KELURAHAN => 4,
            self::SCOPE_RW => 3,
            self::SCOPE_RT => 2,
            self::SCOPE_OWN => 1,
            default => 0,
        };
    }

    /**
     * Perluas anchor wilayah sesuai scope dengan menelusuri seluruh hierarki
     * descendant (termasuk anchor itu sendiri). OWN → hanya anchor.
     * Contoh: anchor KEL01 scope KELURAHAN → KEL01 + RW01/RW02 + RT01..RT04;
     * anchor RW01 scope RW → RW01 + RT01 + RT02.
     */
    protected function expandWilayah(string $anchorId, string $scope): array
    {
        $anchor = Wilayah::find($anchorId);
        if (! $anchor) {
            return [$anchorId];
        }

        if ($scope === self::SCOPE_OWN) {
            return [$anchorId];
        }

        $all = Wilayah::all(['id_wilayah', 'tipe', 'parent_id']);

        $children = [];
        foreach ($all as $w) {
            $children[$w->parent_id][] = $w->id_wilayah;
        }

        $result = [];
        $queue = [$anchorId];

        while (! empty($queue)) {
            $id = array_shift($queue);
            $result[] = $id;

            foreach ($children[$id] ?? [] as $childId) {
                $queue[] = $childId;
            }
        }

        return array_values(array_unique($result));
    }
}
