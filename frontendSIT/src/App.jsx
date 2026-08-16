import { DashboardPage } from './components/dashboard/DashboardPage'
import { LandingPage } from './components/landing/LandingPage'
import { LoginPage } from './components/login/LoginPage'
import { RolePage } from './components/role/RolePage'
import { WargaPage } from './components/warga/WargaPage'
import { useDashboardData } from './hooks/useDashboardData'

function App() {
  const { data, isLoading, error } = useDashboardData()
  const pathname = window.location.pathname

  if (pathname === '/dashboard') {
    return <DashboardPage data={data} error={error} isLoading={isLoading} />
  }

  if (pathname === '/login') {
    return <LoginPage />
  }

  if (pathname.startsWith('/warga')) {
    return <WargaPage />
  }

  if (pathname.startsWith('/role')) {
    const roleParam = pathname.replace(/^\/role\/?/, '').split('/')[0]?.toLowerCase()
    if (roleParam === 'admin' || roleParam === 'dukuh') {
      return <DashboardPage data={data} error={error} isLoading={isLoading} />
    }
    return <RolePage roleParam={roleParam} />
  }

  return <LandingPage />
}

export default App
