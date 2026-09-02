import { useEffect, useState } from 'react'
import { PageShell } from '@/components/layout/PageShell'
import { getRegulations } from '@/services/api'
import { formatDate } from './utils'

export default function RwRegulationPage() {
  const [regulations, setRegulations] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    getRegulations({ per_page: 100 }).then(res => {
      setRegulations(Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [])
      setIsLoading(false)
    }).catch(err => {
      console.error(err)
      setIsLoading(false)
    })
  }, [])

  return (
    <PageShell
      eyebrow="Peraturan"
      title="Tata Tertib & Peraturan Warga"
      description="Monitor daftar tata tertib warga tetap, tidak tetap, dan peraturan lingkungan tingkat RW."
    >
      <section className="mt-8">
        {isLoading ? (
          <div className="p-8 text-center text-sm text-neutral-500 bg-white border rounded-xl">Memuat peraturan...</div>
        ) : regulations.length === 0 ? (
          <div className="p-8 text-center text-sm text-neutral-500 bg-white border rounded-xl">Belum ada peraturan terbit.</div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {regulations.map((r) => (
              <article key={r.id_regulation} className="border border-neutral-300 bg-white p-6 rounded-xl flex flex-col justify-between">
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-neutral-500">
                    Kategori: {r.kategori} · Versi {r.versi || 1}
                  </p>
                  <h2 className="mt-3 text-xl font-extrabold text-black">{r.judul}</h2>
                  <p className="mt-2 line-clamp-4 text-sm leading-6 text-neutral-600">{r.isi}</p>
                </div>
                <div className="mt-4 pt-4 border-t flex justify-between text-xs text-neutral-400 font-semibold">
                  <span>Berlaku: {formatDate(r.tanggal_berlaku)}</span>
                  <span>RT: {r.wilayah?.nama_wilayah || '-'}</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </PageShell>
  )
}
