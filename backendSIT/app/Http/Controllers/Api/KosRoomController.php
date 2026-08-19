<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\KosRoomRequest;
use App\Http\Resources\KosRoomResource;
use App\Models\KosRoom;
use Illuminate\Http\Request;

class KosRoomController extends BaseApiController
{
    public function index(Request $request)
    {
        $this->authorizeModule('PERUMAHAN', 'VIEW');

        $query = KosRoom::query()->with('penghuni');

        if ($request->has('id_house')) {
            $query->where('id_house', $request->query('id_house'));
        }
        if ($request->has('status_okupansi')) {
            $query->where('status_okupansi', $request->query('status_okupansi'));
        }

        return KosRoomResource::collection($query->paginate($request->query('per_page', 50)));
    }

    public function store(KosRoomRequest $request)
    {
        $this->authorizeModule('PERUMAHAN', 'CREATE');

        $room = KosRoom::create($request->validated());

        $this->audit('PERUMAHAN', 'CREATE', 'kos_room', $room->id_kos_room);

        return (new KosRoomResource($room))->response()->setStatusCode(201);
    }

    public function show(string $id)
    {
        $this->authorizeModule('PERUMAHAN', 'VIEW');

        return new KosRoomResource(KosRoom::with(['penghuni', 'house'])->findOrFail($id));
    }

    public function update(KosRoomRequest $request, string $id)
    {
        $this->authorizeModule('PERUMAHAN', 'UPDATE');

        $room = KosRoom::findOrFail($id);
        $old = $room->toArray();
        $room->update($request->validated());

        $this->audit('PERUMAHAN', 'UPDATE', 'kos_room', $room->id_kos_room, $old, $room->toArray());

        return new KosRoomResource($room);
    }

    public function destroy(string $id)
    {
        $this->authorizeModule('PERUMAHAN', 'DELETE');

        $room = KosRoom::findOrFail($id);
        $room->delete();

        $this->audit('PERUMAHAN', 'DELETE', 'kos_room', $room->id_kos_room);

        return response()->noContent();
    }
}
