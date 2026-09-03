import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'
import { Icon } from '@/components/ui/Icon'
import { useDashboardData } from '@/hooks/useDashboardData'

const COLORS = ['#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#8B5CF6']

export function LurahDashboard() {
  const { data, isLoading } = useDashboardData()

  if (isLoading || !data) {
    return <div className="p-6 text-center text-sm text-neutral-500 animate-pulse">Memuat data real...</div>
  }

  // Fallbacks if data doesn't perfectly match
  const totalWarga = data.summaryCards?.[0]?.value || 0
  const detailWarga = data.summaryCards?.[0]?.detail || '0 L, 0 P'
  const suratPending = data.summaryCards?.[3]?.value || 0
  
  const cashflowData = data.cashflow || []
  const complaintsData = data.complaintsByCategory || []

  return (
    <div className="space-y-6">
      {/* AI Insight & Summary */}
      <div className="grid gap-6 md:grid-cols-4">
        <div className="md:col-span-3 grid gap-6 sm:grid-cols-2">
          <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-bold text-neutral-500">Total Warga</p>
            <h3 className="text-3xl font-black text-blue-600">{totalWarga}</h3>
            <p className="mt-1 text-xs text-neutral-400">{detailWarga}</p>
          </div>
          <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-bold text-neutral-500">Surat & Izin (Pending)</p>
            <h3 className="text-3xl font-black text-amber-500">{suratPending}</h3>
            <p className="mt-1 text-xs text-neutral-400">Membutuhkan persetujuan Anda</p>
          </div>
        </div>
        <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-6 shadow-sm flex flex-col justify-center">
          <div className="flex items-center gap-2 text-indigo-700 mb-2">
            <Icon name="search" className="h-5 w-5" />
            <span className="font-extrabold text-sm uppercase tracking-wider">AI Insights</span>
          </div>
          <p className="text-sm font-medium text-indigo-900">
            {complaintsData.length > 0 
              ? `Pengaduan terbanyak saat ini pada kategori ${complaintsData[0].label}.`
              : 'Belum ada tren pengaduan signifikan bulan ini.'}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Chart 1: Cashflow (Income vs Expense) */}
        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-sm font-bold text-neutral-700">Tren Kas Bulanan (Juta)</h3>
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
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {/* Chart 2: Status Pengaduan */}
          <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-sm font-bold text-neutral-700">Kategori Pengaduan</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={complaintsData} dataKey="total" nameKey="label" cx="50%" cy="50%" innerRadius={40} outerRadius={60}>
                    {complaintsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
              {complaintsData.map((entry, index) => (
                <div key={entry.label} className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span className="text-neutral-600">{entry.label} ({entry.total})</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick List / Aktivitas Terbaru */}
          <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-sm font-bold text-neutral-700">Aktivitas Terbaru</h3>
            <ul className="space-y-4">
              {data.activities?.map((act, i) => (
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
          </div>
        </div>
      </div>
    </div>
  )
}
