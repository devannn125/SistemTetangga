import { useEffect, useState } from 'react'
import { PageShell } from '@/components/layout/PageShell'
import { Icon } from '@/components/ui/Icon'
import { getDashboardStatistics, getHouses, getStatistikSummary } from '@/services/api'
import { BarChart, Bar as RechartsBar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const COLORS = ['#0284c7', '#059669', '#d97706', '#dc2626', '#7c3aed', '#475569']
const AGE_CODES = ['balita', 'batita', 'anak', 'produktif', 'lansia']

function ProgressBar({ label, value, total }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0
  return (
    <div className="rounded-lg px-3 py-2">
      <div className="flex items-center justify-between text-xs font-bold text-neutral-700">
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <div className="mt-1.5 h-2 w-full rounded-full bg-neutral-200">
        <div className="h-2 rounded-full bg-sky-600" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

function downloadCsv(demographicSummary) {
  if (!demographicSummary) return
  const headers = ['Kategori Statistik', 'Jumlah / Nilai']
  const body = [
    ['Total Warga', demographicSummary.total_warga || 0],
    ['Total KK', demographicSummary.total_kk || 0],
    ['Warga DPT Pemilu', demographicSummary.dpt || 0],
    ['Berdomisili di Luar', demographicSummary.domisili_luar || 0],
    ['Alamat KK di Luar', demographicSummary.kk_luar || 0],
  ]
  const csv = [headers, ...body]
    .map((line) => line.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(','))
    .join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'rekap-statistik-dukuh.csv'
  link.click()
  URL.revokeObjectURL(url)
}

export function DukuhStatisticsPage() {
  const [stats, setStats] = useState({ total_warga: '0', total_rumah: '0', total_pengaduan: '0', kas_rt: 'Rp 0' })
  const [cashflowData, setCashflowData] = useState([])
  const [complaintData, setComplaintData] = useState([])
  const [demographicSummary, setDemographicSummary] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      getDashboardStatistics().catch(() => null),
      getHouses({ per_page: 100 }).catch(() => null),
      getStatistikSummary().catch(() => null)
    ]).then(([resDashboard, resHouses, resDemographic]) => {
      const dData = resDashboard?.data || resDashboard
      const housesData = resHouses?.data || resHouses
      const demogData = resDemographic?.data || resDemographic

      let totalRumah = '0'
      if (Array.isArray(housesData)) totalRumah = housesData.length.toString()

      if (dData) {
        if (dData.summaryCards) {
          setStats({
            total_warga: dData.summaryCards[0]?.value || '0',
            total_pengaduan: dData.summaryCards[1]?.value || '0',
            kas_rt: dData.summaryCards[2]?.value || 'Rp 0',
            total_rumah: totalRumah
          })
        }
        if (dData.cashflow) setCashflowData(dData.cashflow)
        if (dData.complaintsByCategory) setComplaintData(dData.complaintsByCategory)
      }
      if (demogData) setDemographicSummary(demogData)
      setLoading(false)
    }).catch(err => {
      console.error(err)
      setLoading(false)
    })
  }, [])

  const ageTotal = demographicSummary ? demographicSummary.total_warga - (demographicSummary.tanpa_ttl || 0) : 0
  const profesiTotal = demographicSummary?.profesi?.reduce((acc, p) => acc + p.total, 0) ?? 0

  return (
    <PageShell
      eyebrow="Statistik"
      title="Statistik & Analitik Kependudukan"
      description="Dashboard tinjauan demografi warga dan laporan grafik di tingkat Dukuh."
    >
      <section className="mt-8 space-y-6">
        <div className="flex justify-end">
          <button
            onClick={() => downloadCsv(demographicSummary)}
            className="rounded-full bg-black px-4 py-2 text-xs font-extrabold uppercase text-white hover:bg-neutral-900 transition flex items-center gap-2"
          >
            <Icon name="download" className="h-4 w-4" />
            Ekspor Rekap CSV
          </button>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-neutral-300 bg-white p-6 shadow-sm">
            <h3 className="text-xs font-bold uppercase text-neutral-500">Total Warga</h3>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-black">{loading ? '-' : stats.total_warga}</span>
              <span className="text-sm font-semibold text-neutral-500">Jiwa</span>
            </div>
          </div>
          <div className="rounded-2xl border border-neutral-300 bg-white p-6 shadow-sm">
            <h3 className="text-xs font-bold uppercase text-neutral-500">Total Rumah & Kos</h3>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-black">{loading ? '-' : stats.total_rumah}</span>
              <span className="text-sm font-semibold text-neutral-500">Unit</span>
            </div>
          </div>
          <div className="rounded-2xl border border-neutral-300 bg-white p-6 shadow-sm">
            <h3 className="text-xs font-bold uppercase text-neutral-500">Pengaduan Aktif</h3>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-black">{loading ? '-' : stats.total_pengaduan}</span>
              <span className="text-sm font-semibold text-neutral-500">Tiket</span>
            </div>
          </div>
          <div className="rounded-2xl border border-neutral-300 bg-white p-6 shadow-sm">
            <h3 className="text-xs font-bold uppercase text-neutral-500">Kas RT Agregat</h3>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-2xl font-extrabold text-black">{loading ? '-' : stats.kas_rt}</span>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-neutral-300 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-black mb-6">Arus Kas Bulanan (Juta Rupiah)</h2>
            <div className="h-64 w-full">
              {loading ? (
                <div className="h-full flex items-center justify-center text-sm text-neutral-500">Memuat grafik...</div>
              ) : cashflowData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-sm text-neutral-500">Belum ada data.</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={cashflowData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#737373' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#737373' }} />
                    <Tooltip cursor={{fill: '#f5f5f5'}} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                    <RechartsBar dataKey="income" name="Pemasukan" fill="#059669" radius={[4, 4, 0, 0]} maxBarSize={40} />
                    <RechartsBar dataKey="expense" name="Pengeluaran" fill="#dc2626" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-neutral-300 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-black mb-6">Kategori Pengaduan</h2>
            <div className="h-64 w-full">
              {loading ? (
                <div className="h-full flex items-center justify-center text-sm text-neutral-500">Memuat grafik...</div>
              ) : complaintData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-sm text-neutral-500">Belum ada data.</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={complaintData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="total"
                      nameKey="label"
                    >
                      {complaintData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend iconType="circle" layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        {/* Demographics details */}
        {demographicSummary && (
          <div className="space-y-6">
            {demographicSummary.usia && (
              <div className="border-2 border-neutral-900 bg-white p-5">
                <h3 className="text-xs font-extrabold uppercase tracking-[0.12em] text-neutral-500">Distribusi Usia Warga</h3>
                <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {AGE_CODES.map((kode) => (
                    <ProgressBar
                      key={kode}
                      label={demographicSummary.usia[kode]?.label || kode}
                      value={demographicSummary.usia[kode]?.total || 0}
                      total={ageTotal}
                    />
                  ))}
                </div>
              </div>
            )}

            {demographicSummary.profesi?.length > 0 && (
              <div className="border-2 border-neutral-900 bg-white p-5">
                <h3 className="text-xs font-extrabold uppercase tracking-[0.12em] text-neutral-500">Distribusi Profesi</h3>
                <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {demographicSummary.profesi.map((p) => (
                    <ProgressBar key={p.nama} label={p.nama} value={p.total} total={profesiTotal} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </section>
    </PageShell>
  )
}
