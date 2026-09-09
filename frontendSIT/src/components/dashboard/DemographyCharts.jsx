import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts'

const PIE_COLORS = ['#0284c7', '#f472b6']

/**
 * Blok grafik demografi ringkas untuk beranda/dashboard.
 * prop `summary` dari getStatistikSummary(); sudah di-scope & disensor backend.
 * `canSensitive` mengontrol tampilnya kategori sensitif (bansos/kurang mampu/WNA).
 */
export function DemographyCharts({ summary }) {
  if (!summary) return null

  const gender = [
    { name: 'Laki-laki', value: summary.pria || 0 },
    { name: 'Perempuan', value: summary.wanita || 0 },
  ]
  const usia = (summary.usia ? Object.values(summary.usia) : []).map((u) => ({ name: u.label, value: u.total || 0 }))
  const profesi = (summary.profesi || []).slice(0, 6)

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <div className="border border-neutral-200 bg-white p-5">
        <h3 className="text-sm font-extrabold text-black">Komposisi Jenis Kelamin</h3>
        {gender[0].value + gender[1].value > 0 ? (
          <div className="h-56 mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={gender} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={2}>
                  {gender.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="mt-3 text-sm text-neutral-400">Belum ada data.</p>
        )}
      </div>

      <div className="border border-neutral-200 bg-white p-5">
        <h3 className="text-sm font-extrabold text-black">Distribusi Usia</h3>
        {usia.length > 0 ? (
          <div className="h-56 mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={usia} margin={{ left: -20, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#0284c7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="mt-3 text-sm text-neutral-400">Belum ada data.</p>
        )}
      </div>

      {profesi.length > 0 && (
        <div className="border border-neutral-200 bg-white p-5 lg:col-span-2">
          <h3 className="text-sm font-extrabold text-black">Distribusi Profesi</h3>
          <div className="h-52 mt-3 overflow-x-auto">
            <div className="min-w-[320px] h-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={profesi} layout="vertical" margin={{ left: 8, right: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 11 }} tickFormatter={(v) => String(v).slice(0, 12)} />
                  <Tooltip />
                  <Bar dataKey="total" fill="#7c3aed" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {summary.can_sensitive && (
        <div className="border border-neutral-200 bg-white p-5 lg:col-span-2">
          <h3 className="text-sm font-extrabold text-black">Data Sosial (Sensitif)</h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl bg-neutral-50 p-4">
              <p className="text-2xl font-extrabold text-black">{summary.kurang_mampu ?? 0}</p>
              <p className="text-xs font-semibold text-neutral-500">Kurang Mampu</p>
            </div>
            <div className="rounded-xl bg-neutral-50 p-4">
              <p className="text-2xl font-extrabold text-black">{summary.wna ?? 0}</p>
              <p className="text-xs font-semibold text-neutral-500">Warga Negara Asing</p>
            </div>
            <div className="rounded-xl bg-neutral-50 p-4">
              <p className="text-2xl font-extrabold text-black">{summary.bansos ?? 0}</p>
              <p className="text-xs font-semibold text-neutral-500">Penerima Bansos</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
