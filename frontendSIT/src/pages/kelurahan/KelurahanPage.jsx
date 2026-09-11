import { useState, useEffect, lazy, Suspense } from 'react'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { PageShell } from '@/components/layout/PageShell'
import { getAuthData } from '@/services/authService'
import { getCitizens, getComplaints, getLetterRequests } from '@/services/api'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Icon } from '@/components/ui/Icon'
import { useDashboardData } from '@/hooks/useDashboardData'

const StrukturOrganisasi = lazy(() => import('@/components/StrukturOrganisasi'))
const LurahDashboard = lazy(() => import('@/components/dashboard/roles/LurahDashboard').then((m) => ({ default: m.LurahDashboard })))
const DukuhCitizenPage = lazy(() => import('@/pages/dukuh/pages/DukuhCitizenPage').then((m) => ({ default: m.DukuhCitizenPage })))
const DukuhHousingPage = lazy(() => import('@/pages/dukuh/pages/DukuhHousingPage').then((m) => ({ default: m.DukuhHousingPage })))
const DukuhFinancePage = lazy(() => import('@/pages/dukuh/pages/DukuhFinancePage').then((m) => ({ default: m.DukuhFinancePage })))
const DukuhStatisticsPage = lazy(() => import('@/pages/dukuh/pages/DukuhStatisticsPage').then((m) => ({ default: m.DukuhStatisticsPage })))
const DukuhRegulationPage = lazy(() => import('@/pages/dukuh/pages/DukuhRegulationPage').then((m) => ({ default: m.DukuhRegulationPage })))
const DukuhInventoryPage = lazy(() => import('@/pages/dukuh/pages/DukuhInventoryPage').then((m) => ({ default: m.DukuhInventoryPage })))
const DataKepalaDukuhPage = lazy(() => import('@/pages/kelurahan/pages/DataKepalaDukuhPage'))
const WilayahDukuhPage = lazy(() => import('@/pages/kelurahan/pages/WilayahDukuhPage'))

// Menu portal Kelurahan — hanya modul yang memiliki halaman & akses role LURAH.
const KelurahanMenus = [
  { label: 'Beranda', path: '/kelurahan', icon: 'home' },
  { label: 'Data Warga', path: '/kelurahan/warga', icon: 'users' },
  { label: 'Wilayah Dukuh', path: '/kelurahan/wilayah-dukuh', icon: 'building' },
  { label: 'Data Kepala Dukuh', path: '/kelurahan/data-dukuh', icon: 'users' },
  { label: 'Perumahan', path: '/kelurahan/perumahan', icon: 'box' },
  { label: 'Keuangan', path: '/kelurahan/keuangan', icon: 'wallet' },
  { label: 'Informasi & Statistik', path: '/kelurahan/statistik', icon: 'trendingUp' },
  { label: 'Peraturan', path: '/kelurahan/peraturan', icon: 'scroll' },
  { label: 'Struktur Organisasi', path: '/kelurahan/struktur', icon: 'building' },
  { label: 'Inventaris', path: '/kelurahan/inventaris', icon: 'box' },
]

function getCurrentMenu() {
  const pathname = window.location.pathname
  return KelurahanMenus.find((item) => item.path === pathname) || KelurahanMenus[0]
}

const CHART_COLORS = ['#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#8B5CF6']

