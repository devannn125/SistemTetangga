<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\OrganizationMemberRequest;
use App\Http\Resources\OrganizationMemberResource;
use App\Models\OrganizationMember;
use App\Models\User;
use App\Models\UserRole;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrganizationMemberController extends BaseApiController
{
    public function index(Request $request)
    {
        $this->authorizeModule('ORGANISASI', 'VIEW');

        $query = OrganizationMember::query()->with(['citizen', 'wilayah']);

        $this->scopeQuery($query, 'ORGANISASI', 'VIEW');

        if ($request->has('id_wilayah')) {
            $query->where('id_wilayah', $request->query('id_wilayah'));
        }
        if ($request->has('jabatan')) {
            $query->where('jabatan', $request->query('jabatan'));
        }
        if ($request->has('status_aktif')) {
            $query->where('status_aktif', $request->boolean('status_aktif'));
        }

        return OrganizationMemberResource::collection($query->paginate($request->query('per_page', 50)));
    }

    public function store(OrganizationMemberRequest $request)
    {
        $this->authorizeModule('ORGANISASI', 'CREATE');

        $member = DB::transaction(function () use ($request) {
            $member = OrganizationMember::create($request->validated());

            $this->syncUserRole($member, null);

            return $member;
        });

        $this->audit('ORGANISASI', 'CREATE', 'organization_member', $member->id_organization_member);

        return (new OrganizationMemberResource($member->load('citizen')))->response()->setStatusCode(201);
    }

    public function show(string $id)
    {
        $this->authorizeModule('ORGANISASI', 'VIEW');

        return new OrganizationMemberResource(OrganizationMember::with(['citizen', 'wilayah'])->findOrFail($id));
    }

    public function update(OrganizationMemberRequest $request, string $id)
    {
        $this->authorizeModule('ORGANISASI', 'UPDATE');

        $member = DB::transaction(function () use ($request, $id) {
            $member = OrganizationMember::findOrFail($id);
            $oldJabatan = $member->jabatan;
            $oldStatusAktif = $member->status_aktif;
            $member->update($request->validated());

            $this->syncUserRole($member, $oldJabatan);

            return $member;
        });

        $this->audit('ORGANISASI', 'UPDATE', 'organization_member', $member->id_organization_member);

        return new OrganizationMemberResource($member->load('citizen'));
    }

    public function destroy(string $id)
    {
        $this->authorizeModule('ORGANISASI', 'DELETE');

        $member = OrganizationMember::findOrFail($id);
        $oldJabatan = $member->jabatan;
        $member->update(['status_aktif' => false]);

        if ($member->isStrategic()) {
            $this->revokeUserRole($member, $oldJabatan);
        }

        $this->audit('ORGANISASI', 'DELETE', 'organization_member', $member->id_organization_member);

        return response()->json(['message' => 'Anggota dinonaktifkan.']);
    }

    private function syncUserRole(OrganizationMember $member, ?string $oldJabatan): void
    {
        if (!$member->isStrategic()) {
            return;
        }

        $user = User::where('id_citizen', $member->id_citizen)->first();
        if (!$user) {
            return;
        }

        $roleCode = $member->getRoleCode();
        if (!$roleCode) {
            return;
        }

        $role = Role::where('kode', $roleCode)->first();
        if (!$role) {
            return;
        }

        if ($oldJabatan && $oldJabatan !== $member->jabatan) {
            $oldRoleCode = OrganizationMember::POSITION_TO_ROLE[$oldJabatan] ?? null;
            if ($oldRoleCode) {
                $oldRole = Role::where('kode', $oldRoleCode)->first();
                if ($oldRole) {
                    UserRole::where('id_users', $user->id_users)
                        ->where('id_role', $oldRole->id_role)
                        ->where('id_wilayah', $member->id_wilayah)
                        ->where('status', 'ACTIVE')
                        ->update(['status' => 'ENDED', 'periode_selesai' => now()->toDateString()]);
                }
            }
        }

        $existingUserRole = UserRole::where('id_users', $user->id_users)
            ->where('id_role', $role->id_role)
            ->where('id_wilayah', $member->id_wilayah)
            ->where('status', 'ACTIVE')
            ->first();

        if ($existingUserRole) {
            $existingUserRole->update([
                'periode_mulai' => $member->periode_mulai,
                'periode_selesai' => $member->periode_selesai,
                'status' => $member->status_aktif ? 'ACTIVE' : 'ENDED',
            ]);
        } else {
            UserRole::create([
                'id_users' => $user->id_users,
                'id_role' => $role->id_role,
                'id_wilayah' => $member->id_wilayah,
                'periode_mulai' => $member->periode_mulai,
                'periode_selesai' => $member->periode_selesai,
                'status' => $member->status_aktif ? 'ACTIVE' : 'ENDED',
                'assigned_by' => auth()->id(),
                'assigned_at' => now(),
            ]);
        }
    }

    private function revokeUserRole(OrganizationMember $member, string $jabatan): void
    {
        $roleCode = OrganizationMember::POSITION_TO_ROLE[$jabatan] ?? null;
        if (!$roleCode) {
            return;
        }

        $role = Role::where('kode', $roleCode)->first();
        if (!$role) {
            return;
        }

        $user = User::where('id_citizen', $member->id_citizen)->first();
        if (!$user) {
            return;
        }

        UserRole::where('id_users', $user->id_users)
            ->where('id_role', $role->id_role)
            ->where('id_wilayah', $member->id_wilayah)
            ->where('status', 'ACTIVE')
            ->update(['status' => 'REVOKED', 'periode_selesai' => now()->toDateString()]);
    }
}
