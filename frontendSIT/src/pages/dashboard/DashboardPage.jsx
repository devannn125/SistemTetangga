import { useState, useEffect, lazy, Suspense } from 'react'
import { getAuthRole } from '../../services/authService'
import { Sidebar } from '../../components/layout/Sidebar'
import { Topbar } from '../../components/layout/Topbar'

const WargaDataPage = lazy(() => import('./WargaDataPage').then((m) => ({ default: m.WargaDataPage })))
const LurahDashboard = lazy(() => import('../../components/dashboard/roles/LurahDashboard').then((m) => ({ default: m.LurahDashboard })))
const RwDashboard = lazy(() => import('../../components/dashboard/roles/RwDashboard').then((m) => ({ default: m.RwDashboard })))
const RtDashboard = lazy(() => import('../../components/dashboard/roles/RtDashboard').then((m) => ({ default: m.RtDashboard })))
const BendaharaDashboard = lazy(() => import('../../components/dashboard/roles/BendaharaDashboard').then((m) => ({ default: m.BendaharaDashboard })))
const SekretarisDashboard = lazy(() => import('../../components/dashboard/roles/SekretarisDashboard').then((m) => ({ default: m.SekretarisDashboard })))
const WargaDashboard = lazy(() => import('../../components/dashboard/roles/WargaDashboard').then((m) => ({ default: m.WargaDashboard })))

function getWargaTab(pathname) {
  if (pathname.startsWith('/dashboard/warga/non-warga')) return 'nonWarga'
  if (pathname.startsWith('/dashboard/warga/tamu')) return 'tamu'
  if (pathname.startsWith('/dashboard/warga/rumah')) return 'rumah'
  return 'semua'
}

export function DashboardPage({ data, error, isLoading }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  useEffect(() => {
    if (sidebarOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [sidebarOpen])
  const role = data?.user?.roleCode || getAuthRole() || 'WARGA'
  const pathname = window.location.pathname
  const isWargaPath = pathname.startsWith('/dashboard/warga')

  if (isLoading) {
    return (
      <main className="grid min-h-screen place-items-center bg-neutral-100 text-sm text-neutral-600">
        Memuat dashboard...
      </main>
    )
  }

  if (error || !data) {
    return (
      <main className="grid min-h-screen place-items-center bg-neutral-100 p-6 text-center">
        <div className="rounded-xl border border-red-200 bg-white p-6 text-red-600">
          Gagal memuat dashboard. Silakan coba lagi.
        </div>
      </main>
    )
  }

  // Render content based on role — pass data from App.jsx to avoid extra /dashboard fetches in role dashboards
  const renderDashboardContent = () => {
    switch (role) {
      case 'LURAH':
      case 'DUKUH':
        return <LurahDashboard data={data} />
      case 'RW':
        return <RwDashboard data={data} />
      case 'RT':
        return <RtDashboard data={data} />
      case 'BENDAHARA':
        return <BendaharaDashboard data={data} />
      case 'SEKRETARIS':
        return <SekretarisDashboard data={data} />
      case 'WARGA':
      case 'SISKAMLING':
      case 'PKK':
      case 'KARANG_TARUNA':
        return <WargaDashboard role={role} data={data} />
      default:
        return <LurahDashboard data={data} />
    }
  }

  return (
    <main className="grid min-h-screen grid-cols-[258px_minmax(0,1fr)] bg-neutral-100 text-neutral-900 max-xl:grid-cols-[224px_minmax(0,1fr)] max-md:block">
      <Sidebar items={data.navigation} user={data.user} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Tutup menu"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
        />
      )}

      <section className="min-w-0">
        <Topbar onMenuClick={() => setSidebarOpen((v) => !v)} menuOpen={sidebarOpen} />

        <Suspense fallback={<div className="p-8 text-center text-sm text-neutral-500">Memuat...</div>}>
          {isWargaPath ? (
            <WargaDataPage key={pathname} activeTab={getWargaTab(pathname)} />
          ) : (
            <div className="min-w-0 px-6 py-6 max-md:px-4 max-md:py-5">
              <section className="mb-6">
                <h2 className="mb-1 text-2xl font-extrabold leading-tight text-black">
                  {role === 'LURAH' || role === 'DUKUH' ? 'Helicopter View' : `Dashboard ${role}`}
                </h2>
                <p className="text-sm text-neutral-700">Selamat datang kembali, {data.user?.name || 'Pengguna'}. Ringkasan data {data.area} hari ini.</p>
              </section>
              {renderDashboardContent()}
            </div>
          )}
        </Suspense>
      </section>
    </main>
  )
}
