import { useEffect, useState } from 'react'
import { getStatistikDetail, getStatistikKeluarga, getStatistikSummary } from '../../../services/api'
import { PageShell } from '../../../components/layout/PageShell'
import { formatDateShort } from './utils'

const CATEGORY_CARDS = [
  { kode: 'keluarga', kodeLabel: 'K', label: 'Informasi Keluarga', field: 'total_kk', sensitive: false, desc: 'Jumlah KK aktif beserta anggota per KK' },
  { kode: 'dpt', kodeLabel: 'a', label: 'Warga Berhak Pemilu (DPT)', field: 'dpt', sensitive: false, desc: 'WNI, usia ≥17 th atau pernah kawin' },
  { kode: 'domisili-luar', kodeLabel: 'b', label: 'Berdomisili di Luar RT', field: 'domisili_luar', sensitive: false, desc: 'Terdaftar di RT namun tinggal di luar' },
  { kode: 'kk-luar', kodeLabel: 'c', label: 'Alamat KK di Luar RT', field: 'kk_luar', sensitive: false, desc: 'Tinggal di RT namun KK di luar RT' },
  { kode: 'usia', kodeLabel: 'd', label: 'Warga Berdasarkan Usia', field: null, sensitive: false, desc: 'Balita hingga lansia', breakdown: true },
  { kode: 'kurang-mampu', kodeLabel: 'e', label: 'Warga Kurang Mampu', field: 'kurang_mampu', sensitive: true, desc: 'Status sosial-ekonomi kurang mampu' },
  { kode: 'wna', kodeLabel: 'f', label: 'Warga Negara Asing (WNA)', field: 'wna', sensitive: true, desc: 'Berkewarganegaraan asing berdomisili di RT' },
  { kode: 'profesi', kodeLabel: 'g', label: 'Profesi Warga', field: null, sensitive: false, desc: 'Distribusi warga per profesi', distribution: true },
  { kode: 'bansos', kodeLabel: 'h', label: 'Penerima Bansos', field: 'bansos', sensitive: true, desc: 'Peserta program bantuan sosial' },
  { kode: 'kependudukan', kodeLabel: 'i', label: 'Statistik Kependudukan', field: null, sensitive: false, desc: 'Agregat gender, nikah, usia, domisili', population: true },
  { kode: 'penyakit', kodeLabel: 'j', label: 'Penyakit Warga', field: null, sensitive: true, unavailable: true, desc: 'Di luar scope MVP — data belum tersedia' },
]

const AGE_CODES = ['balita', 'batita', 'anak', 'produktif', 'lansia']

