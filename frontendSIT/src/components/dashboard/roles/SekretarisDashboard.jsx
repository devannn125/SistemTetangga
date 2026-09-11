import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { Icon } from '@/components/ui/Icon'
import { useDashboardData } from '@/hooks/useDashboardData'
import { dashboardData as fallbackData } from '@/data/dashboardData'

export function SekretarisDashboard({ data: propData }) {
  const { data: fetched, isLoading } = useDashboardData({ enabled: false })
  const data = propData || fetched || fallbackData

  if (isLoading || !data) {
    return <div className="p-6 text-center text-sm text-neutral-500 animate-pulse">Memuat data real...</div>
  }

  const pendingLetters = data.summaryCards?.[3]?.value || 0
  const suratMingguan = data.suratMingguan || [
    { day: 'Sen', masuk: 0, selesai: 0 },
    { day: 'Sel', masuk: 0, selesai: 0 },
    { day: 'Rab', masuk: 0, selesai: 0 },
    { day: 'Kam', masuk: 0, selesai: 0 },
    { day: 'Jum', masuk: 0, selesai: 0 },
    { day: 'Sab', masuk: 0, selesai: 0 },
    { day: 'Min', masuk: 0, selesai: 0 },
  ]

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-3">
        <div className="col-span-3 md:col-span-2 rounded-xl border border-indigo-200 bg-indigo-50 p-6 shadow-sm flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-indigo-700 mb-2">
              <Icon name="file" className="h-5 w-5" />
              <span className="font-extrabold text-sm uppercase tracking-wider">AI Draft Assistant</span>
            </div>
            <h3 className="text-xl font-bold text-indigo-900">Bantu saya buatkan draft surat...</h3>
            <div className="mt-3 flex gap-2">
              <span className="bg-white text-indigo-700 px-3 py-1 rounded-full text-xs font-medium border border-indigo-200 cursor-pointer hover:bg-indigo-100">Undangan Rapat Warga</span>
              <span className="bg-white text-indigo-700 px-3 py-1 rounded-full text-xs font-medium border border-indigo-200 cursor-pointer hover:bg-indigo-100">Laporan Bulanan RT</span>
            </div>
          </div>
          <Icon name="search" className="h-16 w-16 text-indigo-200 opacity-50" />
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm flex flex-col justify-center items-center text-center">
          <p className="text-sm font-bold text-neutral-500">Menunggu Approval</p>
          <h3 className="text-3xl font-black text-amber-500 my-2">{pendingLetters}</h3>
          <p className="text-xs text-neutral-400">Surat Pengantar & Domisili</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-sm font-bold text-neutral-700">Volume Pengajuan Surat (Mingguan)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={suratMingguan}>
                <XAxis dataKey="day" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip cursor={{fill: '#f5f5f5'}} />
                <Bar dataKey="masuk" name="Masuk" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="selesai" name="Selesai" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-sm font-bold text-neutral-700">Manajemen Dokumen Warga Terakhir</h3>
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
