import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { Icon } from '@/components/ui/Icon'
import { useDashboardData } from '@/hooks/useDashboardData'
import { dashboardData as fallbackData } from '@/data/dashboardData'

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#6366F1', '#EC4899', '#8B5CF6']

export function RwDashboard({ data: propData }) {
  const { data: fetched, isLoading } = useDashboardData({ enabled: false })
  const data = propData || fetched || fallbackData

  if (isLoading || !data) {
    return <div className="p-6 text-center text-sm text-neutral-500 animate-pulse">Memuat data real...</div>
  }

  const complaintsData = data.complaintsByCategory || []
  const activeComplaints = data.summaryCards?.[1]?.value || 0

  const kepatuhanData = data.cashflow?.map(c => ({
    name: c.month,
    lunas: c.income,
    nunggak: c.expense
  })) || []

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 shadow-sm col-span-3 md:col-span-1 flex flex-col justify-center">
          <div className="flex items-center gap-2 text-red-700 mb-2">
            <Icon name="alert" className="h-5 w-5" />
            <span className="font-extrabold text-sm uppercase tracking-wider">Perhatian RW</span>
          </div>
          <h3 className="text-3xl font-black text-red-600 mb-1">{activeComplaints} Aduan</h3>
          <p className="mt-1 text-xs text-neutral-600">Pengaduan &gt; 3 hari belum selesai ditangani oleh RT, perlu eskalasi.</p>
        </div>

        <div className="col-span-3 md:col-span-2 grid gap-6 sm:grid-cols-2">
          {data.summaryCards?.map((card, i) => i !== 1 && i < 3 && (
            <div key={i} className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-neutral-500">{card.title}</p>
                <h3 className="text-2xl font-black text-black">{card.value}</h3>
                <p className="text-xs text-neutral-400 mt-1">{card.note}</p>
              </div>
              <div className={`flex h-12 w-12 items-center justify-center rounded-full bg-${card.accent}-50 text-${card.accent}-600`}>
                <Icon name={card.icon} className="h-6 w-6" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-sm font-bold text-neutral-700">Kepatuhan Iuran (Pemasukan vs Pengeluaran per Bulan)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={kepatuhanData}>
                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip cursor={{fill: '#f5f5f5'}} />
                <Legend />
                <Bar dataKey="lunas" name="Pemasukan" stackId="a" fill="#10B981" />
                <Bar dataKey="nunggak" name="Pengeluaran" stackId="a" fill="#EF4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-sm font-bold text-neutral-700">Kategori Pengaduan Wilayah</h3>
          <div className="flex h-64 items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={complaintsData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="total" nameKey="label" paddingAngle={2}>
                  {complaintsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{fontSize: '12px'}} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
