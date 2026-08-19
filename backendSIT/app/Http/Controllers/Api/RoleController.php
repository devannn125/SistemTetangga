<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\RoleRequest;
use App\Http\Resources\RoleResource;
use App\Models\Role;
use Illuminate\Http\Request;

class RoleController extends BaseApiController
{
    public function index(Request $request)
    {
        $this->authorizeModule('USER', 'VIEW');

        return RoleResource::collection(Role::query()->orderBy('level')->get());
    }

    public function store(RoleRequest $request)
    {
        $this->authorizeModule('USER', 'CREATE');

        $role = Role::create($request->validated());

        $this->audit('USER', 'CREATE', 'role', $role->id_role);

        return (new RoleResource($role))->response()->setStatusCode(201);
    }

    public function show(string $id)
    {
        $this->authorizeModule('USER', 'VIEW');

        return new RoleResource(Role::findOrFail($id));
    }

    public function update(RoleRequest $request, string $id)
    {
        $this->authorizeModule('USER', 'UPDATE');

        $role = Role::findOrFail($id);
        $old = $role->toArray();
        $role->update($request->validated());

        $this->audit('USER', 'UPDATE', 'role', $role->id_role, $old, $role->toArray());

        return new RoleResource($role);
    }

    public function destroy(string $id)
    {
        $this->authorizeModule('USER', 'DELETE');

        $role = Role::findOrFail($id);

        if ($role->is_strategic) {
            return response()->json(['message' => 'Role strategis tidak dapat dihapus.'], 422);
        }

        $role->delete();

        $this->audit('USER', 'DELETE', 'role', $role->id_role);

        return response()->noContent();
    }
}
