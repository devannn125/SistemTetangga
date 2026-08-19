<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\UserRoleRequest;
use App\Http\Resources\UserRoleResource;
use App\Models\Role;
use App\Models\UserRole;
use Illuminate\Http\Request;

class UserRoleController extends BaseApiController
{
    public function index(Request $request)
    {
        $this->authorizeModule('USER', 'VIEW');

        $query = UserRole::with(['role', 'wilayah']);

        if ($request->has('id_users')) {
            $query->where('id_users', $request->query('id_users'));
        }
        if ($request->has('status')) {
            $query->where('status', $request->query('status'));
        }

        return UserRoleResource::collection($query->paginate($request->query('per_page', 50)));
    }

    public function store(UserRoleRequest $request)
    {
        $this->authorizeModule('USER', 'CREATE');

        // Business rule: jabatan strategis hanya boleh dipegang satu warga aktif
        // per periode di wilayah yang sama (PRD 3.4).
        $role = Role::find($request->validated('id_role'));

        if ($role?->is_strategic) {
            $conflict = UserRole::where('id_role', $role->id_role)
                ->where('id_wilayah', $request->validated('id_wilayah'))
                ->where('status', 'ACTIVE')
                ->exists();

            if ($conflict) {
                return response()->json([
                    'message' => "Jabatan strategis ({$role->nama_role}) sudah dipegang warga aktif di wilayah tersebut.",
                ], 422);
            }
        }

        $userRole = UserRole::create($request->validated());

        $this->audit('USER', 'CREATE', 'user_role', $userRole->id_user_role);

        return (new UserRoleResource($userRole->load(['role', 'wilayah'])))->response()->setStatusCode(201);
    }

    public function show(string $id)
    {
        $this->authorizeModule('USER', 'VIEW');

        return new UserRoleResource(UserRole::with(['role', 'wilayah'])->findOrFail($id));
    }

    public function update(UserRoleRequest $request, string $id)
    {
        $this->authorizeModule('USER', 'UPDATE');

        $userRole = UserRole::findOrFail($id);
        $old = $userRole->toArray();
        $userRole->update($request->validated());

        $this->audit('USER', 'UPDATE', 'user_role', $userRole->id_user_role, $old, $userRole->toArray());

        return new UserRoleResource($userRole->load(['role', 'wilayah']));
    }

    public function destroy(string $id)
    {
        $this->authorizeModule('USER', 'DELETE');

        $userRole = UserRole::findOrFail($id);
        $userRole->delete();

        $this->audit('USER', 'DELETE', 'user_role', $userRole->id_user_role);

        return response()->noContent();
    }
}
