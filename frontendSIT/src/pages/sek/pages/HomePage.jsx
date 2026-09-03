import { useEffect, useState } from 'react'
import { getAuthData } from '../../../services/authService'
import { PageShell } from '../../../components/layout/PageShell'
import { DemographyCharts } from '../../../components/dashboard/DemographyCharts'

function toArray(res) {
  return Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []
}

export default function HomePage() {
  const authUser = getAuthData()
  const [letters, setLetters] = useState(0)
  const [citizens, setCitizens] = useState(0)
  const [feedbacks, setFeedbacks] = useState(0)
  const [summary, setSummary] = useState(null)

  useEffect(() => {
    import('../../../services/api').then((api) => {
      api.getLetterRequests({ per_page: 200 }).then((r) => {
        const arr = toArray(r)
        setLetters(arr.filter((l) => l.status === 'DIAJUKAN').length)
      }).catch(() => {})
      api.getCitizens({ per_page: 200 }).then((r) => setCitizens(toArray(r).length)).catch(() => {})
      api.getFeedback({ per_page: 200 }).then((r) => {
        const arr = toArray(r)
        setFeedbacks(arr.filter((f) => f.status === 'BARU').length)
      }).catch(() => {})
      api.getStatistikSummary().then((r) => setSummary(r?.data || r)).catch(() => {})
    })
  }, [])

  return (
    <PageShell
      eyebrow="Portal Sekretaris RT"
      title={`Selamat datang, ${authUser?.nama_users || 'Sekretaris'}`}
      description="Verifikasi permohonan surat, kelola data warga, dan administrasi lingkungan."
    >
      <section className="mt-8 grid gap-5 md:grid-cols-3">
        <a href="/sek/surat" className="block border border-neutral-900 bg-white p-6 no-underline hover:shadow-lg transition">
          <p className="text-3xl font-extrabold text-black">{letters}</p>
          <h2 className="mt-2 text-lg font-extrabold text-black">Surat Perlu Verifikasi</h2>
          <p className="mt-3 text-sm leading-6 text-neutral-600">Permohonan warga masuk di sini untuk DIVERIFIKASI sebelum disetujui Ketua RT.</p>
          <span className="mt-4 inline-flex text-xs font-extrabold uppercase text-black hover:text-sky-700">Buka daftar surat</span>
        </a>
        <a href="/sek/warga" className="block border border-neutral-900 bg-white p-6 no-underline hover:shadow-lg transition">
          <p className="text-3xl font-extrabold text-black">{citizens}</p>
          <h2 className="mt-2 text-lg font-extrabold text-black">Data Warga</h2>
          <p className="mt-3 text-sm leading-6 text-neutral-600">Pengelolaan data kependudukan tingkat RT.</p>
          <span className="mt-4 inline-flex text-xs font-extrabold uppercase text-black hover:text-sky-700">Buka data warga</span>
        </a>
        <a href="/sek/pesan" className="block border border-neutral-900 bg-white p-6 no-underline hover:shadow-lg transition">
          <p className="text-3xl font-extrabold text-black">{feedbacks}</p>
          <h2 className="mt-2 text-lg font-extrabold text-black">Pesan & Kesan Baru</h2>
          <p className="mt-3 text-sm leading-6 text-neutral-600">Tinjau pesan warga yang masuk.</p>
          <span className="mt-4 inline-flex text-xs font-extrabold uppercase text-black hover:text-sky-700">Buka pesan</span>
        </a>
      </section>
      <section className="mt-8">
        <h2 className="text-sm font-extrabold uppercase tracking-wider text-neutral-500">Statistik Lingkungan</h2>
        <div className="mt-3">
          <DemographyCharts summary={summary} />
        </div>
      </section>
    </PageShell>
  )
}
