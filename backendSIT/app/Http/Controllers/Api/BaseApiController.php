<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Module;
use App\Services\RbacService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;

/**
 * Basis seluruh controller API: zero-trust RBAC per request (PRD 5.3),
 * auto-filtering lingkup wilayah, dan audit log immutable untuk operasi mutasi.
 */
class BaseApiController extends Controller
{
    protected RbacService $rbac;

    public function __construct()
    {
        $this->rbac = app(RbacService::class);
    }

    /**
     * Pastikan user punya akses module+action. 403 bila tidak.
     */
    protected function authorizeModule(string $moduleCode, string $action = 'VIEW'): void
    {
        if (! $this->rbac->can($this->requestUser(), $moduleCode, $action)) {
            abort(403, "Tidak memiliki akses ke modul {$moduleCode} (aksi {$action}).");
        }
    }

    /**
     * Batasi query sesuai lingkup wilayah user untuk module+action.
     * Hanya berlaku bila model punya kolom id_wilayah.
     * `ownColumn`: kolom yang menandai kepemilikan record (mis. id_pengirim_user)
     * untuk scope OWN — tanpa ini, scope OWN dibatasi wilayah saja.
     */
    protected function scopeQuery(Builder $query, string $moduleCode, string $action, ?string $ownColumn = null): Builder
    {
        $user = $this->requestUser();
        $scope = $this->rbac->scopeFor($user, $moduleCode, $action);

        if ($scope === RbacService::SCOPE_OWN) {
            if ($ownColumn) {
                $ownValue = $ownColumn === 'id_citizen' ? $user->id_citizen : $user->id_users;
                $query->where($ownColumn, $ownValue);
            } else {
                $query->whereRaw('1 = 0');
            }

            return $query;
        }

        $scopeIds = $this->rbac->wilayahScopeIds($user, $moduleCode, $action);

        if ($scopeIds !== null && in_array('id_wilayah', $query->getModel()->getFillable(), true)) {
            $query->whereIn('id_wilayah', $scopeIds);
        }

        return $query;
    }

    /**
     * Catat aktivitas ke audit_log. Immutable — hanya insert, tidak diupdate.
     */
    protected function audit(
        string $moduleCode,
        string $action,
        string $entityType,
        ?string $entityId = null,
        array $oldValues = [],
        array $newValues = []
    ): void {
        if (! Schema::hasTable('audit_log')) {
            return;
        }

        AuditLog::create([
            'id_users' => $this->requestUser()?->id_users,
            'id_module' => $this->moduleId($moduleCode),
            'id_permission_action' => $action,
            'entity_type' => $entityType,
            'entity_id' => $entityId,
            'old_value' => $oldValues ? json_encode($oldValues) : null,
            'new_value' => $newValues ? json_encode($newValues) : null,
            'ip_address' => request()->ip(),
        ]);
    }

    protected function moduleId(string $moduleCode): ?string
    {
        return Module::where('kode_module', $moduleCode)->value('id_module');
    }

    protected function requestUser()
    {
        return request()->user();
    }
}
