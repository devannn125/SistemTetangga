<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\SiskamlingIncidentRequest;
use App\Http\Resources\SiskamlingIncidentResource;
use App\Models\SiskamlingIncident;
use Illuminate\Http\Request;

class SiskamlingIncidentController extends BaseApiController
{
    public function index(Request $request)
    {
        $this->authorizeModule('SISKAMLING', 'VIEW');

        $query = SiskamlingIncident::query()->with('jenisKejadian')->latest();

        if ($request->has('status')) {
            $query->where('status', $request->query('status'));
        }
        if ($request->has('is_panic')) {
            $query->where('is_panic', $request->boolean('is_panic'));
        }

        return SiskamlingIncidentResource::collection($query->paginate($request->query('per_page', 25)));
    }

    public function store(SiskamlingIncidentRequest $request)
    {
        $this->authorizeModule('SISKAMLING', 'CREATE');

        $data = $request->validated();
        $data['dilaporkan_oleh'] = $this->requestUser()->id_users;

        $incident = SiskamlingIncident::create($data);

        $this->audit('SISKAMLING', 'CREATE', 'siskamling_incident', $incident->id_siskamling_incident);

        return (new SiskamlingIncidentResource($incident->load('jenisKejadian')))->response()->setStatusCode(201);
    }

    public function show(string $id)
    {
        $this->authorizeModule('SISKAMLING', 'VIEW');

        return new SiskamlingIncidentResource(SiskamlingIncident::with(['jenisKejadian', 'wilayah'])->findOrFail($id));
    }

    public function update(SiskamlingIncidentRequest $request, string $id)
    {
        $this->authorizeModule('SISKAMLING', 'UPDATE');

        $incident = SiskamlingIncident::findOrFail($id);
        $old = $incident->toArray();
        $incident->update($request->validated());

        $this->audit('SISKAMLING', 'UPDATE', 'siskamling_incident', $incident->id_siskamling_incident, $old, $incident->toArray());

        return new SiskamlingIncidentResource($incident->load('jenisKejadian'));
    }

    public function destroy(string $id)
    {
        $this->authorizeModule('SISKAMLING', 'DELETE');

        $incident = SiskamlingIncident::findOrFail($id);
        $incident->delete();

        $this->audit('SISKAMLING', 'DELETE', 'siskamling_incident', $incident->id_siskamling_incident);

        return response()->noContent();
    }
}
