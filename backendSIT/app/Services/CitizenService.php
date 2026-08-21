<?php

namespace App\Services;

use App\Concerns\ResolvesActorWilayah;
use App\Models\Citizen;
use App\Models\User;
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

        return DB::transaction(function () use ($data) {
            return Citizen::create($data);
        });
    }

    public function update(Citizen $citizen, array $data, User $actor): Citizen
    {
        $data = $this->stripSensitiveInputIfUnauthorized($data, $actor);

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
