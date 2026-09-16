<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\WilayahRequest;
use App\Http\Resources\WilayahResource;
use App\Models\Wilayah;
use App\Services\RbacService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class WilayahController extends BaseApiController
{
    public function publicIndex(Request $request)
    {
        $query = Wilayah::query()->with('children');
        if ($request->has('tipe')) {
            $query->where('tipe', $request->query('tipe'));
        }
        if ($request->has('parent_id')) {
            $query->where('parent_id', $request->query('parent_id'));
        } elseif (! filter_var($request->query('all'), FILTER_VALIDATE_BOOLEAN)) {
            $query->whereNull('parent_id');
        }
        return WilayahResource::collection($query->orderBy('tipe')->get());
    }

    public function index(Request $request)
    {
        // Struktur organisasi (read-only utk RW/Sekretaris/Bendahara/Warga)
        // butuh pohon wilayah via getWilayah. Role tsb punya ORGANISASI.VIEW tapi
        // bukan MASTER.VIEW — izinkan baca wilayah bila punya salah satu.
        $actor = $this->requestUser();
        $canOrg = $this->rbac->can($actor, 'ORGANISASI', 'VIEW');
        $canMaster = $this->rbac->can($actor, 'MASTER', 'VIEW');
        if (! $canOrg && ! $canMaster) {
            abort(403, 'Tidak memiliki akses ke modul ini.');
        }

        $query = Wilayah::query()->with('children');

        // Zero-trust scope: non-ADMIN hanya lihat descendant dari anchor.
        // Jika punya dua modul, ambil union (null = ALL berarti tanpa filter).
        $scopeIdsOrg = $canOrg ? $this->rbac->wilayahScopeIds($actor, 'ORGANISASI', 'VIEW') : null;
        $scopeIdsMaster = $canMaster ? $this->rbac->wilayahScopeIds($actor, 'MASTER', 'VIEW') : null;
        $scopeIds = null;
        if ($scopeIdsOrg !== null && $scopeIdsMaster !== null) {
            // dua-duanya terbatas -> union
            $scopeIds = array_values(array_unique(array_merge($scopeIdsOrg, $scopeIdsMaster)));
        } elseif ($scopeIdsOrg !== null) {
            $scopeIds = $scopeIdsOrg;
        } elseif ($scopeIdsMaster !== null) {
            $scopeIds = $scopeIdsMaster;
        } else {
            // salah satu ALL (null) -> tanpa filter
            $scopeIds = null;
        }

        if ($scopeIds !== null) {
            if (empty($scopeIds)) {
                return WilayahResource::collection(collect([]));
            }
            // Sertakan ancestor sampai root agar tree KEL→DUKUH→RW→RT bisa dibangun
            // meski scope terbatas (mis. DUKUH/RW hanya punya descendant, kelurahan induk tidak termasuk).
            $allForAncestor = Wilayah::all(['id_wilayah', 'parent_id']);
            $byId = $allForAncestor->keyBy('id_wilayah');
            $ancestorIds = [];
            foreach ($scopeIds as $sid) {
                $cur = $byId->get($sid);
                $guard = 0;
                while ($cur && $cur->parent_id && $guard < 10) {
                    $ancestorIds[] = $cur->parent_id;
                    $cur = $byId->get($cur->parent_id);
                    $guard++;
                }
            }
            $scopeIds = array_values(array_unique(array_merge($scopeIds, $ancestorIds)));
            $query->whereIn('id_wilayah', $scopeIds);
        }

        if ($request->has('tipe')) {
            $query->where('tipe', $request->query('tipe'));
        }
        if ($request->has('parent_id')) {
            $query->where('parent_id', $request->query('parent_id'));
        } elseif (! filter_var($request->query('all'), FILTER_VALIDATE_BOOLEAN)) {
            $query->whereNull('parent_id');
        }

        return WilayahResource::collection($query->orderBy('tipe')->get());
    }

    public function store(WilayahRequest $request)
    {
        $this->authorizeModule('MASTER', 'CREATE');

        $validated = $request->validated();
        $user = $this->requestUser();

        // ADMIN: boleh buat tipe apa saja (KELURAHAN/DUKUH/RW/RT) — bypass LURAH
        if ($this->rbac->hasAnyRole($user, ['ADMIN'])) {
            if (empty($validated['kode_wilayah'])) {
                throw ValidationException::withMessages([
                    'kode_wilayah' => ['Kode wilayah wajib diisi.'],
                ]);
            }
            $wilayah = Wilayah::create($validated);
            $this->audit('MASTER', 'CREATE', 'wilayah', $wilayah->id_wilayah);
            return (new WilayahResource($wilayah))->response()->setStatusCode(201);
        }

        // Kepala Lurah: hanya berwenang membuat node DUKUH di bawah kelurahan
        // yang menjadi lingkupnya, dengan kode_wilayah auto-generate (DUK##).
        if ($this->rbac->hasAnyRole($user, ['LURAH'])) {
            return response()->json($this->storeDukuh($request, $validated), 201);
        }

        if (empty($validated['kode_wilayah'])) {
            throw ValidationException::withMessages([
                'kode_wilayah' => ['Kode wilayah wajib diisi.'],
            ]);
        }

        $wilayah = Wilayah::create($validated);

        $this->audit('MASTER', 'CREATE', 'wilayah', $wilayah->id_wilayah);

        return (new WilayahResource($wilayah))->response()->setStatusCode(201);
    }

    /**
     * Buat node DUKUH oleh Kepala Lurah: parent harus node KELURAHAN dalam
     * lingkup aktor, kode_wilayah dikonsistensikan mengikuti pola DUK##.
     */
    protected function storeDukuh(Request $request, array $validated): array
    {
        $user = $this->requestUser();
        $tipe = strtoupper((string) ($validated['tipe'] ?? 'DUKUH'));

        if ($tipe !== 'DUKUH') {
            throw ValidationException::withMessages([
                'tipe' => ['Kepala Lurah hanya dapat membuat wilayah bertipe Dukuh.'],
            ]);
        }

        $parentId = $validated['parent_id'] ?? null;
        $parent = $parentId ? Wilayah::find($parentId) : null;
        if (! $parent || strtoupper((string) $parent->tipe) !== 'KELURAHAN') {
            throw ValidationException::withMessages([
                'parent_id' => ['Dukuh harus berada di bawah Kelurahan.'],
            ]);
        }

        // Zero-trust: parent (kelurahan) harus dalam lingkup aktor utk MASTER.CREATE.
        $scopeIds = $this->rbac->wilayahScopeIds($user, 'MASTER', 'CREATE');
        if ($scopeIds !== null && ! in_array($parent->id_wilayah, $scopeIds, true)) {
            throw ValidationException::withMessages([
                'parent_id' => ['Kelurahan di luar lingkup kewenangan Anda.'],
            ]);
        }

        $nama = trim((string) ($validated['nama_wilayah'] ?? ''));
        if ($nama === '') {
            throw ValidationException::withMessages([
                'nama_wilayah' => ['Nama wilayah dukuh wajib diisi.'],
            ]);
        }

        // Auto-generate kode konsisten: DUK + nomor berikutnya (DUK01, DUK02, ...).
        $next = (int) Wilayah::query()
            ->where('kode_wilayah', 'like', 'DUK%')
            ->pluck('kode_wilayah')
            ->map(fn ($k) => (int) preg_replace('/\D/', '', (string) $k))
            ->max() ?: 0;
        $kode = 'DUK'.str_pad((string) ($next + 1), 2, '0', STR_PAD_LEFT);

        $wilayah = Wilayah::create([
            'nama_wilayah' => $nama,
            'tipe' => 'DUKUH',
            'kode_wilayah' => $kode,
            'parent_id' => $parent->id_wilayah,
        ]);

        $this->audit('MASTER', 'CREATE', 'wilayah', $wilayah->id_wilayah);

        return (new WilayahResource($wilayah))->resolve() + ['message' => 'Wilayah Dukuh berhasil dibuat.'];
    }

    public function show(string $id)
    {
        $this->authorizeModule('MASTER', 'VIEW');

        return new WilayahResource(Wilayah::with(['parent', 'children'])->findOrFail($id));
    }

    public function update(WilayahRequest $request, string $id)
    {
        $this->authorizeModule('MASTER', 'UPDATE');

        $wilayah = Wilayah::findOrFail($id);
        $old = $wilayah->toArray();
        $wilayah->update($request->validated());

        $this->audit('MASTER', 'UPDATE', 'wilayah', $wilayah->id_wilayah, $old, $wilayah->toArray());

        return new WilayahResource($wilayah);
    }

    public function destroy(string $id)
    {
        $this->authorizeModule('MASTER', 'DELETE');

        $wilayah = Wilayah::findOrFail($id);
        $wilayah->delete();

        $this->audit('MASTER', 'DELETE', 'wilayah', $wilayah->id_wilayah);

        return response()->noContent();
    }
}
