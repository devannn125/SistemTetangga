<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\FeeBillRequest;
use App\Http\Resources\FeeBillResource;
use App\Models\FeeBill;
use Illuminate\Http\Request;

class FeeBillController extends BaseApiController
{
    public function index(Request $request)
    {
        $this->authorizeModule('IURAN', 'VIEW');

        $query = FeeBill::query()->with('family')->latest('jatuh_tempo');

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
