import { useEffect, useState, useMemo } from 'react'
import { PortalLayout } from '@/components/layout/PortalLayout'
import StrukturOrganisasi from '@/components/StrukturOrganisasi'
import DataPengurusPage from './pages/DataPengurusPage'
import { PageShell } from '@/components/layout/PageShell'
import { getAuthData } from '@/services/authService'
import { useConfirm } from '@/components/ui/ConfirmContext'
import { useToast } from '@/components/ui/ToastContext'
import { Icon } from '@/components/ui/Icon'
import { DataTable } from '@/components/ui/DataTable'
import {
  getCitizens,
  updateCitizen,
  getWilayah,
  getHouses,
  getComplaints,
  updateComplaint,
  getFinanceTransactions,
  getLetterRequests,
  getRegulations,
  getOrganizationMembers,
  getInventoryPurchases,
  getStatistikSummary,
  getDashboardStatistics,
  getFamilies,
  getCitizenMe
} from '@/services/api'
import { BarChart, Bar as RechartsBar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

// Menu disusun mengikuti tabel "Rekomendasi Struktur Sidebar per Role" untuk Ketua Dukuh
// Dashboard (read), Data Warga (verify), Keuangan (monitor), Surat Keterangan (read),
// Statistik (read+export), Eskalasi Pengaduan, Inventaris (read), Peraturan (read), Struktur Organisasi (read)
const DukuhMenus = [
  { label: 'Beranda', path: '/dukuh', icon: 'home' },
  { label: 'Data Warga', path: '/dukuh/warga', icon: 'users' },
  { label: 'Data Ketua RW / RT', path: '/dukuh/data-pengurus', icon: 'users' },
  { label: 'Perumahan', path: '/dukuh/perumahan', icon: 'box' },
  { label: 'Keuangan', path: '/dukuh/keuangan', icon: 'wallet' },
  { label: 'Informasi & Statistik', path: '/dukuh/statistik', icon: 'trendingUp' },
  { label: 'Peraturan', path: '/dukuh/peraturan', icon: 'scroll' },
  { label: 'Struktur Organisasi', path: '/dukuh/struktur', icon: 'building' },
  { label: 'Inventaris', path: '/dukuh/inventaris', icon: 'box' },
]

function getCurrentMenu() {
  const pathname = window.location.pathname
  return DukuhMenus.find((item) => item.path === pathname) || DukuhMenus[0]
}

// Helpers
function formatCurrency(value) {
  return `Rp ${Number(value || 0).toLocaleString('id-ID')}`
}

function formatDate(value) {
  if (!value) return '-'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '-'
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(d)
}

function getVerificationStatusClass(status) {
  return {
    PENDING: 'bg-amber-100 text-amber-900',
    VERIFIED_Dukuh: 'bg-sky-100 text-sky-900',
    APPROVED_DUKUH: 'bg-emerald-100 text-emerald-900',
    REJECTED: 'bg-red-100 text-red-900',
  }[status] || 'bg-neutral-100 text-neutral-900'
}

function getVerificationStatusLabel(status) {
  return {
    PENDING: 'Pending',
    VERIFIED_Dukuh: 'Terverifikasi Dukuh',
    APPROVED_DUKUH: 'Disetujui',
    REJECTED: 'Ditolak',
  }[status] || status || 'Pending'
}

// --- SUB-PAGES ---

// 1. HOME PAGE
export function HomePage() {
  const authUser = getAuthData()
  const [counts, setCounts] = useState({ pendingWarga: 0, escalatedComplaints: 0, letters: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      getCitizens({ per_page: 200 }),
      getComplaints({ per_page: 200 }),
      getLetterRequests({ per_page: 200 })
    ]).then(([resCit, resComp, resLetters]) => {
      const citArr = Array.isArray(resCit?.data) ? resCit.data : Array.isArray(resCit) ? resCit : []
      const compArr = Array.isArray(resComp?.data) ? resComp.data : Array.isArray(resComp) ? resComp : []
      const letArr = Array.isArray(resLetters?.data) ? resLetters.data : Array.isArray(resLetters) ? resLetters : []

      setCounts({
        pendingWarga: citArr.filter(c => c.status_verifikasi === 'PENDING').length,
        escalatedComplaints: compArr.filter(c => c.status === 'ESKALASI').length,
        letters: letArr.length
      })
      setLoading(false)
    }).catch(err => {
      console.error(err)
      setLoading(false)
    })
  }, [])

  return (
    <PageShell
      eyebrow="Portal Ketua Dukuh"
      title={`Selamat datang, ${authUser?.nama_users || 'Ketua Dukuh'}`}
      description="Pusat monitoring dan verifikasi data warga serta eskalasi keluhan tingkat Dukuh."
    >
      <section className="mt-8 grid gap-5 md:grid-cols-3">
        <article className={`rounded-2xl border ${counts.pendingWarga > 0 ? 'border-sky-300 bg-sky-50' : 'border-neutral-300 bg-white'} p-6 shadow-sm flex flex-col justify-between`}>
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-bold uppercase text-neutral-500">Verifikasi Warga</h2>
              {counts.pendingWarga > 0 && <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white animate-pulse">{counts.pendingWarga}</span>}
            </div>
            <p className="text-2xl font-extrabold text-black mt-2">{loading ? '...' : counts.pendingWarga} Pengajuan</p>
            <p className="mt-2 text-xs text-neutral-600">Data warga baru menunggu verifikasi Dukuh.</p>
          </div>
          <a href="/Dukuh/warga" className={`mt-6 inline-flex w-full justify-center rounded-full px-4 py-2 text-xs font-extrabold uppercase ${counts.pendingWarga > 0 ? 'bg-sky-600 text-white hover:bg-sky-700' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}>
            Verifikasi Sekarang
          </a>
        </article>

        <article className={`rounded-2xl border ${counts.escalatedComplaints > 0 ? 'border-orange-300 bg-orange-50' : 'border-neutral-300 bg-white'} p-6 shadow-sm flex flex-col justify-between`}>
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-bold uppercase text-neutral-500">Eskalasi Pengaduan</h2>
              {counts.escalatedComplaints > 0 && <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white animate-pulse">{counts.escalatedComplaints}</span>}
            </div>
            <p className="text-2xl font-extrabold text-black mt-2">{loading ? '...' : counts.escalatedComplaints} Tiket</p>
            <p className="mt-2 text-xs text-neutral-600">Tiket pengaduan yang melewati SLA 3 hari tingkat RT.</p>
          </div>
          <a href="/Dukuh/pengaduan" className={`mt-6 inline-flex w-full justify-center rounded-full px-4 py-2 text-xs font-extrabold uppercase ${counts.escalatedComplaints > 0 ? 'bg-orange-600 text-white hover:bg-orange-700' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}>
            Lihat Pengaduan
          </a>
        </article>

        <article className="rounded-2xl border border-neutral-300 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-bold uppercase text-neutral-500">Surat Terbit</h2>
            </div>
            <p className="text-2xl font-extrabold text-black mt-2">{loading ? '...' : counts.letters} Dokumen</p>
            <p className="mt-2 text-xs text-neutral-600">Total surat keterangan warga yang terdaftar.</p>
          </div>
          <a href="/Dukuh/surat" className="mt-6 inline-flex w-full justify-center rounded-full bg-neutral-100 px-4 py-2 text-xs font-extrabold uppercase text-neutral-600 hover:bg-neutral-200">
            Monitor Surat
          </a>
        </article>
      </section>
    </PageShell>
  )
}

// 2. DATA WARGA (VERIFY ONLY)
export function DukuhCitizenPage() {
  const [activeTab, setActiveTab] = useState('warga')
  const [citizens, setCitizens] = useState([])
  const [families, setFamilies] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [notice, setNotice] = useState('')
  const [processingId, setProcessingId] = useState('')
  const confirm = useConfirm()
  const { showToast } = useToast()

  async function loadData() {
    setIsLoading(true)
    setNotice('')
    try {
      const [resCit, resFam] = await Promise.all([
        getCitizens({ per_page: 200 }),
        getFamilies({ per_page: 200 })
      ])
      setCitizens(Array.isArray(resCit?.data) ? resCit.data : Array.isArray(resCit) ? resCit : [])
      setFamilies(Array.isArray(resFam?.data) ? resFam.data : Array.isArray(resFam) ? resFam : [])
    } catch (err) {
      setNotice(err.message || 'Gagal memuat data warga.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  async function handleVerify(citizen, status) {
    const actionLabel = status === 'VERIFIED_Dukuh' ? 'memverifikasi' : 'menolak'
    const approved = await confirm({
      title: status === 'VERIFIED_Dukuh' ? 'Konfirmasi Verifikasi' : 'Konfirmasi Tolak',
      message: `Apakah Anda yakin ingin ${actionLabel} data warga atas nama "${citizen.nama_lengkap}"?`,
      confirmLabel: status === 'VERIFIED_Dukuh' ? 'Ya, Verifikasi' : 'Ya, Tolak',
    })
    if (!approved) return
    setProcessingId(citizen.id_citizen)
    try {
      await updateCitizen(citizen.id_citizen, {
        status_verifikasi: status
      })
      showToast(`Data warga berhasil ${status === 'VERIFIED_Dukuh' ? 'diverifikasi' : 'ditolak'}.`)
      loadData()
    } catch (err) {
      showToast(err.message || 'Gagal memperbarui verifikasi.', 'error')
    } finally {
      setProcessingId('')
    }
  }

  return (
    <PageShell
      eyebrow="Kependudukan"
      title="Verifikasi Warga & Kartu Keluarga"
      description="Ketua Dukuh memverifikasi warga baru tingkat RT. Akses bersifat read-only untuk data umum dan hanya dapat memproses pengajuan berstatus Pending."
    >
      <section className="mt-8 space-y-6">
        {notice && (
          <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-semibold text-sky-900">
            {notice}
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className={`rounded-full border px-4 py-2 text-xs font-extrabold transition ${
              activeTab === 'warga'
                ? 'border-black bg-black text-white'
                : 'border-neutral-300 bg-white text-neutral-700 hover:border-black hover:bg-neutral-100'
            }`}
            onClick={() => setActiveTab('warga')}
          >
            Data Warga
          </button>
          <button
            type="button"
            className={`rounded-full border px-4 py-2 text-xs font-extrabold transition ${
              activeTab === 'kk'
                ? 'border-black bg-black text-white'
                : 'border-neutral-300 bg-white text-neutral-700 hover:border-black hover:bg-neutral-100'
            }`}
            onClick={() => setActiveTab('kk')}
          >
            Kartu Keluarga (KK)
          </button>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-sm text-neutral-500 bg-white rounded-xl border">Memuat data...</div>
        ) : activeTab === 'warga' ? (
          <div className="rounded-xl border bg-white overflow-hidden overflow-x-auto">
            <table className="w-full text-left text-sm min-w-[900px]">
              <thead className="bg-neutral-50 border-b">
                <tr className="text-xs uppercase text-neutral-500">
                  <th className="px-5 py-3 font-semibold">NIK</th>
                  <th className="px-5 py-3 font-semibold">Nama Lengkap</th>
                  <th className="px-5 py-3 font-semibold">Jenis Kelamin</th>
                  <th className="px-5 py-3 font-semibold">Status Warga</th>
                  <th className="px-5 py-3 font-semibold">RT / Wilayah</th>
                  <th className="px-5 py-3 font-semibold">Status Verifikasi</th>
                  
                </tr>
              </thead>
              <tbody className="divide-y">
                {citizens.length === 0 ? (
                  <tr><td colSpan="7" className="p-5 text-center text-neutral-500">Belum ada data warga</td></tr>
                ) : (
                  citizens.map(c => (
                    <tr key={c.id_citizen} className="hover:bg-neutral-50">
                      <td className="px-5 py-3 font-mono font-medium text-black">{c.nik}</td>
                      <td className="px-5 py-3 font-bold text-black">{c.nama_lengkap}</td>
                      <td className="px-5 py-3">{c.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}</td>
                      <td className="px-5 py-3">{c.status_warga}</td>
                      <td className="px-5 py-3">{c.wilayah?.nama_wilayah || '-'}</td>
                      <td className="px-5 py-3">
                        <span className={"inline-block px-2.5 py-1 text-xs font-bold rounded-full " + getVerificationStatusClass(c.status_verifikasi || 'PENDING')}>
                          {getVerificationStatusLabel(c.status_verifikasi || 'PENDING')}
                        </span>
                      </td>
                      
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-xl border bg-white overflow-hidden overflow-x-auto">
            <table className="w-full text-left text-sm min-w-[600px]">
              <thead className="bg-neutral-50 border-b">
                <tr className="text-xs uppercase text-neutral-500">
                  <th className="px-5 py-3 font-semibold">No. KK</th>
                  <th className="px-5 py-3 font-semibold">Kepala Keluarga</th>
                  <th className="px-5 py-3 font-semibold">RT / Wilayah</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {families.length === 0 ? (
                  <tr><td colSpan="4" className="p-5 text-center text-neutral-500">Belum ada data Kartu Keluarga</td></tr>
                ) : (
                  families.map(f => (
                    <tr key={f.id_family} className="hover:bg-neutral-50">
                      <td className="px-5 py-3 font-mono font-medium text-black">{f.no_kk}</td>
                      <td className="px-5 py-3 font-bold text-black">{f.kepala_keluarga?.nama_lengkap || '-'}</td>
                      <td className="px-5 py-3">{f.wilayah?.nama_wilayah || '-'}</td>
                      <td className="px-5 py-3">
                        <span className={`inline-block px-2.5 py-1 text-xs font-bold rounded-full ${f.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-900' : 'bg-red-100 text-red-900'}`}>
                          {f.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </PageShell>
  )
}

// 3. PERUMAHAN (READ ONLY)
export function DukuhHousingPage() {
  const [houses, setHouses] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    getHouses({ per_page: 100 }).then(res => {
      setHouses(Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [])
      setIsLoading(false)
    }).catch(err => {
      console.error(err)
      setIsLoading(false)
    })
  }, [])

  const columns = [
    {
      key: 'tipe',
      label: 'Tipe',
      render: (value) => (
        <span className={`inline-flex px-2 py-1 rounded text-xs font-bold ${value === 'KOS' ? 'bg-sky-100 text-sky-900' : 'bg-emerald-100 text-emerald-900'}`}>
          {value === 'KOS' ? 'Kos' : 'Rumah Tinggal'}
        </span>
      ),
    },
    { key: 'alamat', label: 'Alamat', render: (value) => <span className="font-bold text-black">{value}</span> },
    { key: 'wilayah', label: 'RT / Wilayah', render: (value) => value?.nama_wilayah || '-' },
    { key: 'pemilik', label: 'Pemilik', render: (value) => value?.nama_lengkap || '-' },
    { key: 'kategoriKos', label: 'Kategori Kos', render: (value, row) => row.tipe === 'KOS' ? (value?.nama_master || '-') : '-' },
    { key: 'jumlah_kamar', label: 'Kamar / Penghuni', render: (value, row) => row.tipe === 'KOS' ? `${row.jumlah_kamar || 0} Kamar / ${row.jumlah_penghuni || 0} Orang` : '-' },
    {
      key: 'status_pajak',
      label: 'Pajak',
      render: (value) => (
        <span className={`inline-flex px-2 py-1 rounded text-xs font-bold ${value === 'LUNAS' ? 'bg-emerald-100 text-emerald-900' : 'bg-amber-100 text-amber-900'}`}>
          {value || '-'}
        </span>
      ),
    },
  ]

  return (
    <PageShell
      eyebrow="Perumahan"
      title="Monitoring Rumah & Kos"
      description="Tinjau daftar rumah tinggal dan kamar kos warga tingkat Dukuh secara read-only."
    >
      <section className="mt-8">
        <DataTable
          data={houses}
          columns={columns}
          searchKeys={['alamat', 'tipe', 'status_pajak']}
          searchPlaceholder="Cari alamat, tipe, atau status..."
          filters={[
            { key: 'tipe', label: 'Tipe', options: [{ value: 'KOS', label: 'Kos' }, { value: 'NON_KOS', label: 'Rumah Tinggal' }] },
            { key: 'status_pajak', label: 'Pajak', options: [{ value: 'LUNAS', label: 'Lunas' }, { value: 'BELUM_LUNAS', label: 'Belum Lunas' }] },
          ]}
          loading={isLoading}
          emptyMessage="Belum ada data perumahan."
          rowKey="id_house"
        />
      </section>
    </PageShell>
  )
}

// 4. ESKALASI PENGADUAN
// 5. KEUANGAN (MONITOR/READ-ONLY)
export function DukuhFinancePage() {
  const [transactions, setTransactions] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    getFinanceTransactions({ per_page: 100 }).then(res => {
      setTransactions(Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [])
      setIsLoading(false)
    }).catch(err => {
      console.error(err)
      setIsLoading(false)
    })
  }, [])

  const summary = useMemo(() => {
    const income = transactions
      .filter((t) => t.tipe === 'PEMASUKAN')
      .reduce((sum, t) => sum + Number(t.jumlah || 0), 0)
    const expense = transactions
      .filter((t) => t.tipe === 'PENGELUARAN')
      .reduce((sum, t) => sum + Number(t.jumlah || 0), 0)

    return { income, expense, balance: income - expense }
  }, [transactions])

  return (
    <PageShell
      eyebrow="Keuangan"
      title="Monitor Keuangan Wilayah"
      description="Akses monitor Ketua Dukuh: memantau total kas dan rekapitulasi pemasukan serta pengeluaran RT."
    >
      <section className="mt-8 space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <article className="rounded-xl border border-neutral-300 bg-white p-6">
            <p className="text-xs font-bold uppercase text-neutral-500">Total Saldo Kas</p>
            <div className="mt-3 text-2xl font-extrabold text-black">{formatCurrency(summary.balance)}</div>
            <p className="mt-2 text-sm text-neutral-600">{isLoading ? 'Memuat data...' : 'Akses read-only Dukuh'}</p>
          </article>
          <article className="rounded-xl border border-neutral-300 bg-white p-6">
            <p className="text-xs font-bold uppercase text-neutral-500">Total Pemasukan</p>
            <div className="mt-3 text-2xl font-extrabold text-emerald-700">{formatCurrency(summary.income)}</div>
          </article>
          <article className="rounded-xl border border-neutral-300 bg-white p-6">
            <p className="text-xs font-bold uppercase text-neutral-500">Total Pengeluaran</p>
            <div className="mt-3 text-2xl font-extrabold text-red-600">{formatCurrency(summary.expense)}</div>
          </article>
        </div>

        <div className="rounded-2xl border border-neutral-300 bg-white p-6">
          <h3 className="text-lg font-extrabold text-black mb-4">Daftar Transaksi</h3>
          {isLoading ? (
            <div className="p-8 text-center text-sm text-neutral-500">Memuat...</div>
          ) : (
            <ul className="divide-y divide-neutral-200">
              {transactions.length === 0 ? (
                <li className="py-4 text-center text-neutral-500">Belum ada transaksi tercatat</li>
              ) : (
                transactions.map((t) => (
                  <li key={t.id_keuangan_transaksi} className="flex items-center justify-between gap-4 py-4">
                    <div>
                      <div className="text-sm font-bold text-black">{t.deskripsi || t.kategori || 'Transaksi'}</div>
                      <div className="text-xs text-neutral-500">Tanggal: {formatDate(t.tanggal)} · RT: {t.wilayah?.nama_wilayah || '-'}</div>
                    </div>
                    <div className={`text-right text-sm font-extrabold ${t.tipe === 'PEMASUKAN' ? 'text-emerald-700' : 'text-red-600'}`}>
                      {t.tipe === 'PEMASUKAN' ? '+' : '-'}{formatCurrency(t.jumlah)}
                    </div>
                  </li>
                ))
              )}
            </ul>
          )}
        </div>
      </section>
    </PageShell>
  )
}

// 6. SURAT KETERANGAN (READ ONLY)
// 7. INFORMASI & STATISTIK (READ ONLY + EXPORT)
const COLORS = ['#0284c7', '#059669', '#d97706', '#dc2626', '#7c3aed', '#475569']
const AGE_CODES = ['balita', 'batita', 'anak', 'produktif', 'lansia']

function ProgressBar({ label, value, total }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0
  return (
    <div className="rounded-lg px-3 py-2">
      <div className="flex items-center justify-between text-xs font-bold text-neutral-700">
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <div className="mt-1.5 h-2 w-full rounded-full bg-neutral-200">
        <div className="h-2 rounded-full bg-sky-600" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

function downloadCsv(demographicSummary) {
  if (!demographicSummary) return
  const headers = ['Kategori Statistik', 'Jumlah / Nilai']
  const body = [
    ['Total Warga', demographicSummary.total_warga || 0],
    ['Total KK', demographicSummary.total_kk || 0],
    ['Warga DPT Pemilu', demographicSummary.dpt || 0],
    ['Berdomisili di Luar', demographicSummary.domisili_luar || 0],
    ['Alamat KK di Luar', demographicSummary.kk_luar || 0],
  ]
  const csv = [headers, ...body]
    .map((line) => line.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(','))
    .join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'rekap-statistik-Dukuh.csv'
  link.click()
  URL.revokeObjectURL(url)
}

export function DukuhStatisticsPage() {
  const [stats, setStats] = useState({ total_warga: '0', total_rumah: '0', total_pengaduan: '0', kas_rt: 'Rp 0' })
  const [cashflowData, setCashflowData] = useState([])
  const [complaintData, setComplaintData] = useState([])
  const [demographicSummary, setDemographicSummary] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      getDashboardStatistics().catch(() => null),
      getHouses({ per_page: 100 }).catch(() => null),
      getStatistikSummary().catch(() => null)
    ]).then(([resDashboard, resHouses, resDemographic]) => {
      const dData = resDashboard?.data || resDashboard
      const housesData = resHouses?.data || resHouses
      const demogData = resDemographic?.data || resDemographic

      let totalRumah = '0'
      if (Array.isArray(housesData)) totalRumah = housesData.length.toString()

      if (dData) {
        if (dData.summaryCards) {
          setStats({
            total_warga: dData.summaryCards[0]?.value || '0',
            total_pengaduan: dData.summaryCards[1]?.value || '0',
            kas_rt: dData.summaryCards[2]?.value || 'Rp 0',
            total_rumah: totalRumah
          })
        }
        if (dData.cashflow) setCashflowData(dData.cashflow)
        if (dData.complaintsByCategory) setComplaintData(dData.complaintsByCategory)
      }
      if (demogData) setDemographicSummary(demogData)
      setLoading(false)
    }).catch(err => {
      console.error(err)
      setLoading(false)
    })
  }, [])

  const ageTotal = demographicSummary ? demographicSummary.total_warga - (demographicSummary.tanpa_ttl || 0) : 0
  const profesiTotal = demographicSummary?.profesi?.reduce((acc, p) => acc + p.total, 0) ?? 0

  return (
    <PageShell
      eyebrow="Statistik"
      title="Statistik & Analitik Kependudukan"
      description="Dashboard tinjauan demografi warga dan laporan grafik di tingkat Dukuh."
    >
      <section className="mt-8 space-y-6">
        <div className="flex justify-end">
          <button
            onClick={() => downloadCsv(demographicSummary)}
            className="rounded-full bg-black px-4 py-2 text-xs font-extrabold uppercase text-white hover:bg-neutral-900 transition flex items-center gap-2"
          >
            <Icon name="download" className="h-4 w-4" />
            Ekspor Rekap CSV
          </button>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-neutral-300 bg-white p-6 shadow-sm">
            <h3 className="text-xs font-bold uppercase text-neutral-500">Total Warga</h3>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-black">{loading ? '-' : stats.total_warga}</span>
              <span className="text-sm font-semibold text-neutral-500">Jiwa</span>
            </div>
          </div>
          <div className="rounded-2xl border border-neutral-300 bg-white p-6 shadow-sm">
            <h3 className="text-xs font-bold uppercase text-neutral-500">Total Rumah & Kos</h3>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-black">{loading ? '-' : stats.total_rumah}</span>
              <span className="text-sm font-semibold text-neutral-500">Unit</span>
            </div>
          </div>
          <div className="rounded-2xl border border-neutral-300 bg-white p-6 shadow-sm">
            <h3 className="text-xs font-bold uppercase text-neutral-500">Pengaduan Aktif</h3>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-black">{loading ? '-' : stats.total_pengaduan}</span>
              <span className="text-sm font-semibold text-neutral-500">Tiket</span>
            </div>
          </div>
          <div className="rounded-2xl border border-neutral-300 bg-white p-6 shadow-sm">
            <h3 className="text-xs font-bold uppercase text-neutral-500">Kas RT Agregat</h3>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-2xl font-extrabold text-black">{loading ? '-' : stats.kas_rt}</span>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-neutral-300 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-black mb-6">Arus Kas Bulanan (Juta Rupiah)</h2>
            <div className="h-64 w-full">
              {loading ? (
                <div className="h-full flex items-center justify-center text-sm text-neutral-500">Memuat grafik...</div>
              ) : cashflowData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-sm text-neutral-500">Belum ada data.</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={cashflowData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#737373' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#737373' }} />
                    <Tooltip cursor={{fill: '#f5f5f5'}} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                    <RechartsBar dataKey="income" name="Pemasukan" fill="#059669" radius={[4, 4, 0, 0]} maxBarSize={40} />
                    <RechartsBar dataKey="expense" name="Pengeluaran" fill="#dc2626" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-neutral-300 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-black mb-6">Kategori Pengaduan</h2>
            <div className="h-64 w-full">
              {loading ? (
                <div className="h-full flex items-center justify-center text-sm text-neutral-500">Memuat grafik...</div>
              ) : complaintData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-sm text-neutral-500">Belum ada data.</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={complaintData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="total"
                      nameKey="label"
                    >
                      {complaintData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend iconType="circle" layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        {/* Demographics details */}
        {demographicSummary && (
          <div className="space-y-6">
            {demographicSummary.usia && (
              <div className="border-2 border-neutral-900 bg-white p-5">
                <h3 className="text-xs font-extrabold uppercase tracking-[0.12em] text-neutral-500">Distribusi Usia Warga</h3>
                <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {AGE_CODES.map((kode) => (
                    <ProgressBar
                      key={kode}
                      label={demographicSummary.usia[kode]?.label || kode}
                      value={demographicSummary.usia[kode]?.total || 0}
                      total={ageTotal}
                    />
                  ))}
                </div>
              </div>
            )}

            {demographicSummary.profesi?.length > 0 && (
              <div className="border-2 border-neutral-900 bg-white p-5">
                <h3 className="text-xs font-extrabold uppercase tracking-[0.12em] text-neutral-500">Distribusi Profesi</h3>
                <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {demographicSummary.profesi.map((p) => (
                    <ProgressBar key={p.nama} label={p.nama} value={p.total} total={profesiTotal} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </section>
    </PageShell>
  )
}

// 8. PERATURAN (READ ONLY)
export function DukuhRegulationPage() {
  const [regulations, setRegulations] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    getRegulations({ per_page: 100 }).then(res => {
      setRegulations(Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [])
      setIsLoading(false)
    }).catch(err => {
      console.error(err)
      setIsLoading(false)
    })
  }, [])

  return (
    <PageShell
      eyebrow="Peraturan"
      title="Tata Tertib & Peraturan Warga"
      description="Monitor daftar tata tertib warga tetap, tidak tetap, dan peraturan lingkungan tingkat Dukuh."
    >
      <section className="mt-8">
        {isLoading ? (
          <div className="p-8 text-center text-sm text-neutral-500 bg-white border rounded-xl">Memuat peraturan...</div>
        ) : regulations.length === 0 ? (
          <div className="p-8 text-center text-sm text-neutral-500 bg-white border rounded-xl">Belum ada peraturan terbit.</div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {regulations.map((r) => (
              <article key={r.id_regulation} className="border border-neutral-300 bg-white p-6 rounded-xl flex flex-col justify-between">
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-neutral-500">
                    Kategori: {r.kategori} · Versi {r.versi || 1}
                  </p>
                  <h2 className="mt-3 text-xl font-extrabold text-black">{r.judul}</h2>
                  <p className="mt-2 line-clamp-4 text-sm leading-6 text-neutral-600">{r.isi}</p>
                </div>
                <div className="mt-4 pt-4 border-t flex justify-between text-xs text-neutral-400 font-semibold">
                  <span>Berlaku: {formatDate(r.tanggal_berlaku)}</span>
                  <span>RT: {r.wilayah?.nama_wilayah || '-'}</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </PageShell>
  )
}

// 9. STRUKTUR ORGANISASI (READ ONLY)
// 10. INVENTARIS (READ ONLY)
export function DukuhInventoryPage() {
  const [purchases, setPurchases] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    getInventoryPurchases({ per_page: 100 }).then(res => {
      setPurchases(Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [])
      setIsLoading(false)
    }).catch(err => {
      console.error(err)
      setIsLoading(false)
    })
  }, [])

  return (
    <PageShell
      eyebrow="Inventaris"
      title="Monitoring Pengajuan Barang"
      description="Tinjau daftar aset inventaris dan status pengajuan pembelian barang tingkat RT."
    >
      <section className="mt-8">
        {isLoading ? (
          <div className="p-8 text-center text-sm text-neutral-500 bg-white border rounded-xl">Memuat data inventaris...</div>
        ) : purchases.length === 0 ? (
          <div className="p-8 text-center text-sm text-neutral-500 bg-white border rounded-xl">Belum ada pengajuan pembelian inventaris.</div>
        ) : (
          <div className="grid gap-4">
            {purchases.map((p) => (
              <article key={p.id_inventory_purchase} className="border border-neutral-300 bg-white p-6 rounded-xl">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-extrabold text-black">{p.nama_barang}</h2>
                    <p className="mt-1 text-sm text-neutral-600">
                      Jumlah: {p.jumlah} {p.satuan || ''} · Perkiraan Biaya: {formatCurrency(p.perkiraan_biaya)}
                    </p>
                    {p.alasan && <p className="mt-1 text-sm text-neutral-500">Alasan: {p.alasan}</p>}
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${p.status === 'DISETUJUI' ? 'bg-emerald-100 text-emerald-900' : p.status === 'DITOLAK' ? 'bg-red-100 text-red-900' : 'bg-amber-100 text-amber-900'}`}>
                    {p.status}
                  </span>
                </div>
                <div className="mt-4 grid gap-2 text-sm text-neutral-500 sm:grid-cols-2 lg:grid-cols-3 border-t pt-3">
                  <p><span className="font-bold text-neutral-900">Diajukan:</span> {formatDate(p.created_at)}</p>
                  <p><span className="font-bold text-neutral-900">Oleh:</span> {p.diajukanOleh?.nama_users || '-'}</p>
                  <p><span className="font-bold text-neutral-900">RT:</span> {p.wilayah?.nama_wilayah || '-'}</p>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </PageShell>
  )
}

function renderPage(activePath) {
  if (activePath === '/dukuh/warga') return <DukuhCitizenPage />
  if (activePath === '/dukuh/data-pengurus') return <DataPengurusPage />
  if (activePath === '/dukuh/perumahan') return <DukuhHousingPage />
  if (activePath === '/dukuh/keuangan') return <DukuhFinancePage />
  if (activePath === '/dukuh/statistik') return <DukuhStatisticsPage />
  if (activePath === '/dukuh/peraturan') return <DukuhRegulationPage />
  if (activePath === '/dukuh/struktur') return <StrukturOrganisasi />
  if (activePath === '/dukuh/inventaris') return <DukuhInventoryPage />
  return <HomePage />
}

export function DukuhPage() {
  const activeMenu = getCurrentMenu()

  return (
    <PortalLayout
      menuItems={DukuhMenus}
      activePath={activeMenu.path}
      homePath="/dukuh"
      brandTitle="Portal Dukuh"
      brandSubtitle="Panel Kepala Dukuh"
      footerLabel="Panel Kepala Dukuh"
    >
      {renderPage(activeMenu.path)}
    </PortalLayout>
  )
}


