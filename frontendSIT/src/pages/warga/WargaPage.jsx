import React, { useState, useEffect } from 'react'
import { Icon } from '../../components/ui/Icon'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { useConfirm } from '../../components/ui/ConfirmContext'
import { useToast } from '../../components/ui/ToastContext'
import { clearAuthData } from '../../services/authService'
import ComplaintPage from './pages/ComplaintPage'
import FinancePage from './pages/FinancePage'
import GuestPage from './pages/GuestPage'
import IuranPage from './pages/IuranPage'
import LetterPage from './pages/LetterPage'
import SiskamlingPage from './pages/SiskamlingPage'
import HealthPage from './pages/HealthPage'
import InventoryPage from './pages/InventoryPage'
import RulesPage from './pages/RulesPage'
import OrgPage from './pages/OrgPage'
import StatisticsPage from './pages/StatisticsPage'

const wargaMenus = [
  { label: 'Beranda', path: '/warga', icon: 'home' },
  { label: 'Pengaduan', path: '/warga/pengaduan', icon: 'alert' },
  { label: 'Tamu', path: '/warga/tamu', icon: 'idCard' },
  { label: 'Keuangan', path: '/warga/keuangan', icon: 'receipt' },
  { label: 'Iuran', path: '/warga/iuran', icon: 'wallet' },
  { label: 'Siskamling', path: '/warga/siskamling', icon: 'shield' },
  { label: 'Kesehatan', path: '/warga/kesehatan', icon: 'heart' },
  { label: 'Inventaris', path: '/warga/inventaris', icon: 'box' },
  { label: 'Peraturan', path: '/warga/peraturan', icon: 'scroll' },
  { label: 'Struktur Organisasi', path: '/warga/organisasi', icon: 'users' },
  { label: 'Statistik', path: '/warga/statistik', icon: 'trendingUp' },
  { label: 'Surat Resmi', path: '/warga/surat-resmi', icon: 'file' },
  { label: 'Pengumuman', path: '/warga/pengumuman', icon: 'megaphone' },
  { label: 'Notifikasi', path: '/warga/notifikasi', icon: 'bell' },
  { label: 'Feedback', path: '/warga/feedback', icon: 'message' },
]

const portalCards = [
  { title: 'Profil Warga', description: 'Lihat dan perbarui data keluarga.', icon: 'idCard' },
  { title: 'Iuran Bulanan', description: 'Pantau status pembayaran lingkungan.', icon: 'wallet' },
  { title: 'Pengumuman', description: 'Baca informasi terbaru dari pengurus.', icon: 'megaphone' },
]

const announcements = [
  { type: 'Berita', date: '24 Okt 2024', title: 'Kerja Bakti Rutin Akhir Bulan' },
  { type: 'Agenda', date: '28 Okt 2024', title: 'Rapat Koordinasi HUT RI ke-80' },
  { type: 'Dokumen', date: '15 Okt 2024', title: 'Laporan Keuangan Kuartal 3 2024' },
]

function getCurrentMenu() {
  const pathname = window.location.pathname
  return wargaMenus.find((item) => item.path === pathname) || wargaMenus[0]
}

function handleLogout() {
  clearAuthData()
  window.location.assign('/login')
}function WargaSidebar({ activePath }) {
  return (
    <aside className="sticky top-0 flex h-screen w-[250px] shrink-0 flex-col border-r border-neutral-900 bg-white max-md:static max-md:h-auto max-md:w-full max-md:flex-none max-md:border-r-0 max-md:border-b">
      <div className="flex h-15 shrink-0 border-b border-neutral-900 px-4 py-5">
        <a className="flex items-center gap-2 text-sm font-extrabold text-black no-underline" href="/warga">
          <Icon name="building" className="h-5 w-5" />
          Kenaran
        </a>
      </div>

      <div className="shrink-0 px-4 py-6">
        <p className="text-xl font-extrabold leading-tight text-black">Portal Warga</p>
        <p className="mt-1 text-xs font-semibold uppercase leading-5 text-neutral-500">Layanan Digital Masyarakat</p>
      </div>

      <nav className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto px-3 max-md:grid max-md:max-h-none max-md:grid-cols-2 max-md:overflow-visible" aria-label="Menu portal warga">
        {wargaMenus.map((item) => {
          const isActive = activePath === item.path

          return (
            <a
              className={`flex min-h-10 items-center gap-3 px-3 text-sm font-bold no-underline transition ${
                isActive ? 'bg-black text-white' : 'text-neutral-700 hover:bg-neutral-100 hover:text-black'
              }`}
              href={item.path}
              key={item.path}
            >
              <Icon name={item.icon} className="h-4 w-4" />
              {item.label}
            </a>
          )
        })}
      </nav>
    </aside>
  )
}

