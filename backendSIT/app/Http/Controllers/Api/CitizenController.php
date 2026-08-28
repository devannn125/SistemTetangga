<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\StoreCitizenRequest;
use App\Http\Requests\UpdateCitizenRequest;
use App\Http\Resources\CitizenResource;
use App\Models\Citizen;
use App\Services\CitizenService;
use App\Services\RbacService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CitizenController extends BaseApiController
{
    public function __construct(private readonly CitizenService $service)
    {
        parent::__construct();
    }

    /**
     * GET /api/citizens
     * Sesuai matrix RBAC. Warga & turunannya TIDAK bisa listing warga lain —
     * gunakan endpoint /api/citizens/me.
     */
    public function index(Request $request): JsonResponse
    {
        $this->authorizeModule('WARGA', 'VIEW');

        $filters = $request->only(['search', 'id_wilayah', 'status_warga', 'status_aktif']);

        $scope = $this->rbac->scopeFor($request->user(), 'WARGA', 'VIEW');

        if ($scope === RbacService::SCOPE_OWN) {
            // Scope OWN (warga): hanya data warga milik akun ini.
            // Fail-closed: akun tanpa relasi citizen tidak boleh melihat data
            // siapa pun — filter dipaksa tidak mungkin cocok.
            $filters['id_citizen'] = $request->user()->id_citizen ?? '___none___';
        } else {
            // Scope RT/RW/KELURAHAN: batasi ke lingkup wilayah akun.
            $scopeIds = $this->rbac->wilayahScopeIds($request->user(), 'WARGA', 'VIEW');
            if ($scopeIds !== null) {
                $filters['id_wilayah'] = $scopeIds;
            }
        }

        $perPage = (int) $request->query('per_page', 15);

        $citizens = $this->service->list($filters, $perPage);

        return response()->json([
            'data' => CitizenResource::collection($citizens),
            'meta' => [
                'current_page' => $citizens->currentPage(),
                'last_page' => $citizens->lastPage(),
                'per_page' => $citizens->perPage(),
                'total' => $citizens->total(),
            ],
        ]);
    }

    /**
     * GET /api/citizens/{citizen}
     * Warga hanya bisa melihat record miliknya sendiri (dicek di CitizenPolicy@view).
     */
    public function show(string $id): JsonResponse
    {
        $this->authorizeModule('WARGA', 'VIEW');

        $citizen = $this->service->find($id);
        $this->assertInScope($citizen->id_wilayah, 'VIEW');

        return response()->json([
            'data' => new CitizenResource($citizen),
        ]);
    }

    /**
     * POST /api/citizens
     * Hanya role dengan akses CREATE di modul WARGA (RT/Admin dll).
     */
    public function store(StoreCitizenRequest $request): JsonResponse
    {
        $this->authorizeModule('WARGA', 'CREATE');

        $citizen = $this->service->create($request->validated(), $request->user());

        $this->audit('WARGA', 'CREATE', 'citizen', $citizen->id_citizen, [], $request->validated());

        return response()->json([
            'message' => 'Data warga berhasil ditambahkan.',
            'data' => new CitizenResource($citizen->load(['agama', 'pendidikan', 'profesi', 'wilayah', 'family'])),
        ], 201);
    }

    /**
     * PUT/PATCH /api/citizens/{citizen}
     */
    public function update(UpdateCitizenRequest $request, string $id): JsonResponse
    {
        $validated = $request->validated();
        $isOnlyVerification = isset($validated['status_verifikasi']) && count($validated) === 1;

        if ($isOnlyVerification) {
            $hasUpdate = $this->rbac->can($request->user(), 'WARGA', 'UPDATE');
            $hasVerify = $this->rbac->can($request->user(), 'WARGA', 'VERIFY');
            
            if (!$hasUpdate && !$hasVerify) {
                abort(403, 'Anda tidak memiliki akses untuk memverifikasi warga.');
            }
        } else {
            $this->authorizeModule('WARGA', 'UPDATE');
        }

        $citizen = $this->service->find($id);

        if ($isOnlyVerification) {
            $hasUpdateScope = $this->rbac->can($request->user(), 'WARGA', 'UPDATE');
            $scopeAction = $hasUpdateScope ? 'UPDATE' : 'VERIFY';
            $this->assertInScope($citizen->id_wilayah, $scopeAction);
        } else {
            $this->assertInScope($citizen->id_wilayah, 'UPDATE');
        }

        $old = $citizen->toArray();
        $citizen = $this->service->update($citizen, $validated, $request->user());

        $this->audit('WARGA', 'UPDATE', 'citizen', $citizen->id_citizen, $old, $validated);

        return response()->json([
            'message' => 'Data warga berhasil diperbarui.',
            'data' => new CitizenResource($citizen),
        ]);
    }

    /**
     * DELETE /api/citizens/{citizen}
     * "Delete" = nonaktifkan (status_aktif = 0), sesuai dokumen batasan role.
     */
    public function destroy(string $id): JsonResponse
    {
        $this->authorizeModule('WARGA', 'DELETE');

        $citizen = $this->service->find($id);
        $this->assertInScope($citizen->id_wilayah, 'DELETE');

        $this->service->deactivate($citizen);

        $this->audit('WARGA', 'DELETE', 'citizen', $citizen->id_citizen);

        return response()->json([
            'message' => 'Data warga berhasil dinonaktifkan.',
        ]);
    }

    /**
     * Zero Trust (PRD 5.3): pastikan warga yang diakses langsung via ID berada
     * dalam lingkup wilayah aktor (pola sama dengan FamilyController).
     * Null = scope ALL (tanpa batas).
     */
    private function assertInScope(string $idWilayah, string $action): void
    {
        $scopeIds = $this->rbac->wilayahScopeIds($this->requestUser(), 'WARGA', $action);

        if ($scopeIds !== null && ! in_array($idWilayah, $scopeIds, true)) {
            abort(403, 'Data warga berada di luar lingkup wilayah Anda.');
        }
    }

    /**
     * GET /api/citizens/me
     * Shortcut untuk role Warga/Siskamling/PKK/Karang Taruna melihat data mereka sendiri
     * tanpa perlu tahu id_citizen mereka sendiri (Own Data, sesuai matrix akses).
     */
    public function me(Request $request): JsonResponse
    {
        $user = $request->user();

        if (! $user->id_citizen) {
            return response()->json(['message' => 'Akun ini tidak terhubung ke data warga.'], 404);
        }

        $citizen = $this->service->find($user->id_citizen);

        return response()->json([
            'data' => new CitizenResource($citizen),
        ]);
    }
}
