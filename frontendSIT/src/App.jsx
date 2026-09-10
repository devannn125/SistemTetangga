import { lazy, Suspense } from 'react'
import { useDashboardData } from './hooks/useDashboardData'
import { usePathname } from './services/router'

const DashboardPage = lazy(() => import('./pages/dashboard/DashboardPage').then((m) => ({ default: m.DashboardPage })))
const LandingPage = lazy(() => import('./pages/landing/LandingPage').then((m) => ({ default: m.LandingPage })))
const LoginPage = lazy(() => import('./pages/login/LoginPage').then((m) => ({ default: m.LoginPage })))
const RolePage = lazy(() => import('./pages/role/RolePage').then((m) => ({ default: m.RolePage })))
const WargaPage = lazy(() => import('./pages/warga/WargaPage').then((m) => ({ default: m.WargaPage })))
const RtPage = lazy(() => import('./pages/rt/RtPage').then((m) => ({ default: m.RtPage })))
const SekretarisPage = lazy(() => import('./pages/sek/SekretarisPage').then((m) => ({ default: m.SekretarisPage })))
const BendaharaPage = lazy(() => import('./pages/ben/BendaharaPage').then((m) => ({ default: m.BendaharaPage })))
const RwPage = lazy(() => import('./pages/rw/RwPage').then((m) => ({ default: m.RwPage })))
const DukuhPage = lazy(() => import('./pages/dukuh/DukuhPage').then((m) => ({ default: m.DukuhPage })))
const KelurahanPage = lazy(() => import('./pages/kelurahan/KelurahanPage').then((m) => ({ default: m.KelurahanPage })))
const AdminPage = lazy(() => import('./pages/admin/AdminPage').then((m) => ({ default: m.AdminPage })))

function PageLoader() {
  return <main className="grid min-h-screen place-items-center bg-neutral-100 text-sm text-neutral-600">Memuat halaman...</main>
}

function S({ children }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>
}

function App() {
  const pathname = usePathname()
  const isDashboard = pathname === '/dashboard' || pathname.startsWith('/dashboard/')
  const { data, isLoading, error } = useDashboardData({ enabled: isDashboard })

  if (isDashboard) return <S><DashboardPage data={data} error={error} isLoading={isLoading} /></S>
  if (pathname === '/login') return <S><LoginPage /></S>
  if (pathname.startsWith('/warga')) return <S><WargaPage /></S>
  if (pathname.startsWith('/rt')) return <S><RtPage /></S>
  if (pathname.startsWith('/rw')) return <S><RwPage /></S>
  if (pathname.startsWith('/dukuh')) return <S><DukuhPage /></S>
  if (pathname.startsWith('/kelurahan')) return <S><KelurahanPage /></S>
  if (pathname.startsWith('/sek')) return <S><SekretarisPage /></S>
  if (pathname.startsWith('/ben')) return <S><BendaharaPage /></S>
  if (pathname.startsWith('/admin')) return <S><AdminPage /></S>
  if (pathname.startsWith('/role')) {
    const roleParam = pathname.replace(/^\/role\/?/, '').split('/')[0]?.toLowerCase()
    if (roleParam === 'admin') return <S><AdminPage /></S>
    if (roleParam === 'dukuh') return <S><DukuhPage /></S>
    if (roleParam === 'rt') return <S><RtPage /></S>
    if (roleParam === 'rw') return <S><RwPage /></S>
    if (roleParam === 'lurah') return <S><KelurahanPage /></S>
    return <S><RolePage roleParam={roleParam} /></S>
  }
  return <S><LandingPage /></S>
}

export default App
