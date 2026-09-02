import { PortalLayout } from '@/components/layout/PortalLayout'
import StrukturOrganisasi from '@/components/StrukturOrganisasi'
import DataPengurusPage from './pages/DataPengurusPage'
import HomePage from './pages/HomePage'
import { DukuhCitizenPage } from './pages/DukuhCitizenPage'
import { DukuhHousingPage } from './pages/DukuhHousingPage'
import { DukuhFinancePage } from './pages/DukuhFinancePage'
import { DukuhStatisticsPage } from './pages/DukuhStatisticsPage'
import { DukuhRegulationPage } from './pages/DukuhRegulationPage'
import { DukuhInventoryPage } from './pages/DukuhInventoryPage'

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

// Re-export utk KelurahanPage yang mengimpor sub-page dari file ini.
export { DukuhCitizenPage } from './pages/DukuhCitizenPage'
export { DukuhHousingPage } from './pages/DukuhHousingPage'
export { DukuhFinancePage } from './pages/DukuhFinancePage'
export { DukuhStatisticsPage } from './pages/DukuhStatisticsPage'
export { DukuhRegulationPage } from './pages/DukuhRegulationPage'
export { DukuhInventoryPage } from './pages/DukuhInventoryPage'
