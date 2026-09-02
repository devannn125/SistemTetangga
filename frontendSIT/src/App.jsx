import { DashboardPage } from './pages/dashboard/DashboardPage'
import { LandingPage } from './pages/landing/LandingPage'
import { LoginPage } from './pages/login/LoginPage'
import { RolePage } from './pages/role/RolePage'
import { WargaPage } from './pages/warga/WargaPage'
import { RtPage } from './pages/rt/RtPage'
import { SekretarisPage } from './pages/sek/SekretarisPage'
import { BendaharaPage } from './pages/ben/BendaharaPage'
import { RwPage } from './pages/rw/RwPage'
import { DukuhPage } from './pages/dukuh/DukuhPage'
import { KelurahanPage } from './pages/kelurahan/KelurahanPage'
import { AdminPage } from './pages/admin/AdminPage'
import { useDashboardData } from './hooks/useDashboardData'
import { usePathname } from './services/router'

function App() {
  const { data, isLoading, error } = useDashboardData()
  const pathname = usePathname()

  if (pathname === '/dashboard' || pathname.startsWith('/dashboard/')) {
    return <DashboardPage data={data} error={error} isLoading={isLoading} />
  }

  if (pathname === '/login') {
    return <LoginPage />
  }

  if (pathname.startsWith('/warga')) {
    return <WargaPage />
  }

  if (pathname.startsWith('/rt')) {
    return <RtPage />
  }

  if (pathname.startsWith('/rw')) {
    return <RwPage />
  }

  if (pathname.startsWith('/dukuh')) {
    return <DukuhPage />
  }

  if (pathname.startsWith('/kelurahan')) {
    return <KelurahanPage />
  }

  if (pathname.startsWith('/sek')) {
    return <SekretarisPage />
  }

  if (pathname.startsWith('/ben')) {
    return <BendaharaPage />
  }

  if (pathname.startsWith('/admin')) {
    return <AdminPage />
  }

  if (pathname.startsWith('/role')) {
    const roleParam = pathname.replace(/^\/role\/?/, '').split('/')[0]?.toLowerCase()
    if (roleParam === 'admin') {
      return <AdminPage />
    }
    if (roleParam === 'dukuh') {
      return <DukuhPage />
    }
    if (roleParam === 'rt') {
      return <RtPage />
    }
    if (roleParam === 'rw') {
      return <RwPage />
    }
    if (roleParam === 'lurah') {
      return <KelurahanPage />
    }
    return <RolePage roleParam={roleParam} />
  }

  return <LandingPage />
}

export default App
