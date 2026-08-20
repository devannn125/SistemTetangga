<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\GuestRequest;
use App\Http\Resources\GuestResource;
use App\Models\Guest;
use App\Models\House;
use App\Services\RbacService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

class GuestController extends BaseApiController
{
    public function index(Request $request)
    {
        $this->authorizeModule('TAMU', 'VIEW');

        $query = Guest::query()->with(['house', 'approver'])->latest();

        $scope = $this->rbac->scopeFor($this->requestUser(), 'TAMU', 'VIEW');

        if ($scope === RbacService::SCOPE_OWN) {
            // Warga: hanya tamu di rumah milik KK-nya atau kos tempat ia tinggal
            // (PRD 3.2 Own Data) — dibagikan antar anggota KK di rumah yang sama.
            $this->assertCitizenLinked();
            $houseIds = House::idsAccessibleByCitizen($this->requestUser()->id_citizen);
            $query->whereIn('id_house', $houseIds);
        } else {
            // RT/RW/dll: batasi ke lingkup wilayah via rumah tujuan tamu
            // (guest tidak punya kolom id_wilayah).
            $scopeIds = $this->rbac->wilayahScopeIds($this->requestUser(), 'TAMU', 'VIEW');
            if ($scopeIds !== null) {
                $query->whereHas('house', fn (Builder $house) => $house->whereIn('id_wilayah', $scopeIds));
            }
        }

        if ($request->has('status')) {
            $query->where('status', $request->query('status'));
        }

        return GuestResource::collection($query->paginate($request->query('per_page', 25)));
    }

    public function store(GuestRequest $request)
    {
        $this->authorizeModule('TAMU', 'CREATE');
        $this->assertCitizenLinked();

        $data = $request->validated();
        $data['status'] = 'MENUNGGU';

        // Warga hanya boleh mendaftarkan tamu di rumah miliknya sendiri
        // (permission matrix: Tamu → Create (Own)).
        $this->assertOwnHouse($data['id_house']);

        $guest = Guest::create($data);

        $this->audit('TAMU', 'CREATE', 'guest', $guest->id_guest);

        return (new GuestResource($guest->load('house')))->response()->setStatusCode(201);
    }

    public function show(string $id)
    {
        $this->authorizeModule('TAMU', 'VIEW');

        return new GuestResource(Guest::with(['house', 'approver'])->findOrFail($id));
    }

    /**
     * Update tamu. Saat payload berisi `status`, tindakan dianggap APPROVE —
     * Ketua RT (TAMU APPROVE, bukan UPDATE) yang menyetujui/menolak.
     */
    public function update(GuestRequest $request, string $id)
    {
        $data = $request->validated();

        if (array_key_exists('status', $data)) {
            $this->authorizeModule('TAMU', 'APPROVE');
            $this->assertInScope($id);
        } else {
            $this->authorizeModule('TAMU', 'UPDATE');
        }

        $guest = Guest::findOrFail($id);
        $old = $guest->toArray();

        if (in_array($data['status'] ?? null, ['DISETUJUI', 'DITOLAK'], true)) {
            $data['approved_by'] = $this->requestUser()->id_users;
            $data['approved_at'] = now();
        }

        $guest->update($data);

        $this->audit('TAMU', 'UPDATE', 'guest', $guest->id_guest, $old, $guest->toArray());

        return new GuestResource($guest->load(['house', 'approver']));
    }

    public function destroy(string $id)
    {
        $this->authorizeModule('TAMU', 'DELETE');

        $guest = Guest::findOrFail($id);
        $guest->delete();

        $this->audit('TAMU', 'DELETE', 'guest', $guest->id_guest);

        return response()->noContent();
    }

    private function assertCitizenLinked(): void
    {
        if (! $this->requestUser()->id_citizen) {
            abort(403, 'Akun ini belum terhubung ke data warga.');
        }
    }

    private function assertOwnHouse(string $idHouse): void
    {
        $houseIds = House::idsAccessibleByCitizen($this->requestUser()->id_citizen);

        if (! in_array($idHouse, $houseIds, true)) {
            abort(403, 'Anda hanya dapat mendaftarkan tamu di rumah milik keluarga Anda atau rumah kos tempat Anda tinggal.');
        }
    }

    private function assertInScope(string $id): void
    {
        $guest = Guest::with('house')->findOrFail($id);

        $scopeIds = $this->rbac->wilayahScopeIds($this->requestUser(), 'TAMU', 'APPROVE');
        if ($scopeIds !== null && ! in_array($guest->house?->id_wilayah, $scopeIds, true)) {
            abort(403, 'Tamu di luar lingkup wilayah Anda.');
        }
    }
}