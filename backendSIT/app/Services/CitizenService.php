<?php

namespace App\Services;

use App\Concerns\ResolvesActorWilayah;
use App\Models\Citizen;
use App\Models\Role;
use App\Models\User;
use App\Models\UserRole;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class CitizenService
{
    use ResolvesActorWilayah;
    /**
     * List warga dengan filter, pencarian, dan pagination.
     * Scoping "role boleh lihat apa" sudah ditegakkan lewat CitizenPolicy@viewAny
     * di controller; method ini fokus ke query & filter operasional.
     */
    public function list(array $filters, int $perPage = 15): LengthAwarePaginator
    {
        $query = Citizen::query()
            ->with(['agama', 'pendidikan', 'profesi', 'wilayah', 'family']);

        if (! empty($filters['search'])) {
            $query->search($filters['search']);
        }

        if (! empty($filters['id_wilayah'])) {
            if (is_array($filters['id_wilayah'])) {
                $query->whereIn('id_wilayah', $filters['id_wilayah']);
            } else {
                $query->where('id_wilayah', $filters['id_wilayah']);
            }
        }

        if (! empty($filters['id_citizen'])) {
            $query->where('id_citizen', $filters['id_citizen']);
        }

        if (! empty($filters['status_warga'])) {
            $query->where('status_warga', $filters['status_warga']);
        }

        if (array_key_exists('status_aktif', $filters) && $filters['status_aktif'] !== null) {
            $query->where('status_aktif', (bool) $filters['status_aktif']);
        } else {
            // default: hanya tampilkan warga aktif kecuali diminta eksplisit
            $query->active();
        }

        if (! empty($filters['exclude_admin'])) {
            $query->whereDoesntHave('users.userRoles', function ($q) {
                $q->where('status', 'ACTIVE')
                    ->whereHas('role', fn ($r) => $r->where('kode', 'ADMIN'));
            });
        }

        return $query->orderBy('nama_lengkap')->paginate($perPage);
    }

    public function find(string $id): Citizen
    {
        return Citizen::with(['agama', 'pendidikan', 'profesi', 'wilayah', 'family'])
            ->findOrFail($id);
    }

    public function create(array $data, User $actor): Citizen
    {
        $data = $this->stripSensitiveInputIfUnauthorized($data, $actor);
        $data['id_wilayah'] = $this->resolveActorWilayah($actor);
        // Data warga baru selalu menunggu verifikasi RW (Zero Trust: abaikan
        // input klien). Tidak ada jalur "langsung aktif" dari RT/Sekretaris.
        $data['status_verifikasi'] = 'PENDING';

        return DB::transaction(function () use ($data, $actor) {
            $citizen = Citizen::create($data);
            $this->autoCreateUserAccount($citizen, $actor);

            return $citizen;
        });
    }

    /**
     * Saat warga baru ditambahkan (oleh Ketua RT/Sekretaris), buat akun login
     * (tabel users) sekaligus peran WARGA supaya warga bisa masuk. Password
     * default "123456". Status akun default PENDING_VERIFICATION — login baru
     * bisa setelah diaktifkan lewat Menu User Management.
     */
    private function autoCreateUserAccount(Citizen $citizen, User $actor): void
    {
        if (! $citizen->email || ! $citizen->no_hp) {
            return;
        }

        // Email duplikat di tabel users → tolak (bukan diam-diam dilewati),
        // biar persoalan akun login yang bentrok terlihat jelas.
        if (User::where('email', $citizen->email)->exists()) {
            throw \Illuminate\Validation\ValidationException::withMessages([
                'email' => ['Email sudah digunakan akun lain.'],
            ]);
        }

        $user = User::create([
            'nama_users' => $citizen->nama_lengkap,
            'email' => $citizen->email,
            'no_hp' => $citizen->no_hp,
            'password_hash' => '123456',
            'auth_provider' => 'EMAIL',
            'status' => 'PENDING_VERIFICATION',
            'id_citizen' => $citizen->id_citizen,
        ]);

        $wargaRole = Role::where('kode', 'WARGA')->first();
        if (! $wargaRole) {
            return;
        }

        $existingActive = UserRole::where('id_users', $user->id_users)
            ->where('id_role', $wargaRole->id_role)
            ->where('id_wilayah', $citizen->id_wilayah)
            ->where('status', 'ACTIVE')
            ->exists();

        if (! $existingActive) {
            UserRole::create([
                'id_users' => $user->id_users,
                'id_role' => $wargaRole->id_role,
                'id_wilayah' => $citizen->id_wilayah,
                'periode_mulai' => now()->toDateString(),
                'status' => 'ACTIVE',
                'assigned_by' => $actor->id_users,
                'assigned_at' => now(),
            ]);
        }
    }

    public function update(Citizen $citizen, array $data, User $actor): Citizen
    {
        $data = $this->stripSensitiveInputIfUnauthorized($data, $actor);

        // Wilayah warga tidak pernah diubah lewat endpoint update — nilai dari
        // client diabaikan (Zero Trust). Create men-pin wilayah aktor; update
        // mempertahankan wilayah lama. Perpindahan RT = workflow riwayat
        // terpisah (PRD 6.2.1), bukan sekadar edit field.
        unset($data['id_wilayah']);

        // Hanya aktor berhak verify (Ketua RW) yang boleh mengubah
        // status_verifikasi. Edit biasa (RT/Sekretaris) mempertahankan status
        // lama — tidak di-reset ke PENDING (Zero Trust).
        if (isset($data['status_verifikasi']) && ! app(RbacService::class)->can($actor, 'WARGA', 'VERIFY')) {
            unset($data['status_verifikasi']);
        }

        DB::transaction(function () use ($citizen, $data) {
            $citizen->update($data);
        });

        return $citizen->fresh(['agama', 'pendidikan', 'profesi', 'wilayah', 'family']);
    }

    /**
     * "Delete" pada modul Data Warga berarti menonaktifkan (status_aktif = 0),
     * bukan hard delete, sesuai tabel referensi aksi di dokumen batasan role.
     */
    public function deactivate(Citizen $citizen): Citizen
    {
        $citizen->update(['status_aktif' => 0]);

        return $citizen;
    }

    /**
     * Cegah role yang tidak berwenang (mis. Bendahara yang hanya Read) menyelundupkan
     * perubahan pada field sensitif lewat payload create/update, walaupun secara umum
     * mereka lolos dari policy create/update (yang hanya mengizinkan ketua_rt/sekretaris).
     * Ini lapis pertahanan tambahan (defense in depth) di service layer.
     */
    private function stripSensitiveInputIfUnauthorized(array $data, User $actor): array
    {
        // Hanya role Ketua RT (dan kelak Sekretaris/Bendahara) yang boleh menulis
        // field sensitif. Dilemahkan dari cek property `role` yang tidak ada, menjadi
        // cek user_role (RbacService::canViewSensitive).
        if (! app(RbacService::class)->canViewSensitive($actor)) {
            foreach (Citizen::SENSITIVE_FIELDS as $field) {
                unset($data[$field]);
            }
        }

        return $data;
    }
}
