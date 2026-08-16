<?php

namespace App\Services;

use App\Models\Citizen;
use App\Models\Complaint;
use App\Models\Family;
use App\Models\FeeBill;
use App\Models\FinanceTransaction;
use App\Models\LetterRequest;
use Illuminate\Support\Facades\Schema;

class DashboardService
{
    public function summary(): array
    {
        $citizens = Citizen::query();
        $income = (float) FinanceTransaction::where('tipe', 'PEMASUKAN')->sum('jumlah');
        $expense = (float) FinanceTransaction::where('tipe', 'PENGELUARAN')->sum('jumlah');
        $paidBills = (float) FeeBill::where('status', 'LUNAS')->sum('jumlah_tagihan');
        $unpaidBills = (float) FeeBill::whereIn('status', ['BELUM_BAYAR', 'SEBAGIAN'])->sum('jumlah_tagihan');
        $totalBills = FeeBill::count();
        $paidCount = FeeBill::where('status', 'LUNAS')->count();
        $hasComplaints = Schema::hasTable('complaint');

        return [
            'user' => ['name' => 'Admin RT', 'role' => 'Ketua RT', 'initial' => 'A'],
            'area' => 'RT Digital',
            'navigation' => $this->navigation(),
            'summaryCards' => [
                [
                    'title' => 'Total Warga',
                    'value' => (string) $citizens->clone()->count(),
                    'accent' => 'blue',
                    'icon' => 'users',
                    'note' => Family::count().' KK aktif',
                    'detail' => $citizens->clone()->where('jenis_kelamin', 'L')->count().' laki-laki, '.$citizens->clone()->where('jenis_kelamin', 'P')->count().' perempuan',
                ],
                [
                    'title' => 'Pengaduan Aktif',
                    'value' => (string) ($hasComplaints ? Complaint::whereIn('status', ['PENDING', 'DIPROSES', 'ESKALASI'])->count() : 0),
                    'accent' => 'amber',
                    'icon' => 'alert',
                    'note' => ($hasComplaints ? Complaint::where('status', 'SELESAI')->count() : 0).' selesai',
                    'detail' => 'Formal SIPANDU',
                    'positive' => true,
                ],
                [
                    'title' => 'Saldo Kas',
                    'value' => $this->rupiah($income - $expense),
                    'accent' => 'green',
                    'icon' => 'wallet',
                    'note' => '+'.$this->rupiah($income).' pemasukan',
                    'positive' => true,
                ],
                [
                    'title' => 'Surat Pending',
                    'value' => (string) LetterRequest::whereIn('status', ['DIAJUKAN', 'DIVERIFIKASI'])->count(),
                    'accent' => 'blue',
                    'icon' => 'file',
                    'note' => LetterRequest::where('status', 'DISETUJUI')->count().' disetujui',
                    'detail' => 'Domisili dan usaha',
                ],
            ],
            'financeCards' => [
                ['title' => 'Iuran Terkumpul', 'value' => $this->rupiah($paidBills), 'icon' => 'trendingUp', 'accent' => 'green'],
                ['title' => 'Tunggakan Iuran', 'value' => $this->rupiah($unpaidBills), 'icon' => 'trendingDown', 'accent' => 'red'],
                ['title' => 'Tingkat Kepatuhan', 'value' => ($totalBills ? round($paidCount / $totalBills * 100) : 0).'%', 'icon' => 'receipt', 'accent' => 'blue'],
            ],
            'cashflow' => $this->cashflow(),
            'complaintsByCategory' => $this->complaintsByCategory(),
            'activities' => $this->activities(),
            'quickActions' => [
                ['label' => 'Buat Surat', 'icon' => 'file'],
                ['label' => 'Tambah Warga', 'icon' => 'userPlus'],
                ['label' => 'Catat Iuran', 'icon' => 'wallet'],
                ['label' => 'Buat Pengumuman', 'icon' => 'megaphone'],
            ],
        ];
    }

    private function cashflow(): array
    {
        return FinanceTransaction::query()
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

    private function complaintsByCategory(): array
    {
        if (! Schema::hasTable('complaint')) {
            return [];
        }

        return Complaint::query()
            ->selectRaw('kategori as label, COUNT(*) as total')
            ->groupBy('kategori')
            ->orderByDesc('total')
            ->get()
            ->map(fn ($row) => ['label' => ucfirst(strtolower($row->label)), 'total' => (int) $row->total])
            ->all();
    }

    private function activities(): array
    {
        return [
            ['title' => 'Data warga', 'description' => Citizen::latest()->value('nama_lengkap') ?: 'Belum ada data warga', 'time' => 'Terbaru', 'icon' => 'users'],
            ['title' => 'Pengaduan', 'description' => Schema::hasTable('complaint') ? (Complaint::latest()->value('judul') ?: 'Belum ada pengaduan') : 'Tabel SIPANDU belum dimigrasikan', 'time' => 'Terbaru', 'icon' => 'alert'],
            ['title' => 'Surat', 'description' => LetterRequest::latest()->value('jenis_surat') ?: 'Belum ada surat', 'time' => 'Terbaru', 'icon' => 'file'],
        ];
    }

    private function navigation(): array
    {
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
