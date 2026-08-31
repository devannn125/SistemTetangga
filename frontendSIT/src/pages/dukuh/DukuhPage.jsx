import { PortalLayout } from '@/components/layout/PortalLayout'
import { PageShell } from '@/components/layout/PageShell'
import { usePathname } from '@/services/router'
import { getAuthData } from '@/services/authService'
import DukuhOrganizationPage from './pages/DukuhOrganizationPage'
import { Icon } from '@/components/ui/Icon'

const dukuhMenus = [
  {
    category: 'MENU UTAMA',
    items: [
      { id: 'dashboard', label: 'Beranda Dukuh', path: '/dukuh', icon: <Icon type="heroicon" name="HomeIcon" className="w-5 h-5 text-neutral-400" /> },
      { id: 'organisasi', label: 'Struktur Organisasi', path: '/dukuh/organisasi', icon: <Icon type="heroicon" name="UserGroupIcon" className="w-5 h-5 text-neutral-400" /> },
    ]
  }
]

function getCurrentMenu() {
  const pathname = usePathname()
  for (const cat of dukuhMenus) {
    for (const item of cat.items) {
      if (item.path === pathname) return item
    }
  }
  return dukuhMenus[0].items[0]
}

function HomePage() {
  const authUser = getAuthData()
  return (
    <PageShell
      eyebrow="Beranda"
      title={`Selamat Datang, ${authUser?.nama_users || 'Dukuh'}`}
      description="Portal informasi dan layanan Kelurahan / Dukuh."
    >
      <section className="mt-8">
        <div className="rounded-xl border border-neutral-300 bg-white p-8">
          <p className="text-sm font-semibold text-neutral-600">
            Anda dapat mengakses berbagai modul Kelurahan melalui menu di sebelah kiri.
          </p>
        </div>
      </section>
    </PageShell>
  )
}

function renderPage(activePath) {
  if (activePath === '/dukuh/organisasi') return <DukuhOrganizationPage />
  return <HomePage />
}

export function DukuhPage() {
  const activeMenu = getCurrentMenu()

  return (
    <PortalLayout
      menuItems={dukuhMenus}
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
