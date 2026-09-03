import { PortalLayout } from '@/components/layout/PortalLayout'
import HomePage from './pages/HomePage'
import RwCitizenPage from './pages/RwCitizenPage'
import RwHousingPage from './pages/RwHousingPage'
import RwComplaintPage from './pages/RwComplaintPage'
import RwFinancePage from './pages/RwFinancePage'
import RwLetterPage from './pages/RwLetterPage'
import RwStatisticsPage from './pages/RwStatisticsPage'
import RwRegulationPage from './pages/RwRegulationPage'
import RwOrganizationPage from './pages/RwOrganizationPage'
import RwInventoryPage from './pages/RwInventoryPage'
import { RwDashboard } from '@/components/dashboard/roles/RwDashboard'
import { PageShell } from '@/components/layout/PageShell'

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
  return (
      <PageShell eyebrow="Portal Ketua RW" title="Dashboard Ketua RW" description="Ringkasan informasi dan metrik terkini untuk Ketua RW.">
        <RwDashboard  />
      </PageShell>
    )
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
