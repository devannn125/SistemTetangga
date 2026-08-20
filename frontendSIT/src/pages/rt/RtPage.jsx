import { useEffect, useState } from 'react'
import { PortalLayout } from '../../components/layout/PortalLayout'
import { PageShell } from '../../components/layout/PageShell'
import { getAuthData } from '../../services/authService'
import { getInventoryPurchases, updateInventoryPurchase } from '../../services/api'
import ApprovalGuestPage from './pages/ApprovalGuestPage'
import ApprovalLetterPage from './pages/ApprovalLetterPage'

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
  { label: 'Keuangan', path: '/rt/keuangan', icon: 'wallet' },
  { label: 'Iuran', path: '/rt/iuran', icon: 'receipt' },
  { label: 'Surat Keterangan', path: '/rt/surat', icon: 'file' },
  { label: 'Siskamling', path: '/rt/siskamling', icon: 'shield' },
  { label: 'Informasi & Statistik', path: '/rt/statistik', icon: 'chart' },
  { label: 'Peraturan', path: '/rt/peraturan', icon: 'scroll' },
  { label: 'Struktur Organisasi', path: '/rt/organisasi', icon: 'building' },
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

  return (
    <PageShell
      eyebrow="Portal Ketua RT"
      title={`Selamat datang, ${authUser?.nama_users || 'Ketua RT'}`}
      description="Kelola data warga, verifikasi pengaduan, dan pantau keuangan RT dari satu tempat."
    >
      <section className="mt-8 grid gap-5 md:grid-cols-3">
        <article className="border border-neutral-900 bg-white p-6">
          <h2 className="text-lg font-extrabold text-black">Tamu Menunggu Approval</h2>
          <p className="mt-3 text-sm leading-6 text-neutral-600">Belum ada data — hubungkan ke backend.</p>
        </article>
        <article className="border border-neutral-900 bg-white p-6">
          <h2 className="text-lg font-extrabold text-black">Surat Perlu Approval</h2>
          <p className="mt-3 text-sm leading-6 text-neutral-600">Belum ada data — hubungkan ke backend.</p>
        </article>
        <article className="border border-neutral-900 bg-white p-6">
          <h2 className="text-lg font-extrabold text-black">Iuran Perlu Konfirmasi</h2>
          <p className="mt-3 text-sm leading-6 text-neutral-600">Belum ada data — hubungkan ke backend.</p>
        </article>
        <article className="border border-neutral-900 bg-white p-6">
          <h2 className="text-lg font-extrabold text-black">Inventaris Perlu Approval</h2>
          <p className="mt-3 text-sm leading-6 text-neutral-600">Pengajuan pembelian barang dari Sekretaris.</p>
          <a className="mt-4 inline-flex text-xs font-extrabold uppercase text-black no-underline hover:text-sky-700" href="/rt/inventaris">
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
  if (activePath === '/rt/warga')
    return <PageShell eyebrow="Kependudukan" title="Data Warga" description="CRUD data warga tingkat RT. Sedang dikembangkan." />
  if (activePath === '/rt/perumahan')
    return <PageShell eyebrow="Perumahan" title="Data Rumah & Kos" description="CRUD data rumah warga dan kos. Sedang dikembangkan." />
  if (activePath === '/rt/tamu')
    return <ApprovalGuestPage />
  if (activePath === '/rt/keuangan')
    return <PageShell eyebrow="Keuangan" title="Keuangan RT" description="Ringkasan kas RT (read-only, input oleh Bendahara). Sedang dikembangkan." />
  if (activePath === '/rt/iuran')
    return <PageShell eyebrow="Iuran" title="Approval Iuran Warga" description="Persetujuan dan pemantauan status iuran. Sedang dikembangkan." />
  if (activePath === '/rt/surat')
    return <ApprovalLetterPage />
  if (activePath === '/rt/siskamling')
    return <PageShell eyebrow="Siskamling" title="Jadwal & Kejadian Siskamling" description="Kelola jadwal ronda dan tinjau laporan kejadian. Sedang dikembangkan." />
  if (activePath === '/rt/statistik')
    return <PageShell eyebrow="Informasi & Statistik" title="Statistik Warga" description="Statistik kependudukan kategori a-j, termasuk data sensitif. Sedang dikembangkan." />
  if (activePath === '/rt/peraturan')
    return <PageShell eyebrow="Peraturan" title="Tata Tertib RT" description="Kelola tata tertib warga tetap & tidak tetap. Sedang dikembangkan." />
  if (activePath === '/rt/organisasi')
    return <PageShell eyebrow="Organisasi" title="Struktur Organisasi & Pengurus" description="Kelola jabatan dan periode pengurus RT. Sedang dikembangkan." />
  if (activePath === '/rt/pesan')
    return <PageShell eyebrow="Komunikasi" title="Pesan & Kesan Warga" description="Tinjau pesan, keluhan, dan apresiasi warga. Sedang dikembangkan." />
  if (activePath === '/rt/pengumuman')
    return <PageShell eyebrow="Informasi" title="Pengumuman" description="Kelola pengumuman untuk warga. Sedang dikembangkan." />
  if (activePath === '/rt/user')
    return <PageShell eyebrow="Sistem" title="Manajemen User" description="Kelola akun pengguna dalam lingkup RT. Sedang dikembangkan." />
  if (activePath === '/rt/inventaris')
    return <ApprovalInventoryPage />
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