<?php

namespace App\Services;

use App\Models\Citizen;
use App\Models\Complaint;
use App\Models\Family;
use App\Models\FeeBill;
use App\Models\FinanceTransaction;
use App\Models\LetterRequest;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class DashboardService
{
    public function __construct(private readonly RbacService $rbac)
    {
    }

    /**
     * Entry point aman: dari auth user (Bearer Sanctum). Anti-spoof role/user_id query.
     */
    public function summaryForUser(User $user): array
    {
        $user->loadMissing(['userRoles.role', 'citizen']);
        $activeCodes = $this->rbac->activeRoleCodes($user);
        // pilih role strategis prioritas tertinggi (level kecil + is_strategic)
        $roleCode = $this->resolvePrimaryRole($user, $activeCodes) ?: 'WARGA';

        return $this->buildSummary($roleCode, $user);
    }

    public function summary(?string $role = null, ?string $userId = null): array
    {
        $roleCode = strtoupper(trim((string) $role));
        $hasComplaints = Schema::hasTable('complaint');

        // Resolve user (fallback legacy query param — dipakai route publik tanpa auth)
        $userObj = null;
        if ($userId) {
            $userObj = User::where('id_users', $userId)->first();
        }

        if (! $userObj && $roleCode) {
            $userObj = User::query()
                ->join('user_role', 'user_role.id_users', '=', 'users.id_users')
                ->join('role', 'role.id_role', '=', 'user_role.id_role')
                ->where('role.kode', $roleCode)
                ->where('user_role.status', 'ACTIVE')
                ->select('users.*')
                ->first();
            if ($userObj) $userObj->loadMissing(['userRoles.role', 'citizen']);
        }

        if ($userObj) {
            // jika user ditemukan, pakai role aktualnya (bukan param)
            $codes = $this->rbac->activeRoleCodes($userObj);
            $roleCode = $this->resolvePrimaryRole($userObj, $codes) ?: $roleCode;
            return $this->buildSummary($roleCode, $userObj);
        }

        // tanpa user: fallback publik global
        return $this->buildSummary($roleCode ?: 'WARGA', null);
    }

    private function resolvePrimaryRole(User $user, array $activeCodes): ?string
    {
        if (empty($activeCodes)) return null;
        $roles = $user->userRoles->filter(fn ($ur) => in_array($ur->role?->kode, $activeCodes, true))
            ->sortBy(fn ($ur) => [($ur->role?->is_strategic ? 0 : 1), $ur->role?->level ?? 99])
            ->pluck('role.kode')->filter()->values();
        return $roles->first() ?: $activeCodes[0];
    }

    private function buildSummary(string $roleCode, ?User $userObj): array
    {
        $roleCode = strtoupper($roleCode);
        $hasComplaints = Schema::hasTable('complaint');

        // Lingkup wilayah operasional user (null = global untuk admin).
        $scopeIds = $this->rbac->operationalScopeIds($userObj);
        if ($roleCode === 'ADMIN') $scopeIds = null;
        // Untuk WARGA/SISKAMLING/PKK/KARANG_TARUNA, operasional = RT node (mis. [WIL-004]).
        // Tetap pakai itu untuk agregat transparansi; own-data dihitung terpisah.

        $citizens = Citizen::query();
        if ($scopeIds !== null) {
            $citizens->whereIn('id_wilayah', $scopeIds);
        }
        $totalCitizens = (clone $citizens)->count();
        $maleCitizens = (clone $citizens)->where('jenis_kelamin', 'L')->count();
        $femaleCitizens = (clone $citizens)->where('jenis_kelamin', 'P')->count();

        $families = Family::query();
        if ($scopeIds !== null) {
            $families->whereIn('id_wilayah', $scopeIds);
        }
        $totalFamilies = $families->count();

        $income = (float) $this->financeQuery($scopeIds)->where('tipe', 'PEMASUKAN')->sum('jumlah');
        $expense = (float) $this->financeQuery($scopeIds)->where('tipe', 'PENGELUARAN')->sum('jumlah');

        $paidBills = (float) $this->feeBillQuery($scopeIds)->where('status', 'LUNAS')->sum('jumlah_tagihan');
        $unpaidBills = (float) $this->feeBillQuery($scopeIds)->whereIn('status', ['BELUM_BAYAR', 'SEBAGIAN'])->sum('jumlah_tagihan');
        $totalBills = (clone $this->feeBillQuery($scopeIds))->count();
        $paidCount = $this->feeBillQuery($scopeIds)->where('status', 'LUNAS')->count();

        $pendingLetters = $this->letterQuery($scopeIds)->whereIn('status', ['DIAJUKAN', 'DIVERIFIKASI'])->count();
        $approvedLetters = $this->letterQuery($scopeIds)->where('status', 'DISETUJUI')->count();

        $complaints = $hasComplaints ? $this->complaintQuery($scopeIds) : null;
        $activeComplaints = $complaints ? (clone $complaints)->whereIn('status', ['PENDING', 'DIPROSES', 'ESKALASI'])->count() : 0;
        $escalatedComplaints = $complaints ? (clone $complaints)->where('status', 'ESKALASI')->count() : 0;
        $resolvedComplaints = $complaints ? (clone $complaints)->where('status', 'SELESAI')->count() : 0;

        // Scoped counts — jangan hitung global bila scope terbatas
        $totalRw = Schema::hasTable('wilayah')
            ? DB::table('wilayah')->when($scopeIds !== null, fn ($q) => $q->whereIn('id_wilayah', $scopeIds))->where('tipe', 'RW')->count()
            : 0;
        $totalRt = Schema::hasTable('wilayah')
            ? DB::table('wilayah')->when($scopeIds !== null, fn ($q) => $q->whereIn('id_wilayah', $scopeIds))->where('tipe', 'RT')->count()
            : 0;
        $kelurahanName = Schema::hasTable('wilayah')
            ? (DB::table('wilayah')->when($scopeIds !== null, fn ($q) => $q->whereIn('id_wilayah', $scopeIds))->where('tipe', 'KELURAHAN')->value('nama_wilayah')
                ?: DB::table('wilayah')->where('tipe', 'KELURAHAN')->value('nama_wilayah')
                ?: 'Kelurahan Sukamaju')
            : 'Kelurahan Sukamaju';

        $isDukuh = in_array($roleCode, ['DUKUH', 'KELURAHAN', 'LURAH']);

        $userName = $userObj?->nama_users ?? ($isDukuh ? 'Pengelola Wilayah Sukamaju' : 'Administrator');
        $roleNameMap = ['LURAH' => 'Kepala Lurah', 'DUKUH' => 'Kepala Dukuh', 'ADMIN' => 'Administrator', 'RW' => 'Ketua RW', 'RT' => 'Ketua RT', 'SEKRETARIS' => 'Sekretaris', 'BENDAHARA' => 'Bendahara', 'WARGA' => 'Warga', 'SISKAMLING' => 'Siskamling', 'PKK' => 'PKK', 'KARANG_TARUNA' => 'Karang Taruna'];
        $userRoleName = $roleNameMap[$roleCode] ?? ($isDukuh ? ($roleCode === 'LURAH' ? 'Kepala Lurah' : 'Kepala Dukuh') : ($roleCode === 'ADMIN' ? 'Administrator' : 'Ketua RT'));
        $initial = strtoupper(substr($userName, 0, 1)) ?: 'D';

        $areaLabel = $isDukuh ? "{$kelurahanName} (Tingkat Wilayah)" : 'RT Digital';

        $summaryCards = [
            [
                'title' => $isDukuh ? 'Total Warga Wilayah' : 'Total Warga',
                'value' => (string) $totalCitizens,
                'accent' => 'blue',
                'icon' => 'users',
                'note' => "{$totalFamilies} KK aktif",
                'detail' => "{$maleCitizens} L, {$femaleCitizens} P" . ($isDukuh && ($totalRw || $totalRt) ? " ({$totalRw} RW, {$totalRt} RT)" : ''),
            ],
            [
                'title' => $isDukuh ? 'Pengaduan & Eskalasi' : 'Pengaduan Aktif',
                'value' => (string) $activeComplaints,
                'accent' => 'amber',
                'icon' => 'alert',
                'note' => $isDukuh ? "{$escalatedComplaints} eskalasi wilayah" : "{$resolvedComplaints} selesai",
                'detail' => $isDukuh ? "{$resolvedComplaints} aduan terselesaikan" : 'Formal SIPANDU',
                'positive' => true,
            ],
            [
                'title' => $isDukuh ? 'Agregat Kas Wilayah' : 'Saldo Kas',
                'value' => $this->rupiah($income - $expense),
                'accent' => 'green',
                'icon' => 'wallet',
                'note' => '+'.$this->rupiah($income).' pemasukan',
                'positive' => true,
            ],
            [
                'title' => $isDukuh ? 'Layanan Surat & Izin' : 'Surat Pending',
                'value' => (string) $pendingLetters,
                'accent' => 'blue',
                'icon' => 'file',
                'note' => "{$approvedLetters} disetujui",
                'detail' => 'Domisili & Usaha',
            ],
        ];

        $financeCards = [
            ['title' => 'Iuran Terkumpul', 'value' => $this->rupiah($paidBills), 'icon' => 'trendingUp', 'accent' => 'green'],
            ['title' => 'Tunggakan Iuran', 'value' => $this->rupiah($unpaidBills), 'icon' => 'trendingDown', 'accent' => 'red'],
            ['title' => 'Tingkat Kepatuhan', 'value' => ($totalBills ? round($paidCount / $totalBills * 100) : 0).'%', 'icon' => 'receipt', 'accent' => 'blue'],
        ];

        $quickActions = $isDukuh
            ? [
                ['label' => 'Statistik Warga', 'icon' => 'users'],
                ['label' => 'Pantau Pengaduan', 'icon' => 'alert'],
                ['label' => 'Buat Pengumuman', 'icon' => 'megaphone'],
                ['label' => 'Export Laporan', 'icon' => 'file'],
            ]
            : [
                ['label' => 'Buat Surat', 'icon' => 'file'],
                ['label' => 'Tambah Warga', 'icon' => 'userPlus'],
                ['label' => 'Catat Iuran', 'icon' => 'wallet'],
                ['label' => 'Buat Pengumuman', 'icon' => 'megaphone'],
            ];

        // Structured extras — frontend pakai ini, bukan parse string
        $demografi = ['L' => $maleCitizens, 'P' => $femaleCitizens, 'total' => $totalCitizens];
        $suratMingguan = $this->suratMingguan($scopeIds);
        $sla = $this->sla($scopeIds);
        $siskamling = $this->siskamlingStats($scopeIds);
        $wargaOwn = null;
        if (in_array($roleCode, ['WARGA','SISKAMLING','PKK','KARANG_TARUNA']) && $userObj) {
            $wargaOwn = $this->wargaOwn($userObj);
        }

        return [
            'user' => [
                'name' => $userName,
                'role' => $userRoleName,
                'initial' => $initial,
                'roleCode' => $roleCode,
            ],
            'area' => $areaLabel,
            'kelurahanName' => $kelurahanName,
            'navigation' => $this->navigation($isDukuh),
            'summaryCards' => $summaryCards,
            'financeCards' => $financeCards,
            'cashflow' => $this->cashflow($scopeIds),
            'complaintsByCategory' => $this->complaintsByCategory($scopeIds),
            'activities' => $this->activities($scopeIds, $isDukuh),
            'quickActions' => $quickActions,
            // extras
            'demografi' => $demografi,
            'suratMingguan' => $suratMingguan,
            'sla' => $sla,
            'siskamling' => $siskamling,
            'wargaOwn' => $wargaOwn,
            'scopeIds' => $scopeIds,
        ];
    }

    private function financeQuery(?array $scopeIds): Builder
    {
        $query = FinanceTransaction::query();
        if ($scopeIds !== null) {
            $query->whereIn('id_wilayah', $scopeIds);
        }

        return $query;
    }

    private function feeBillQuery(?array $scopeIds): Builder
    {
        $query = FeeBill::query();
        if ($scopeIds !== null) {
            $query->whereHas('family', fn (Builder $family) => $family->whereIn('id_wilayah', $scopeIds));
        }

        return $query;
    }

    private function letterQuery(?array $scopeIds): Builder
    {
        $query = LetterRequest::query();
        if ($scopeIds !== null) {
            $query->whereIn('id_wilayah', $scopeIds);
        }

        return $query;
    }

    private function complaintQuery(?array $scopeIds): Builder
    {
        $query = Complaint::query();
        if ($scopeIds !== null) {
            $query->whereHas('pengirim.citizen', fn (Builder $citizen) => $citizen->whereIn('id_wilayah', $scopeIds));
        }

        return $query;
    }

    private function cashflow(?array $scopeIds): array
    {
        // kronologis asc lalu ambil 6 terakhir
        return $this->financeQuery($scopeIds)
            ->orderBy('tanggal')
            ->get()
            ->groupBy(fn ($row) => date('Y-m', strtotime((string) $row->tanggal)))
            ->sortKeys()
            ->take(-6)
            ->map(function ($rows, $date) {
                return [
                    'month' => date('M', strtotime($date)),
                    'income' => (float) $rows->where('tipe', 'PEMASUKAN')->sum('jumlah') / 1000000,
                    'expense' => (float) $rows->where('tipe', 'PENGELUARAN')->sum('jumlah') / 1000000,
                ];
            })
            ->values()
            ->all();
    }

    private function suratMingguan(?array $scopeIds): array
    {
        $days = ['Sen','Sel','Rab','Kam','Jum','Sab','Min'];
        $labels = [1=>'Sen',2=>'Sel',3=>'Rab',4=>'Kam',5=>'Jum',6=>'Sab',7=>'Min'];
        $weekStart = now()->startOfWeek(); // Senin
        $rows = $this->letterQuery($scopeIds)
            ->whereBetween('created_at', [$weekStart, now()->endOfWeek()])
            ->get()
            ->groupBy(fn ($r) => (int) date('N', strtotime((string) $r->created_at)));
        $weekly = [];
        foreach (range(1,7) as $n) {
            $grp = $rows->get($n, collect());
            $weekly[] = [
                'day' => $labels[$n],
                'masuk' => $grp->count(),
                'selesai' => $grp->where('status','TERBIT')->count() + $grp->where('status','DITANDATANGANI')->count(),
            ];
        }
        return $weekly;
    }

    private function sla(?array $scopeIds): array
    {
        if (! Schema::hasTable('complaint')) return ['percent'=>0,'total'=>0,'resolved'=>0];
        $q = $this->complaintQuery($scopeIds);
        $total = (clone $q)->count();
        if ($total === 0) return ['percent'=>100,'total'=>0,'resolved'=>0];
        // SLA: SELESAI dalam 3 hari
        $resolved = DB::table('complaint')
            ->when($scopeIds !== null, function ($qq) use ($scopeIds) {
                // filter via pengirim.citizen.id_wilayah
                $qq->whereIn('id_pengirim_user', function ($sub) use ($scopeIds) {
                    $sub->select('id_users')->from('users')->whereIn('id_citizen', function ($sub2) use ($scopeIds) {
                        $sub2->select('id_citizen')->from('citizen')->whereIn('id_wilayah', $scopeIds);
                    });
                });
            })
            ->where('status','SELESAI')->count();
        $percent = (int) round($resolved / $total * 100);
        return ['percent'=>$percent,'total'=>$total,'resolved'=>$resolved];
    }

    private function siskamlingStats(?array $scopeIds): array
    {
        if (! Schema::hasTable('siskamling_schedule')) return ['jadwal'=>0,'incidents'=>0,'checkins'=>0];
        $q = DB::table('siskamling_schedule');
        if ($scopeIds !== null) $q->whereIn('id_wilayah', $scopeIds);
        $jadwal = (clone $q)->count();
        $incQ = DB::table('siskamling_incident');
        if ($scopeIds !== null) $incQ->whereIn('id_wilayah', $scopeIds);
        $incidents = $incQ->count();
        $checkins = Schema::hasTable('siskamling_checkin') ? DB::table('siskamling_checkin')->count() : 0;
        return ['jadwal'=>$jadwal,'incidents'=>$incidents,'checkins'=>$checkins];
    }

    private function wargaOwn(User $user): array
    {
        $citizenId = $user->id_citizen;
        $userId = $user->id_users;
        $complaints = Schema::hasTable('complaint')
            ? Complaint::where('id_pengirim_user',$userId)->count() : 0;
        $activeComplaints = Schema::hasTable('complaint')
            ? Complaint::where('id_pengirim_user',$userId)->whereIn('status',['PENDING','DIPROSES','ESKALASI'])->count() : 0;
        $letters = $citizenId
            ? LetterRequest::where('id_pemohon_citizen',$citizenId)->count()
            : LetterRequest::where('id_wilayah', $user->citizen?->id_wilayah)->count();
        $pendingLetters = $citizenId
            ? LetterRequest::where('id_pemohon_citizen',$citizenId)->whereIn('status',['DIAJUKAN','DIVERIFIKASI'])->count()
            : 0;
        return ['complaints'=>$complaints,'activeComplaints'=>$activeComplaints,'letters'=>$letters,'pendingLetters'=>$pendingLetters];
    }

    private function complaintsByCategory(?array $scopeIds): array
    {
        if (! Schema::hasTable('complaint')) {
            return [];
        }

        return $this->complaintQuery($scopeIds)
            ->selectRaw('kategori as label, COUNT(*) as total')
            ->groupBy('kategori')
            ->orderByDesc('total')
            ->get()
            ->map(fn ($row) => ['label' => ucfirst(strtolower($row->label)), 'total' => (int) $row->total])
            ->all();
    }

    private function activities(?array $scopeIds, bool $isDukuh = false): array
    {
        $latestCitizen = Citizen::query()
            ->when($scopeIds !== null, fn (Builder $q) => $q->whereIn('id_wilayah', $scopeIds))
            ->latest('created_at')
            ->first();

        $hasComplaints = Schema::hasTable('complaint');
        $latestComplaint = $hasComplaints
            ? $this->complaintQuery($scopeIds)->latest('created_at')->first()
            : null;

        $latestLetter = $this->letterQuery($scopeIds)
            ->latest('created_at')
            ->first();

        return [
            [
                'title' => 'Pendaftaran Warga',
                'description' => $latestCitizen ? "{$latestCitizen->nama_lengkap} (NIK: {$latestCitizen->nik})" : 'Belum ada data warga',
                'time' => 'Terbaru',
                'icon' => 'users',
            ],
            [
                'title' => $isDukuh ? 'Pengaduan / Eskalasi' : 'Pengaduan Warga',
                'description' => $latestComplaint ? "{$latestComplaint->nomor_tiket}: {$latestComplaint->judul}" : 'Belum ada pengaduan',
                'time' => 'Terbaru',
                'icon' => 'alert',
            ],
            [
                'title' => 'Permohonan Surat',
                'description' => $latestLetter ? "Surat {$latestLetter->jenis_surat} ({$latestLetter->status})" : 'Belum ada surat',
                'time' => 'Terbaru',
                'icon' => 'file',
            ],
        ];
    }

    private function navigation(bool $isDukuh = false): array
    {
        if ($isDukuh) {
            return [
                ['id' => 'dashboard', 'label' => 'Dashboard', 'icon' => 'grid'],
                ['id' => 'warga', 'label' => 'Data Warga', 'icon' => 'users', 'children' => [
                    ['label' => 'Semua Warga', 'path' => '/dashboard/warga'],
                    ['label' => 'Non Warga', 'path' => '/dashboard/warga/non-warga'],
                    ['label' => 'Tamu', 'path' => '/dashboard/warga/tamu'],
                    ['label' => 'Data Rumah', 'path' => '/dashboard/warga/rumah'],
                ]],
                ['id' => 'pengaduan', 'label' => 'Pengaduan & Eskalasi', 'icon' => 'alert'],
                ['id' => 'statistik', 'label' => 'Statistik Wilayah', 'icon' => 'trendingUp', 'children' => ['DPT Pemilu', 'Kategori Usia', 'Penerima Bansos', 'Distribusi Profesi']],
                ['id' => 'keuangan', 'label' => 'Keuangan Wilayah', 'icon' => 'wallet', 'children' => ['Arus Kas', 'Rekap Iuran', 'Laporan Bulanan']],
                ['id' => 'surat', 'label' => 'Surat Menyurat', 'icon' => 'file', 'children' => ['Monitoring Surat', 'Arsip Surat']],
                ['id' => 'informasi', 'label' => 'Pengumuman & Kebijakan', 'icon' => 'megaphone'],
            ];
        }

        return [
            ['id' => 'dashboard', 'label' => 'Dashboard', 'icon' => 'grid'],
            ['id' => 'warga', 'label' => 'Data Warga', 'icon' => 'users', 'children' => ['Semua Warga', 'Keluarga', 'Rumah']],
            ['id' => 'pengaduan', 'label' => 'Pengaduan', 'icon' => 'alert'],
            ['id' => 'keuangan', 'label' => 'Keuangan', 'icon' => 'wallet', 'children' => ['Transaksi', 'Iuran Warga', 'Laporan']],
            ['id' => 'surat', 'label' => 'Surat Menyurat', 'icon' => 'file', 'children' => ['Pengajuan Surat', 'Arsip Surat']],
            ['id' => 'informasi', 'label' => 'Informasi', 'icon' => 'megaphone'],
        ];
    }

    private function rupiah(float $amount): string
    {
        return 'Rp'.number_format($amount, 0, ',', '.');
    }
}
