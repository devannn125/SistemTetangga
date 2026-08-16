<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\FeeBillRequest;
use App\Http\Resources\FeeBillResource;
use App\Models\FeeBill;

class FeeBillController extends Controller
{
    public function index()
    {
        return FeeBillResource::collection(FeeBill::latest('jatuh_tempo')->paginate(15));
    }

    public function store(FeeBillRequest $request)
    {
        return new FeeBillResource(FeeBill::create($request->validated()));
    }

    public function show(FeeBill $feeBill)
    {
        return new FeeBillResource($feeBill);
    }

    public function update(FeeBillRequest $request, FeeBill $feeBill)
    {
        $feeBill->update($request->validated());

        return new FeeBillResource($feeBill);
    }

    public function destroy(FeeBill $feeBill)
    {
        $feeBill->delete();

        return response()->noContent();
    }
}
