<?php

namespace App\Services;

use App\Models\Citizen;
use App\Models\Family;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Validation\ValidationException;

/**
 * Informasi & Statistik (PRD 6.8) — sepuluh kategori informasi warga (a–j)
 * sebagai turunan analitik data Kependudukan/Keluarga. Dihitung on-request
 * via query SQL langsung sesuai prinsip monolith modular (PRD 5.1), dengan:
 * - Lingkup wilayah otomatis dari RBAC (Sekretaris/RT hanya RT-nya sendiri).
 * - Gate data sensitif (kurang mampu, WNA, bansos — PRD 3.4): angka dikembalikan
 *   null dan detail ditolak 403 bila user bukan Ketua RT/Sekretaris/Bendahara.
 * Kategori j (Penyakit Warga) belum tersedia — tidak ada kolomnya di skema MVP.
 */
class InformationStatisticService
{
    /** Batas kelompok usia kategori d/i: [min, max] tahun (max null = terbuka). */
    private const AGE_GROUPS = [
        'balita' => ['Balita (0–2 tahun)', 0, 2],
        'batita' => ['Batita (3–5 tahun)', 3, 5],
        'anak' => ['Anak (6–17 tahun)', 6, 17],
        'produktif' => ['Produktif (18–59 tahun)', 18, 59],
        'lansia' => ['Lansia (60 tahun ke atas)', 60, null],
    ];

    /** Kode kategori yang memuat data sensitif. */
    private const SENSITIVE_CATEGORIES = ['kurang-mampu', 'wna', 'bansos'];

    public function __construct(private readonly RbacService $rbac)
    {
    }

    /**
     * Ringkasan seluruh kategori untuk halaman Informasi & Statistik.
     */
    public function summary(User $user): array
    {
        $canSensitive = $this->rbac->canViewSensitive($user);
        $base = $this->baseQuery($user);

        $total = (clone $base)->count();
        $pria = (clone $base)->where('jenis_kelamin', 'L')->count();
        $usia = $this->ageGroups($base);
        $produktif = $usia['produktif']['total'];
        $tanpaTtl = (clone $base)->whereNull('tanggal_lahir')->count();

        return [
            'can_sensitive' => $canSensitive,

            'total_warga' => $total,
            'total_kk' => $this->familyQuery($user)->count(),
            'pria' => $pria,
            'wanita' => (clone $base)->where('jenis_kelamin', 'P')->count(),

            // a. Warga berhak pemilu: WNI + usia >= 17 ATAU pernah kawin.
            'dpt' => $this->applyDptFilter(clone $base)->count(),

            // b. Terdaftar di RT namun berdomisili di luar.
            'domisili_luar' => (clone $base)->where('berdomisili_luar_rt', true)->count(),

            // c. Tinggal di RT namun KK-nya di luar RT.
            'kk_luar' => (clone $base)->where('alamat_kk_luar_rt', true)->count(),

            // d. Kelompok usia.
            'usia' => $usia,
            'tanpa_ttl' => $tanpaTtl,

            // e/f/h. Sensitif — null bila tidak berhak, disensor total (PRD 3.4).
            'kurang_mampu' => $canSensitive ? (clone $base)->where('status_ekonomi', 'KURANG_MAMPU')->count() : null,
            'wna' => $canSensitive ? (clone $base)->where('kewarganegaraan', 'WNA')->count() : null,
            'bansos' => $canSensitive ? (clone $base)->where('penerima_bansos', true)->count() : null,

            // g. Distribusi profesi.
            'profesi' => $this->professionDistribution($base),

            // i. Statistik kependudukan agregat.
            'kependudukan' => [
                'jenis_kelamin' => ['L' => $pria, 'P' => $total - $pria],
                'status_nikah' => (clone $base)
                    ->selectRaw("COALESCE(status_nikah, 'TIDAK_DIISI') as kategori, COUNT(*) as total")
                    ->groupBy('kategori')
                    ->pluck('total', 'kategori'),
                'produktif' => $produktif,
                'tidak_produktif' => max(0, $total - $tanpaTtl - $produktif),
                'balita_batita' => $usia['balita']['total'] + $usia['batita']['total'],
                'warga_tidak_tetap' => (clone $base)->where('status_warga', 'TIDAK_TETAP')->count(),
            ],
        ];
    }

    /**
     * Daftar warga untuk satu kategori (drill-down tabel).
     * Kode: dpt, domisili-luar, kk-luar, kurang-mampu, wna, bansos,
     * atau kode kelompok usia (balita/batita/anak/produktif/lansia).
     */
    public function detail(User $user, string $kode): array
    {
        $this->abortIfOwnScope($user);

        if (! $this->isKnownCategory($kode)) {
            throw ValidationException::withMessages([
                'kode' => ["Kategori statistik \"{$kode}\" tidak dikenal."],
            ]);
        }

        if (in_array($kode, self::SENSITIVE_CATEGORIES, true) && ! $this->rbac->canViewSensitive($user)) {
            abort(403, 'Data sensitif hanya dapat diakses Ketua RT, Sekretaris, dan Bendahara.');
        }

        $query = $this->baseQuery($user)->with(['profesi']);

        match ($kode) {
            'dpt' => $this->applyDptFilter($query),
            'domisili-luar' => $query->where('berdomisili_luar_rt', true),
            'kk-luar' => $query->where('alamat_kk_luar_rt', true),
            'kurang-mampu' => $query->where('status_ekonomi', 'KURANG_MAMPU'),
            'wna' => $query->where('kewarganegaraan', 'WNA'),
            'bansos' => $query->where('penerima_bansos', true),
            default => $this->applyAgeGroup($query, $kode),
        };

        return $query->orderBy('nama_lengkap')
            ->get()
            ->map(fn (Citizen $c) => [
                'id_citizen' => $c->id_citizen,
                'nik' => $c->nik,
                'nama_lengkap' => $c->nama_lengkap,
                'jenis_kelamin' => $c->jenis_kelamin,
                'tanggal_lahir' => $c->tanggal_lahir?->toDateString(),
                'usia' => $c->tanggal_lahir?->age,
                'status_nikah' => $c->status_nikah,
                'status_warga' => $c->status_warga,
                'profesi' => $c->profesi?->nama_master,
            ])
            ->all();
    }

