<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\CitizenRequest;
use App\Http\Resources\CitizenResource;
use App\Models\Citizen;

class CitizenController extends Controller
{
    public function index()
    {
        return CitizenResource::collection(Citizen::latest()->paginate(15));
    }

    public function store(CitizenRequest $request)
    {
        return new CitizenResource(Citizen::create($request->validated()));
    }

    public function show(Citizen $citizen)
    {
        return new CitizenResource($citizen);
    }

    public function update(CitizenRequest $request, Citizen $citizen)
    {
        $citizen->update($request->validated());

        return new CitizenResource($citizen);
    }

    public function destroy(Citizen $citizen)
    {
        $citizen->update(['status_aktif' => false]);

        return response()->noContent();
    }
}
