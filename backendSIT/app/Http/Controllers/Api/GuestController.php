<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\GuestRequest;
use App\Http\Resources\GuestResource;
use App\Models\Guest;
use Illuminate\Http\Request;

class GuestController extends BaseApiController
{
    public function index(Request $request)
    {
        $this->authorizeModule('TAMU', 'VIEW');

        $query = Guest::query()->with('house')->latest();

        if ($request->has('status')) {
            $query->where('status', $request->query('status'));
        }
        if ($request->has('id_house')) {
            $query->where('id_house', $request->query('id_house'));
        }

        return GuestResource::collection($query->paginate($request->query('per_page', 25)));
    }

    public function store(GuestRequest $request)
    {
        $this->authorizeModule('TAMU', 'CREATE');

        $data = $request->validated();
        $data['status'] = $data['status'] ?? 'MENUNGGU';

        // Check-in > 1x24 jam wajib approval RT (PRD 6.4).
        $longRooming = isset($data['jam_keluar'])
            && now()->parse($data['jam_keluar'])->gt(now()->parse($data['jam_masuk'])->addDay());

        $guest = Guest::create($data);

        $this->audit('TAMU', 'CREATE', 'guest', $guest->id_guest);

        return (new GuestResource($guest->load('house')))->response()->setStatusCode(201);
    }

    public function show(string $id)
    {
        $this->authorizeModule('TAMU', 'VIEW');

        return new GuestResource(Guest::with(['house', 'approver'])->findOrFail($id));
    }

    public function update(GuestRequest $request, string $id)
    {
        $this->authorizeModule('TAMU', 'UPDATE');

        $guest = Guest::findOrFail($id);
        $old = $guest->toArray();
        $guest->update($request->validated());

        $this->audit('TAMU', 'UPDATE', 'guest', $guest->id_guest, $old, $guest->toArray());

        return new GuestResource($guest->load('house'));
    }

    public function destroy(string $id)
    {
        $this->authorizeModule('TAMU', 'DELETE');

        $guest = Guest::findOrFail($id);
        $guest->delete();

        $this->audit('TAMU', 'DELETE', 'guest', $guest->id_guest);

        return response()->noContent();
    }
}
