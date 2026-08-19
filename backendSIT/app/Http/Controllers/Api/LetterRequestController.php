<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\LetterRequestRequest;
use App\Http\Resources\LetterRequestResource;
use App\Models\LetterRequest;
use Illuminate\Http\Request;

class LetterRequestController extends BaseApiController
{
    public function index(Request $request)
    {
        $this->authorizeModule('SURAT', 'VIEW');

        $query = LetterRequest::query()->with(['pemohon', 'signature'])->latest();

        if ($request->has('status')) {
            $query->where('status', $request->query('status'));
        }
        if ($request->has('jenis_surat')) {
            $query->where('jenis_surat', $request->query('jenis_surat'));
        }
        if ($request->has('id_wilayah')) {
            $query->where('id_wilayah', $request->query('id_wilayah'));
        }

        return LetterRequestResource::collection($query->paginate($request->query('per_page', 25)));
    }

    public function store(LetterRequestRequest $request)
    {
        $this->authorizeModule('SURAT', 'CREATE');

        $data = $request->validated();
        $data['status'] = $data['status'] ?? 'DIAJUKAN';

        $letter = LetterRequest::create($data);

        $this->audit('SURAT', 'CREATE', 'letter_request', $letter->id_letter_request);

        return (new LetterRequestResource($letter->load(['pemohon', 'signature'])))->response()->setStatusCode(201);
    }

    public function show(string $id)
    {
        $this->authorizeModule('SURAT', 'VIEW');

        return new LetterRequestResource(LetterRequest::with(['pemohon', 'signature', 'wilayah'])->findOrFail($id));
    }

    public function update(LetterRequestRequest $request, string $id)
    {
        $this->authorizeModule('SURAT', 'UPDATE');

        $letter = LetterRequest::findOrFail($id);
        $old = $letter->toArray();
        $letter->update($request->validated());

        $this->audit('SURAT', 'UPDATE', 'letter_request', $letter->id_letter_request, $old, $letter->toArray());

        return new LetterRequestResource($letter->load(['pemohon', 'signature']));
    }

    public function destroy(string $id)
    {
        $this->authorizeModule('SURAT', 'DELETE');

        $letter = LetterRequest::findOrFail($id);
        $letter->delete();

        $this->audit('SURAT', 'DELETE', 'letter_request', $letter->id_letter_request);

        return response()->noContent();
    }
}
