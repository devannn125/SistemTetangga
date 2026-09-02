import { useEffect, useState } from 'react'
import { PageShell } from '@/components/layout/PageShell'
import { getCitizens } from '@/services/api'
import { toRows } from './utils'

export default function WargaReadPage() {
  const [citizens, setCitizens] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [notice, setNotice] = useState('')

  useEffect(() => {
    let alive = true

    async function load() {
      setIsLoading(true)
      try {
        const response = await getCitizens({ per_page: 100 })
        if (alive) setCitizens(toRows(response))
      } catch (error) {
        if (alive) setNotice(error.message || 'Backend belum dapat dihubungi.')
      } finally {
        if (alive) setIsLoading(false)
      }
    }

    load()

    return () => {
      alive = false
    }
  }, [])

  return (
    <PageShell eyebrow="Kependudukan" title="Data Warga" description="Pemantauan data warga untuk kebutuhan iuran dan bantuan sosial (read-only).">
      <section className="mt-8 space-y-4">
        {notice ? <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-semibold text-sky-900">{notice}</div> : null}
        {isLoading ? (
          <div className="rounded-2xl border border-neutral-300 bg-white p-8 text-center text-sm font-semibold text-neutral-600">Memuat data warga...</div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-neutral-300 bg-white">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-neutral-300 text-xs uppercase text-neutral-500">
                  <th className="px-5 py-3">Nama</th>
                  <th className="px-5 py-3">NIK</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">No. HP</th>
                </tr>
              </thead>
              <tbody>
                {citizens.map((c) => (
                  <tr key={c.id_citizen} className="border-b border-neutral-100 last:border-0">
                    <td className="px-5 py-3 font-bold text-black">{c.nama_lengkap}</td>
                    <td className="px-5 py-3 text-neutral-600">{c.nik}</td>
                    <td className="px-5 py-3 text-neutral-600">{c.status_warga}</td>
                    <td className="px-5 py-3 text-neutral-600">{c.no_hp || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </PageShell>
  )
}