function WargaTopbar() {
  const [confirmLogout, setConfirmLogout] = useState(false)

  function confirmAndLogout() {
    setConfirmLogout(false)
    handleLogout()
  }

  return (
    <header className="flex h-15 items-center justify-end border-b border-neutral-900 bg-white px-6 ">
      <button
        className="flex h-9 items-center gap-2 border border-black bg-black px-4 text-xs font-extrabold text-white transition hover:border-sky-600 hover:bg-sky-600"
        onClick={() => setConfirmLogout(true)}
        type="button"
      >
        <Icon name="logout" className="h-4 w-4" />
        Keluar
      </button>
      <ConfirmDialog
        open={confirmLogout}
        title="Konfirmasi Keluar"
        message="Apakah Anda yakin ingin keluar dari akun ini?"
        confirmLabel="Keluar"
        onConfirm={confirmAndLogout}
        onCancel={() => setConfirmLogout(false)}
      />
    </header>
  )
}

function PageShell({ children, eyebrow, title, description }) {
  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <section className="border-2 border-neutral-900 bg-white p-8 max-sm:p-5">
        <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-neutral-500">{eyebrow}</p>
        <h1 className="mt-3 text-3xl font-extrabold leading-tight text-black max-sm:text-2xl">{title}</h1>
        {description ? <p className="mt-4 max-w-2xl text-sm leading-6 text-neutral-600">{description}</p> : null}
      </section>
      {children}
    </div>
  )
}

function HomePage() {
  return (
    <PageShell
      description="Akses layanan warga, pembayaran iuran, pengumuman, dan data lingkungan dari satu tempat."
      eyebrow="Portal Warga"
      title="Selamat datang di halaman warga"
    >
      <section className="mt-8 grid gap-5 md:grid-cols-3">
        {portalCards.map((item) => (
          <article className="border border-neutral-900 bg-white p-6" key={item.title}>
            <div className="grid h-11 w-11 place-items-center bg-black text-white">
              <Icon name={item.icon} className="h-5 w-5" />
            </div>
            <h2 className="mt-5 text-lg font-extrabold text-black">{item.title}</h2>
            <p className="mt-3 text-sm leading-6 text-neutral-600">{item.description}</p>
          </article>
        ))}
      </section>

      <section className="mt-8 border-t border-neutral-900 pt-8">
        <div className="flex items-end justify-between gap-4 max-sm:flex-col max-sm:items-start">
          <div>
            <h2 className="text-2xl font-extrabold text-black">Pusat Informasi & Pengumuman</h2>
            <p className="mt-2 text-sm text-neutral-600">Berita terbaru dan agenda kegiatan RT/RW.</p>
          </div>
          <a className="border border-black bg-black px-4 py-2 text-xs font-extrabold text-white no-underline" href="/warga/pengumuman">
            Semua
          </a>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {announcements.map((item) => (
            <article className="border border-neutral-900 bg-white p-5" key={item.title}>
              <div className="flex items-center justify-between gap-3 text-xs font-bold text-neutral-500">
                <span className="border border-neutral-500 px-2 py-1 text-black">{item.type}</span>
                <span>{item.date}</span>
              </div>
              <h3 className="mt-5 text-base font-extrabold leading-6 text-black">{item.title}</h3>
              <a className="mt-5 inline-flex text-xs font-extrabold uppercase text-black no-underline hover:text-sky-700" href="/warga/pengumuman">
                Baca selengkapnya
              </a>
            </article>
          ))}
        </div>
      </section>
    </PageShell>
  )
}



