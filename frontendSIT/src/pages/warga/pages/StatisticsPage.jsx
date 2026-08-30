import { useEffect, useState } from 'react'
import { getStatistikSummary } from '../../../services/api'

function PageShell({ children, eyebrow, title, description }) {
  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <section className="border-2 border-neutral-900 bg-white p-8 max-sm:p-5">
        <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-neutral-500">{eyebrow}</p>
        <h1 className="mt-3 text-3xl font-extrabold leading-tight text-black max-sm:text-2xl">{title}</h1>
        {description ? <p className="mt-4 max-w-2xl text-sm leading-6 text-neutral-600">{description}</p> : null}
      </section>
      {children}
    </div>
  )
}

const CATEGORY_CARDS = [
  { kodeLabel: 'K', label: 'Informasi Keluarga', field: 'total_kk', sensitive: false, desc: 'Jumlah KK aktif beserta anggota per KK' },
  { kodeLabel: 'a', label: 'Warga Berhak Pemilu (DPT)', field: 'dpt', sensitive: false, desc: 'WNI, usia ≥17 th atau pernah kawin' },
  { kodeLabel: 'b', label: 'Berdomisili di Luar RT', field: 'domisili_luar', sensitive: false, desc: 'Terdaftar di RT namun tinggal di luar' },
  { kodeLabel: 'c', label: 'Alamat KK di Luar RT', field: 'kk_luar', sensitive: false, desc: 'Tinggal di RT namun KK di luar RT' },
  { kodeLabel: 'd', label: 'Warga Berdasarkan Usia', field: null, breakdown: true, sensitive: false, desc: 'Balita hingga lansia' },
  { kodeLabel: 'e', label: 'Warga Kurang Mampu', field: 'kurang_mampu', sensitive: true, desc: 'Status sosial-ekonomi kurang mampu' },
  { kodeLabel: 'f', label: 'Warga Negara Asing (WNA)', field: 'wna', sensitive: true, desc: 'Berkewarganegaraan asing berdomisili di RT' },
  { kodeLabel: 'g', label: 'Profesi Warga', field: null, distribution: true, sensitive: false, desc: 'Distribusi warga per profesi' },
  { kodeLabel: 'h', label: 'Penerima Bansos', field: 'bansos', sensitive: true, desc: 'Peserta program bantuan sosial' },
  { kodeLabel: 'i', label: 'Statistik Kependudukan', field: null, population: true, sensitive: false, desc: 'Agregat gender, nikah, usia, domisili' },
  { kodeLabel: 'j', label: 'Penyakit Warga', field: null, unavailable: true, sensitive: true, desc: 'Di luar scope MVP — data belum tersedia' },
]

const AGE_CODES = ['balita', 'batita', 'anak', 'produktif', 'lansia']

