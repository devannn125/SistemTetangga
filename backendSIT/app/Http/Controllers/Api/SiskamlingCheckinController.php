<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\SiskamlingCheckinRequest;
use App\Http\Resources\SiskamlingCheckinResource;
use App\Models\SiskamlingCheckin;
use Illuminate\Http\Request;

class SiskamlingCheckinController extends BaseApiController
{
    public function index(Request $request)
    {
        $this->authorizeModule('SISKAMLING', 'VIEW');

        $query = SiskamlingCheckin::query();

        if ($request->has('id_siskamling_schedule')) {
            $query->where('id_siskamling_schedule', $request->query('id_siskamling_schedule'));
        }

        return SiskamlingCheckinResource::collection($query->paginate($request->query('per_page', 50)));
    }

    public function store(SiskamlingCheckinRequest $request)
    {
        $this->authorizeModule('SISKAMLING', 'CREATE');

        $checkin = SiskamlingCheckin::create($request->validated());

        $this->audit('SISKAMLING', 'CREATE', 'siskamling_checkin', $checkin->id_siskamling_checkin);

        return (new SiskamlingCheckinResource($checkin))->response()->setStatusCode(201);
    }

    public function show(string $id)
    {
        $this->authorizeModule('SISKAMLING', 'VIEW');

        return new SiskamlingCheckinResource(SiskamlingCheckin::findOrFail($id));
    }

    public function destroy(string $id)
    {
        $this->authorizeModule('SISKAMLING', 'DELETE');

        $checkin = SiskamlingCheckin::findOrFail($id);
        $checkin->delete();

        $this->audit('SISKAMLING', 'DELETE', 'siskamling_checkin', $checkin->id_siskamling_checkin);

        return response()->noContent();
    }
}
