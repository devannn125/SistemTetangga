import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Icon } from '@/components/ui/Icon'
import { useDashboardData } from '@/hooks/useDashboardData'
import { dashboardData as fallbackData } from '@/data/dashboardData'

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#6366F1']

export function WargaDashboard({ role, data: propData }) {
  const { data: fetched, isLoading } = useDashboardData({ enabled: false })
  const data = propData || fetched || fallbackData

  // role could be WARGA, SISKAMLING, PKK, KARANG_TARUNA
  const isSiskamling = role === 'SISKAMLING'
  const isPkk = role === 'PKK' || role === 'KARANG_TARUNA'

  if (isLoading || !data) {
    return <div className="p-6 text-center text-sm text-neutral-500 animate-pulse">Memuat data real...</div>
  }

  // Gunakan data dari backend (meskipun backend belum menyediakan alokasi per-kategori, kita tampilkan yang ada di data agregat)
  // Misal untuk Warga, kita map financeCards untuk ditampilkan
  const financeCards = data.financeCards || []
  
  // Karena WargaDashboard membutuhkan informasi tracking pengaduan/surat dari user tersebut,
  // untuk saat ini kita menggunakan fallback jika backend tidak spesifik.
  const activeComplaints = data.summaryCards?.[1]?.value || 0
  const letterCount = data.summaryCards?.[3]?.value || 0

  return (
    <div className="space-y-6">
      
      {/* Khusus Role Ekstra */}
      {isSiskamling && (
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-blue-800 uppercase">Jadwal Ronda Anda</p>
              <h4 className="font-black text-lg text-blue-900 mt-1">Malam Ini, 22:00 - 02:00</h4>
            </div>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold text-xs shadow hover:bg-blue-700">Check-In</button>
          </div>
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-red-800 uppercase">Panic Button</p>
              <h4 className="font-medium text-sm text-red-900 mt-1">Lapor Darurat Keamanan</h4>
            </div>
            <button className="h-12 w-12 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg hover:bg-red-700 hover:scale-105 transition-transform">
              <Icon name="alert" className="h-6 w-6" />
            </button>
          </div>
        </div>
      )}

      {isPkk && (
        <div className="rounded-xl border border-pink-200 bg-pink-50 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold text-pink-800 uppercase">Agenda Kegiatan Terdekat</p>
            <h4 className="font-black text-lg text-pink-900 mt-1">Senam Sehat & Posyandu</h4>
            <p className="text-sm text-pink-700 mt-1">Minggu, 08:00 WIB di Balai RW</p>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-white text-pink-700 border border-pink-200 rounded-lg font-bold text-xs shadow-sm hover:bg-pink-100">To-Do List Panitia</button>
            <button className="px-4 py-2 bg-pink-600 text-white rounded-lg font-bold text-xs shadow hover:bg-pink-700">Buat Laporan</button>
          </div>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        {/* Widget Keuangan Singkat */}
        <div className="md:col-span-1 grid gap-4">
          <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3 text-neutral-600 mb-4">
              <Icon name="wallet" className="h-5 w-5" />
              <h3 className="text-sm font-bold">Status Iuran Lingkungan</h3>
            </div>
            {financeCards[1] && (
              <div>
                <p className="text-xs text-neutral-500">{financeCards[1].title}</p>
                <h4 className="text-2xl font-black text-black">{financeCards[1].value}</h4>
              </div>
            )}
            <a href="/warga/iuran" className="mt-4 block text-center rounded-lg bg-neutral-100 py-2 text-xs font-bold text-neutral-700 hover:bg-neutral-200">
              Bayar Sekarang
            </a>
          </div>

          <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
            <h3 className="mb-4 text-sm font-bold text-neutral-700">Pelacakan Proses</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-neutral-800">Pengaduan Anda ({activeComplaints})</span>
                  <span className="text-[10px] font-bold text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full">Proses</span>
                </div>
                <div className="w-full bg-neutral-100 rounded-full h-1.5"><div className="bg-amber-500 h-1.5 rounded-full w-[30%]"></div></div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-neutral-800">Surat Pengantar ({letterCount})</span>
                  <span className="text-[10px] font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full">Verifikasi RT</span>
                </div>
                <div className="w-full bg-neutral-100 rounded-full h-1.5"><div className="bg-blue-500 h-1.5 rounded-full w-[60%]"></div></div>
              </div>
            </div>
          </div>
        </div>

        {/* Feed Pengumuman & Alokasi */}
        <div className="md:col-span-2 grid gap-6 sm:grid-cols-2">
          
          <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
            <h3 className="mb-4 text-sm font-bold text-neutral-700">Pengumuman Terbaru</h3>
            <div className="space-y-4">
              {data.activities?.map((act, i) => (
                <div key={i} className="flex gap-3 items-start border-b border-neutral-100 pb-3 last:border-0 last:pb-0">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                    <Icon name={act.icon} className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-neutral-800">{act.title}</h4>
                    <p className="mt-0.5 text-[10px] text-neutral-500">{act.description}</p>
                    <span className="text-[9px] text-neutral-400 mt-1 block">{act.time}</span>
                  </div>
                </div>
              ))}
              {data.activities?.length === 0 && <p className="text-xs text-neutral-500 text-center">Belum ada pengumuman terbaru.</p>}
            </div>
          </div>

          <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm flex flex-col">
            <h3 className="mb-4 text-sm font-bold text-neutral-700">Transparansi Kategori Pengaduan</h3>
            <div className="flex-1 flex items-center justify-center min-h-[150px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data.complaintsByCategory || []} cx="50%" cy="50%" innerRadius={40} outerRadius={60} dataKey="total" nameKey="label" paddingAngle={2}>
                    {(data.complaintsByCategory || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <p className="text-[10px] text-center text-neutral-400 mt-2">Daftar kategori pengaduan terbanyak di wilayah Anda.</p>
          </div>

        </div>
      </div>
    </div>
  )
}