function AnnouncementPage() {
  const [items, setItems] = React.useState([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    // Gunakan modul api yang sama dengan RT agar token autentikasi terkirim
    import('../../services/api').then(({ getAnnouncements }) => {
      getAnnouncements({ per_page: 100 })
        .then(res => {
          const arr = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []
          // Hanya tampilkan pengumuman yang sudah disetujui (aktif) atau dari RT langsung
          setItems(arr.filter(a => ['RT', 'DUKUH_DISETUJUI'].includes(a.status_approval) || !a.status_approval))
          setLoading(false)
        })
        .catch(err => {
          console.error(err)
          setLoading(false)
        })
    })
  }, [])

  return (
    <PageShell
      description="Baca informasi terbaru yang dibagikan pengurus lingkungan."
      eyebrow="Informasi"
      title="Pengumuman Warga"
    >
      <section className="mt-6 grid gap-4">
        {loading ? (
          <div className="p-8 text-center text-sm text-neutral-500 bg-white border">Memuat pengumuman...</div>
        ) : items.length === 0 ? (
          <div className="p-8 text-center text-sm text-neutral-500 bg-white border">Belum ada pengumuman.</div>
        ) : items.map((item) => (
          <article className="border border-neutral-900 bg-white p-5" key={item.id_announcement || item.id || item.judul}>
            <p className="text-xs font-extrabold uppercase text-neutral-500">
              {item.kategori || 'Berita'} - {item.created_at ? new Date(item.created_at).toLocaleDateString('id-ID') : (item.tanggal || '-')}
            </p>
            <h2 className="mt-2 text-lg font-extrabold text-black">{item.judul}</h2>
            <p className="mt-3 text-sm leading-6 text-neutral-600">{item.isi}</p>
          </article>
        ))}
      </section>
    </PageShell>
  )
}



function NotificationPage() {
  return (
    <PageShell eyebrow="Notifikasi" title="Notifikasi Warga" description="Pantau kabar terbaru tentang pengajuan, iuran, dan informasi lingkungan.">
      <section className="mt-6 border border-neutral-900 bg-white p-5">
        <p className="text-sm font-bold text-neutral-700">Belum ada notifikasi baru.</p>
      </section>
    </PageShell>
  )
}

