<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\UserSessionResource;
use App\Models\UserSession;
use Illuminate\Http\Request;

class UserSessionController extends BaseApiController
{
    public function index(Request $request)
    {
        $this->authorizeModule('USER', 'VIEW');

        $query = UserSession::query();

        if ($request->has('id_users')) {
            $query->where('id_users', $request->query('id_users'));
        }
        if ($request->has('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        return UserSessionResource::collection($query->latest()->paginate($request->query('per_page', 50)));
    }

    public function show(string $id)
    {
        $this->authorizeModule('USER', 'VIEW');

        return new UserSessionResource(UserSession::findOrFail($id));
    }

    public function destroy(string $id)
    {
        $this->authorizeModule('USER', 'DELETE');

        $session = UserSession::findOrFail($id);
        $session->update(['is_active' => false]);

        $this->audit('USER', 'DELETE', 'user_session', $session->id_user_session);

        return response()->json(['message' => 'Sesi user dinonaktifkan.']);
    }
}
