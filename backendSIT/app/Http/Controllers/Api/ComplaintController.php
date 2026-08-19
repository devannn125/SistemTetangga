<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\ComplaintRequest;
use App\Http\Resources\ComplaintResource;
use App\Models\Complaint;
use Illuminate\Http\Request;

class ComplaintController extends BaseApiController
{
    public function index(Request $request)
    {
        $this->authorizeModule('PENGADUAN', 'VIEW');

        $query = Complaint::query()->with('pengirim')->latest();

        $this->scopeQuery($query, 'PENGADUAN', 'VIEW', 'id_pengirim_user');

        if ($request->has('status')) {
            $query->where('status', $request->query('status'));
        }
        if ($request->has('kategori')) {
            $query->where('kategori', $request->query('kategori'));
        }

        return ComplaintResource::collection($query->paginate($request->query('per_page', 25)));
    }

    public function store(ComplaintRequest $request)
    {
        $this->authorizeModule('PENGADUAN', 'CREATE');

        $data = $request->validated();
        $data['id_pengirim_user'] = $this->requestUser()->id_users;
        $data['nomor_tiket'] = $this->nextTicketNumber();

        $complaint = Complaint::create($data);

        $this->audit('PENGADUAN', 'CREATE', 'complaint', $complaint->id_complaint);

        return (new ComplaintResource($complaint->load('pengirim')))->response()->setStatusCode(201);
    }

    public function show(string $id)
    {
        $this->authorizeModule('PENGADUAN', 'VIEW');

        return new ComplaintResource(Complaint::with('pengirim')->findOrFail($id));
    }

    public function update(ComplaintRequest $request, string $id)
    {
        $this->authorizeModule('PENGADUAN', 'UPDATE');

        $complaint = Complaint::findOrFail($id);
        $old = $complaint->toArray();
        $complaint->update($request->validated());

        $this->audit('PENGADUAN', 'UPDATE', 'complaint', $complaint->id_complaint, $old, $complaint->toArray());

        return new ComplaintResource($complaint->load('pengirim'));
    }

    public function destroy(string $id)
    {
        $this->authorizeModule('PENGADUAN', 'DELETE');

        $complaint = Complaint::findOrFail($id);
        $complaint->delete();

        $this->audit('PENGADUAN', 'DELETE', 'complaint', $complaint->id_complaint);

        return response()->noContent();
    }

    private function nextTicketNumber(): string
    {
        $year = now()->year;
        $count = Complaint::whereYear('created_at', $year)->count() + 1;

        return '#ADU-'.$year.'-'.str_pad((string) $count, 4, '0', STR_PAD_LEFT);
    }
}
