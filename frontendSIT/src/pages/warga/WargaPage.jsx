import React, { useState, useEffect } from 'react'
import { Icon } from '@/components/ui/Icon'
import { Button } from '@/components/ui/Button'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { useConfirm } from '@/components/ui/ConfirmContext'
import { useToast } from '@/components/ui/ToastContext'
import { getAuthRole, getAuthData } from '@/services/authService'
import { DemographyCharts } from '@/components/dashboard/DemographyCharts'
import ComplaintPage from '@/pages/warga/pages/ComplaintPage'
import FinancePage from '@/pages/warga/pages/FinancePage'
import GuestPage from '@/pages/warga/pages/GuestPage'
import IuranPage from '@/pages/warga/pages/IuranPage'
import LetterPage from '@/pages/warga/pages/LetterPage'
import SiskamlingPage from '@/pages/warga/pages/SiskamlingPage'
import HealthPage from '@/pages/warga/pages/HealthPage'
import PasswordPage from '@/pages/warga/pages/PasswordPage'
import InventoryPage from '@/pages/warga/pages/InventoryPage'
import RulesPage from '@/pages/warga/pages/RulesPage'
import OrgPage from '@/pages/warga/pages/OrgPage'
import StatisticsPage from '@/pages/warga/pages/StatisticsPage'
import { WargaDashboard } from '@/components/dashboard/roles/WargaDashboard'
import { PageShell } from '@/components/layout/PageShell'

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
  { label: 'Ubah Password', path: '/warga/password', icon: 'lock' },
]

const PORTAL_CARDS = [
  { title: 'Profil Warga', description: 'Lihat dan perbarui data keluarga.', icon: 'idCard', path: '/warga/berandaprofil' },
  { title: 'Iuran Bulanan', description: 'Pantau status pembayaran lingkungan.', icon: 'wallet', path: '/warga/iuran' },
  { title: 'Pengumuman', description: 'Baca informasi terbaru dari pengurus.', icon: 'megaphone', path: '/warga/pengumuman' },
]

const ROLE_NAME = {
  WARGA: 'Warga',
  SISKAMLING: 'Pengurus Siskamling',
  PKK: 'Ibu PKK',
  KARANG_TARUNA: 'Karang Taruna',
}

function getCurrentMenu() {
  const pathname = window.location.pathname
  return wargaMenus.find((item) => item.path === pathname) || wargaMenus[0]
}

