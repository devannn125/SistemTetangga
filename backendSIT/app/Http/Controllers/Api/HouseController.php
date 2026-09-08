<?php

namespace App\Http\Controllers\Api;

use App\Concerns\ResolvesActorWilayah;
use App\Http\Requests\HouseRequest;
use App\Http\Resources\HouseResource;
use App\Models\House;
use Illuminate\Http\Request;

class HouseController extends BaseApiController
{
    use ResolvesActorWilayah;

    public function index(Request $request)
    {
        $this->authorizeModule('PERUMAHAN', 'VIEW');

        $query = House::query()->with(['pemilik', 'wilayah', 'kategoriKos', 'photos', 'rooms']);

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

        $data = $request->validated();
        $data['id_wilayah'] = $this->resolveActorWilayah($request->user());

        $house = House::create($data);

        $this->audit('PERUMAHAN', 'CREATE', 'house', $house->id_house);

        return (new HouseResource($house->load(['pemilik', 'wilayah', 'kategoriKos'])))->response()->setStatusCode(201);
    }

    /**
     * GET /api/houses/mine
     * Rumah milik keluarga user + rumah kos tempat ia tinggal (Own Data) —
     * dipakai warga untuk memilih rumah tujuan saat mendaftarkan tamu.
     */
    public function mine(Request $request)
    {
        $user = $request->user();

        if (! $user->id_citizen) {
            return response()->json(['data' => []]);
        }

        $houseIds = House::idsAccessibleByCitizen($user->id_citizen);

        $houses = House::query()
            ->with(['pemilik', 'wilayah', 'kategoriKos', 'photos', 'rooms'])
            ->whereIn('id_house', $houseIds)
            ->where('status_aktif', 1)
            ->latest()
            ->get();

        return HouseResource::collection($houses);
    }

    public function show(string $id)
    {
        $this->authorizeModule('PERUMAHAN', 'VIEW');

        return new HouseResource(House::with(['pemilik', 'wilayah', 'kategoriKos', 'photos', 'rooms'])->findOrFail($id));
    }

    public function update(HouseRequest $request, string $id)
    {
        $this->authorizeModule('PERUMAHAN', 'UPDATE');

        $house = House::findOrFail($id);
        $old = $house->toArray();

        $data = $request->validated();
        $data['id_wilayah'] = $this->resolveActorWilayah($request->user());
        $house->update($data);

        $this->audit('PERUMAHAN', 'UPDATE', 'house', $house->id_house, $old, $house->toArray());

        return new HouseResource($house->load(['pemilik', 'wilayah', 'kategoriKos']));
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
