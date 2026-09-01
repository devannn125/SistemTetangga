<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\RolePermissionResource;
use App\Models\RolePermission;
use Illuminate\Http\Request;

class RolePermissionController extends BaseApiController
{
    public function index(Request $request)
    {
        $this->authorizeModule('USER', 'VIEW');

        $query = RolePermission::with(['role', 'module', 'action']);

        if ($request->has('id_role')) {
            $query->where('id_role', $request->query('id_role'));
        }

        return RolePermissionResource::collection($query->paginate($request->query('per_page', 50)));
    }

    public function store(Request $request)
    {
        $this->authorizeModule('USER', 'CREATE');

        $data = $request->validate([
            'id_role' => ['required', 'exists:role,id_role'],
            'id_module' => ['required', 'exists:module,id_module'],
            'id_permission_action' => ['required', 'exists:permission_action,id_permission_action'],
            'resource_scope' => ['nullable', 'string', 'max:100'],
            'scope_level' => ['required', 'in:OWN,RT,RW,DUKUH,KELURAHAN,ALL'],
        ]);

        $rp = RolePermission::updateOrCreate(
            [
                'id_role' => $data['id_role'],
                'id_module' => $data['id_module'],
                'id_permission_action' => $data['id_permission_action'],
                'resource_scope' => $data['resource_scope'] ?? '*',
            ],
            ['scope_level' => $data['scope_level']]
        );

        $this->audit('USER', 'CREATE', 'role_permission', $rp->id_role_permission);

        return (new RolePermissionResource($rp->load(['role', 'module', 'action'])))->response()->setStatusCode(201);
    }

    public function show(string $id)
    {
        $this->authorizeModule('USER', 'VIEW');

        return new RolePermissionResource(RolePermission::with(['role', 'module', 'action'])->findOrFail($id));
    }

    public function destroy(string $id)
    {
        $this->authorizeModule('USER', 'DELETE');

        $rp = RolePermission::findOrFail($id);
        $rp->delete();

        $this->audit('USER', 'DELETE', 'role_permission', $rp->id_role_permission);

        return response()->noContent();
    }
}
