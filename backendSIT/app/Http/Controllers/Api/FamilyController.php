<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\FamilyRequest;
use App\Http\Resources\FamilyResource;
use App\Models\Family;
use Illuminate\Http\Request;

class FamilyController extends BaseApiController
{
    public function index(Request $request)
    {
        $this->authorizeModule('KELUARGA', 'VIEW');

        $query = Family::query()->with(['kepalaKeluarga', 'wilayah'])->withCount('members');

        if ($request->has('search')) {
            $term = $request->query('search');
            $query->where('no_kk', 'like', "%{$term}%");
        }
        if ($request->has('id_wilayah')) {
            $query->where('id_wilayah', $request->query('id_wilayah'));
        }

        return FamilyResource::collection($query->paginate($request->query('per_page', 25)));
    }

    public function store(FamilyRequest $request)
    {
        $this->authorizeModule('KELUARGA', 'CREATE');

        $family = Family::create($request->validated());

        $this->audit('KELUARGA', 'CREATE', 'family', $family->id_family);

        return (new FamilyResource($family->load(['kepalaKeluarga', 'wilayah'])))->response()->setStatusCode(201);
    }

    public function show(string $id)
    {
        $this->authorizeModule('KELUARGA', 'VIEW');

        return new FamilyResource(Family::with(['kepalaKeluarga', 'wilayah', 'members'])->withCount('members')->findOrFail($id));
    }

    public function update(FamilyRequest $request, string $id)
    {
        $this->authorizeModule('KELUARGA', 'UPDATE');

        $family = Family::findOrFail($id);
        $old = $family->toArray();
        $family->update($request->validated());

        $this->audit('KELUARGA', 'UPDATE', 'family', $family->id_family, $old, $family->toArray());

        return new FamilyResource($family->load(['kepalaKeluarga', 'wilayah'])->loadCount('members'));
    }

    public function destroy(string $id)
    {
        $this->authorizeModule('KELUARGA', 'DELETE');

        $family = Family::findOrFail($id);
        $family->update(['status' => 'DIHAPUS']);

        $this->audit('KELUARGA', 'DELETE', 'family', $family->id_family);

        return response()->json(['message' => 'Keluarga ditandai dihapus.']);
    }
}