function exportCsv(filename, headers, rows) {
  const escape = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`
  const csv = [headers.map(escape).join(';'), ...rows.map((r) => r.map(escape).join(';'))].join('\n')
  const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

function Bar({ label, value, total, onClick }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={`w-full text-left ${onClick ? 'transition hover:bg-neutral-50' : 'cursor-default'} rounded-lg px-3 py-2`}
    >
      <div className="flex items-center justify-between text-xs font-bold text-neutral-700">
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <div className="mt-1.5 h-2 w-full rounded-full bg-neutral-200">
        <div className="h-2 rounded-full bg-sky-600" style={{ width: `${pct}%` }} />
      </div>
    </button>
  )
}

function CardInner({ card, summary, locked }) {
  let value = '—'
  if (summary) {
    if (card.unavailable) {
      value = 'N/A'
    } else if (card.breakdown) {
      const filled = Object.values(summary.usia || {}).reduce((acc, g) => acc + g.total, 0)
      value = String(filled)
    } else if (card.distribution) {
      value = String((summary.profesi || []).reduce((acc, p) => acc + p.total, 0))
    } else if (card.population) {
      value = String(summary.total_warga)
    } else if (locked) {
      value = '🔒'
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
        {locked ? (
          <span className="rounded bg-amber-100 px-2 py-0.5 text-[10px] font-extrabold uppercase text-amber-900">Sensitif · Terkunci</span>
        ) : card.unavailable ? (
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

export default function InformasiStatistikPage() {
  const [summary, setSummary] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [notice, setNotice] = useState('')
  const [detail, setDetail] = useState({ kode: null, loading: false, warga: [], keluarga: [] })

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

  useEffect(() => {
    if (!detail.kode || detail.kode === 'usia' || detail.kode === 'profesi' || detail.kode === 'kependudukan' || detail.kode === 'penyakit') {
      return
    }

    async function loadDetail() {
      setDetail((prev) => ({ ...prev, loading: true }))
      try {
        if (detail.kode === 'keluarga') {
          const res = await getStatistikKeluarga()
          setDetail({ kode: detail.kode, loading: false, warga: [], keluarga: res?.data || [] })
        } else {
          const res = await getStatistikDetail(detail.kode)
          setDetail({ kode: detail.kode, loading: false, warga: res?.data?.warga || [], keluarga: [] })
        }
      } catch (error) {
        setNotice(error.message || 'Gagal memuat detail kategori.')
        setDetail({ kode: null, loading: false, warga: [], keluarga: [] })
      }
    }
    loadDetail()
  }, [detail.kode])

  function openDetail(kode) {
    setNotice('')
    setDetail((prev) => (prev.kode === kode
      ? { kode: null, loading: false, warga: [], keluarga: [] }
      : { kode, loading: true, warga: [], keluarga: [] }))
  }

  function openAgeDetail(kode) {
    setNotice('')
    setDetail({ kode, loading: false, warga: [], keluarga: [] })
  }

  function handleExport() {
    if (!detail.kode) return

    if (detail.kode === 'keluarga') {
      exportCsv(
        `informasi-keluarga-${Date.now()}.csv`,
        ['No. KK', 'Kepala Keluarga', 'Jumlah Anggota'],
        detail.keluarga.map((k) => [k.no_kk, k.kepala_keluarga || '-', k.jumlah_anggota]),
      )
      return
    }

    exportCsv(
      `statistik-${detail.kode}-${Date.now()}.csv`,
      ['Nama Lengkap', 'NIK', 'JK', 'Tanggal Lahir', 'Usia', 'Status Nikah', 'Status Warga', 'Profesi'],
      detail.warga.map((w) => [
        w.nama_lengkap,
        w.nik,
        w.jenis_kelamin,
        w.tanggal_lahir ? formatDateShort(w.tanggal_lahir) : '-',
        w.usia ?? '-',
        w.status_nikah || '-',
        w.status_warga || '-',
        w.profesi || '-',
      ]),
    )
  }

  const activeCard = CATEGORY_CARDS.find((c) => c.kode === detail.kode)
  const ageTotal = summary ? summary.total_warga - (summary.tanpa_ttl || 0) : 0
  const profesiTotal = summary?.profesi?.reduce((acc, p) => acc + p.total, 0) ?? 0

  return (
    <PageShell
      eyebrow="Informasi & Statistik"
      title="Statistik Warga Kategori a–j"
      description="Turunan analitik dari data kependudukan dan keluarga RT. Data sensitif hanya dapat dilihat Ketua RT, Sekretaris, dan Bendahara."
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
              {CATEGORY_CARDS.map((card) => {
                const locked = card.sensitive && card.field && summary && summary[card.field] === null
                const isActive = detail.kode === card.kode
                const clickable = !card.unavailable && !card.breakdown && !card.distribution && !card.population

                return clickable ? (
                  <button
                    key={card.kode}
                    type="button"
                    onClick={() => openDetail(card.kode)}
                    className={`relative border-2 p-5 text-left transition ${
                      isActive
                        ? 'border-sky-600 bg-sky-50'
                        : 'border-neutral-900 bg-white hover:bg-neutral-50'
                    }`}
                  >
                    <CardInner card={card} summary={summary} locked={locked} />
                  </button>
                ) : (
                  <div
                    key={card.kode}
                    className={`relative border-2 border-neutral-900 p-5 ${card.unavailable ? 'bg-neutral-100 opacity-60' : 'bg-white'}`}
                  >
                    <CardInner card={card} summary={summary} locked={locked} />
                  </div>
                )
              })}
            </div>

            {summary?.usia ? (
              <div className="border-2 border-neutral-900 bg-white p-5">
                <h3 className="text-xs font-extrabold uppercase tracking-[0.12em] text-neutral-500">Kelompok Usia (kategori d)</h3>
                <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {AGE_CODES.map((kode) => (
                    <Bar
                      key={kode}
                      label={summary.usia[kode]?.label}
                      value={summary.usia[kode]?.total ?? 0}
                      total={ageTotal}
                      onClick={() => openAgeDetail(kode)}
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
                <h3 className="text-xs font-extrabold uppercase tracking-[0.12em] text-neutral-500">Distribusi Profesi (kategori g)</h3>
                <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {summary.profesi.map((p) => (
                    <Bar key={p.nama} label={p.nama} value={p.total} total={profesiTotal} />
                  ))}
                </div>
              </div>
            ) : null}

            {summary?.kependudukan ? (
              <div className="border-2 border-neutral-900 bg-white p-5">
                <h3 className="text-xs font-extrabold uppercase tracking-[0.12em] text-neutral-500">Statistik Kependudukan (kategori i)</h3>
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

            {activeCard ? (
              <div className="border-2 border-neutral-900 bg-white">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-neutral-900 bg-black px-5 py-3">
                  <h3 className="text-sm font-extrabold uppercase tracking-widest text-white">
                    Detail — {activeCard.label}
                  </h3>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleExport}
                      className="rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-bold text-white transition hover:border-sky-400 hover:text-sky-300"
                    >
                      Export CSV
                    </button>
                    <button
                      type="button"
                      onClick={() => openDetail(activeCard.kode)}
                      className="rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-bold text-white transition hover:border-red-400 hover:text-red-300"
                    >
                      Tutup
                    </button>
                  </div>
                </div>

                {detail.loading ? (
                  <p className="p-8 text-center text-sm font-semibold text-neutral-600">Memuat detail...</p>
                ) : activeCard.kode === 'keluarga' ? (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[520px] text-left text-sm">
                      <thead>
                        <tr className="border-b border-neutral-200 text-xs uppercase text-neutral-500">
                          <th className="px-5 py-3">No. KK</th>
                          <th className="px-5 py-3">Kepala Keluarga</th>
                          <th className="px-5 py-3">Jumlah Anggota</th>
                        </tr>
                      </thead>
                      <tbody>
                        {detail.keluarga.length === 0 ? (
                          <tr><td colSpan={3} className="px-5 py-6 text-center text-neutral-500">Belum ada KK aktif.</td></tr>
                        ) : detail.keluarga.map((k) => (
                          <tr key={k.id_family} className="border-b border-neutral-100 last:border-0">
                            <td className="px-5 py-3 font-mono text-xs">{k.no_kk}</td>
                            <td className="px-5 py-3 font-semibold">{k.kepala_keluarga || '-'}</td>
                            <td className="px-5 py-3">{k.jumlah_anggota}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[760px] text-left text-sm">
                      <thead>
                        <tr className="border-b border-neutral-200 text-xs uppercase text-neutral-500">
                          <th className="px-5 py-3">Nama</th>
                          <th className="px-5 py-3">NIK</th>
                          <th className="px-5 py-3">JK</th>
                          <th className="px-5 py-3">Tgl Lahir</th>
                          <th className="px-5 py-3">Usia</th>
                          <th className="px-5 py-3">Status Nikah</th>
                          <th className="px-5 py-3">Profesi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {detail.warga.length === 0 ? (
                          <tr><td colSpan={7} className="px-5 py-6 text-center text-neutral-500">Tidak ada warga pada kategori ini.</td></tr>
                        ) : detail.warga.map((w) => (
                          <tr key={w.id_citizen} className="border-b border-neutral-100 last:border-0">
                            <td className="px-5 py-3 font-semibold">{w.nama_lengkap}</td>
                            <td className="px-5 py-3 font-mono text-xs">{w.nik}</td>
                            <td className="px-5 py-3">{w.jenis_kelamin}</td>
                            <td className="px-5 py-3">{w.tanggal_lahir ? formatDateShort(w.tanggal_lahir) : '-'}</td>
                            <td className="px-5 py-3">{w.usia ?? '-'}</td>
                            <td className="px-5 py-3">{(w.status_nikah || '-').replaceAll('_', ' ').toLowerCase()}</td>
                            <td className="px-5 py-3">{w.profesi || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ) : null}
          </>
        )}
      </section>
    </PageShell>
  )
}
