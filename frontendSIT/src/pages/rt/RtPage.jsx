import { PortalLayout } from '../../components/layout/PortalLayout'
import { PageShell } from '../../components/layout/PageShell'
import { getAuthData } from '../../services/authService'

// Menu disusun mengikuti tabel "Rekomendasi Struktur Sidebar per Role" untuk Ketua RT
// (Dashboard full, Data Warga CRUD, Perumahan, Tamu approve, Keuangan read,
// Iuran approve, Surat Keterangan approve, Siskamling CRUD jadwal,
// Informasi & Statistik CRUD+export, Peraturan CRUD, Struktur Organisasi CRUD,
// Pesan Warga, User Management RT scope)
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
    return <PageShell eyebrow="Tamu" title="Approval Tamu" description="Persetujuan pendaftaran tamu/penghuni tidak tetap. Sedang dikembangkan." />
  if (activePath === '/rt/keuangan')
    return <PageShell eyebrow="Keuangan" title="Keuangan RT" description="Ringkasan kas RT (read-only, input oleh Bendahara). Sedang dikembangkan." />
  if (activePath === '/rt/iuran')
    return <PageShell eyebrow="Iuran" title="Approval Iuran Warga" description="Persetujuan dan pemantauan status iuran. Sedang dikembangkan." />
  if (activePath === '/rt/surat')
    return <PageShell eyebrow="Surat Keterangan" title="Approval Surat" description="Persetujuan final permohonan surat setelah verifikasi Sekretaris. Sedang dikembangkan." />
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