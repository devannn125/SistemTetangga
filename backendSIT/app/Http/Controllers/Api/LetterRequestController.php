<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\LetterRequestRequest;
use App\Http\Resources\LetterRequestResource;
use App\Models\LetterRequest;

class LetterRequestController extends Controller
{
    public function index()
    {
        return LetterRequestResource::collection(LetterRequest::latest()->paginate(15));
    }

    public function store(LetterRequestRequest $request)
    {
        return new LetterRequestResource(LetterRequest::create($request->validated()));
    }

    public function show(LetterRequest $letterRequest)
    {
        return new LetterRequestResource($letterRequest);
    }

    public function update(LetterRequestRequest $request, LetterRequest $letterRequest)
    {
        $letterRequest->update($request->validated());

        return new LetterRequestResource($letterRequest);
    }

    public function destroy(LetterRequest $letterRequest)
    {
        $letterRequest->delete();

        return response()->noContent();
    }
}
