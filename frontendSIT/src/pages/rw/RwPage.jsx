import { lazy, Suspense } from 'react'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { PageShell } from '@/components/layout/PageShell'

const HomePage = lazy(() => import('./pages/HomePage'))
const RwCitizenPage = lazy(() => import('./pages/RwCitizenPage'))
const RwHousingPage = lazy(() => import('./pages/RwHousingPage'))
const RwComplaintPage = lazy(() => import('./pages/RwComplaintPage'))
const RwFinancePage = lazy(() => import('./pages/RwFinancePage'))
const RwLetterPage = lazy(() => import('./pages/RwLetterPage'))
const RwStatisticsPage = lazy(() => import('./pages/RwStatisticsPage'))
const RwRegulationPage = lazy(() => import('./pages/RwRegulationPage'))
const RwOrganizationPage = lazy(() => import('./pages/RwOrganizationPage'))
const RwInventoryPage = lazy(() => import('./pages/RwInventoryPage'))
const RwDashboard = lazy(() => import('@/components/dashboard/roles/RwDashboard').then((m) => ({ default: m.RwDashboard })))

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
      <Suspense fallback={<div className="p-8 text-center text-sm text-neutral-500">Memuat...</div>}>
        {renderPage(activeMenu.path)}
      </Suspense>
    </PortalLayout>
  )
}
