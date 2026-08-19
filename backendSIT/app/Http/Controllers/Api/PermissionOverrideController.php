<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\PermissionOverrideResource;
use App\Models\PermissionOverride;
use Illuminate\Http\Request;

class PermissionOverrideController extends BaseApiController
{
    public function index(Request $request)
    {
        $this->authorizeModule('USER', 'VIEW');

        $query = PermissionOverride::with(['module', 'action', 'user']);

        if ($request->has('id_users')) {
            $query->where('id_users', $request->query('id_users'));
        }

        return PermissionOverrideResource::collection($query->paginate($request->query('per_page', 50)));
    }

    public function store(Request $request)
    {
        $this->authorizeModule('USER', 'CREATE');

        $data = $request->validate([
            'id_users' => ['required', 'exists:users,id_users'],
            'id_module' => ['required', 'exists:module,id_module'],
            'id_permission_action' => ['required', 'exists:permission_action,id_permission_action'],
            'id_wilayah' => ['nullable', 'exists:wilayah,id_wilayah'],
            'is_granted' => ['required', 'boolean'],
            'reason' => ['nullable', 'string', 'max:255'],
            'expires_at' => ['nullable', 'date'],
        ]);

        $data['created_by'] = $this->requestUser()->id_users;

        $override = PermissionOverride::create($data);

        $this->audit('USER', 'CREATE', 'permission_override', $override->id_permission_override);

        return (new PermissionOverrideResource($override->load(['module', 'action', 'user'])))->response()->setStatusCode(201);
    }

    public function show(string $id)
    {
        $this->authorizeModule('USER', 'VIEW');

        return new PermissionOverrideResource(PermissionOverride::with(['module', 'action', 'user'])->findOrFail($id));
    }

    public function destroy(string $id)
    {
        $this->authorizeModule('USER', 'DELETE');

        $override = PermissionOverride::findOrFail($id);
        $override->delete();

        $this->audit('USER', 'DELETE', 'permission_override', $override->id_permission_override);

        return response()->noContent();
    }
}
