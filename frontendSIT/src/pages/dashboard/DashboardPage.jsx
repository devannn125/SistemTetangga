import { PageShell } from '../../components/layout/PageShell'
import { getAuthRole } from '../../services/authService'
import { Sidebar } from '../../components/layout/Sidebar'
import { Topbar } from '../../components/layout/Topbar'
import { WargaDataPage } from './WargaDataPage'

// Import Role Dashboards
import { LurahDashboard } from '../../components/dashboard/roles/LurahDashboard'
import { RwDashboard } from '../../components/dashboard/roles/RwDashboard'
import { RtDashboard } from '../../components/dashboard/roles/RtDashboard'
import { BendaharaDashboard } from '../../components/dashboard/roles/BendaharaDashboard'
import { SekretarisDashboard } from '../../components/dashboard/roles/SekretarisDashboard'
import { WargaDashboard } from '../../components/dashboard/roles/WargaDashboard'

function getWargaTab(pathname) {
  if (pathname.startsWith('/dashboard/warga/non-warga')) return 'nonWarga'
  if (pathname.startsWith('/dashboard/warga/tamu')) return 'tamu'
  if (pathname.startsWith('/dashboard/warga/rumah')) return 'rumah'
  return 'semua'
}

export function DashboardPage({ data, error, isLoading }) {
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

  const role = getAuthRole() || 'WARGA'
  const pathname = window.location.pathname
  const isWargaPath = pathname.startsWith('/dashboard/warga')

  // Render content based on role
  const renderDashboardContent = () => {
    switch (role) {
      case 'LURAH':
      case 'DUKUH':
        return <LurahDashboard />
      case 'RW':
        return <RwDashboard />
      case 'RT':
        return <RtDashboard />
      case 'BENDAHARA':
        return <BendaharaDashboard />
      case 'SEKRETARIS':
        return <SekretarisDashboard />
      case 'WARGA':
      case 'SISKAMLING':
      case 'PKK':
      case 'KARANG_TARUNA':
        return <WargaDashboard role={role} />
      default:
        return <LurahDashboard /> 
    }
  }

  return (
    <main className="grid min-h-screen grid-cols-[258px_minmax(0,1fr)] bg-neutral-100 text-neutral-900 max-xl:grid-cols-[224px_minmax(0,1fr)] max-md:block">
      <Sidebar items={data.navigation} user={data.user} />

      <section className="min-w-0">
        <Topbar />

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
      </section>
    </main>
  )
}
