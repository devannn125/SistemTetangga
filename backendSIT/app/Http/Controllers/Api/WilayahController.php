<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\WilayahRequest;
use App\Http\Resources\WilayahResource;
use App\Models\Wilayah;
use Illuminate\Http\Request;

class WilayahController extends BaseApiController
{
    public function index(Request $request)
    {
        $this->authorizeModule('MASTER', 'VIEW');

        $query = Wilayah::query()->with('children');

        if ($request->has('tipe')) {
            $query->where('tipe', $request->query('tipe'));
        }
        if ($request->has('parent_id')) {
            $query->where('parent_id', $request->query('parent_id'));
        } else {
            $query->whereNull('parent_id');
        }

        return WilayahResource::collection($query->orderBy('tipe')->get());
    }

    public function store(WilayahRequest $request)
    {
        $this->authorizeModule('MASTER', 'CREATE');

        $wilayah = Wilayah::create($request->validated());

        $this->audit('MASTER', 'CREATE', 'wilayah', $wilayah->id_wilayah);

        return (new WilayahResource($wilayah))->response()->setStatusCode(201);
    }

    public function show(string $id)
    {
        $this->authorizeModule('MASTER', 'VIEW');

        return new WilayahResource(Wilayah::with(['parent', 'children'])->findOrFail($id));
    }

    public function update(WilayahRequest $request, string $id)
    {
        $this->authorizeModule('MASTER', 'UPDATE');

        $wilayah = Wilayah::findOrFail($id);
        $old = $wilayah->toArray();
        $wilayah->update($request->validated());

        $this->audit('MASTER', 'UPDATE', 'wilayah', $wilayah->id_wilayah, $old, $wilayah->toArray());

        return new WilayahResource($wilayah);
    }

    public function destroy(string $id)
    {
        $this->authorizeModule('MASTER', 'DELETE');

        $wilayah = Wilayah::findOrFail($id);
        $wilayah->delete();

        $this->audit('MASTER', 'DELETE', 'wilayah', $wilayah->id_wilayah);

        return response()->noContent();
    }
}
