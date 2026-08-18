<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCitizenRequest;
use App\Http\Requests\UpdateCitizenRequest;
use App\Http\Resources\CitizenResource;
use App\Models\Citizen;
use App\Services\CitizenService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CitizenController extends Controller
{
    public function __construct(private readonly CitizenService $service)
    {
    }

    /**
     * GET /api/citizens
     * Kelurahan/Ketua RW/Ketua RT/Sekretaris/Bendahara: sesuai matrix (viewAny policy).
     * Warga & turunannya TIDAK bisa listing warga lain — gunakan endpoint /api/citizens/me.
     */
    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Citizen::class);

        $filters = $request->only(['search', 'id_wilayah', 'status_warga', 'status_aktif']);
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
        $citizen = $this->service->find($id);

        $this->authorize('view', $citizen);

        return response()->json([
            'data' => new CitizenResource($citizen),
        ]);
    }

    /**
     * POST /api/citizens
     * Hanya Ketua RT & Sekretaris (CRUD penuh) sesuai matrix.
     */
    public function store(StoreCitizenRequest $request): JsonResponse
    {
        $this->authorize('create', Citizen::class);

        $citizen = $this->service->create($request->validated(), $request->user());

        return response()->json([
            'message' => 'Data warga berhasil ditambahkan.',
            'data' => new CitizenResource($citizen->load(['agama', 'pendidikan', 'profesi', 'wilayah', 'family'])),
        ], 201);
    }

    /**
     * PUT/PATCH /api/citizens/{citizen}
     * Hanya Ketua RT & Sekretaris.
     */
    public function update(UpdateCitizenRequest $request, string $id): JsonResponse
    {
        $citizen = $this->service->find($id);

        $this->authorize('update', $citizen);

        $citizen = $this->service->update($citizen, $request->validated(), $request->user());

        return response()->json([
            'message' => 'Data warga berhasil diperbarui.',
            'data' => new CitizenResource($citizen),
        ]);
    }

    /**
     * DELETE /api/citizens/{citizen}
     * "Delete" = nonaktifkan (status_aktif = 0), wewenang final Ketua RT.
     */
    public function destroy(string $id): JsonResponse
    {
        $citizen = $this->service->find($id);

        $this->authorize('delete', $citizen);

        $this->service->deactivate($citizen);

        return response()->json([
            'message' => 'Data warga berhasil dinonaktifkan.',
        ]);
    }

    /**
     * GET /api/citizens/me
     * Shortcut untuk role Warga/Siskamling/PKK/Karang Taruna melihat data mereka sendiri
     * tanpa perlu tahu id_citizen mereka sendiri (Own Data, sesuai matrix akses).
     */
    public function me(Request $request): JsonResponse
    {
        $user = $request->user();

        if (! $user->citizen_id) {
            return response()->json(['message' => 'Akun ini tidak terhubung ke data warga.'], 404);
        }

        $citizen = $this->service->find($user->citizen_id);

        $this->authorize('view', $citizen);

        return response()->json([
            'data' => new CitizenResource($citizen),
        ]);
    }
}