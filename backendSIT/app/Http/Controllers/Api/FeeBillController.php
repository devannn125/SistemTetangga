<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\FeeBillRequest;
use App\Http\Resources\FeeBillResource;
use App\Models\Citizen;
use App\Models\FeeBill;
use App\Services\RbacService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

class FeeBillController extends BaseApiController
{
    public function index(Request $request)
    {
        $this->authorizeModule('IURAN', 'VIEW');

        $query = FeeBill::query()->with('family')->latest('jatuh_tempo');

        $scope = $this->rbac->scopeFor($this->requestUser(), 'IURAN', 'VIEW');

        if ($scope === RbacService::SCOPE_OWN) {
            // Warga: hanya tagihan KK-nya sendiri (PRD 3.2 Own Data).
            $familyId = $this->requestUser()->id_citizen
                ? Citizen::where('id_citizen', $this->requestUser()->id_citizen)->value('id_family')
                : null;
            if (! $familyId) {
                $query->whereRaw('1 = 0');
            } else {
                $query->where('id_family', $familyId);
            }
        } else {
            // RT/RW/dll: batasi ke lingkup wilayah via family (iuran_tagihan tak punya id_wilayah).
            $scopeIds = $this->rbac->wilayahScopeIds($this->requestUser(), 'IURAN', 'VIEW');
            if ($scopeIds !== null) {
                $query->whereHas('family', fn (Builder $family) => $family->whereIn('id_wilayah', $scopeIds));
            }
        }

        if ($request->has('status')) {
            $query->where('status', $request->query('status'));
        }
        if ($request->has('periode')) {
            $query->where('periode', $request->query('periode'));
        }

        return FeeBillResource::collection($query->paginate($request->query('per_page', 25)));
    }

    public function store(FeeBillRequest $request)
    {
        $this->authorizeModule('IURAN', 'CREATE');

        $bill = FeeBill::create($request->validated());

        $this->audit('IURAN', 'CREATE', 'iuran_tagihan', $bill->id_iuran_tagihan);

        return (new FeeBillResource($bill->load('family')))->response()->setStatusCode(201);
    }

    public function show(string $id)
    {
        $this->authorizeModule('IURAN', 'VIEW');

        return new FeeBillResource(FeeBill::with('family')->findOrFail($id));
    }

    public function update(FeeBillRequest $request, string $id)
    {
        $this->authorizeModule('IURAN', 'UPDATE');

        $bill = FeeBill::findOrFail($id);
        $old = $bill->toArray();

        $data = $request->validated();
        if (isset($data['status']) && in_array($data['status'], ['LUNAS', 'SEBAGIAN'], true)) {
            $data['dikonfirmasi_oleh'] = $this->requestUser()->id_users;
            $data['dikonfirmasi_at'] = now();
        }

        $bill->update($data);

        $this->audit('IURAN', 'UPDATE', 'iuran_tagihan', $bill->id_iuran_tagihan, $old, $bill->toArray());

        return new FeeBillResource($bill->load('family'));
    }

    public function destroy(string $id)
    {
        $this->authorizeModule('IURAN', 'DELETE');

        $bill = FeeBill::findOrFail($id);
        $bill->delete();

        $this->audit('IURAN', 'DELETE', 'iuran_tagihan', $bill->id_iuran_tagihan);

        return response()->noContent();
    }
}
