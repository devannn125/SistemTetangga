import { useEffect, useState, useMemo } from 'react'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { PageShell } from '@/components/layout/PageShell'
import { getAuthData } from '@/services/authService'
import { useConfirm } from '@/components/ui/ConfirmContext'
import { useToast } from '@/components/ui/ToastContext'
import { Icon } from '@/components/ui/Icon'
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
  getFamilies
} from '@/services/api'
import { BarChart, Bar as RechartsBar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

// Menu disusun mengikuti tabel "Rekomendasi Struktur Sidebar per Role" untuk Ketua RW
// Dashboard (read), Data Warga (verify), Keuangan (monitor), Surat Keterangan (read),
// Statistik (read+export), Eskalasi Pengaduan, Inventaris (read), Peraturan (read), Struktur Organisasi (read)
const rwMenus = [
  { label: 'Beranda', path: '/rw', icon: 'home' },
  { label: 'Data Warga', path: '/rw/warga', icon: 'users' },
  { label: 'Perumahan', path: '/rw/perumahan', icon: 'box' },
  { label: 'Eskalasi Pengaduan', path: '/rw/pengaduan', icon: 'alert' },
  { label: 'Keuangan', path: '/rw/keuangan', icon: 'wallet' },
  { label: 'Surat Keterangan', path: '/rw/surat', icon: 'file' },
  { label: 'Informasi & Statistik', path: '/rw/statistik', icon: 'trendingUp' },
  { label: 'Peraturan', path: '/rw/peraturan', icon: 'scroll' },
  { label: 'Struktur Organisasi', path: '/rw/organisasi', icon: 'users' },
  { label: 'Inventaris', path: '/rw/inventaris', icon: 'box' },
]

function getCurrentMenu() {
  const pathname = window.location.pathname
  return rwMenus.find((item) => item.path === pathname) || rwMenus[0]
}

// Helpers
function formatCurrency(value) {
  return `Rp ${Number(value || 0).toLocaleString('id-ID')}`
}

function formatDate(value) {
  if (!value) return '-'
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value))
}

function getVerificationStatusClass(status) {
  return {
    PENDING: 'bg-amber-100 text-amber-900',
    VERIFIED_RW: 'bg-sky-100 text-sky-900',
    APPROVED_DUKUH: 'bg-emerald-100 text-emerald-900',
    REJECTED: 'bg-red-100 text-red-900',
  }[status] || 'bg-neutral-100 text-neutral-900'
}

function getVerificationStatusLabel(status) {
  return {
    PENDING: 'Pending',
    VERIFIED_RW: 'Terverifikasi RW',
    APPROVED_DUKUH: 'Disetujui',
    REJECTED: 'Ditolak',
  }[status] || status || 'Pending'
}

// --- SUB-PAGES ---

