import { useEffect, useState } from 'react'
import { PageShell } from '@/components/layout/PageShell'
import { getAuthData } from '@/services/authService'
import { getCitizens, getComplaints, getLetterRequests } from '@/services/api'

export default function HomePage() {
  const authUser = getAuthData()
  const [counts, setCounts] = useState({ pendingWarga: 0, escalatedComplaints: 0, letters: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      getCitizens({ per_page: 200 }),
      getComplaints({ per_page: 200 }),
      getLetterRequests({ per_page: 200 })
    ]).then(([resCit, resComp, resLetters]) => {
      const citArr = Array.isArray(resCit?.data) ? resCit.data : Array.isArray(resCit) ? resCit : []
      const compArr = Array.isArray(resComp?.data) ? resComp.data : Array.isArray(resComp) ? resComp : []
      const letArr = Array.isArray(resLetters?.data) ? resLetters.data : Array.isArray(resLetters) ? resLetters : []

      setCounts({
        pendingWarga: citArr.filter(c => c.status_verifikasi === 'PENDING').length,
        escalatedComplaints: compArr.filter(c => c.status === 'ESKALASI').length,
        letters: letArr.length
      })
      setLoading(false)
    }).catch(err => {
      console.error(err)
      setLoading(false)
    })
  }, [])

  return (
    <PageShell
      eyebrow="Portal Ketua Dukuh"
      title={`Selamat datang, ${authUser?.nama_users || 'Ketua Dukuh'}`}
      description="Pusat monitoring dan verifikasi data warga serta eskalasi keluhan tingkat Dukuh."
    >
      <section className="mt-8 grid gap-5 md:grid-cols-3">
        <article className={`rounded-2xl border ${counts.pendingWarga > 0 ? 'border-sky-300 bg-sky-50' : 'border-neutral-300 bg-white'} p-6 shadow-sm flex flex-col justify-between`}>
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-bold uppercase text-neutral-500">Verifikasi Warga</h2>
              {counts.pendingWarga > 0 && <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white animate-pulse">{counts.pendingWarga}</span>}
            </div>
            <p className="text-2xl font-extrabold text-black mt-2">{loading ? '...' : counts.pendingWarga} Pengajuan</p>
            <p className="mt-2 text-xs text-neutral-600">Data warga baru menunggu verifikasi Dukuh.</p>
          </div>
          <a href="/dukuh/warga" className={`mt-6 inline-flex w-full justify-center rounded-full px-4 py-2 text-xs font-extrabold uppercase ${counts.pendingWarga > 0 ? 'bg-sky-600 text-white hover:bg-sky-700' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}>
            Verifikasi Sekarang
          </a>
        </article>

        <article className={`rounded-2xl border ${counts.escalatedComplaints > 0 ? 'border-orange-300 bg-orange-50' : 'border-neutral-300 bg-white'} p-6 shadow-sm flex flex-col justify-between`}>
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-bold uppercase text-neutral-500">Eskalasi Pengaduan</h2>
              {counts.escalatedComplaints > 0 && <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white animate-pulse">{counts.escalatedComplaints}</span>}
            </div>
            <p className="text-2xl font-extrabold text-black mt-2">{loading ? '...' : counts.escalatedComplaints} Tiket</p>
            <p className="mt-2 text-xs text-neutral-600">Tiket pengaduan yang melewati SLA 3 hari tingkat RT.</p>
          </div>
          <a href="/dukuh/pengaduan" className={`mt-6 inline-flex w-full justify-center rounded-full px-4 py-2 text-xs font-extrabold uppercase ${counts.escalatedComplaints > 0 ? 'bg-orange-600 text-white hover:bg-orange-700' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}>
            Lihat Pengaduan
          </a>
        </article>

        <article className="rounded-2xl border border-neutral-300 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-bold uppercase text-neutral-500">Surat Terbit</h2>
            </div>
            <p className="text-2xl font-extrabold text-black mt-2">{loading ? '...' : counts.letters} Dokumen</p>
            <p className="mt-2 text-xs text-neutral-600">Total surat keterangan warga yang terdaftar.</p>
          </div>
          <a href="/dukuh/surat" className="mt-6 inline-flex w-full justify-center rounded-full bg-neutral-100 px-4 py-2 text-xs font-extrabold uppercase text-neutral-600 hover:bg-neutral-200">
            Monitor Surat
          </a>
        </article>
      </section>
    </PageShell>
  )
}
