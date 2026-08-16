<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\FamilyRequest;
use App\Http\Resources\FamilyResource;
use App\Models\Family;

class FamilyController extends Controller
{
    public function index()
    {
        return FamilyResource::collection(Family::withCount('members')->latest()->paginate(15));
    }

    public function store(FamilyRequest $request)
    {
        return new FamilyResource(Family::create($request->validated()));
    }

    public function show(Family $family)
    {
        return new FamilyResource($family->loadCount('members'));
    }

    public function update(FamilyRequest $request, Family $family)
    {
        $family->update($request->validated());

        return new FamilyResource($family);
    }

    public function destroy(Family $family)
    {
        $family->update(['status' => 'DIHAPUS']);

        return response()->noContent();
    }
}