// 1. HOME PAGE
function HomePage() {
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
      eyebrow="Portal Ketua RW"
      title={`Selamat datang, ${authUser?.nama_users || 'Ketua RW'}`}
      description="Pusat monitoring dan verifikasi data warga serta eskalasi keluhan tingkat RW."
    >
      <section className="mt-8 grid gap-5 md:grid-cols-3">
        <article className={`rounded-2xl border ${counts.pendingWarga > 0 ? 'border-sky-300 bg-sky-50' : 'border-neutral-300 bg-white'} p-6 shadow-sm flex flex-col justify-between`}>
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-bold uppercase text-neutral-500">Verifikasi Warga</h2>
              {counts.pendingWarga > 0 && <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white animate-pulse">{counts.pendingWarga}</span>}
            </div>
            <p className="text-2xl font-extrabold text-black mt-2">{loading ? '...' : counts.pendingWarga} Pengajuan</p>
            <p className="mt-2 text-xs text-neutral-600">Data warga baru menunggu verifikasi RW.</p>
          </div>
          <a href="/rw/warga" className={`mt-6 inline-flex w-full justify-center rounded-full px-4 py-2 text-xs font-extrabold uppercase ${counts.pendingWarga > 0 ? 'bg-sky-600 text-white hover:bg-sky-700' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}>
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
          <a href="/rw/pengaduan" className={`mt-6 inline-flex w-full justify-center rounded-full px-4 py-2 text-xs font-extrabold uppercase ${counts.escalatedComplaints > 0 ? 'bg-orange-600 text-white hover:bg-orange-700' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}>
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
          <a href="/rw/surat" className="mt-6 inline-flex w-full justify-center rounded-full bg-neutral-100 px-4 py-2 text-xs font-extrabold uppercase text-neutral-600 hover:bg-neutral-200">
            Monitor Surat
          </a>
        </article>
      </section>
    </PageShell>
  )
}

// 2. DATA WARGA (VERIFY ONLY)
function RwCitizenPage() {
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
    const actionLabel = status === 'VERIFIED_RW' ? 'memverifikasi' : 'menolak'
    const approved = await confirm({
      title: status === 'VERIFIED_RW' ? 'Konfirmasi Verifikasi' : 'Konfirmasi Tolak',
      message: `Apakah Anda yakin ingin ${actionLabel} data warga atas nama "${citizen.nama_lengkap}"?`,
      confirmLabel: status === 'VERIFIED_RW' ? 'Ya, Verifikasi' : 'Ya, Tolak',
    })
    if (!approved) return
    setProcessingId(citizen.id_citizen)
    try {
      await updateCitizen(citizen.id_citizen, {
        status_verifikasi: status
      })
      showToast(`Data warga berhasil ${status === 'VERIFIED_RW' ? 'diverifikasi' : 'ditolak'}.`)
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
      description="Ketua RW memverifikasi warga baru tingkat RT. Akses bersifat read-only untuk data umum dan hanya dapat memproses pengajuan berstatus Pending."
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
                  <th className="px-5 py-3 font-semibold text-right">Aksi</th>
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
                      <td className="px-5 py-3 text-right">
                        {c.status_verifikasi === 'PENDING' || !c.status_verifikasi ? (
                          <div className="flex justify-end gap-2">
                            <button
                              disabled={processingId === c.id_citizen}
                              onClick={() => handleVerify(c, 'VERIFIED_RW')}
                              className="rounded bg-sky-600 px-3 py-1.5 text-xs font-extrabold text-white hover:bg-sky-700 transition"
                            >
                              Verifikasi
                            </button>
                            <button
                              disabled={processingId === c.id_citizen}
                              onClick={() => handleVerify(c, 'REJECTED')}
                              className="rounded border border-red-300 px-3 py-1.5 text-xs font-extrabold text-red-600 hover:bg-red-50 transition"
                            >
                              Tolak
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-neutral-400 font-semibold">Telah Diproses</span>
                        )}
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
function RwHousingPage() {
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

  return (
    <PageShell
      eyebrow="Perumahan"
      title="Monitoring Rumah & Kos"
      description="Tinjau daftar rumah tinggal dan kamar kos warga tingkat RW secara read-only."
    >
      <section className="mt-8">
        {isLoading ? (
          <div className="p-8 text-center text-sm text-neutral-500 bg-white border rounded-xl">Memuat...</div>
        ) : (
          <div className="rounded-xl border bg-white overflow-hidden overflow-x-auto">
            <table className="w-full text-left text-sm min-w-[900px]">
              <thead className="bg-neutral-50 border-b">
                <tr className="text-xs uppercase text-neutral-500">
                  <th className="px-5 py-3 font-semibold">Tipe</th>
                  <th className="px-5 py-3 font-semibold">Alamat</th>
                  <th className="px-5 py-3 font-semibold">RT / Wilayah</th>
                  <th className="px-5 py-3 font-semibold">Pemilik</th>
                  <th className="px-5 py-3 font-semibold">Kategori Kos</th>
                  <th className="px-5 py-3 font-semibold">Kamar / Penghuni</th>
                  <th className="px-5 py-3 font-semibold">Pajak</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {houses.length === 0 ? (
                  <tr><td colSpan="7" className="p-5 text-center text-neutral-500">Belum ada data perumahan</td></tr>
                ) : (
                  houses.map(h => (
                    <tr key={h.id_house} className="hover:bg-neutral-50">
                      <td className="px-5 py-3">
                        <span className={`inline-flex px-2 py-1 rounded text-xs font-bold ${h.tipe === 'KOS' ? 'bg-sky-100 text-sky-900' : 'bg-emerald-100 text-emerald-900'}`}>
                          {h.tipe === 'KOS' ? 'Kos' : 'Rumah Tinggal'}
                        </span>
                      </td>
                      <td className="px-5 py-3 font-bold text-black">{h.alamat}</td>
                      <td className="px-5 py-3">{h.wilayah?.nama_wilayah || '-'}</td>
                      <td className="px-5 py-3">{h.pemilik?.nama_lengkap || '-'}</td>
                      <td className="px-5 py-3">{h.tipe === 'KOS' ? (h.kategoriKos?.nama_master || '-') : '-'}</td>
                      <td className="px-5 py-3">
                        {h.tipe === 'KOS' ? `${h.jumlah_kamar || 0} Kamar / ${h.jumlah_penghuni || 0} Orang` : '-'}
                      </td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex px-2 py-1 rounded text-xs font-bold ${h.status_pajak === 'LUNAS' ? 'bg-emerald-100 text-emerald-900' : 'bg-amber-100 text-amber-900'}`}>
                          {h.status_pajak || '-'}
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

// 4. ESKALASI PENGADUAN
function RwComplaintPage() {
  const [complaints, setComplaints] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [processingId, setProcessingId] = useState('')
  const confirm = useConfirm()
  const { showToast } = useToast()

  function loadComplaints() {
    setIsLoading(true)
    getComplaints({ per_page: 100 }).then(res => {
      setComplaints(Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [])
      setIsLoading(false)
    }).catch(err => {
      console.error(err)
      setIsLoading(false)
    })
  }

  useEffect(() => {
    loadComplaints()
  }, [])

  async function handleResolve(complaint) {
    const approved = await confirm({
      title: 'Selesaikan Pengaduan',
      message: `Apakah Anda yakin ingin menyelesaikan tiket pengaduan eskalasi "${complaint.judul}"?`,
      confirmLabel: 'Ya, Selesaikan',
    })
    if (!approved) return
    setProcessingId(complaint.id_complaint)
    try {
      await updateComplaint(complaint.id_complaint, {
        ...complaint,
        status: 'SELESAI'
      })
      showToast('Tiket pengaduan eskalasi berhasil diselesaikan.')
      loadComplaints()
    } catch (err) {
      showToast(err.message || 'Gagal memperbarui status pengaduan.', 'error')
    } finally {
      setProcessingId('')
    }
  }

  const escalatedList = complaints.filter(c => c.status === 'ESKALASI')

  return (
    <PageShell
      eyebrow="SIPANDU"
      title="Eskalasi Pengaduan RW"
      description="Proses tiket pengaduan warga yang telah melampaui SLA 3 hari di tingkat RT and telah dieskalasi ke tingkat RW."
    >
      <section className="mt-8 space-y-6">
        {isLoading ? (
          <div className="p-8 text-center text-sm text-neutral-500 bg-white border rounded-xl">Memuat data pengaduan...</div>
        ) : escalatedList.length === 0 ? (
          <div className="p-8 text-center text-sm text-neutral-500 bg-white border rounded-xl">Tidak ada tiket pengaduan eskalasi aktif saat ini.</div>
        ) : (
          <div className="grid gap-4">
            {escalatedList.map(c => (
              <article key={c.id_complaint} className="border border-neutral-300 bg-white p-6 rounded-xl">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-neutral-500">
                      {c.nomor_tiket || `#${c.id_complaint}`} · {c.kategori}
                    </p>
                    <h2 className="mt-3 text-xl font-extrabold text-black">{c.judul}</h2>
                    <p className="mt-2 max-w-3xl text-sm leading-6 text-neutral-600">{c.deskripsi}</p>
                  </div>
                  <span className="rounded-full bg-orange-100 text-orange-900 px-3 py-1 text-xs font-bold uppercase">
                    ESKALASI
                  </span>
                </div>

                <div className="mt-4 grid gap-2 text-sm text-neutral-500 sm:grid-cols-2 lg:grid-cols-4">
                  <p><span className="font-bold text-neutral-900">Lokasi:</span> {c.lokasi || '-'}</p>
                  <p><span className="font-bold text-neutral-900">Urgensi:</span> {c.urgensi}</p>
                  <p><span className="font-bold text-neutral-900">Tanggal:</span> {formatDate(c.created_at)}</p>
                  <p><span className="font-bold text-neutral-900">RT:</span> {c.wilayah?.nama_wilayah || '-'}</p>
                </div>

                <div className="mt-5 flex gap-3">
                  <button
                    disabled={processingId === c.id_complaint}
                    onClick={() => handleResolve(c)}
                    className="rounded-full bg-black px-5 py-2 text-xs font-extrabold uppercase text-white hover:bg-neutral-900 transition"
                  >
                    Tandai Selesai
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </PageShell>
  )
}

// 5. KEUANGAN (MONITOR/READ-ONLY)
function RwFinancePage() {
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
      description="Akses monitor Ketua RW: memantau total kas dan rekapitulasi pemasukan serta pengeluaran RT."
    >
      <section className="mt-8 space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <article className="rounded-xl border border-neutral-300 bg-white p-6">
            <p className="text-xs font-bold uppercase text-neutral-500">Total Saldo Kas</p>
            <div className="mt-3 text-2xl font-extrabold text-black">{formatCurrency(summary.balance)}</div>
            <p className="mt-2 text-sm text-neutral-600">{isLoading ? 'Memuat data...' : 'Akses read-only RW'}</p>
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
function RwLetterPage() {
  const [letters, setLetters] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    getLetterRequests({ per_page: 100 }).then(res => {
      setLetters(Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [])
      setIsLoading(false)
    }).catch(err => {
      console.error(err)
      setIsLoading(false)
    })
  }, [])

  return (
    <PageShell
      eyebrow="Surat Keterangan"
      title="Arsip & Monitor Surat Pengantar"
      description="Monitor daftar pengajuan surat keterangan warga di lingkungan RW."
    >
      <section className="mt-8">
        {isLoading ? (
          <div className="p-8 text-center text-sm text-neutral-500 bg-white border rounded-xl">Memuat data surat...</div>
        ) : (
          <div className="rounded-xl border bg-white overflow-hidden overflow-x-auto">
            <table className="w-full text-left text-sm min-w-[800px]">
              <thead className="bg-neutral-50 border-b">
                <tr className="text-xs uppercase text-neutral-500">
                  <th className="px-5 py-3 font-semibold">Nomor Surat</th>
                  <th className="px-5 py-3 font-semibold">Pemohon</th>
                  <th className="px-5 py-3 font-semibold">Jenis Surat</th>
                  <th className="px-5 py-3 font-semibold">Keperluan / Keterangan</th>
                  <th className="px-5 py-3 font-semibold">RT / Wilayah</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold">Tanggal Terbit</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {letters.length === 0 ? (
                  <tr><td colSpan="7" className="p-5 text-center text-neutral-500">Belum ada pengajuan surat keterangan</td></tr>
                ) : (
                  letters.map(l => (
                    <tr key={l.id_letter_request} className="hover:bg-neutral-50">
                      <td className="px-5 py-3 font-mono text-black">{l.nomor_surat || '-'}</td>
                      <td className="px-5 py-3 font-bold text-black">{l.pemohon?.nama_lengkap || '-'}</td>
                      <td className="px-5 py-3">
                        <span className="inline-flex px-2 py-0.5 rounded text-xs font-bold bg-neutral-100 text-neutral-800">
                          {l.jenis_surat}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        {l.jenis_surat === 'USAHA' ? `${l.nama_usaha || ''} (${l.jenis_usaha || ''})` : (l.keperluan || '-')}
                      </td>
                      <td className="px-5 py-3">{l.wilayah?.nama_wilayah || '-'}</td>
                      <td className="px-5 py-3">
                        <span className="inline-flex px-2.5 py-1 text-xs font-bold rounded-full bg-blue-50 text-blue-800">
                          {l.status}
                        </span>
                      </td>
                      <td className="px-5 py-3">{l.tanggal_terbit ? formatDate(l.tanggal_terbit) : '-'}</td>
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
  link.download = 'rekap-statistik-rw.csv'
  link.click()
  URL.revokeObjectURL(url)
}

function RwStatisticsPage() {
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
      description="Dashboard tinjauan demografi warga dan laporan grafik di tingkat RW."
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
function RwRegulationPage() {
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
      description="Monitor daftar tata tertib warga tetap, tidak tetap, dan peraturan lingkungan tingkat RW."
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
function RwOrganizationPage() {
  const [members, setMembers] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    getOrganizationMembers({ per_page: 100 }).then(res => {
      setMembers(Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [])
      setIsLoading(false)
    }).catch(err => {
      console.error(err)
      setIsLoading(false)
    })
  }, [])

  return (
    <PageShell
      eyebrow="Struktur Organisasi"
      title="Struktur Pengurus Lingkungan"
      description="Daftar pengurus RT/RW yang aktif menjabat di wilayah kerja RW."
    >
      <section className="mt-8">
        {isLoading ? (
          <div className="p-8 text-center text-sm text-neutral-500 bg-white border rounded-xl">Memuat data pengurus...</div>
        ) : members.length === 0 ? (
          <div className="p-8 text-center text-sm text-neutral-500 bg-white border rounded-xl">Belum ada data pengurus terdaftar.</div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {members.filter(m => m.status_aktif).map(m => (
              <div key={m.id_organization_member} className="flex flex-col items-center rounded-2xl border border-neutral-300 bg-white p-6 relative">
                <div className="mb-4 flex h-32 w-32 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50 text-4xl font-extrabold text-neutral-300 shadow-sm">
                  {m.foto_url ? (
                    <img src={m.foto_url.startsWith('http') ? m.foto_url : 'http://127.0.0.1:8000/storage/' + m.foto_url} alt="Foto" className="h-full w-full object-cover" />
                  ) : (
                    m.citizen?.nama_lengkap?.[0] || '?'
                  )}
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-bold text-black">{m.citizen?.nama_lengkap || '-'}</h3>
                  <p className="mt-1 text-xs font-extrabold uppercase tracking-wide text-sky-600">{m.jabatan}</p>
                  <p className="mt-1 text-xs text-neutral-400">RT: {m.wilayah?.nama_wilayah || '-'}</p>
                </div>
                <p className="mt-4 w-full border-t border-neutral-100 pt-3 text-[10px] text-neutral-400 text-center font-medium">
                  Periode Mulai: {formatDate(m.periode_mulai)}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </PageShell>
  )
}

// 10. INVENTARIS (READ ONLY)
function RwInventoryPage() {
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
  if (activePath === '/rw/warga') return <RwCitizenPage />
  if (activePath === '/rw/perumahan') return <RwHousingPage />
  if (activePath === '/rw/pengaduan') return <RwComplaintPage />
  if (activePath === '/rw/keuangan') return <RwFinancePage />
  if (activePath === '/rw/surat') return <RwLetterPage />
  if (activePath === '/rw/statistik') return <RwStatisticsPage />
  if (activePath === '/rw/peraturan') return <RwRegulationPage />
  if (activePath === '/rw/organisasi') return <RwOrganizationPage />
  if (activePath === '/rw/inventaris') return <RwInventoryPage />
  return <HomePage />
}

export function RwPage() {
  const activeMenu = getCurrentMenu()

  return (
    <PortalLayout
      menuItems={rwMenus}
      activePath={activeMenu.path}
      homePath="/rw"
      brandTitle="Portal Ketua RW"
      brandSubtitle="Panel Monitoring Wilayah"
      footerLabel="Panel Ketua RW"
    >
      {renderPage(activeMenu.path)}
    </PortalLayout>
  )
}
