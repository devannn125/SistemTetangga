import { useState, useEffect } from 'react'
import { PageShell } from '../../../components/layout/PageShell'
import { getDashboardStatistics, getStatistikSummary } from '../../../services/api'
import { BarChart, Bar as RechartsBar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const COLORS = ['#0284c7', '#059669', '#d97706', '#dc2626', '#7c3aed', '#475569']

const CATEGORY_CARDS = [
  { kodeLabel: 'K', label: 'Informasi Keluarga', field: 'total_kk', sensitive: false, desc: 'Jumlah KK aktif beserta anggota per KK' },
  { kodeLabel: 'a', label: 'Warga Berhak Pemilu (DPT)', field: 'dpt', sensitive: false, desc: 'WNI, usia >= 17 th atau pernah kawin' },
  { kodeLabel: 'b', label: 'Berdomisili di Luar RT', field: 'domisili_luar', sensitive: false, desc: 'Terdaftar di RT namun tinggal di luar' },
  { kodeLabel: 'c', label: 'Alamat KK di Luar RT', field: 'kk_luar', sensitive: false, desc: 'Tinggal di RT namun KK di luar RT' },
  { kodeLabel: 'd', label: 'Warga Berdasarkan Usia', field: null, breakdown: true, sensitive: false, desc: 'Balita hingga lansia' },
  { kodeLabel: 'e', label: 'Warga Kurang Mampu', field: 'kurang_mampu', sensitive: true, desc: 'Status sosial-ekonomi kurang mampu' },
  { kodeLabel: 'f', label: 'Warga Negara Asing (WNA)', field: 'wna', sensitive: true, desc: 'Berkewarganegaraan asing berdomisili di RT' },
  { kodeLabel: 'g', label: 'Profesi Warga', field: null, distribution: true, sensitive: false, desc: 'Distribusi warga per profesi' },
  { kodeLabel: 'h', label: 'Penerima Bansos', field: 'bansos', sensitive: true, desc: 'Peserta program bantuan sosial' },
  { kodeLabel: 'i', label: 'Statistik Kependudukan', field: null, population: true, sensitive: false, desc: 'Agregat gender, nikah, usia, domisili' },
  { kodeLabel: 'j', label: 'Penyakit Warga', field: null, unavailable: true, sensitive: true, desc: 'Di luar scope MVP - data belum tersedia' },
]

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

function CardValue({ card, summary }) {
  let value = '-'
  if (summary) {
    if (card.unavailable) {
      value = 'N/A'
    } else if (card.breakdown) {
      value = String(Object.values(summary.usia || {}).reduce((acc, g) => acc + g.total, 0))
    } else if (card.distribution) {
      value = String((summary.profesi || []).reduce((acc, p) => acc + p.total, 0))
    } else if (card.population) {
      value = String(summary.total_warga)
    } else {
      value = String(summary[card.field] ?? 0)
    }
  }

  return (
    <>
      <div className="flex items-start justify-between gap-2">
        <span className="inline-flex h-6 min-w-6 items-center justify-center bg-black px-1.5 text-xs font-extrabold text-white">
          {card.kodeLabel}
        </span>
        {card.unavailable ? (
          <span className="rounded bg-neutral-200 px-2 py-0.5 text-[10px] font-extrabold uppercase text-neutral-500">Belum Tersedia</span>
        ) : card.sensitive ? (
          <span className="rounded bg-violet-100 px-2 py-0.5 text-[10px] font-extrabold uppercase text-violet-900">Sensitif</span>
        ) : null}
      </div>
      <p className="mt-3 text-sm font-extrabold leading-snug text-black">{card.label}</p>
      <p className="mt-1 text-xs font-normal leading-4 text-neutral-500">{card.desc}</p>
      <p className="mt-3 text-2xl font-extrabold text-black">{value}</p>
    </>
  )
}

export default function RtStatisticsPage() {
  const [stats, setStats] = useState({
    total_warga: '0',
    total_rumah: '0',
    total_pengaduan: '0',
    kas_rt: 'Rp 0'
  })
  const [cashflowData, setCashflowData] = useState([])
  const [complaintData, setComplaintData] = useState([])
  const [demographicSummary, setDemographicSummary] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      getDashboardStatistics().catch(() => null),
      import('../../../services/api').then(m => m.getHouses({ per_page: 100 })).catch(() => null),
      getStatistikSummary().catch(() => null)
    ]).then(([resDashboard, resHouses, resDemographic]) => {
      const data = resDashboard?.data || resDashboard
      const housesData = resHouses?.data || resHouses
      const demogData = resDemographic?.data || resDemographic
      
      let totalRumah = '0'
      if (Array.isArray(housesData)) totalRumah = housesData.length.toString()
      else if (Array.isArray(housesData?.data)) totalRumah = housesData.data.length.toString()

      if (data) {
        if (data.summaryCards) {
          setStats({
            total_warga: data.summaryCards[0]?.value || '0',
            total_pengaduan: data.summaryCards[1]?.value || '0',
            kas_rt: data.summaryCards[2]?.value || 'Rp 0',
            total_rumah: totalRumah
          })
        }
        if (data.cashflow && Array.isArray(data.cashflow)) setCashflowData(data.cashflow)
        if (data.complaintsByCategory && Array.isArray(data.complaintsByCategory)) setComplaintData(data.complaintsByCategory)
      } else {
        setStats(s => ({ ...s, total_rumah: totalRumah }))
      }
      
      if (demogData) {
        setDemographicSummary(demogData)
      }

      setLoading(false)
    })
  }, [])

  const ageTotal = demographicSummary ? demographicSummary.total_warga - (demographicSummary.tanpa_ttl || 0) : 0
  const profesiTotal = demographicSummary?.profesi?.reduce((acc, p) => acc + p.total, 0) ?? 0
  const visibleCards = demographicSummary && !demographicSummary.can_sensitive
    ? CATEGORY_CARDS.filter((card) => !card.sensitive)
    : CATEGORY_CARDS

  return (
    <PageShell
      eyebrow="Informasi & Statistik"
      title="Statistik Warga & Lingkungan"
      description="Tinjau rangkuman data kependudukan, pengaduan, dan keuangan wilayah Anda."
    >
      <section className="mt-6">
        {/* KPI Dashboard */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-neutral-300 bg-white p-6 shadow-sm">
            <h3 className="text-xs font-bold uppercase text-neutral-500">Total Warga</h3>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-black">{loading ? '-' : stats.total_warga}</span>
              <span className="text-sm font-semibold text-neutral-500">Jiwa</span>
            </div>
            <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-neutral-100">
              <div className="h-full bg-sky-500" style={{ width: '70%' }} />
            </div>
          </div>
          <div className="rounded-2xl border border-neutral-300 bg-white p-6 shadow-sm">
            <h3 className="text-xs font-bold uppercase text-neutral-500">Total Rumah & Kos</h3>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-black">{loading ? '-' : stats.total_rumah}</span>
              <span className="text-sm font-semibold text-neutral-500">Unit</span>
            </div>
            <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-neutral-100">
              <div className="h-full bg-emerald-500" style={{ width: '45%' }} />
            </div>
          </div>
          <div className="rounded-2xl border border-neutral-300 bg-white p-6 shadow-sm">
            <h3 className="text-xs font-bold uppercase text-neutral-500">Pengaduan Aktif</h3>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-black">{loading ? '-' : stats.total_pengaduan}</span>
              <span className="text-sm font-semibold text-neutral-500">Tiket</span>
            </div>
            <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-neutral-100">
              <div className="h-full bg-orange-500" style={{ width: '30%' }} />
            </div>
          </div>
          <div className="rounded-2xl border border-neutral-300 bg-white p-6 shadow-sm">
            <h3 className="text-xs font-bold uppercase text-neutral-500">Saldo Kas RT</h3>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-2xl font-extrabold text-black">{loading ? '-' : stats.kas_rt}</span>
            </div>
            <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-neutral-100">
              <div className="h-full bg-black" style={{ width: '85%' }} />
            </div>
          </div>
        </div>

        {/* Grafik Recharts */}
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-neutral-300 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-black mb-6">Arus Kas Bulanan (Juta Rupiah)</h2>
            <div className="h-64 w-full">
              {loading ? (
                <div className="h-full flex items-center justify-center text-sm text-neutral-500">Memuat grafik...</div>
              ) : cashflowData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-sm text-neutral-500">Belum ada data keuangan.</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={cashflowData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#737373' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#737373' }} />
                    <Tooltip cursor={{fill: '#f5f5f5'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
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
                <div className="h-full flex items-center justify-center text-sm text-neutral-500">Belum ada data pengaduan.</div>
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
                    <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                    <Legend iconType="circle" layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        {/* Data Demografi / Kependudukan */}
        {demographicSummary ? (
          <div className="mt-8 space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {visibleCards.map((card) => (
                <div key={card.kodeLabel} className={`border-2 border-neutral-900 p-5 ${card.unavailable ? 'bg-neutral-100 opacity-60' : 'bg-white'}`}>
                  <CardValue card={card} summary={demographicSummary} />
                </div>
              ))}
            </div>

            {demographicSummary.usia && Object.keys(demographicSummary.usia).length > 0 ? (
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
                  <ProgressBar
                    label="Tanpa tanggal lahir"
                    value={demographicSummary.tanpa_ttl ?? 0}
                    total={demographicSummary.total_warga}
                  />
                </div>
              </div>
            ) : null}

            {demographicSummary.profesi?.length ? (
              <div className="border-2 border-neutral-900 bg-white p-5">
                <h3 className="text-xs font-extrabold uppercase tracking-[0.12em] text-neutral-500">Distribusi Profesi</h3>
                <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {demographicSummary.profesi.map((p) => (
                    <ProgressBar key={p.nama} label={p.nama} value={p.total} total={profesiTotal} />
                  ))}
                </div>
              </div>
            ) : null}

            {demographicSummary.kependudukan ? (
              <div className="border-2 border-neutral-900 bg-white p-5">
                <h3 className="text-xs font-extrabold uppercase tracking-[0.12em] text-neutral-500">Statistik Kependudukan Lainnya</h3>
                <div className="mt-4 grid gap-x-8 gap-y-4 text-sm sm:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <p className="text-xs font-bold uppercase text-neutral-500">Jenis Kelamin</p>
                    <p className="mt-1 font-semibold text-black">Laki-laki {demographicSummary.kependudukan.jenis_kelamin?.L || 0} • Perempuan {demographicSummary.kependudukan.jenis_kelamin?.P || 0}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase text-neutral-500">Usia Produktif / Tidak</p>
                    <p className="mt-1 font-semibold text-black">{demographicSummary.kependudukan.produktif || 0} / {demographicSummary.kependudukan.tidak_produktif || 0}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase text-neutral-500">Balita & Batita</p>
                    <p className="mt-1 font-semibold text-black">{demographicSummary.kependudukan.balita_batita || 0}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase text-neutral-500">Warga Tidak Tetap</p>
                    <p className="mt-1 font-semibold text-black">{demographicSummary.kependudukan.warga_tidak_tetap || 0}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-xs font-bold uppercase text-neutral-500">Status Perkawinan</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {Object.entries(demographicSummary.kependudukan.status_nikah || {}).map(([k, v]) => (
                        <span key={k} className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-bold text-neutral-700">
                          {k.replaceAll('_', ' ').toLowerCase()} ({v})
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
      </section>
    </PageShell>
  )
}
