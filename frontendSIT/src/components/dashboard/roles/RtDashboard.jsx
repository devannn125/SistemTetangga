import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts'
import { Icon } from '@/components/ui/Icon'
import { useDashboardData } from '@/hooks/useDashboardData'

const GAUGE_COLORS = ['#10B981', '#E5E7EB'] // Green and Gray

export function RtDashboard() {
  const { data, isLoading } = useDashboardData()

  if (isLoading || !data) {
    return <div className="p-6 text-center text-sm text-neutral-500 animate-pulse">Memuat data real...</div>
  }

  // Real data mapping
  const saldoKas = data.summaryCards?.[2]?.value || 'Rp 0'
  const saldoNote = data.summaryCards?.[2]?.note || '+Rp0 pemasukan'
  const pendingLetters = data.summaryCards?.[3]?.value || 0
  const letterDetail = data.summaryCards?.[3]?.note || '0 disetujui'

  // Demography mapping from summary card string "12 L, 15 P" (This is a simplified parse, backend currently returns it as string)
  const detailStr = data.summaryCards?.[0]?.detail || ''
  let countL = 120; let countP = 135;
  const match = detailStr.match(/(\d+)\sL,\s(\d+)\sP/)
  if (match) {
    countL = parseInt(match[1])
    countP = parseInt(match[2])
  }
  const mockDemografi = [
    { name: 'Laki-laki', value: countL },
    { name: 'Perempuan', value: countP },
  ]
  const COLORS_DEMO = ['#3B82F6', '#EC4899']

  const slaValue = 85 // Static for now, as backend SLA logic is complex
  
  // Use cashflow as a proxy for activity if Siskamling data is unavailable
  const mockSiskamling = data.cashflow?.map(c => ({ day: c.month, insiden: c.expense > 0 ? 1 : 0 })) || []

  return (
    <div className="space-y-6">
      {/* Smart Notification */}
      <div className="flex items-center justify-between rounded-xl border border-blue-200 bg-blue-50 p-4 shadow-sm">
        <div className="flex items-center gap-3 text-blue-800">
          <Icon name="bell" className="h-5 w-5" />
          <p className="text-sm font-medium"><strong>Smart Reminder:</strong> {pendingLetters > 0 ? `Ada ${pendingLetters} permohonan surat menunggu diproses.` : 'Tidak ada permohonan surat mendesak saat ini.'}</p>
        </div>
        {pendingLetters > 0 && <a href="/rt/surat" className="rounded-full bg-blue-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-blue-700">Proses Surat</a>}
      </div>

      {/* Mini Stats (Keuangan & SLA) */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-neutral-500">Saldo Kas Lingkungan</p>
            <h3 className="text-2xl font-black text-black">{saldoKas}</h3>
            <p className="text-xs text-green-600 font-bold mt-1">{saldoNote}</p>
          </div>
          <Icon name="wallet" className="h-10 w-10 text-neutral-200" />
        </div>
        
        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-neutral-500">Surat Menunggu</p>
            <h3 className="text-2xl font-black text-amber-500">{pendingLetters}</h3>
            <p className="text-xs text-neutral-400 mt-1">{letterDetail}</p>
          </div>
          <Icon name="file" className="h-10 w-10 text-amber-100" />
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm flex items-center gap-4">
          <div className="h-16 w-16 shrink-0 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={[{value: slaValue}, {value: 100-slaValue}]} innerRadius={22} outerRadius={30} dataKey="value" startAngle={90} endAngle={-270} stroke="none">
                  {[{value: slaValue}, {value: 100-slaValue}].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={GAUGE_COLORS[index]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <span className="absolute inset-0 flex items-center justify-center text-xs font-black">{slaValue}%</span>
          </div>
          <div>
            <p className="text-sm font-bold text-neutral-500">Tingkat SLA RT</p>
            <p className="text-[10px] text-neutral-400 leading-tight">Responsibilitas pengurus dalam menyelesaikan aduan/surat.</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-sm font-bold text-neutral-700">Demografi Warga Aktif</h3>
          <div className="flex items-center">
            <div className="h-48 flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={mockDemografi} cx="50%" cy="50%" innerRadius={45} outerRadius={65} dataKey="value" paddingAngle={5}>
                    {mockDemografi.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS_DEMO[index % COLORS_DEMO.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-1/3 space-y-4">
              {mockDemografi.map((entry, index) => (
                <div key={entry.name}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="h-2 w-2 rounded-full" style={{backgroundColor: COLORS_DEMO[index]}}></span>
                    <span className="text-xs text-neutral-500">{entry.name}</span>
                  </div>
                  <p className="font-bold">{entry.value} Jiwa</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-sm font-bold text-neutral-700">Aktivitas Terakhir</h3>
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
  )
}
