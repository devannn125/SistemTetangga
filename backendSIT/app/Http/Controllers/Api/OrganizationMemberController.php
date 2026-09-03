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
            $data = $request->validated();
            if ($request->hasFile('foto')) {
                $path = $request->file('foto')->store('pengurus', 'public');
                $data['foto_url'] = $path;
            }

            $member = OrganizationMember::create($data);

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

            if ($oldStatusAktif && !$member->status_aktif && $member->shouldSyncUserRole()) {
                $member->update(['periode_selesai' => now()->toDateString()]);
            }

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

        // Jika sudah nonaktif, hapus permanen
        if (!$member->status_aktif) {
            $member->delete();
            $this->audit('ORGANISASI', 'DELETE', 'organization_member', $member->id_organization_member);
            return response()->json(['message' => 'Riwayat berhasil dihapus permanen.']);
        }

        // Cari riwayat nonaktif yang bentrok (jabatan & periode mulai yang sama)
        $collision = OrganizationMember::where('jabatan', $member->jabatan)
            ->where('id_wilayah', $member->id_wilayah)
            ->where('periode_mulai', $member->periode_mulai)
            ->where('status_aktif', false)
            ->where('id_organization_member', '!=', $member->id_organization_member)
            ->first();

        if ($collision) {
            // Hapus riwayat lama agar tidak terjadi duplikasi unik saat menonaktifkan member saat ini
            $collision->delete();
        }

        $today = now()->toDateString();
        $member->update([
            'status_aktif' => false,
            'periode_selesai' => $today,
        ]);

        if ($member->shouldSyncUserRole()) {
            $this->revokeUserRole($member, $oldJabatan);
        }

        $this->audit('ORGANISASI', 'DELETE', 'organization_member', $member->id_organization_member);

        return response()->json(['message' => 'Anggota dinonaktifkan.']);
    }

    private function syncUserRole(OrganizationMember $member, ?string $oldJabatan): void
    {
        if (!$member->shouldSyncUserRole()) {
            return;
        }

        $user = User::where('id_citizen', $member->id_citizen)->first();
        if (!$user) {
            return;
        }

        // Selaraskan data warga pengurus ke node jabatan (mis. Ketua RT diangkat
        // jadi node RT, bukan tempat dia dicatat di Dukuh/Kelurahan). Supaya data
        // warga & RBAC scope user konsisten dengan node penugasannya.
        if ($member->shouldSyncUserRole() && !empty($member->id_wilayah)) {
            \App\Models\Citizen::where('id_citizen', $member->id_citizen)
                ->where('id_wilayah', '!=', $member->id_wilayah)
                ->update(['id_wilayah' => $member->id_wilayah]);
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
                    $this->endUserRole($user, $oldRole->id_role, $member->id_wilayah, 'ENDED');
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

        $this->endUserRole($user, $role->id_role, $member->id_wilayah, 'REVOKED');
    }

    /**
     * Akhiri user_role aktif dengan aman terhadap index unik
     * uq_user_role_wilayah_active (satu baris per user+role+wilayah+status):
     * baris non-aktif lama untuk kombinasi yang sama dihapus dulu, jejak
     * lengkapnya tetap tersimpan di audit_log.
     */
    private function endUserRole(User $user, string $roleId, string $idWilayah, string $status): void
    {
        UserRole::where('id_users', $user->id_users)
            ->where('id_role', $roleId)
            ->where('id_wilayah', $idWilayah)
            ->where('status', '!=', 'ACTIVE')
            ->delete();

        UserRole::where('id_users', $user->id_users)
            ->where('id_role', $roleId)
            ->where('id_wilayah', $idWilayah)
            ->where('status', 'ACTIVE')
            ->update(['status' => $status, 'periode_selesai' => now()->toDateString()]);
    }
}

