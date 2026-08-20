import { DashboardPage } from './pages/dashboard/DashboardPage'
import { LandingPage } from './pages/landing/LandingPage'
import { LoginPage } from './pages/login/LoginPage'
import { RolePage } from './pages/role/RolePage'
import { WargaPage } from './pages/warga/WargaPage'
import { RtPage } from './pages/rt/RtPage'
import { SekretarisPage } from './pages/sek/SekretarisPage'
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

  if (pathname.startsWith('/sek')) {
    return <SekretarisPage />
  }

  if (pathname.startsWith('/role')) {
    const roleParam = pathname.replace(/^\/role\/?/, '').split('/')[0]?.toLowerCase()
    if (roleParam === 'admin' || roleParam === 'dukuh') {
      return <DashboardPage data={data} error={error} isLoading={isLoading} />
    }
    if (roleParam === 'rt') {
      return <RtPage />
    }
    return <RolePage roleParam={roleParam} />
  }

  return <LandingPage />
}

export default App