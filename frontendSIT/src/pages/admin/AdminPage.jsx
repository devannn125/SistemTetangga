import { lazy, Suspense } from 'react'
import { PortalLayout } from '@/components/layout/PortalLayout'

const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage'))
const AdminMasterDataPage = lazy(() => import('./pages/AdminMasterDataPage'))
const AdminWilayahPage = lazy(() => import('./pages/AdminWilayahPage'))
const AdminUsersPage = lazy(() => import('./pages/AdminUsersPage'))
const AdminSettingsPage = lazy(() => import('./pages/AdminSettingsPage'))
const AdminPerangkatPage = lazy(() => import('./pages/AdminPerangkatPage'))
const AdminStrukturPage = lazy(() => import('@/components/StrukturOrganisasi'))
const AdminPortalPage = lazy(() => import('./pages/AdminPortalPage'))

const AdminMenus = [
  { label: 'Beranda Sistem', path: '/admin', icon: 'server' },
  { label: 'Manajemen Portal', path: '/admin/portal', icon: 'globe' },
  { label: 'Struktur Organisasi', path: '/admin/struktur', icon: 'building' },
  { label: 'Perangkat Desa', path: '/admin/perangkat', icon: 'users' },
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
  if (activePath === '/admin/struktur') return <AdminStrukturPage />
  if (activePath === '/admin/perangkat') return <AdminPerangkatPage />
  if (activePath === '/admin/master-data') return <AdminMasterDataPage />
  if (activePath === '/admin/wilayah') return <AdminWilayahPage />
  if (activePath === '/admin/users') return <AdminUsersPage />
  if (activePath === '/admin/settings') return <AdminSettingsPage />
  if (activePath === '/admin/portal') return <AdminPortalPage />
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
      <Suspense fallback={<div className="p-8 text-center text-sm text-neutral-500">Memuat...</div>}>
        {renderPage(activeMenu.path)}
      </Suspense>
    </PortalLayout>
  )
}


