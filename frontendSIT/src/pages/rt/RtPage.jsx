import { useEffect, useState } from 'react'
import { PortalLayout } from '../../components/layout/PortalLayout'
import { PageShell } from '../../components/layout/PageShell'
import { getAuthData } from '../../services/authService'
import { getInventoryPurchases, updateInventoryPurchase } from '../../services/api'
import ApprovalGuestPage from './pages/ApprovalGuestPage'
import ApprovalLetterPage from './pages/ApprovalLetterPage'
import RtComplaintPage from './pages/RtComplaintPage'
import RtFeeBillPage from './pages/RtFeeBillPage'
import RtFinancePage from './pages/RtFinancePage'
import RtRegulationPage from './pages/RtRegulationPage'
import RtCitizenPage from './pages/RtCitizenPage'
import RtSiskamlingPage from './pages/RtSiskamlingPage'
import RtAnnouncementPage from './pages/RtAnnouncementPage'
import RtUserManagementPage from './pages/RtUserManagementPage'
import RtHousingPage from './pages/RtHousingPage'
import RtOrganizationPage from './pages/RtOrganizationPage'
import RtMessagePage from './pages/RtMessagePage'
import RtStatisticsPage from './pages/RtStatisticsPage'

// Menu disusun mengikuti tabel "Rekomendasi Struktur Sidebar per Role" untuk Ketua RT
// (Dashboard full, Data Warga CRUD, Perumahan, Tamu approve, Keuangan read,
// Iuran approve, Surat Keterangan approve, Siskamling CRUD jadwal,
// Informasi & Statistik CRUD+export, Peraturan CRUD, Struktur Organisasi CRUD,
// Pesan Warga, User Management RT scope, Inventaris approve)
const rtMenus = [
  { label: 'Beranda', path: '/rt', icon: 'home' },
  { label: 'Data Warga', path: '/rt/warga', icon: 'users' },
  { label: 'Perumahan', path: '/rt/perumahan', icon: 'box' },
  { label: 'Tamu', path: '/rt/tamu', icon: 'idCard' },
  { label: 'Pengaduan', path: '/rt/pengaduan', icon: 'alert' },
  { label: 'Keuangan', path: '/rt/keuangan', icon: 'wallet' },
  { label: 'Iuran', path: '/rt/iuran', icon: 'receipt' },
  { label: 'Surat Keterangan', path: '/rt/surat', icon: 'file' },
  { label: 'Siskamling', path: '/rt/siskamling', icon: 'shield' },
  { label: 'Informasi & Statistik', path: '/rt/statistik', icon: 'trendingUp' },
  { label: 'Peraturan', path: '/rt/peraturan', icon: 'scroll' },
  { label: 'Struktur Organisasi', path: '/rt/organisasi', icon: 'users' },
  { label: 'Pesan Warga', path: '/rt/pesan', icon: 'message' },
  { label: 'Pengumuman', path: '/rt/pengumuman', icon: 'megaphone' },
  { label: 'Manajemen User', path: '/rt/user', icon: 'key' },
  { label: 'Inventaris', path: '/rt/inventaris', icon: 'box' },
]

function getCurrentMenu() {
  const pathname = window.location.pathname
  return rtMenus.find((item) => item.path === pathname) || rtMenus[0]
}

