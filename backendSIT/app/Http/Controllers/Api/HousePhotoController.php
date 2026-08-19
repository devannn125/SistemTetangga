<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\HousePhotoRequest;
use App\Http\Resources\HousePhotoResource;
use App\Models\HousePhoto;
use Illuminate\Http\Request;

class HousePhotoController extends BaseApiController
{
    public function index(Request $request)
    {
        $this->authorizeModule('PERUMAHAN', 'VIEW');

        $query = HousePhoto::query();

        if ($request->has('id_house')) {
            $query->where('id_house', $request->query('id_house'));
        }

        return HousePhotoResource::collection($query->paginate($request->query('per_page', 50)));
    }

    public function store(HousePhotoRequest $request)
    {
        $this->authorizeModule('PERUMAHAN', 'CREATE');

        $photo = HousePhoto::create($request->validated());

        $this->audit('PERUMAHAN', 'CREATE', 'house_photo', $photo->id_house_photo);

        return (new HousePhotoResource($photo))->response()->setStatusCode(201);
    }

    public function show(string $id)
    {
        $this->authorizeModule('PERUMAHAN', 'VIEW');

        return new HousePhotoResource(HousePhoto::findOrFail($id));
    }

    public function destroy(string $id)
    {
        $this->authorizeModule('PERUMAHAN', 'DELETE');

        $photo = HousePhoto::findOrFail($id);
        $photo->delete();

        $this->audit('PERUMAHAN', 'DELETE', 'house_photo', $photo->id_house_photo);

        return response()->noContent();
    }
}
