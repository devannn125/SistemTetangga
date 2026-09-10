import { lazy, Suspense } from 'react'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { PageShell } from '@/components/layout/PageShell'

const HomePage = lazy(() => import('@/pages/sek/pages/HomePage'))
const WargaPage = lazy(() => import('@/pages/sek/pages/WargaPage'))
const LetterPage = lazy(() => import('@/pages/sek/pages/LetterPage'))
const InventoryPage = lazy(() => import('@/pages/sek/pages/InventoryPage'))
const PerumahanPage = lazy(() => import('@/pages/sek/pages/PerumahanPage'))
const InformasiStatistikPage = lazy(() => import('@/pages/sek/pages/InformasiStatistikPage'))
const GuestPage = lazy(() => import('@/pages/sek/pages/GuestPage'))
const FinancePage = lazy(() => import('@/pages/sek/pages/FinancePage'))
const FeeBillPage = lazy(() => import('@/pages/sek/pages/FeeBillPage'))
const SiskamlingPage = lazy(() => import('@/pages/sek/pages/SiskamlingPage'))
const RegulationPage = lazy(() => import('@/pages/sek/pages/RegulationPage'))
const OrganizationPage = lazy(() => import('@/pages/sek/pages/OrganizationPage'))
const MessagePage = lazy(() => import('@/pages/sek/pages/MessagePage'))
const SekretarisDashboard = lazy(() => import('@/components/dashboard/roles/SekretarisDashboard').then((m) => ({ default: m.SekretarisDashboard })))

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
      <Suspense fallback={<div className="p-8 text-center text-sm text-neutral-500">Memuat...</div>}>
        {renderPage(activeMenu.path)}
      </Suspense>
    </PortalLayout>
  )
}