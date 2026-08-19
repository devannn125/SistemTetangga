<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\NotificationSubscriptionResource;
use App\Models\NotificationSubscription;
use Illuminate\Http\Request;

class NotificationSubscriptionController extends BaseApiController
{
    public function index(Request $request)
    {
        $this->authorizeModule('NOTIFIKASI', 'VIEW');

        $query = NotificationSubscription::query();

        // Scope OWN: hanya langganan milik sendiri.
        if ($this->rbac->scopeFor($request->user(), 'NOTIFIKASI', 'VIEW') === \App\Services\RbacService::SCOPE_OWN) {
            $query->where('id_users', $request->user()->id_users);
        } elseif ($request->has('id_users')) {
            $query->where('id_users', $request->query('id_users'));
        }

        return NotificationSubscriptionResource::collection($query->paginate($request->query('per_page', 50)));
    }

    public function store(Request $request)
    {
        $this->authorizeModule('NOTIFIKASI', 'CREATE');

        $data = $request->validate([
            'id_users' => ['required', 'exists:users,id_users'],
            'kategori' => ['required', 'string', 'max:50'],
            'is_subscribed' => ['boolean'],
        ]);

        $data['id_users'] = $request->user()->id_users;

        $sub = NotificationSubscription::updateOrCreate(
            ['id_users' => $data['id_users'], 'kategori' => $data['kategori']],
            $data
        );

        return (new NotificationSubscriptionResource($sub))->response()->setStatusCode(201);
    }

    public function destroy(string $idUsers, string $category)
    {
        $this->authorizeModule('NOTIFIKASI', 'DELETE');

        NotificationSubscription::where('id_users', $idUsers)->where('kategori', $category)->delete();

        return response()->noContent();
    }
}
