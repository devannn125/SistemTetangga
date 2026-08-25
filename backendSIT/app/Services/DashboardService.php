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

    public function summary(?string $role = null, ?string $userId = null): array
    {
        $roleCode = strtoupper(trim((string) $role));
        $hasComplaints = Schema::hasTable('complaint');

        // Resolve user
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
        }

        // Lingkup wilayah operasional user (null = global untuk admin/dukuh).
        $scopeIds = $this->rbac->operationalScopeIds($userObj);

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

        $totalRw = Schema::hasTable('wilayah') ? DB::table('wilayah')->where('tipe', 'RW')->count() : 0;
        $totalRt = Schema::hasTable('wilayah') ? DB::table('wilayah')->where('tipe', 'RT')->count() : 0;
        $kelurahanName = Schema::hasTable('wilayah')
            ? (DB::table('wilayah')->where('tipe', 'KELURAHAN')->value('nama_wilayah') ?: 'Kelurahan Sukamaju')
            : 'Kelurahan Sukamaju';

        $isDukuh = in_array($roleCode, ['DUKUH', 'KELURAHAN']);

        $userName = $userObj->nama_users ?? ($isDukuh ? 'Pak Dukuh Sukamaju' : 'Administrator');
        $userRoleName = $isDukuh ? 'Kepala Dukuh' : ($roleCode === 'ADMIN' ? 'Administrator' : 'Ketua RT');
        $initial = strtoupper(substr($userName, 0, 1)) ?: 'D';

        $areaLabel = $isDukuh ? "{$kelurahanName} (Tingkat Dukuh)" : 'RT Digital';

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

        return [
            'user' => [
                'name' => $userName,
                'role' => $userRoleName,
                'initial' => $initial,
            ],
            'area' => $areaLabel,
            'navigation' => $this->navigation($isDukuh),
            'summaryCards' => $summaryCards,
            'financeCards' => $financeCards,
            'cashflow' => $this->cashflow($scopeIds),
            'complaintsByCategory' => $this->complaintsByCategory($scopeIds),
            'activities' => $this->activities($scopeIds, $isDukuh),
            'quickActions' => $quickActions,
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
        return $this->financeQuery($scopeIds)
            ->orderBy('tanggal')
            ->get()
            ->groupBy(fn ($row) => date('Y-m', strtotime((string) $row->tanggal)))
            ->take(6)
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