function HomePage() {
  const authUser = getAuthData()
  const [counts, setCounts] = useState({ guests: 0, letters: 0, bills: 0, inventory: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    import('../../services/api').then(api => {
      Promise.all([
        api.getGuests({ per_page: 100 }),
        api.getLetterRequests({ per_page: 100 }),
        api.getFeeBills({ per_page: 100 }),
        api.getInventoryPurchases({ per_page: 100 })
      ]).then(([resGuests, resLetters, resBills, resInv]) => {
        const guestsArr = Array.isArray(resGuests?.data) ? resGuests.data : Array.isArray(resGuests) ? resGuests : []
        const lettersArr = Array.isArray(resLetters?.data) ? resLetters.data : Array.isArray(resLetters) ? resLetters : []
        const billsArr = Array.isArray(resBills?.data) ? resBills.data : Array.isArray(resBills) ? resBills : []
        const invArr = Array.isArray(resInv?.data) ? resInv.data : Array.isArray(resInv) ? resInv : []

        setCounts({
          guests: guestsArr.filter(g => g.status === 'MENUNGGU').length,
          letters: lettersArr.filter(l => l.status === 'MENUNGGU' || l.status === 'DIPROSES').length,
          bills: billsArr.filter(b => b.status === 'DRAFT' || b.status === 'PENDING').length,
          inventory: invArr.filter(i => i.status_pengajuan === 'DIAJUKAN' || i.status === 'DIAJUKAN' || i.status === 'MENUNGGU').length
        })
        setLoading(false)
      }).catch(err => {
        console.error('Failed to fetch approval counts', err)
        setLoading(false)
      })
    })
  }, [])

  return (
    <PageShell
      eyebrow="Portal Ketua RT"
      title={`Selamat datang, ${authUser?.nama_users || 'Ketua RT'}`}
      description="Pusat notifikasi dan persetujuan (approval) harian RT."
    >
      <section className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        
        <article className={`rounded-2xl border ${counts.guests > 0 ? 'border-sky-300 bg-sky-50' : 'border-neutral-300 bg-white'} p-6 shadow-sm flex flex-col justify-between`}>
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-bold uppercase text-neutral-500">Tamu Menginap</h2>
              {counts.guests > 0 && <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white animate-pulse">{counts.guests}</span>}
            </div>
            <p className="text-2xl font-extrabold text-black mt-2">{loading ? '...' : counts.guests} Pengajuan</p>
            <p className="mt-2 text-xs text-neutral-600">Laporan tamu lebih dari 1x24 jam.</p>
          </div>
          <a href="/rt/tamu" className={`mt-6 inline-flex w-full justify-center rounded-full px-4 py-2 text-xs font-extrabold uppercase ${counts.guests > 0 ? 'bg-sky-600 text-white hover:bg-sky-700' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}>
            Buka Tamu
          </a>
        </article>

        <article className={`rounded-2xl border ${counts.letters > 0 ? 'border-amber-300 bg-amber-50' : 'border-neutral-300 bg-white'} p-6 shadow-sm flex flex-col justify-between`}>
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-bold uppercase text-neutral-500">Surat Pengantar</h2>
              {counts.letters > 0 && <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white animate-pulse">{counts.letters}</span>}
            </div>
            <p className="text-2xl font-extrabold text-black mt-2">{loading ? '...' : counts.letters} Menunggu</p>
            <p className="mt-2 text-xs text-neutral-600">Permohonan surat pengantar warga.</p>
          </div>
          <a href="/rt/surat" className={`mt-6 inline-flex w-full justify-center rounded-full px-4 py-2 text-xs font-extrabold uppercase ${counts.letters > 0 ? 'bg-amber-600 text-white hover:bg-amber-700' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}>
            Buka Surat
          </a>
        </article>

        <article className={`rounded-2xl border ${counts.bills > 0 ? 'border-emerald-300 bg-emerald-50' : 'border-neutral-300 bg-white'} p-6 shadow-sm flex flex-col justify-between`}>
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-bold uppercase text-neutral-500">Draf Iuran</h2>
              {counts.bills > 0 && <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white animate-pulse">{counts.bills}</span>}
            </div>
            <p className="text-2xl font-extrabold text-black mt-2">{loading ? '...' : counts.bills} Draf Baru</p>
            <p className="mt-2 text-xs text-neutral-600">Draf tagihan iuran bulanan dari Bendahara.</p>
          </div>
          <a href="/rt/iuran" className={`mt-6 inline-flex w-full justify-center rounded-full px-4 py-2 text-xs font-extrabold uppercase ${counts.bills > 0 ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}>
            Buka Iuran
          </a>
        </article>

        <article className={`rounded-2xl border ${counts.inventory > 0 ? 'border-purple-300 bg-purple-50' : 'border-neutral-300 bg-white'} p-6 shadow-sm flex flex-col justify-between`}>
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-bold uppercase text-neutral-500">Inventaris</h2>
              {counts.inventory > 0 && <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white animate-pulse">{counts.inventory}</span>}
            </div>
            <p className="text-2xl font-extrabold text-black mt-2">{loading ? '...' : counts.inventory} Pengajuan</p>
            <p className="mt-2 text-xs text-neutral-600">Pembelian aset dari Sekretaris.</p>
          </div>
          <a href="/rt/inventaris" className={`mt-6 inline-flex w-full justify-center rounded-full px-4 py-2 text-xs font-extrabold uppercase ${counts.inventory > 0 ? 'bg-purple-600 text-white hover:bg-purple-700' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}>
            Buka Inventaris
          </a>
        </article>

      </section>
    </PageShell>
  )
}

const purchaseStatusTabs = [
  { id: 'DIAJUKAN', label: 'Perlu Approval' },
  { id: 'DISETUJUI', label: 'Disetujui' },
  { id: 'DITOLAK', label: 'Ditolak' },
  { id: 'all', label: 'Semua' },
]

function getPurchaseStatusClass(status) {
  return {
    DIAJUKAN: 'bg-amber-100 text-amber-900',
    DISETUJUI: 'bg-emerald-100 text-emerald-900',
    DITOLAK: 'bg-red-100 text-red-900',
  }[status] || 'bg-neutral-100 text-neutral-900'
}

function formatCurrency(value) {
  return `Rp ${Number(value || 0).toLocaleString('id-ID')}`
}

function formatDate(value) {
  if (!value) return '-'
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(value))
}

function ApprovalInventoryPage() {
  const [activeStatus, setActiveStatus] = useState('DIAJUKAN')
  const [purchases, setPurchases] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [processingId, setProcessingId] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    let alive = true

    async function loadPurchases() {
      setIsLoading(true)
      try {
        const response = await getInventoryPurchases({ per_page: 100 })
        const rows = Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : []
        if (alive) setPurchases(rows)
      } catch (error) {
        if (alive) setNotice(error.message || 'Backend belum dapat dihubungi.')
      } finally {
        if (alive) setIsLoading(false)
      }
    }

    loadPurchases()

    return () => {
      alive = false
    }
  }, [])

  const filteredPurchases = purchases.filter((p) => activeStatus === 'all' || p.status === activeStatus)

  async function handleDecision(id, status) {
    setNotice('')
    setProcessingId(id)
    try {
      await updateInventoryPurchase(id, { status })
      setPurchases((current) => current.map((p) => (p.id_inventory_purchase === id ? { ...p, status } : p)))
      setNotice(`Pengajuan pembelian berhasil ${status === 'DISETUJUI' ? 'disetujui' : 'ditolak'}.`)
    } catch (error) {
      setNotice(error.message || 'Gagal memperbarui status pengajuan.')
    } finally {
      setProcessingId('')
    }
  }

  return (
    <PageShell
      description="Persetujuan pengajuan pembelian barang inventaris dari Sekretaris RT."
      eyebrow="Inventaris"
      title="Approval Pengajuan Pembelian"
    >
      <section className="mt-8 space-y-6">
        {notice ? (
          <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-semibold text-sky-900">
            {notice}
          </div>
        ) : null}

        <div className="flex flex-wrap gap-3">
          {purchaseStatusTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`rounded-full border px-4 py-2 text-xs font-extrabold transition ${
                activeStatus === tab.id
                  ? 'border-black bg-black text-white'
                  : 'border-neutral-300 bg-white text-neutral-700 hover:border-black hover:bg-neutral-100'
              }`}
              onClick={() => setActiveStatus(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="rounded-xl border border-neutral-300 bg-white p-8 text-center text-sm font-semibold text-neutral-600">
            Memuat data pengajuan...
          </div>
        ) : filteredPurchases.length === 0 ? (
          <div className="rounded-xl border border-neutral-300 bg-white p-8 text-center text-sm font-semibold text-neutral-600">
            Tidak ada pengajuan pembelian pada status ini.
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredPurchases.map((purchase) => (
              <article key={purchase.id_inventory_purchase} className="border border-neutral-300 bg-white p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-extrabold text-black">{purchase.nama_barang}</h2>
                    <p className="mt-1 text-sm text-neutral-600">
                      Jumlah: {purchase.jumlah} {purchase.satuan || ''} · Perkiraan: {formatCurrency(purchase.perkiraan_biaya)}
                    </p>
                    {purchase.alasan && <p className="mt-1 text-sm text-neutral-500">{purchase.alasan}</p>}
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${getPurchaseStatusClass(purchase.status)}`}>{purchase.status}</span>
                </div>

                <div className="mt-4 grid gap-2 text-sm text-neutral-500 sm:grid-cols-2 lg:grid-cols-3">
                  <p><span className="font-bold text-neutral-900">Diajukan:</span> {formatDate(purchase.created_at)}</p>
                  <p><span className="font-bold text-neutral-900">Oleh:</span> {purchase.diajukanOleh?.nama_users || '-'}</p>
                  {purchase.disetujui_at ? <p><span className="font-bold text-neutral-900">Disetujui:</span> {formatDate(purchase.disetujui_at)}</p> : null}
                  {purchase.disetujuiOleh ? <p><span className="font-bold text-neutral-900">Oleh:</span> {purchase.disetujuiOleh.nama_users}</p> : null}
                </div>

                {purchase.status === 'DIAJUKAN' ? (
                  <div className="mt-5 flex flex-wrap gap-3">
                    <button
                      className="rounded-full bg-black px-5 py-2 text-xs font-extrabold uppercase text-white transition hover:bg-neutral-900 disabled:cursor-not-allowed disabled:opacity-50"
                      onClick={() => handleDecision(purchase.id_inventory_purchase, 'DISETUJUI')}
                      disabled={processingId === purchase.id_inventory_purchase}
                      type="button"
                    >
                      Setujui
                    </button>
                    <button
                      className="rounded-full border border-black px-5 py-2 text-xs font-extrabold uppercase text-black transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50"
                      onClick={() => handleDecision(purchase.id_inventory_purchase, 'DITOLAK')}
                      disabled={processingId === purchase.id_inventory_purchase}
                      type="button"
                    >
                      Tolak
                    </button>
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        )}
      </section>
    </PageShell>
  )
}

// TODO: begitu tiap modul digarap, pindahkan ke file sendiri di src/pages/rt/pages/,
// mengikuti pola yang sudah ada di src/pages/warga/pages/
function renderPage(activePath) {
  if (activePath === '/rt/warga') return <RtCitizenPage />
  if (activePath === '/rt/perumahan') return <RtHousingPage />
  if (activePath === '/rt/tamu') return <ApprovalGuestPage />
  if (activePath === '/rt/pengaduan') return <RtComplaintPage />
  if (activePath === '/rt/keuangan') return <RtFinancePage />
  if (activePath === '/rt/iuran') return <RtFeeBillPage />
  if (activePath === '/rt/surat') return <ApprovalLetterPage />
  if (activePath === '/rt/siskamling') return <RtSiskamlingPage />
  if (activePath === '/rt/statistik') return <RtStatisticsPage />
  if (activePath === '/rt/peraturan') return <RtRegulationPage />
  if (activePath === '/rt/organisasi') return <RtOrganizationPage />
  if (activePath === '/rt/pesan') return <RtMessagePage />
  if (activePath === '/rt/pengumuman') return <RtAnnouncementPage />
  if (activePath === '/rt/user') return <RtUserManagementPage />
  if (activePath === '/rt/inventaris') return <ApprovalInventoryPage />
  return <HomePage />
}

export function RtPage() {
  const activeMenu = getCurrentMenu()

  return (
    <PortalLayout
      menuItems={rtMenus}
      activePath={activeMenu.path}
      homePath="/rt"
      brandTitle="Portal Ketua RT"
      brandSubtitle="Panel Pengurus Lingkungan"
      footerLabel="Panel Ketua RT"
    >
      {renderPage(activeMenu.path)}
    </PortalLayout>
  )
}
