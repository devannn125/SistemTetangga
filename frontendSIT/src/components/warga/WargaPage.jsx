import { Icon } from '../ui/Icon'

const wargaMenus = [
  { label: 'Beranda', path: '/warga', icon: 'home' },
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
  localStorage.removeItem('authRole')
  localStorage.removeItem('authNik')
  window.location.assign('/login')
}

function WargaSidebar({ activePath }) {
  return (
    <aside className="sticky top-0 flex h-screen w-[250px] shrink-0 flex-col border-r border-neutral-900 bg-white max-md:static max-md:h-auto max-md:w-full max-md:border-r-0 max-md:border-b">
      <div className="flex h-15 border-b border-neutral-900 px-4 py-5">
        <a className="flex items-center gap-2 text-sm font-extrabold text-black no-underline" href="/warga">
          <Icon name="building" className="h-5 w-5" />
          SIW MASYARAKAT
        </a>
      </div>

      <div className="px-4 py-6">
        <p className="text-xl font-extrabold leading-tight text-black">Portal Warga</p>
        <p className="mt-1 text-xs font-semibold uppercase leading-5 text-neutral-500">Layanan Digital Masyarakat</p>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3 max-md:grid max-md:grid-cols-2" aria-label="Menu portal warga">
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
  return (
    <header className="flex h-15 items-center justify-end border-b border-neutral-900 bg-white px-6 ">
      <button
        className="flex h-9 items-center gap-2 border border-black bg-black px-4 text-xs font-extrabold text-white transition hover:border-sky-600 hover:bg-sky-600"
        onClick={handleLogout}
        type="button"
      >
        <Icon name="logout" className="h-4 w-4" />
        Keluar
      </button>
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

function LetterPage() {
  return (
    <PageShell
      description="Ajukan berbagai keperluan surat pengantar dan keterangan secara digital."
      eyebrow="Pengajuan"
      title="Pengajuan Surat Resmi"
    >
      <section className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
        <form className="border border-neutral-900 bg-white p-5">
          <h2 className="text-base font-extrabold text-black">Lengkapi Data</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-bold text-black">
              Nama Lengkap Pemohon
              <input className="h-11 border border-neutral-400 px-3 outline-0 focus:border-sky-600" placeholder="Nama lengkap" />
            </label>
            <label className="grid gap-2 text-sm font-bold text-black">
              NIK
              <input className="h-11 border border-neutral-400 px-3 outline-0 focus:border-sky-600" placeholder="16 digit NIK" />
            </label>
          </div>
          <label className="mt-4 grid gap-2 text-sm font-bold text-black">
            Keperluan Secara Detail
            <textarea className="min-h-28 resize-none border border-neutral-400 px-3 py-3 outline-0 focus:border-sky-600" placeholder="Jelaskan tujuan pembuatan surat..." />
          </label>
          <div className="mt-5 flex justify-end gap-3">
            <button className="h-10 border border-neutral-900 px-5 text-xs font-extrabold" type="button">Batal</button>
            <button className="h-10 border border-black bg-black px-5 text-xs font-extrabold text-white" type="button">Ajukan Surat</button>
          </div>
        </form>

        <aside className="border border-neutral-900 bg-white p-5">
          <h2 className="text-base font-extrabold text-black">Panduan Pengajuan</h2>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-neutral-600">
            <li>Pilih jenis surat sesuai kebutuhan.</li>
            <li>Lengkapi data dan tujuan dengan benar.</li>
            <li>Tunggu validasi dari pengurus RT/RW.</li>
          </ul>
        </aside>
      </section>
    </PageShell>
  )
}

function AnnouncementPage() {
  return (
    <PageShell
      description="Baca informasi terbaru yang dibagikan pengurus lingkungan."
      eyebrow="Informasi"
      title="Pengumuman Warga"
    >
      <section className="mt-6 grid gap-4">
        {announcements.map((item) => (
          <article className="border border-neutral-900 bg-white p-5" key={item.title}>
            <p className="text-xs font-extrabold uppercase text-neutral-500">{item.type} - {item.date}</p>
            <h2 className="mt-2 text-lg font-extrabold text-black">{item.title}</h2>
            <p className="mt-3 text-sm leading-6 text-neutral-600">Informasi lengkap akan diperbarui oleh pengurus RT/RW.</p>
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
  return (
    <PageShell
      description="Sampaikan aspirasi, kritik membangun, atau apresiasi kepada pengurus lingkungan."
      eyebrow="Suara Warga"
      title="Pesan & Kesan"
    >
      <section className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <form className="border border-neutral-900 bg-white p-5">
          <label className="grid gap-2 text-sm font-bold text-black">
            Kategori Pesan
            <select className="h-11 border border-neutral-400 px-3 outline-0 focus:border-sky-600">
              <option>Aspirasi / Usulan</option>
              <option>Keluhan</option>
              <option>Apresiasi</option>
            </select>
          </label>
          <label className="mt-4 grid gap-2 text-sm font-bold text-black">
            Isi Pesan
            <textarea className="min-h-40 resize-none border border-neutral-400 px-3 py-3 outline-0 focus:border-sky-600" placeholder="Tuliskan detail pesan Anda di sini..." />
          </label>
          <button className="mt-5 h-10 border border-black bg-black px-5 text-xs font-extrabold text-white" type="button">
            Kirim Pesan
          </button>
        </form>

        <aside className="border border-neutral-900 bg-white p-5">
          <h2 className="text-base font-extrabold text-black">Kesan Warga</h2>
          <div className="mt-4 space-y-3">
            <article className="border border-neutral-300 p-4">
              <p className="text-sm font-extrabold text-black">Bpk. Budi Santoso</p>
              <p className="mt-2 text-sm leading-6 text-neutral-600">Terima kasih atas perbaikan lampu jalan di area blok A.</p>
            </article>
            <article className="border border-neutral-300 p-4">
              <p className="text-sm font-extrabold text-black">Anonim</p>
              <p className="mt-2 text-sm leading-6 text-neutral-600">Mohon dipertimbangkan jadwal pengangkutan sampah tambahan.</p>
            </article>
          </div>
        </aside>
      </section>
    </PageShell>
  )
}

function renderPage(activePath) {
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
            <span>&copy; 2024 SIW Masyarakat - Sistem Informasi Warga</span>
            <span>Kontak Pengurus | Bantuan | Kebijakan Privasi</span>
          </div>
        </footer>
      </section>
    </main>
  )
}
