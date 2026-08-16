<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ComplaintRequest;
use App\Http\Resources\ComplaintResource;
use App\Models\Complaint;

class ComplaintController extends Controller
{
    public function index()
    {
        return ComplaintResource::collection(Complaint::latest()->paginate(15));
    }

    public function store(ComplaintRequest $request)
    {
        $data = $request->validated();
        $data['nomor_tiket'] = $this->nextTicketNumber();

        return new ComplaintResource(Complaint::create($data));
    }

    public function show(Complaint $complaint)
    {
        return new ComplaintResource($complaint);
    }

    public function update(ComplaintRequest $request, Complaint $complaint)
    {
        $complaint->update($request->validated());

        return new ComplaintResource($complaint);
    }

    public function destroy(Complaint $complaint)
    {
        $complaint->delete();

        return response()->noContent();
    }

    private function nextTicketNumber(): string
    {
        $year = now()->year;
        $count = Complaint::whereYear('created_at', $year)->count() + 1;

        return '#ADU-'.$year.'-'.str_pad((string) $count, 4, '0', STR_PAD_LEFT);
    }
}
