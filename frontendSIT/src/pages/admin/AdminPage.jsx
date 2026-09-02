import { PortalLayout } from '@/components/layout/PortalLayout'
import { PageShell } from '@/components/layout/PageShell'
import AdminDashboardPage from './pages/AdminDashboardPage'
import AdminMasterDataPage from './pages/AdminMasterDataPage'
import AdminWilayahPage from './pages/AdminWilayahPage'
import AdminUsersPage from './pages/AdminUsersPage'
import AdminSettingsPage from './pages/AdminSettingsPage'

const AdminMenus = [
  { label: 'Beranda Sistem', path: '/admin', icon: 'server' },
  { label: 'Master Data', path: '/admin/master-data', icon: 'database' },
  { label: 'Manajemen Wilayah', path: '/admin/wilayah', icon: 'map' },
  { label: 'Manajemen Pengguna', path: '/admin/users', icon: 'users' },
  { label: 'Pengaturan Sistem', path: '/admin/settings', icon: 'settings' },
]

function getCurrentMenu() {
  const pathname = window.location.pathname
  return AdminMenus.find((item) => item.path === pathname) || AdminMenus[0]
}

function renderPage(activePath) {
  if (activePath === '/admin/master-data') return <AdminMasterDataPage />
  if (activePath === '/admin/wilayah') return <AdminWilayahPage />
  if (activePath === '/admin/users') return <AdminUsersPage />
  if (activePath === '/admin/settings') return <AdminSettingsPage />
  return <AdminDashboardPage />
}

export function AdminPage() {
  const activeMenu = getCurrentMenu()

  return (
    <PortalLayout
      menuItems={AdminMenus}
      activePath={activeMenu.path}
      homePath='/admin'
      brandTitle='Super Admin'
      brandSubtitle='Administrator Sistem'
      footerLabel='Sistem Administrator'
    >
      {renderPage(activeMenu.path)}
    </PortalLayout>
  )
}