function KelurahanHomePage() {
  const authUser = getAuthData()
  const [counts, setCounts] = useState({ warga: 0, complaints: 0, letters: 0 })
  const [loading, setLoading] = useState(true)
  const { data: dash, isLoading: dashLoading } = useDashboardData({ enabled: true })

  useEffect(() => {
    Promise.all([
      getCitizens({ per_page: 200 }).catch(() => null),
      getComplaints({ per_page: 200 }).catch(() => null),
      getLetterRequests({ per_page: 200 }).catch(() => null),
    ]).then(([resCit, resComp, resLetters]) => {
      const cit = Array.isArray(resCit?.data) ? resCit.data : Array.isArray(resCit) ? resCit : []
      const comp = Array.isArray(resComp?.data) ? resComp.data : Array.isArray(resComp) ? resComp : []
      const letr = Array.isArray(resLetters?.data) ? resLetters.data : Array.isArray(resLetters) ? resLetters : []
      setCounts({ warga: cit.length, complaints: comp.length, letters: letr.length })
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const cashflowData = dash?.cashflow || []
  const complaintsData = dash?.complaintsByCategory || []
  const activities = dash?.activities || []
  const totalWargaDash = dash?.summaryCards?.[0]?.value
  const wargaNote = totalWargaDash != null ? `${totalWargaDash} Jiwa` : null

  return (
    <PageShell
      eyebrow="Portal Kelurahan"
      title={`Selamat datang, ${authUser?.nama_users || 'Kepala Lurah'}`}
      description="Pusat monitoring dan pengelolaan administrasi tingkat kelurahan/dukuh."
    >
      <section className="mt-8 grid gap-5 md:grid-cols-3">
        <article className="rounded-2xl border border-neutral-300 bg-white p-6 shadow-sm">
          <p className="text-sm font-bold uppercase text-neutral-500">Total Warga</p>
          <p className="mt-3 text-2xl font-extrabold text-black">{loading ? '...' : (wargaNote ?? `${counts.warga} Jiwa`)}</p>
          <p className="mt-2 text-xs text-neutral-600">Beserta kartu keluarga (KK) terdaftar — cakupan {dash?.kelurahanName || 'kelurahan'}.</p>
        </article>
        <article className="rounded-2xl border border-neutral-300 bg-white p-6 shadow-sm">
          <p className="text-sm font-bold uppercase text-neutral-500">Pengaduan</p>
          <p className="mt-3 text-2xl font-extrabold text-black">{loading ? '...' : counts.complaints} Tiket</p>
          <p className="mt-2 text-xs text-neutral-600">Seluruh pengaduan terdaftar di wilayah.</p>
        </article>
        <article className="rounded-2xl border border-neutral-300 bg-white p-6 shadow-sm">
          <p className="text-sm font-bold uppercase text-neutral-500">Surat Terbit</p>
          <p className="mt-3 text-2xl font-extrabold text-black">{loading ? '...' : counts.letters} Dokumen</p>
          <p className="mt-2 text-xs text-neutral-600">Total surat keterangan warga terdaftar.</p>
        </article>
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-neutral-300 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-sm font-bold text-neutral-700">Tren Kas Bulanan (Juta)</h3>
          {dashLoading ? (
            <div className="h-64 animate-pulse rounded bg-neutral-100" />
          ) : cashflowData.length === 0 ? (
            <p className="py-16 text-center text-sm text-neutral-400">Belum ada transaksi keuangan di wilayah ini.</p>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cashflowData}>
                  <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{ fill: '#f5f5f5' }} />
                  <Bar dataKey="income" name="Pemasukan" fill="#10B981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expense" name="Pengeluaran" fill="#EF4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
          <p className="mt-2 text-xs text-neutral-400">Data scoped: {dash?.scopeIds ? `${dash.scopeIds.length} wilayah` : 'global'} — sesuai role {dash?.user?.roleCode || 'LURAH'}.</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="rounded-2xl border border-neutral-300 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-sm font-bold text-neutral-700">Kategori Pengaduan</h3>
            {dashLoading ? (
              <div className="h-48 animate-pulse rounded bg-neutral-100" />
            ) : complaintsData.length === 0 ? (
              <p className="py-12 text-center text-sm text-neutral-400">Belum ada pengaduan.</p>
            ) : (
              <>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={complaintsData} dataKey="total" nameKey="label" cx="50%" cy="50%" innerRadius={40} outerRadius={60}>
                        {complaintsData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 grid grid-cols-1 gap-2 text-xs">
                  {complaintsData.map((entry, index) => (
                    <div key={entry.label} className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }} />
                      <span className="text-neutral-600">{entry.label} ({entry.total})</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="rounded-2xl border border-neutral-300 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-sm font-bold text-neutral-700">Aktivitas Terbaru</h3>
            {dashLoading ? (
              <div className="space-y-3">
                {[0,1,2].map((i) => <div key={i} className="h-12 animate-pulse rounded bg-neutral-100" />)}
              </div>
            ) : activities.length === 0 ? (
              <p className="text-sm text-neutral-400">Belum ada aktivitas.</p>
            ) : (
              <ul className="space-y-4">
                {activities.map((act, i) => (
                  <li key={i} className="flex gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                      <Icon name={act.icon} className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-neutral-900">{act.title}</p>
                      <p className="text-[10px] text-neutral-500 line-clamp-1">{act.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>
    </PageShell>
  )
}

function renderPage(activePath) {
  if (activePath === '/kelurahan') return <KelurahanHomePage />
  if (activePath === '/kelurahan/warga') return <DukuhCitizenPage />
  if (activePath === '/kelurahan/wilayah-dukuh') return <WilayahDukuhPage />
  if (activePath === '/kelurahan/data-dukuh') return <DataKepalaDukuhPage />
  if (activePath === '/kelurahan/perumahan') return <DukuhHousingPage />
  if (activePath === '/kelurahan/keuangan') return <DukuhFinancePage />
  if (activePath === '/kelurahan/statistik') return <DukuhStatisticsPage />
  if (activePath === '/kelurahan/peraturan') return <DukuhRegulationPage />
  if (activePath === '/kelurahan/struktur') return <StrukturOrganisasi />
  if (activePath === '/kelurahan/inventaris') return <DukuhInventoryPage />
  return <KelurahanHomePage />
}

export function KelurahanPage() {
  const activeMenu = getCurrentMenu()

  return (
    <PortalLayout
      menuItems={KelurahanMenus}
      activePath={activeMenu.path}
      homePath="/kelurahan"
      brandTitle="Portal Kelurahan"
      brandSubtitle="Panel Kepala Lurah"
      footerLabel="Panel Kepala Lurah"
    >
      <Suspense fallback={<div className="p-8 text-center text-sm text-neutral-500">Memuat...</div>}>
        {renderPage(activeMenu.path)}
      </Suspense>
    </PortalLayout>
  )
}

