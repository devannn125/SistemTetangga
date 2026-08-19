<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\DigitalSignatureRequest;
use App\Http\Resources\DigitalSignatureResource;
use App\Models\DigitalSignature;
use Illuminate\Http\Request;

class DigitalSignatureController extends BaseApiController
{
    public function index(Request $request)
    {
        $this->authorizeModule('SURAT', 'VIEW');

        $query = DigitalSignature::query();

        if ($request->has('id_letter_request')) {
            $query->where('id_letter_request', $request->query('id_letter_request'));
        }
        if ($request->has('status')) {
            $query->where('status', $request->query('status'));
        }

        return DigitalSignatureResource::collection($query->paginate($request->query('per_page', 50)));
    }

    public function store(DigitalSignatureRequest $request)
    {
        $this->authorizeModule('SURAT', 'CREATE');

        $signature = DigitalSignature::create($request->validated());

        $this->audit('SURAT', 'CREATE', 'digital_signature', $signature->id_digital_signature);

        return (new DigitalSignatureResource($signature))->response()->setStatusCode(201);
    }

    public function show(string $id)
    {
        $this->authorizeModule('SURAT', 'VIEW');

        return new DigitalSignatureResource(DigitalSignature::findOrFail($id));
    }

    public function update(DigitalSignatureRequest $request, string $id)
    {
        $this->authorizeModule('SURAT', 'UPDATE');

        $signature = DigitalSignature::findOrFail($id);
        $old = $signature->toArray();
        $signature->update($request->validated());

        $this->audit('SURAT', 'UPDATE', 'digital_signature', $signature->id_digital_signature, $old, $signature->toArray());

        return new DigitalSignatureResource($signature);
    }

    public function destroy(string $id)
    {
        $this->authorizeModule('SURAT', 'DELETE');

        $signature = DigitalSignature::findOrFail($id);
        $signature->delete();

        $this->audit('SURAT', 'DELETE', 'digital_signature', $signature->id_digital_signature);

        return response()->noContent();
    }
}
