<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\UserManagementRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserManagementController extends BaseApiController
{
    public function index(Request $request)
    {
        $this->authorizeModule('USER', 'VIEW');

        $query = User::query()->with(['userRoles.role', 'citizen']);

        // Scope OWN (warga): hanya profil akun sendiri.
        if ($this->rbac->scopeFor($request->user(), 'USER', 'VIEW') === \App\Services\RbacService::SCOPE_OWN) {
            $query->where('id_users', $request->user()->id_users);
        }

        if ($request->has('search')) {
            $term = $request->query('search');
            $query->where(function ($q) use ($term) {
                $q->where('nama_users', 'like', "%{$term}%")
                    ->orWhere('email', 'like', "%{$term}%")
                    ->orWhere('no_hp', 'like', "%{$term}%");
            });
        }
        if ($request->has('status')) {
            $query->where('status', $request->query('status'));
        }

        return UserResource::collection($query->paginate($request->query('per_page', 25)));
    }

    public function store(UserManagementRequest $request)
    {
        $this->authorizeModule('USER', 'CREATE');

        $data = $request->validated();

        if (! empty($data['password'])) {
            $data['password_hash'] = Hash::make($data['password']);
        }
        unset($data['password']);

        $user = User::create($data);

        $this->audit('USER', 'CREATE', 'users', $user->id_users);

        return new UserResource($user->load(['userRoles.role', 'citizen']));
    }

    public function show(string $id)
    {
        $this->authorizeModule('USER', 'VIEW');

        if ($this->rbac->scopeFor($this->requestUser(), 'USER', 'VIEW') === \App\Services\RbacService::SCOPE_OWN
            && $id !== $this->requestUser()->id_users) {
            abort(403, 'Tidak memiliki akses ke akun lain.');
        }

        $user = User::with(['userRoles.role', 'userRoles.wilayah', 'citizen'])->findOrFail($id);

        return (new UserResource($user))->additional([
            'roles' => $user->userRoles->map(fn ($ur) => [
                'id_user_role' => $ur->id_user_role,
                'role' => $ur->role->kode ?? null,
                'id_wilayah' => $ur->id_wilayah,
                'status' => $ur->status,
            ]),
        ]);
    }

    public function update(UserManagementRequest $request, string $id)
    {
        $this->authorizeModule('USER', 'UPDATE');

        $user = User::findOrFail($id);
        $old = $user->toArray();
        $data = $request->validated();

        if (! empty($data['password'])) {
            $data['password_hash'] = Hash::make($data['password']);
        }
        unset($data['password']);

        $user->update($data);

        $this->audit('USER', 'UPDATE', 'users', $user->id_users, $old, $user->toArray());

        return new UserResource($user->load(['userRoles.role', 'citizen']));
    }

    public function destroy(string $id)
    {
        $this->authorizeModule('USER', 'DELETE');

        $user = User::findOrFail($id);

        if ($user->id_users === $this->requestUser()?->id_users) {
            return response()->json(['message' => 'Tidak dapat menonaktifkan akun sendiri.'], 422);
        }

        $user->update(['status' => 'INACTIVE']);

        $this->audit('USER', 'DELETE', 'users', $user->id_users);

        return response()->json(['message' => 'Akun dinonaktifkan.']);
    }
}
