import { Sidebar } from '../../components/layout/Sidebar'
import { Topbar } from '../../components/layout/Topbar'
import { ActivityPanel } from '../../components/dashboard/ActivityPanel'
import { CashflowChart } from '../../components/dashboard/CashflowChart'
import { ComplaintPanel } from '../../components/dashboard/ComplaintPanel'
import { FinanceCard } from '../../components/dashboard/FinanceCard'
import { QuickActions } from '../../components/dashboard/QuickActions'
import { ResidentRequestsPanel } from '../../components/dashboard/ResidentRequestsPanel'
import { StatCard } from '../../components/dashboard/StatCard'

function getResidentRequests() {
  try {
    return JSON.parse(localStorage.getItem('residentRequests') || '[]')
  } catch {
    return []
  }
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

  const residentRequests = getResidentRequests()

  return (
    <main className="grid min-h-screen grid-cols-[258px_minmax(0,1fr)] bg-neutral-100 text-neutral-900 max-xl:grid-cols-[224px_minmax(0,1fr)] max-md:block">
      <Sidebar items={data.navigation} user={data.user} />

      <section className="min-w-0">
        <Topbar />

        <div className="min-w-0 px-6 py-6 max-md:px-4 max-md:py-5">
          <section className="mb-6">
            <h2 className="mb-1 text-2xl font-extrabold leading-tight text-black">Selamat datang kembali</h2>
            <p className="text-sm text-neutral-700">Ringkasan data {data.area} hari ini</p>
          </section>

          <ResidentRequestsPanel items={residentRequests} />

          <section className="grid grid-cols-4 gap-4 max-xl:grid-cols-2 max-md:grid-cols-1" aria-label="Ringkasan data">
            {data.summaryCards.map((item) => (
              <StatCard item={item} key={item.title} />
            ))}
          </section>

          <section className="mt-6 grid grid-cols-3 gap-4 max-xl:grid-cols-2 max-md:grid-cols-1" aria-label="Ringkasan iuran">
            {data.financeCards.map((item) => (
              <FinanceCard item={item} key={item.title} />
            ))}
          </section>

          <section className="mt-6 grid grid-cols-[minmax(360px,1fr)_minmax(300px,1fr)] gap-4 max-xl:grid-cols-1">
            <CashflowChart data={data.cashflow} />
            <ComplaintPanel items={data.complaintsByCategory} />
          </section>

          <section className="mt-6 grid grid-cols-[minmax(360px,1fr)_420px] gap-4 max-xl:grid-cols-1">
            <ActivityPanel items={data.activities} />
            <QuickActions items={data.quickActions} />
          </section>
        </div>
      </section>
    </main>
  )
}
