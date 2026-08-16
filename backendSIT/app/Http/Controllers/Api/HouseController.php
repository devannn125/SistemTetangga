<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\HouseRequest;
use App\Http\Resources\HouseResource;
use App\Models\House;

class HouseController extends Controller
{
    public function index()
    {
        return HouseResource::collection(House::latest()->paginate(15));
    }

    public function store(HouseRequest $request)
    {
        return new HouseResource(House::create($request->validated()));
    }

    public function show(House $house)
    {
        return new HouseResource($house);
    }

    public function update(HouseRequest $request, House $house)
    {
        $house->update($request->validated());

        return new HouseResource($house);
    }

    public function destroy(House $house)
    {
        $house->update(['status_aktif' => false]);

        return response()->noContent();
    }
}