function Bar({ label, value, total }) {
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
  let value = '—'
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

export default function StatisticsPage() {
  const [summary, setSummary] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [notice, setNotice] = useState('')

  useEffect(() => {
    async function loadSummary() {
      try {
        const res = await getStatistikSummary()
        setSummary(res?.data || null)
      } catch (error) {
        setNotice(error.message || 'Gagal memuat statistik.')
      } finally {
        setIsLoading(false)
      }
    }
    loadSummary()
  }, [])

  const ageTotal = summary ? summary.total_warga - (summary.tanpa_ttl || 0) : 0
  const profesiTotal = summary?.profesi?.reduce((acc, p) => acc + p.total, 0) ?? 0

  // Kategori sensitif (e/f/h/j) disembunyikan total untuk role tanpa hak akses —
  // bukan sekadar ditandai terkunci (PRD 3.4).
  const visibleCards = summary && !summary.can_sensitive
    ? CATEGORY_CARDS.filter((card) => !card.sensitive)
    : CATEGORY_CARDS

  return (
    <PageShell
      eyebrow="Informasi & Statistik"
      title="Statistik Warga RT"
      description="Data agregat lingkungan RT. Data sensitif dan daftar personal warga hanya tersedia untuk pengurus."
    >
      <section className="mt-8 space-y-6">
        {notice ? (
          <div className={`rounded-2xl border px-4 py-3 text-sm font-semibold ${notice.includes('Gagal') ? 'border-red-200 bg-red-50 text-red-900' : 'border-sky-200 bg-sky-50 text-sky-900'}`}>
            {notice}
          </div>
        ) : null}

        {isLoading ? (
          <div className="rounded-xl border border-neutral-300 bg-white p-8 text-center text-sm font-semibold text-neutral-600">
            Memuat statistik...
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-4">
              {[
                { label: 'Total Warga Aktif', value: summary?.total_warga ?? 0 },
                { label: 'Total KK Aktif', value: summary?.total_kk ?? 0 },
                { label: 'Laki-laki', value: summary?.pria ?? 0 },
                { label: 'Perempuan', value: summary?.wanita ?? 0 },
              ].map((item) => (
                <div key={item.label} className="border-2 border-neutral-900 bg-white px-5 py-4">
                  <p className="text-xs font-extrabold uppercase tracking-[0.1em] text-neutral-500">{item.label}</p>
                  <p className="mt-2 text-3xl font-extrabold text-black">{item.value}</p>
                </div>
              ))}
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {visibleCards.map((card) => (
                <div key={card.kodeLabel} className={`border-2 border-neutral-900 p-5 ${card.unavailable ? 'bg-neutral-100 opacity-60' : 'bg-white'}`}>
                  <CardValue card={card} summary={summary} />
                </div>
              ))}
            </div>

            {summary?.usia ? (
              <div className="border-2 border-neutral-900 bg-white p-5">
                <h3 className="text-xs font-extrabold uppercase tracking-[0.12em] text-neutral-500">Kelompok Usia</h3>
                <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {AGE_CODES.map((kode) => (
                    <Bar
                      key={kode}
                      label={summary.usia[kode]?.label}
                      value={summary.usia[kode]?.total ?? 0}
                      total={ageTotal}
                    />
                  ))}
                  <Bar
                    label="Tanpa tanggal lahir"
                    value={summary.tanpa_ttl ?? 0}
                    total={summary.total_warga}
                  />
                </div>
              </div>
            ) : null}

            {summary?.profesi?.length ? (
              <div className="border-2 border-neutral-900 bg-white p-5">
                <h3 className="text-xs font-extrabold uppercase tracking-[0.12em] text-neutral-500">Distribusi Profesi</h3>
                <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {summary.profesi.map((p) => (
                    <Bar key={p.nama} label={p.nama} value={p.total} total={profesiTotal} />
                  ))}
                </div>
              </div>
            ) : null}

            {summary?.kependudukan ? (
              <div className="border-2 border-neutral-900 bg-white p-5">
                <h3 className="text-xs font-extrabold uppercase tracking-[0.12em] text-neutral-500">Statistik Kependudukan</h3>
                <div className="mt-4 grid gap-x-8 gap-y-4 text-sm sm:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <p className="text-xs font-bold uppercase text-neutral-500">Jenis Kelamin</p>
                    <p className="mt-1 font-semibold text-black">Laki-laki {summary.kependudukan.jenis_kelamin?.L ?? 0} · Perempuan {summary.kependudukan.jenis_kelamin?.P ?? 0}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase text-neutral-500">Usia Produktif / Tidak</p>
                    <p className="mt-1 font-semibold text-black">{summary.kependudukan.produktif} / {summary.kependudukan.tidak_produktif}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase text-neutral-500">Balita & Batita</p>
                    <p className="mt-1 font-semibold text-black">{summary.kependudukan.balita_batita}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase text-neutral-500">Warga Tidak Tetap</p>
                    <p className="mt-1 font-semibold text-black">{summary.kependudukan.warga_tidak_tetap}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-xs font-bold uppercase text-neutral-500">Status Perkawinan</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {Object.entries(summary.kependudukan.status_nikah || {}).map(([k, v]) => (
                        <span key={k} className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-bold text-neutral-700">
                          {k.replaceAll('_', ' ').toLowerCase()} ({v})
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </>
        )}
      </section>
    </PageShell>
  )
}
