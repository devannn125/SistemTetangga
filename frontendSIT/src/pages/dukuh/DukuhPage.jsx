import { lazy, Suspense } from 'react'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { PageShell } from '@/components/layout/PageShell'

const StrukturOrganisasi = lazy(() => import('@/components/StrukturOrganisasi'))
const DataPengurusPage = lazy(() => import('./pages/DataPengurusPage'))
const DukuhCitizenPage = lazy(() => import('./pages/DukuhCitizenPage').then((m) => ({ default: m.DukuhCitizenPage })))
const DukuhHousingPage = lazy(() => import('./pages/DukuhHousingPage').then((m) => ({ default: m.DukuhHousingPage })))
const DukuhFinancePage = lazy(() => import('./pages/DukuhFinancePage').then((m) => ({ default: m.DukuhFinancePage })))
const DukuhStatisticsPage = lazy(() => import('./pages/DukuhStatisticsPage').then((m) => ({ default: m.DukuhStatisticsPage })))
const DukuhRegulationPage = lazy(() => import('./pages/DukuhRegulationPage').then((m) => ({ default: m.DukuhRegulationPage })))
const DukuhInventoryPage = lazy(() => import('./pages/DukuhInventoryPage').then((m) => ({ default: m.DukuhInventoryPage })))
const LurahDashboard = lazy(() => import('@/components/dashboard/roles/LurahDashboard').then((m) => ({ default: m.LurahDashboard })))



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
  return (
      <PageShell eyebrow="Portal Kepala Dukuh" title="Dashboard Kepala Dukuh" description="Ringkasan informasi dan metrik terkini untuk Kepala Dukuh.">
        <LurahDashboard  />
      </PageShell>
    )
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
      <Suspense fallback={<div className="p-8 text-center text-sm text-neutral-500">Memuat...</div>}>
        {renderPage(activeMenu.path)}
      </Suspense>
    </PortalLayout>
  )
}
