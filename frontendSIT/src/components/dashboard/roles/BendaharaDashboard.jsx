import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts'
import { Icon } from '@/components/ui/Icon'
import { useDashboardData } from '@/hooks/useDashboardData'

export function BendaharaDashboard() {
  const { data, isLoading } = useDashboardData()

  if (isLoading || !data) {
    return <div className="p-6 text-center text-sm text-neutral-500 animate-pulse">Memuat data real...</div>
  }

  const cashflowData = data.cashflow || []
  
  // Real targets based on API return, but fallback to strings parsing
  const iuranTerkumpulStr = data.financeCards?.[0]?.value || 'Rp 0'
  const tunggakanStr = data.financeCards?.[1]?.value || 'Rp 0'
  const kepatuhanStr = data.financeCards?.[2]?.value || '0%'

  return (
    <div className="space-y-6">
      {/* Target & Pending */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm flex flex-col justify-center">
          <div className="flex justify-between items-end mb-2">
            <div>
              <p className="text-sm font-bold text-neutral-500">Iuran Terkumpul</p>
              <h3 className="text-2xl font-black text-black mt-1">{iuranTerkumpulStr}</h3>
            </div>
            <p className="text-xs text-neutral-400 font-medium">Tingkat Kepatuhan: {kepatuhanStr}</p>
          </div>
          <div className="h-4 w-full bg-neutral-100 rounded-full overflow-hidden">
            <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: kepatuhanStr }} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm flex flex-col justify-center items-center text-center">
            <h3 className="text-2xl font-black text-blue-600">{iuranTerkumpulStr}</h3>
            <p className="text-xs font-bold text-neutral-500 mt-1">Lunas</p>
          </div>
          <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm flex flex-col justify-center items-center text-center">
            <h3 className="text-2xl font-black text-amber-500">{tunggakanStr}</h3>
            <p className="text-xs font-bold text-neutral-500 mt-1">Tunggakan (Belum Dibayar)</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-sm font-bold text-neutral-700">Tren Cashflow Wilayah (Jutaan Rupiah)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={cashflowData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="income" name="Pemasukan" stroke="#10B981" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
                <Line type="monotone" dataKey="expense" name="Pengeluaran" stroke="#EF4444" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-sm font-bold text-neutral-700">Aktivitas Terakhir</h3>
          <div className="overflow-x-auto">
             <ul className="space-y-4">
              {data.activities?.map((act, i) => (
                <li key={i} className="flex gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-50 text-green-600">
                    <Icon name={act.icon} className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-neutral-900">{act.title}</p>
                    <p className="text-[10px] text-neutral-500 line-clamp-1">{act.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
