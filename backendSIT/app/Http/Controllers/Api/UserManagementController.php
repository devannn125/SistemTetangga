<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\UserManagementRequest;
use App\Http\Resources\UserResource;
use App\Models\Citizen;
use App\Models\OrganizationMember;
use App\Models\Role;
use App\Models\User;
use App\Models\UserRole;
use App\Services\RbacService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserManagementController extends BaseApiController
{
    private const ASSIGNABLE_ROLES = ['WARGA', 'SISKAMLING', 'PKK', 'KARANG_TARUNA'];

    private const CUSTOM_ROLES = ['WARGA', 'SISKAMLING', 'PKK', 'KARANG_TARUNA'];

    private const PROTECTED_ROLES = ['ADMIN', 'LURAH', 'DUKUH', 'RW', 'RT', 'SEKRETARIS', 'BENDAHARA'];

    private const ORG_JABATAN = [
        'SISKAMLING' => 'Pengurus Siskamling',
        'PKK' => 'Ibu PKK',
        'KARANG_TARUNA' => 'Karang Taruna',
    ];

    public function index(Request $request)
    {
        $this->authorizeModule('USER', 'VIEW');

        $query = User::query()->with(['userRoles.role', 'citizen.wilayah']);

        // Scope OWN (warga): hanya profil akun sendiri. Scope RT/RW/dll:
        // batasi ke akun yang terhubung warga dalam lingkup wilayah.
        if ($this->rbac->scopeFor($request->user(), 'USER', 'VIEW') === RbacService::SCOPE_OWN) {
            $query->where('id_users', $request->user()->id_users);
        } else {
            $scopeIds = $this->rbac->wilayahScopeIds($request->user(), 'USER', 'VIEW');
            if ($scopeIds !== null) {
                $query->whereHas('citizen', fn ($citizen) => $citizen->whereIn('id_wilayah', $scopeIds));
            }
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
        $roleKode = $data['role'] ?? null;
        $nik = $data['nik'] ?? null;
        $jenisKelamin = $data['jenis_kelamin'] ?? null;
        $idWilayah = $data['id_wilayah'] ?? null;
        unset($data['role'], $data['nik'], $data['jenis_kelamin'], $data['id_wilayah']);
        $data = $this->fillEmailFromCitizen($data);

        if (! empty($data['password'])) {
            $data['password_hash'] = Hash::make($data['password']);
        }
        unset($data['password']);

        // Auto citizen: warga awal langsung dibuatkan data citizen agar terbaca di /admin/perangkat
        // NIK angka 16 + wilayah RT wajib, citizen.id_wilayah = RT domisili (bukan null)
        $user = null;
        $citizen = null;
        DB::transaction(function () use (&$user, &$citizen, $data, $roleKode, $nik, $jenisKelamin, $idWilayah, $request) {
            $citizen = Citizen::create([
                'nik' => $nik,
                'nama_lengkap' => $data['nama_users'],
                'jenis_kelamin' => $jenisKelamin,
                'id_wilayah' => $idWilayah,
                'no_hp' => $data['no_hp'],
                'email' => $data['email'],
                'status_warga' => 'TETAP',
                'kewarganegaraan' => 'WNI',
                'status_ekonomi' => 'MAMPU',
                'penerima_bansos' => false,
                'tanggal_masuk_rt' => now()->toDateString(),
                'alamat_kk_luar_rt' => false,
                'berdomisili_luar_rt' => false,
                'status_hidup' => 'HIDUP',
                'status_aktif' => true,
                'status_verifikasi' => 'PENDING',
            ]);

            $data['id_citizen'] = $citizen->id_citizen;
            $user = User::create($data);

            if ($roleKode === 'WARGA') {
                $role = Role::where('kode', 'WARGA')->firstOrFail();
                UserRole::create([
                    'id_users' => $user->id_users,
                    'id_role' => $role->id_role,
                    'id_wilayah' => $idWilayah,
                    'periode_mulai' => now()->toDateString(),
                    'status' => 'ACTIVE',
                    'assigned_by' => $request->user()?->id_users,
                    'assigned_at' => now(),
                ]);
            }
        });

        $this->audit('USER', 'CREATE', 'users', $user->id_users, [], ['role' => $roleKode, 'id_wilayah' => $idWilayah, 'id_citizen' => $citizen->id_citizen]);
        $this->audit('WARGA', 'CREATE', 'citizen', $citizen->id_citizen, [], $citizen->toArray());

        return new UserResource($user->load(['userRoles.role', 'citizen', 'citizen.wilayah']));
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
        $data = $this->fillEmailFromCitizen($data);

        // Aktivasi akun (PENDING -> ACTIVE) hanya boleh utk warga yang sudah
        // diverifikasi Ketua RW (citizen.status_verifikasi = VERIFIED_RW).
        if (array_key_exists('status', $data)
            && $data['status'] === 'ACTIVE'
            && $user->status !== 'ACTIVE') {
            $this->assertCitizenVerifiedForActivation($user);
        }

        if (! empty($data['password'])) {
            $data['password_hash'] = Hash::make($data['password']);
        }
        unset($data['password']);

        $user->update($data);

        $this->audit('USER', 'UPDATE', 'users', $user->id_users, $old, $user->toArray());

        return new UserResource($user->load(['userRoles.role', 'citizen.wilayah']));
    }

    /**
     * Cek syarat aktivasi: akun wajib terhubung ke data warga yang sudah
     * diverifikasi Ketua RW (VERIFIED_RW) ATAU disetujui Dukuh sebagai calon
     * perangkat wilayah (APPROVED_DUKUH). Calon perangkat dibuat langsung oleh
     * Dukuh, jadi tidak perlu lewat verifikasi Ketua RW lagi. Blok kalau belum
     * (Zero Trust — bukan cuma UI).
     */
    private function assertCitizenVerifiedForActivation(User $user): void
    {
        $citizenStatus = $user->id_citizen
            ? \App\Models\Citizen::where('id_citizen', $user->id_citizen)->value('status_verifikasi')
            : null;

        if (! in_array($citizenStatus, ['VERIFIED_RW', 'APPROVED_DUKUH'], true)) {
            abort(422, 'Akun tidak dapat diaktifkan sebelum data warga diverifikasi Ketua RW / disetujui Dukuh.');
        }
    }

    /**
     * POST /api/users/{id}/role — tunjuk warga RT sebagai Warga/Pengurus
     * Siskamling/Ibu PKK/Karang Taruna (dan Sekretaris/Bendahara dengan cek
     * keunikan jabatan strategis). Satu role kustom per warga: penunjukan baru
     * otomatis mengakhiri role kustom lain di wilayah yang sama. Sekalian
     * mencatat organization_member agar tampil di Struktur Organisasi.
     */
    public function assignRole(Request $request, string $id)
    {
        $this->authorizeModule('USER', 'UPDATE');

        $data = $request->validate([
            'role' => ['required', 'string', Rule::in(self::ASSIGNABLE_ROLES)],
        ]);

        $actor = $this->requestUser();
        if ($actor->id_users === $id) {
            abort(422, 'Tidak dapat mengubah role akun Anda sendiri.');
        }

        $target = User::with(['userRoles.role', 'citizen'])->findOrFail($id);

        if (! $target->citizen) {
            abort(422, 'Akun ini belum terhubung ke data warga.');
        }

        $activeTargetRoles = $target->userRoles
            ->filter(fn ($ur) => $ur->status === 'ACTIVE')
            ->pluck('role.kode')
            ->filter();

        if ($activeTargetRoles->intersect(self::PROTECTED_ROLES)->isNotEmpty()) {
            abort(422, 'Akun pengurus strategis dikelola melalui menu Struktur Organisasi.');
        }

        $scopeIds = $this->rbac->wilayahScopeIds($actor, 'USER', 'UPDATE');
        if ($scopeIds !== null && ! in_array($target->citizen->id_wilayah, $scopeIds, true)) {
            abort(403, 'Warga yang dipilih di luar lingkup wilayah Anda.');
        }

        $idWilayah = $target->citizen->id_wilayah;
        $roleKode = $data['role'];
        $role = Role::where('kode', $roleKode)->firstOrFail();
        $today = now()->toDateString();

        if (! in_array($roleKode, self::CUSTOM_ROLES, true)
            && OrganizationMember::isPositionTaken(self::ORG_JABATAN[$roleKode], $idWilayah, $today)) {
            abort(422, "Jabatan ".self::ORG_JABATAN[$roleKode]." sudah dipegang pengurus lain pada periode ini.");
        }

        DB::transaction(function () use ($actor, $target, $role, $idWilayah, $roleKode, $today) {
            // Akhiri semua user_role aktif target di wilayah ini (aman: guard
            // PROTECTED_ROLES menjamin hanya role kustom yang tersisa).
            // Index unik uq_user_role_wilayah_active hanya mengizinkan satu
            // baris per (user, role, wilayah, status) — baris non-aktif lama
            // untuk role yang sama harus dibersihkan sebelum flip status.
            foreach ($target->userRoles()->where('id_wilayah', $idWilayah)->where('status', 'ACTIVE')->get() as $activeRow) {
                $target->userRoles()
                    ->where('id_role', $activeRow->id_role)
                    ->where('id_wilayah', $idWilayah)
                    ->where('status', '!=', 'ACTIVE')
                    ->delete();

                $activeRow->update(['status' => 'ENDED', 'periode_selesai' => $today]);
            }

            $existing = $target->userRoles()
                ->where('id_role', $role->id_role)
                ->where('id_wilayah', $idWilayah)
                ->first();

            if ($existing) {
                $existing->update([
                    'periode_mulai' => $today,
                    'periode_selesai' => null,
                    'status' => 'ACTIVE',
                    'assigned_by' => $actor->id_users,
                ]);
            } else {
                UserRole::create([
                    'id_users' => $target->id_users,
                    'id_role' => $role->id_role,
                    'id_wilayah' => $idWilayah,
                    'periode_mulai' => $today,
                    'status' => 'ACTIVE',
                    'assigned_by' => $actor->id_users,
                    'assigned_at' => now(),
                ]);
            }

            // Sinkron catatan Struktur Organisasi.
            $this->syncOrganizationMember($target, $roleKode, $idWilayah, $today);
        });

        $this->audit('USER', 'ASSIGN_ROLE', 'users', $target->id_users, [], [
            'role' => $roleKode,
            'id_wilayah' => $idWilayah,
            'citizen' => $target->citizen->nama_lengkap,
        ]);

        return new UserResource($target->fresh(['userRoles.role', 'citizen.wilayah']));
    }

    private function syncOrganizationMember(User $target, string $roleKode, string $idWilayah, string $today): void
    {
        $customJabatan = array_map(
            fn ($kode) => self::ORG_JABATAN[$kode],
            ['SISKAMLING', 'PKK', 'KARANG_TARUNA']
        );

        OrganizationMember::where('id_citizen', $target->citizen->id_citizen)
            ->where('id_wilayah', $idWilayah)
            ->whereIn('jabatan', $customJabatan)
            ->where('status_aktif', true)
            ->update(['status_aktif' => false, 'periode_selesai' => $today]);

        if (! isset(self::ORG_JABATAN[$roleKode])) {
            return;
        }

        OrganizationMember::updateOrCreate(
            [
                'id_citizen' => $target->citizen->id_citizen,
                'jabatan' => self::ORG_JABATAN[$roleKode],
                'id_wilayah' => $idWilayah,
                'periode_mulai' => $today,
            ],
            [
                'status_aktif' => true,
                'periode_selesai' => null,
            ]
        );
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

    /**
     * Isi users.email dari citizen.email bila akun dibuat/diupdate tanpa email.
     * Mencegah akun login tanpa email padahal data warga punya email.
     */
    private function fillEmailFromCitizen(array $data): array
    {
        if (! empty($data['email']) || empty($data['id_citizen'])) {
            return $data;
        }

        $citizenEmail = \App\Models\Citizen::where('id_citizen', $data['id_citizen'])->value('email');
        if ($citizenEmail) {
            $data['email'] = $citizenEmail;
        }

        return $data;
    }
}
