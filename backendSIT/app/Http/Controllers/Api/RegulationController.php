<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\RegulationRequest;
use App\Http\Resources\RegulationResource;
use App\Models\Regulation;
use Illuminate\Http\Request;

class RegulationController extends BaseApiController
{
    public function index(Request $request)
    {
        $this->authorizeModule('PERATURAN', 'VIEW');

        $query = Regulation::query()->with('wilayah');

        if ($request->has('kategori')) {
            $query->where('kategori', $request->query('kategori'));
        }
        if ($request->has('status')) {
            $query->where('status', $request->query('status'));
        }

        return RegulationResource::collection($query->latest()->paginate($request->query('per_page', 25)));
    }

    public function store(RegulationRequest $request)
    {
        $this->authorizeModule('PERATURAN', 'CREATE');

        $data = $request->validated();
        $data['created_by'] = $this->requestUser()->id_users;
        $data['versi'] = $data['versi'] ?? 1;

        $regulation = Regulation::create($data);

        $this->audit('PERATURAN', 'CREATE', 'regulation', $regulation->id_regulation);

        return (new RegulationResource($regulation->load('wilayah')))->response()->setStatusCode(201);
    }

    public function show(string $id)
    {
        $this->authorizeModule('PERATURAN', 'VIEW');

        return new RegulationResource(Regulation::with('wilayah')->findOrFail($id));
    }

    public function update(RegulationRequest $request, string $id)
    {
        $this->authorizeModule('PERATURAN', 'UPDATE');

        $regulation = Regulation::findOrFail($id);
        $old = $regulation->toArray();

        // Perubahan tata tertib tersimpan sebagai versi baru (PRD 6.1.1).
        $data = $request->validated();
        $data['versi'] = $regulation->versi + 1;

        $regulation->update($data);

        $this->audit('PERATURAN', 'UPDATE', 'regulation', $regulation->id_regulation, $old, $regulation->toArray());

        return new RegulationResource($regulation->load('wilayah'));
    }

    public function destroy(string $id)
    {
        $this->authorizeModule('PERATURAN', 'DELETE');

        $regulation = Regulation::findOrFail($id);
        $regulation->update(['status' => 'NONAKTIF']);

        $this->audit('PERATURAN', 'DELETE', 'regulation', $regulation->id_regulation);

        return response()->json(['message' => 'Peraturan dinonaktifkan.']);
    }
}
