import { PortalLayout } from '@/components/layout/PortalLayout'
import StrukturOrganisasi from '@/components/StrukturOrganisasi'
import HomePage from './pages/HomePage'
import KeuanganPage from './pages/KeuanganPage'
import IuranPage from './pages/IuranPage'
import WargaReadPage from './pages/WargaReadPage'
import PerumahanPage from './pages/PerumahanPage'
import InventoryPage from './pages/InventoryPage'
import { BendaharaDashboard } from '@/components/dashboard/roles/BendaharaDashboard'
import { PageShell } from '@/components/layout/PageShell'

const benMenus = [
  { label: 'Beranda', path: '/ben', icon: 'home' },
  { label: 'Keuangan', path: '/ben/keuangan', icon: 'wallet' },
  { label: 'Iuran', path: '/ben/iuran', icon: 'receipt' },
  { label: 'Data Warga', path: '/ben/warga', icon: 'users' },
  { label: 'Perumahan', path: '/ben/perumahan', icon: 'box' },
  { label: 'Inventaris', path: '/ben/inventaris', icon: 'box' },
  { label: 'Struktur Organisasi', path: '/ben/struktur', icon: 'building' },
]

function getCurrentMenu() {
  const pathname = window.location.pathname
  return benMenus.find((item) => item.path === pathname) || benMenus[0]
}

function renderPage(activePath) {
  if (activePath === '/ben/keuangan') return <KeuanganPage />
  if (activePath === '/ben/iuran') return <IuranPage />
  if (activePath === '/ben/warga') return <WargaReadPage />
  if (activePath === '/ben/perumahan') return <PerumahanPage />
  if (activePath === '/ben/inventaris') return <InventoryPage />
  if (activePath === '/ben/struktur') return <StrukturOrganisasi />
  return (
      <PageShell eyebrow="Portal Bendahara" title="Dashboard Bendahara" description="Ringkasan informasi dan metrik terkini untuk Bendahara.">
        <BendaharaDashboard  />
      </PageShell>
    )
}

export function BendaharaPage() {
  const activeMenu = getCurrentMenu()

  return (
    <PortalLayout
      menuItems={benMenus}
      activePath={activeMenu.path}
      homePath="/ben"
      brandTitle="Portal Bendahara"
      brandSubtitle="Panel Keuangan RT"
      footerLabel="Panel Bendahara"
    >
      {renderPage(activeMenu.path)}
    </PortalLayout>
  )
}
