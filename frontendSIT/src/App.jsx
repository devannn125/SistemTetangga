import { DashboardPage } from './components/dashboard/DashboardPage'
import { LandingPage } from './components/landing/LandingPage'
import { LoginPage } from './components/login/LoginPage'
import { useDashboardData } from './hooks/useDashboardData'

function App() {
  const { data, isLoading, error } = useDashboardData()

  if (window.location.pathname === '/dashboard') {
    return <DashboardPage data={data} error={error} isLoading={isLoading} />
  }

  if (window.location.pathname === '/login') {
    return <LoginPage />
  }

  return <LandingPage />
}

export default App