function HomePage() {
  const [announcements, setAnnouncements] = useState([])
  const [myBills, setMyBills] = useState([])
  const [myLetters, setMyLetters] = useState([])
  const [upcomingSiskamling, setUpcomingSiskamling] = useState([])
  const [upcomingPosyandu, setUpcomingPosyandu] = useState([])
  const [summary, setSummary] = useState(null)
  const role = getAuthRole()

  useEffect(() => {
    import('../../services/api').then((api) => {
      api.getAnnouncements({ per_page: 3 }).then((r) => setAnnouncements(toArray(r))).catch(() => {})
      api.getFeeBills({ per_page: 100 }).then((r) => setMyBills(toArray(r))).catch(() => {})
      api.getLetterRequests({ per_page: 100 }).then((r) => setMyLetters(toArray(r))).catch(() => {})
      api.getSiskamlingSchedules({ per_page: 100 }).then((r) => setUpcomingSiskamling(upcoming(toArray(r)))).catch(() => {})
      api.getPosyanduSchedules({ per_page: 100 }).then((r) => setUpcomingPosyandu(upcoming(toArray(r)))).catch(() => {})
      api.getStatistikSummary().then((r) => setSummary((r?.data || r))).catch(() => {})
    })
  }, [])

  const unpaidBills = myBills.filter((b) => b.status === 'BELUM_BAYAR' || b.status === 'SEBAGIAN')
  const activeLetters = myLetters.filter((l) => l.status === 'DIAJUKAN' || l.status === 'DIVERIFIKASI')
  const roleLabel = ROLE_NAME[role] || 'Warga'

  return (
    <PageShell
      description="Akses layanan warga, pembayaran iuran, pengumuman, dan data lingkungan dari satu tempat."
      eyebrow="Portal Warga"
      title={`Selamat datang, ${roleLabel}`}
    >
      {/* Stat ringkas (data milik sendiri, sesuai batasan role) */}
      <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile icon="receipt" label="Tagihan Saya" value={myBills.length} sub={`${unpaidBills.length} belum bayar`} accent="text-amber-600 bg-amber-50" />
        <StatTile icon="file" label="Surat Saya" value={myLetters.length} sub={`${activeLetters.length} proses`} accent="text-sky-600 bg-sky-50" />
        <StatTile icon="megaphone" label="Pengumuman" value={announcements.length} sub="terbaru" accent="text-emerald-600 bg-emerald-50" path="/warga/pengumuman" />
        {role === 'SISKAMLING' && (
          <StatTile icon="shield" label="Jadwal Ronda" value={upcomingSiskamling.length} sub="akan datang" accent="text-indigo-600 bg-indigo-50" path="/warga/siskamling" />
        )}
        {role === 'PKK' && (
          <StatTile icon="heart" label="Jadwal Posyandu" value={upcomingPosyandu.length} sub="akan datang" accent="text-rose-600 bg-rose-50" path="/warga/kesehatan" />
        )}
      </section>

      {/* Akses cepat */}
      <section className="mt-6">
        <h2 className="text-sm font-extrabold uppercase tracking-wider text-neutral-500">Akses Cepat</h2>
        <div className="mt-3 grid gap-5 md:grid-cols-3">
          {PORTAL_CARDS.filter((c) => c.title !== 'Profil Warga' || role === 'WARGA').map((item) => (
            <a key={item.title} href={item.path} className="block border border-neutral-900 bg-white p-5 hover:shadow-lg transition">
              <div className="grid h-11 w-11 place-items-center bg-black text-white">
                <Icon name={item.icon} className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-extrabold text-black">{item.title}</h3>
              <p className="mt-1 text-sm text-neutral-600">{item.description}</p>
            </a>
          ))}
        </div>
      </section>

      {/* Widget khusus role */}
      {role === 'SISKAMLING' && upcomingSiskamling.length > 0 && (
        <section className="mt-6">
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-neutral-500">Jadwal Ronda Terdekat Anda</h2>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {upcomingSiskamling.slice(0, 4).map((s) => (
              <div key={s.id_siskamling_schedule} className="border border-neutral-200 bg-white p-4 rounded-xl">
                <p className="font-extrabold text-black">{s.tanggal_jadwal}</p>
                <p className="text-xs text-neutral-500 mt-1">Shift {s.shift} · {s.petugas?.nama_lengkap || '-'}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {role === 'PKK' && upcomingPosyandu.length > 0 && (
        <section className="mt-6">
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-neutral-500">Jadwal Posyandu Terdekat</h2>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {upcomingPosyandu.slice(0, 4).map((p) => (
              <div key={p.id_posyandu_schedule} className="border border-neutral-200 bg-white p-4 rounded-xl">
                <p className="font-extrabold text-black">{p.nama_kegiatan}</p>
                <p className="text-xs text-neutral-500 mt-1">{p.tanggal_jadwal} {p.jam_mulai ? `· ${p.jam_mulai}` : ''} {p.lokasi ? `· ${p.lokasi}` : ''}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Statistik lingkungan (non-sensitif utk role warga/turunan) */}
      <section className="mt-6">
        <h2 className="text-sm font-extrabold uppercase tracking-wider text-neutral-500">Statistik Lingkungan</h2>
        <div className="mt-3">
          <DemographyCharts summary={summary} />
        </div>
      </section>

      {/* Informasi terkini */}
      <section className="mt-6 border-t border-neutral-900 pt-6">
        <div className="flex items-end justify-between gap-4 max-sm:flex-col max-sm:items-start">
          <div>
            <h2 className="text-xl font-extrabold text-black">Informasi Terkini</h2>
            <p className="mt-1 text-sm text-neutral-600">Berita dan agenda lingkungan terbaru.</p>
          </div>
          <Button variant="outline" className="shrink-0" onClick={() => window.location.assign('/warga/pengumuman')}>Lihat Semua</Button>
        </div>
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          {announcements.length === 0 ? (
            <p className="text-sm text-neutral-500 bg-white border p-4">Belum ada pengumuman.</p>
          ) : announcements.map((item) => (
            <article className="border border-neutral-200 bg-white p-5" key={item.id_announcement || item.id || item.judul}>
              <div className="flex items-center gap-2 text-xs font-bold text-neutral-500">
                <span className="uppercase text-sky-700">{item.kategori || 'Berita'}</span>
                <span>&bull;</span>
                <span>{item.created_at ? new Date(item.created_at).toLocaleDateString('id-ID') : (item.tanggal || '-')}</span>
              </div>
              <h3 className="mt-2 text-base font-extrabold leading-tight text-black">{item.judul}</h3>
              <p className="mt-2 text-sm leading-6 text-neutral-600 line-clamp-2">{item.isi}</p>
            </article>
          ))}
        </div>
      </section>
    </PageShell>
  )
}

function StatTile({ icon, label, value, sub, accent, path }) {
  const content = (
    <>
      <div className={`grid h-10 w-10 place-items-center rounded-full ${accent}`}>
        <Icon name={icon} className="h-5 w-5" />
      </div>
      <div className="mt-3">
        <p className="text-2xl font-extrabold text-black">{value}</p>
        <p className="text-sm font-bold text-neutral-700">{label}</p>
        <p className="text-xs text-neutral-400 mt-0.5">{sub}</p>
      </div>
    </>
  )
  return path ? (
    <a href={path} className="block border border-neutral-900 bg-white p-4 hover:shadow-md transition">{content}</a>
  ) : (
    <div className="border border-neutral-200 bg-white p-4">{content}</div>
  )
}

function toArray(res) {
  return Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []
}

function upcoming(arr) {
  const today = new Date().toISOString().split('T')[0]
  return arr.filter((x) => (x.tanggal_jadwal || '') >= today).sort((a, b) => (a.tanggal_jadwal || '').localeCompare(b.tanggal_jadwal || ''))
}

function AnnouncementPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const isKarangTaruna = getAuthRole() === 'KARANG_TARUNA'
  const [form, setForm] = useState({ judul: '', isi: '', kategori: 'LAINNYA', target: 'SEMUA_WARGA' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const confirm = useConfirm()
  const { showToast } = useToast()

  async function loadData() {
    const api = await import('../../services/api')
    const res = await api.getAnnouncements({ per_page: 100 })
    setItems(Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [])
    setLoading(false)
  }

  useEffect(() => {
    loadData().catch((err) => { console.error(err); setLoading(false) })
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.judul.trim() || !form.isi.trim()) {
      showToast('Judul dan isi pengumuman wajib diisi.', 'error')
      return
    }
    const approved = await confirm({
      title: 'Konfirmasi Simpan',
      message: `Yakin ingin menambahkan pengumuman "${form.judul}"?`,
      confirmLabel: 'Ya, Simpan',
    })
    if (!approved) return
    setIsSubmitting(true)
    try {
      const api = await import('../../services/api')
      await api.createAnnouncement({ ...form, status_approval: 'DRAFT' })
      showToast('Pengumuman berhasil ditambahkan.')
      setForm({ judul: '', isi: '', kategori: 'LAINNYA', target: 'SEMUA_WARGA' })
      loadData()
    } catch (err) {
      console.error(err)
      showToast(err.response?.data?.message || err.message || 'Gagal menyimpan pengumuman.', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <PageShell
      description="Baca informasi terbaru yang dibagikan pengurus lingkungan."
      eyebrow="Informasi"
      title="Pengumuman Warga"
    >
      <section className="mt-6 grid gap-4">
        {isKarangTaruna && (
          <form onSubmit={handleSubmit} className="border border-neutral-900 bg-white p-5">
            <h3 className="text-sm font-extrabold text-black">Tambah Pengumuman (Karang Taruna)</h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <label className="grid gap-1 text-xs font-semibold text-neutral-700">
                Judul <span className="text-red-500">*</span>
                <input className="h-9 rounded-md border border-neutral-300 px-3 text-sm focus:border-sky-500 focus:outline-none" value={form.judul} onChange={(e) => setForm({ ...form, judul: e.target.value })} required />
              </label>
              <label className="grid gap-1 text-xs font-semibold text-neutral-700">
                Kategori
                <select className="h-9 rounded-md border border-neutral-300 bg-white px-2 text-sm focus:border-sky-500 focus:outline-none" value={form.kategori} onChange={(e) => setForm({ ...form, kategori: e.target.value })}>
                  <option value="KESEHATAN">Kesehatan</option>
                  <option value="KEAMANAN">Keamanan</option>
                  <option value="INFRASTRUKTUR">Infrastruktur</option>
                  <option value="SOSIAL">Sosial</option>
                  <option value="LAINNYA">Lainnya</option>
                </select>
              </label>
            </div>
            <label className="mt-3 grid gap-1 text-xs font-semibold text-neutral-700">
              Isi <span className="text-red-500">*</span>
              <textarea className="min-h-24 resize-none rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none" value={form.isi} onChange={(e) => setForm({ ...form, isi: e.target.value })} required />
            </label>
            <Button className="mt-3" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Menyimpan...' : 'Simpan Pengumuman'}
            </Button>
          </form>
        )}
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
        isi_pesan: form.deskripsi
      })
      showToast('Pesan berhasil dikirim.')
      setForm({ kategori: 'MASUKAN', judul: '', deskripsi: '' })

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
            <Button 
              className="mt-5 h-10" 
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Mengirim...' : 'Kirim Pesan'}
            </Button>
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
  if (activePath === '/warga/password') return <PasswordPage />
  return (
      <PageShell eyebrow="Portal Warga" title="Dashboard Warga" description="Ringkasan informasi dan metrik terkini untuk Warga.">
        <WargaDashboard role={getAuthData()?.role || "WARGA"} />
      </PageShell>
    )
}

export function WargaPage() {
  const activeMenu = getCurrentMenu()

  return (
    <PortalLayout
      menuItems={wargaMenus}
      activePath={activeMenu.path}
      homePath="/warga"
      brandTitle="Portal Warga"
      brandSubtitle="Layanan Digital Masyarakat"
      footerLabel="Kenaran"
    >
      {renderPage(activeMenu.path)}
    </PortalLayout>
  )
}
