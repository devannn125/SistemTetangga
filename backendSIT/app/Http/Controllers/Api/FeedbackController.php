<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\FeedbackRequest;
use App\Http\Resources\FeedbackResource;
use App\Models\Feedback;
use Illuminate\Http\Request;

class FeedbackController extends BaseApiController
{
    public function index(Request $request)
    {
        $this->authorizeModule('PESAN', 'VIEW');

        $query = Feedback::query()->with('pengirim')->latest();

        // Batasi lingkup: warga hanya pesan sendiri; RT/Sekretaris pesan dari
        // warganya dalam lingkup wilayah.
        $scope = $this->rbac->scopeFor($this->requestUser(), 'PESAN', 'VIEW');
        if ($scope === \App\Services\RbacService::SCOPE_OWN) {
            $query->where('id_pengirim_user', $this->requestUser()->id_users);
        } else {
            $scopeIds = $this->rbac->wilayahScopeIds($this->requestUser(), 'PESAN', 'VIEW');
            if ($scopeIds !== null) {
                $query->whereHas('pengirim.citizen', fn ($q) => $q->whereIn('id_wilayah', $scopeIds));
            }
        }

        if ($request->has('status')) {
            $query->where('status', $request->query('status'));
        }
        if ($request->has('kategori')) {
            $query->where('kategori', $request->query('kategori'));
        }

        return FeedbackResource::collection($query->paginate($request->query('per_page', 25)));
    }

    public function store(FeedbackRequest $request)
    {
        $this->authorizeModule('PESAN', 'CREATE');

        $data = $request->validated();
        $data['id_pengirim_user'] = $this->requestUser()->id_users;

        $feedback = Feedback::create($data);

        $this->audit('PESAN', 'CREATE', 'feedback', $feedback->id_feedback);

        return (new FeedbackResource($feedback))->response()->setStatusCode(201);
    }

    public function show(string $id)
    {
        $this->authorizeModule('PESAN', 'VIEW');

        return new FeedbackResource(Feedback::with('pengirim')->findOrFail($id));
    }

    public function update(FeedbackRequest $request, string $id)
    {
        $this->authorizeModule('PESAN', 'UPDATE');

        $feedback = Feedback::findOrFail($id);
        $old = $feedback->toArray();
        $feedback->update($request->validated());

        $this->audit('PESAN', 'UPDATE', 'feedback', $feedback->id_feedback, $old, $feedback->toArray());

        return new FeedbackResource($feedback);
    }

    public function destroy(string $id)
    {
        $this->authorizeModule('PESAN', 'DELETE');

        $feedback = Feedback::findOrFail($id);
        $feedback->delete();

        $this->audit('PESAN', 'DELETE', 'feedback', $feedback->id_feedback);

        return response()->noContent();
    }
}