function FeedbackPage() {
  const [feedbacks, setFeedbacks] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ kategori: 'MASUKAN', judul: '', deskripsi: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [notice, setNotice] = useState({ type: '', msg: '' })
  const confirm = useConfirm()
  const { showToast } = useToast()

  useEffect(() => {
    import('../../services/api').then(api => {
      api.getFeedback({ per_page: 5 }).then(res => {
        const arr = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []
        setFeedbacks(arr)
        setLoading(false)
      }).catch(err => {
        console.error(err)
        setLoading(false)
      })
    })
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.judul.trim() || !form.deskripsi.trim()) {
      setNotice({ type: 'error', msg: 'Judul dan isi pesan wajib diisi.' })
      return
    }

    const approved = await confirm({
      title: 'Konfirmasi Kirim',
      message: `Kirim ${form.kategori === 'KELUHAN' ? 'keluhan' : 'pesan'} "${form.judul}" kepada pengurus RT?`,
      confirmLabel: 'Ya, Kirim',
    })
    if (!approved) return

    setIsSubmitting(true)
    setNotice({ type: '', msg: '' })

    try {
      const api = await import('../../services/api')
      await api.createFeedback({
        judul: form.judul,
        kategori: form.kategori,
        deskripsi: form.deskripsi,
        isi_feedback: form.deskripsi,
        isi_pesan: form.deskripsi // Menambahkan ini agar lolos validasi backend
      })
      showToast('Pesan berhasil dikirim.')
      setForm({ kategori: 'MASUKAN', judul: '', deskripsi: '' })

      // Refresh list
      const res = await api.getFeedback({ per_page: 5 })
      setFeedbacks(Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [])
    } catch (err) {
      showToast(err.message || 'Gagal mengirim pesan.', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <PageShell
      description="Sampaikan aspirasi, kritik membangun, atau apresiasi kepada pengurus lingkungan."
      eyebrow="Suara Warga"
      title="Pesan & Kesan"
    >
      <section className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="border border-neutral-900 bg-white p-5">
          {notice.msg && (
            <div className={`mb-5 rounded px-4 py-3 text-sm font-bold ${notice.type === 'error' ? 'bg-red-50 text-red-900' : 'bg-emerald-50 text-emerald-900'}`}>
              {notice.msg}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <label className="grid gap-2 text-sm font-bold text-black">
              Kategori Pesan
              <select 
                className="h-11 border border-neutral-400 px-3 outline-0 focus:border-sky-600"
                value={form.kategori}
                onChange={e => setForm({ ...form, kategori: e.target.value })}
              >
                <option value="MASUKAN">Aspirasi / Usulan</option>
                <option value="KELUHAN">Keluhan</option>
                <option value="APRESIASI">Apresiasi</option>
                <option value="LAINNYA">Lainnya</option>
              </select>
            </label>
            <label className="mt-4 grid gap-2 text-sm font-bold text-black">
              Judul Pesan
              <input 
                type="text"
                className="h-11 border border-neutral-400 px-3 outline-0 focus:border-sky-600" 
                placeholder="Topik pesan..." 
                value={form.judul}
                onChange={e => setForm({ ...form, judul: e.target.value })}
              />
            </label>
            <label className="mt-4 grid gap-2 text-sm font-bold text-black">
              Isi Pesan
              <textarea 
                className="min-h-40 resize-none border border-neutral-400 px-3 py-3 outline-0 focus:border-sky-600" 
                placeholder="Tuliskan detail pesan Anda di sini..." 
                value={form.deskripsi}
                onChange={e => setForm({ ...form, deskripsi: e.target.value })}
              />
            </label>
            <button 
              className="mt-5 h-10 border border-black bg-black px-5 text-xs font-extrabold text-white disabled:opacity-50" 
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Mengirim...' : 'Kirim Pesan'}
            </button>
          </form>
        </div>

        <aside className="border border-neutral-900 bg-white p-5">
          <h2 className="text-base font-extrabold text-black">Kesan Warga Terkini</h2>
          <div className="mt-4 space-y-3">
            {loading ? (
              <p className="text-sm text-neutral-500">Memuat...</p>
            ) : feedbacks.length === 0 ? (
              <p className="text-sm text-neutral-500">Belum ada pesan yang dibagikan.</p>
            ) : feedbacks.map((item) => (
              <article key={item.id_feedback || item.id} className="border border-neutral-300 p-4">
                <div className="flex justify-between items-start mb-1">
                  <p className="text-sm font-extrabold text-black">{item.judul || 'Pesan'}</p>
                  <span className="text-[10px] font-bold uppercase text-sky-700 bg-sky-50 px-2 py-0.5 rounded">{item.kategori || 'UMUM'}</span>
                </div>
                <p className="text-xs text-neutral-500 mb-2">{item.tanggal_submit || item.created_at?.slice(0,10)}</p>
                <p className="text-sm leading-6 text-neutral-600 line-clamp-3">{item.isi_pesan || item.deskripsi || item.isi_feedback}</p>
              </article>
            ))}
          </div>
        </aside>
      </section>
    </PageShell>
  )
}

function renderPage(activePath) {
  if (activePath === '/warga/pengaduan') return <ComplaintPage />
  if (activePath === '/warga/tamu') return <GuestPage />
  if (activePath === '/warga/keuangan') return <FinancePage />
  if (activePath === '/warga/iuran') return <IuranPage />
  if (activePath === '/warga/siskamling') return <SiskamlingPage />
  if (activePath === '/warga/kesehatan') return <HealthPage />
  if (activePath === '/warga/inventaris') return <InventoryPage />
  if (activePath === '/warga/peraturan') return <RulesPage />
  if (activePath === '/warga/organisasi') return <OrgPage />
  if (activePath === '/warga/statistik') return <StatisticsPage />
  if (activePath === '/warga/surat-resmi') return <LetterPage />
  if (activePath === '/warga/pengumuman') return <AnnouncementPage />
  if (activePath === '/warga/notifikasi') return <NotificationPage />
  if (activePath === '/warga/feedback') return <FeedbackPage />
  return <HomePage />
}

export function WargaPage() {
  const activeMenu = getCurrentMenu()

  return (
    <main className="flex min-h-screen bg-neutral-100 text-neutral-900 max-md:block">
      <WargaSidebar activePath={activeMenu.path} />

      <section className="min-w-0 flex-1">
        <WargaTopbar />
        {renderPage(activeMenu.path)}
        <footer className="border-t border-neutral-900 bg-white px-6 py-5 text-xs font-semibold text-neutral-500">
          <div className="mx-auto flex max-w-6xl justify-between gap-4 max-sm:flex-col">
            <span>&copy; 2024 Kenaran</span>
            <span>Kontak Pengurus | Bantuan | Kebijakan Privasi</span>
          </div>
        </footer>
      </section>
    </main>
  )
}