    /**
     * Daftar KK aktif beserta kepala keluarga & jumlah anggota
     * (Informasi Keluarga, PRD 6.8.1).
     */
    public function familySummary(User $user): array
    {
        $this->abortIfOwnScope($user);

        return $this->familyQuery($user)
            ->with(['kepalaKeluarga:id_citizen,nama_lengkap'])
            ->withCount('members')
            ->orderBy('no_kk')
            ->get()
            ->map(fn (Family $f) => [
                'id_family' => $f->id_family,
                'no_kk' => $f->no_kk,
                'kepala_keluarga' => $f->kepalaKeluarga?->nama_lengkap,
                'jumlah_anggota' => $f->members_count,
            ])
            ->all();
    }

    /**
     * Basis semua perhitungan: warga aktif, masih hidup, dalam lingkup wilayah user.
     */
    private function baseQuery(User $user): Builder
    {
        $scopeIds = $this->rbac->wilayahScopeIds($user, 'STATISTIK', 'VIEW');

        return Citizen::query()
            ->where('status_aktif', true)
            ->where('status_hidup', 'HIDUP')
            ->when($scopeIds !== null, fn (Builder $q) => $q->whereIn('id_wilayah', $scopeIds));
    }

    /**
     * Drill-down (daftar personal warga/KK) hanya untuk pengurus — scope OWN
     * (warga biasa) cukup melihat ringkasan agregat non-sensitif (PRD 3.2).
     */
    private function abortIfOwnScope(User $user): void
    {
        if ($this->rbac->scopeFor($user, 'STATISTIK', 'VIEW') === RbacService::SCOPE_OWN) {
            abort(403, 'Detail daftar warga hanya tersedia untuk pengurus RT.');
        }
    }

    private function familyQuery(User $user): Builder
    {
        $scopeIds = $this->rbac->wilayahScopeIds($user, 'STATISTIK', 'VIEW');

        return Family::query()
            ->where('status', 'ACTIVE')
            ->when($scopeIds !== null, fn (Builder $q) => $q->whereIn('id_wilayah', $scopeIds));
    }

    private function applyDptFilter(Builder $query): Builder
    {
        return $query
            ->where('kewarganegaraan', 'WNI')
            ->where(function (Builder $q) {
                $q->whereRaw('TIMESTAMPDIFF(YEAR, tanggal_lahir, CURDATE()) >= 17')
                    ->orWhereIn('status_nikah', ['KAWIN', 'CERAI_HIDUP', 'CERAI_MATI']);
            });
    }

    private function ageGroups(Builder $base): array
    {
        $result = [];

        foreach (self::AGE_GROUPS as $kode => [$label, $min, $max]) {
            $result[$kode] = [
                'label' => $label,
                'total' => $this->ageCount($base, $min, $max),
            ];
        }

        return $result;
    }

    private function ageCount(Builder $base, int $min, ?int $max): int
    {
        $query = (clone $base)
            ->whereNotNull('tanggal_lahir')
            ->whereRaw('TIMESTAMPDIFF(YEAR, tanggal_lahir, CURDATE()) >= ?', [$min]);

        if ($max !== null) {
            $query->whereRaw('TIMESTAMPDIFF(YEAR, tanggal_lahir, CURDATE()) <= ?', [$max]);
        }

        return $query->count();
    }

    private function applyAgeGroup(Builder $query, string $kode): void
    {
        [, $min, $max] = self::AGE_GROUPS[$kode];

        $query->whereNotNull('tanggal_lahir')
            ->whereRaw('TIMESTAMPDIFF(YEAR, tanggal_lahir, CURDATE()) >= ?', [$min]);

        if ($max !== null) {
            $query->whereRaw('TIMESTAMPDIFF(YEAR, tanggal_lahir, CURDATE()) <= ?', [$max]);
        }
    }

    private function professionDistribution(Builder $base): array
    {
        $rows = (clone $base)
            ->join('master_data', 'master_data.id_master', '=', 'citizen.id_profesi')
            ->selectRaw('master_data.nama_master as nama, COUNT(*) as total')
            ->groupBy('master_data.nama_master')
            ->orderByDesc('total')
            ->get()
            ->map(fn ($row) => ['nama' => $row->nama, 'total' => (int) $row->total])
            ->all();

        $tanpaProfesi = (clone $base)->whereNull('id_profesi')->count();
        if ($tanpaProfesi > 0) {
            $rows[] = ['nama' => '(Tanpa profesi)', 'total' => $tanpaProfesi];
        }

        return $rows;
    }

    private function isKnownCategory(string $kode): bool
    {
        return in_array($kode, ['dpt', 'domisili-luar', 'kk-luar', ...self::SENSITIVE_CATEGORIES], true)
            || array_key_exists($kode, self::AGE_GROUPS);
    }
}
