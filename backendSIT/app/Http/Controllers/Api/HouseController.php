<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\HouseRequest;
use App\Http\Resources\HouseResource;
use App\Models\House;
use Illuminate\Http\Request;

class HouseController extends BaseApiController
{
    public function index(Request $request)
    {
        $this->authorizeModule('PERUMAHAN', 'VIEW');

        $query = House::query()->with(['pemilik', 'wilayah', 'photos', 'rooms']);

        $this->scopeQuery($query, 'PERUMAHAN', 'VIEW');

        if ($request->has('tipe')) {
            $query->where('tipe', $request->query('tipe'));
        }
        if ($request->has('status_pajak')) {
            $query->where('status_pajak', $request->query('status_pajak'));
        }

        return HouseResource::collection($query->paginate($request->query('per_page', 25)));
    }

    public function store(HouseRequest $request)
    {
        $this->authorizeModule('PERUMAHAN', 'CREATE');

        $house = House::create($request->validated());

        $this->audit('PERUMAHAN', 'CREATE', 'house', $house->id_house);

        return (new HouseResource($house->load(['pemilik', 'wilayah'])))->response()->setStatusCode(201);
    }

    public function show(string $id)
    {
        $this->authorizeModule('PERUMAHAN', 'VIEW');

        return new HouseResource(House::with(['pemilik', 'wilayah', 'photos', 'rooms'])->findOrFail($id));
    }

    public function update(HouseRequest $request, string $id)
    {
        $this->authorizeModule('PERUMAHAN', 'UPDATE');

        $house = House::findOrFail($id);
        $old = $house->toArray();
        $house->update($request->validated());

        $this->audit('PERUMAHAN', 'UPDATE', 'house', $house->id_house, $old, $house->toArray());

        return new HouseResource($house->load(['pemilik', 'wilayah']));
    }

    public function destroy(string $id)
    {
        $this->authorizeModule('PERUMAHAN', 'DELETE');

        $house = House::findOrFail($id);
        $house->update(['status_aktif' => false]);

        $this->audit('PERUMAHAN', 'DELETE', 'house', $house->id_house);

        return response()->json(['message' => 'Rumah dinonaktifkan.']);
    }
}
