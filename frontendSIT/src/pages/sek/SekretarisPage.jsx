import { PortalLayout } from '@/components/layout/PortalLayout'
import HomePage from '@/pages/sek/pages/HomePage'
import WargaPage from '@/pages/sek/pages/WargaPage'
import LetterPage from '@/pages/sek/pages/LetterPage'
import InventoryPage from '@/pages/sek/pages/InventoryPage'
import PerumahanPage from '@/pages/sek/pages/PerumahanPage'
import InformasiStatistikPage from '@/pages/sek/pages/InformasiStatistikPage'
import GuestPage from '@/pages/sek/pages/GuestPage'
import FinancePage from '@/pages/sek/pages/FinancePage'
import FeeBillPage from '@/pages/sek/pages/FeeBillPage'
import SiskamlingPage from '@/pages/sek/pages/SiskamlingPage'
import RegulationPage from '@/pages/sek/pages/RegulationPage'
import OrganizationPage from '@/pages/sek/pages/OrganizationPage'
import MessagePage from '@/pages/sek/pages/MessagePage'
import { SekretarisDashboard } from '@/components/dashboard/roles/SekretarisDashboard'
import { PageShell } from '@/components/layout/PageShell'

const sekMenus = [
  { label: 'Beranda', path: '/sek', icon: 'home' },
  { label: 'Data Warga', path: '/sek/warga', icon: 'users' },
  { label: 'Perumahan', path: '/sek/perumahan', icon: 'box' },
  { label: 'Tamu', path: '/sek/tamu', icon: 'idCard' },
  { label: 'Keuangan', path: '/sek/keuangan', icon: 'wallet' },
  { label: 'Iuran', path: '/sek/iuran', icon: 'receipt' },
  { label: 'Surat Keterangan', path: '/sek/surat', icon: 'file' },
  { label: 'Siskamling', path: '/sek/siskamling', icon: 'shield' },
  { label: 'Informasi & Statistik', path: '/sek/statistik', icon: 'trendingUp' },
  { label: 'Peraturan', path: '/sek/peraturan', icon: 'scroll' },
  { label: 'Struktur Organisasi', path: '/sek/organisasi', icon: 'building' },
  { label: 'Pesan & Kesan', path: '/sek/pesan', icon: 'message' },
  { label: 'Inventaris', path: '/sek/inventaris', icon: 'box' },
]

function getCurrentMenu() {
  const pathname = window.location.pathname
  return sekMenus.find((item) => item.path === pathname) || sekMenus[0]
}

function renderPage(activePath) {
  if (activePath === '/sek/surat') return <LetterPage />
  if (activePath === '/sek/inventaris') return <InventoryPage />
  if (activePath === '/sek/warga') return <WargaPage />
  if (activePath === '/sek/perumahan') return <PerumahanPage />
  if (activePath === '/sek/tamu') return <GuestPage />
  if (activePath === '/sek/keuangan') return <FinancePage />
  if (activePath === '/sek/iuran') return <FeeBillPage />
  if (activePath === '/sek/siskamling') return <SiskamlingPage />
  if (activePath === '/sek/statistik') return <InformasiStatistikPage />
  if (activePath === '/sek/peraturan') return <RegulationPage />
  if (activePath === '/sek/organisasi') return <OrganizationPage />
  if (activePath === '/sek/pesan') return <MessagePage />
  return (
      <PageShell eyebrow="Portal Sekretaris" title="Dashboard Sekretaris" description="Ringkasan informasi dan metrik terkini untuk Sekretaris.">
        <SekretarisDashboard  />
      </PageShell>
    )
}

export function SekretarisPage() {
  const activeMenu = getCurrentMenu()

  return (
    <PortalLayout
      menuItems={sekMenus}
      activePath={activeMenu.path}
      homePath="/sek"
      brandTitle="Portal Sekretaris"
      brandSubtitle="Panel Administrasi RT"
      footerLabel="Panel Sekretaris"
    >
      {renderPage(activeMenu.path)}
    </PortalLayout>
  )
}