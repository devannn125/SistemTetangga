<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\MasterDataRequest;
use App\Http\Resources\MasterDataResource;
use App\Models\MasterData;
use Illuminate\Http\Request;

class MasterDataController extends BaseApiController
{
    public function index(Request $request)
    {
        $this->authorizeModule('MASTER', 'VIEW');

        $query = MasterData::query()->ordered();

        if ($request->has('tipe')) {
            $query->tipe($request->query('tipe'));
        }
        if ($request->has('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        return MasterDataResource::collection($query->paginate($request->query('per_page', 50)));
    }

    public function store(MasterDataRequest $request)
    {
        $this->authorizeModule('MASTER', 'CREATE');

        $item = MasterData::create($request->validated());

        $this->audit('MASTER', 'CREATE', 'master_data', $item->id_master);

        return (new MasterDataResource($item))->response()->setStatusCode(201);
    }

    public function show(string $id)
    {
        $this->authorizeModule('MASTER', 'VIEW');

        return new MasterDataResource(MasterData::findOrFail($id));
    }

    public function update(MasterDataRequest $request, string $id)
    {
        $this->authorizeModule('MASTER', 'UPDATE');

        $item = MasterData::findOrFail($id);
        $old = $item->toArray();
        $item->update($request->validated());

        $this->audit('MASTER', 'UPDATE', 'master_data', $item->id_master, $old, $item->toArray());

        return new MasterDataResource($item);
    }

    public function destroy(string $id)
    {
        $this->authorizeModule('MASTER', 'DELETE');

        $item = MasterData::findOrFail($id);
        $item->update(['is_active' => false]);

        $this->audit('MASTER', 'DELETE', 'master_data', $item->id_master);

        return response()->json(['message' => 'Master data dinonaktifkan.']);
    }
}
