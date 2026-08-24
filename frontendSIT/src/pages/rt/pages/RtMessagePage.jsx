import { useState, useEffect } from 'react'
import { PageShell } from '../../../components/layout/PageShell'
import { getFeedback } from '../../../services/api'

export default function RtMessagePage() {
  const [feedbacks, setFeedbacks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getFeedback({ per_page: 100 })
      .then(res => {
        const arr = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []
        setFeedbacks(arr)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [])

  return (
    <PageShell
      eyebrow="Komunikasi"
      title="Pesan & Kesan Warga"
      description="Tinjau pesan, keluhan umum, dan apresiasi dari warga di lingkungan Anda."
    >
      <section className="mt-6">
        <div className="grid gap-4">
          {loading ? (
             <div className="p-8 text-center text-sm text-neutral-500 bg-white border rounded-xl">Memuat pesan warga...</div>
          ) : feedbacks.length === 0 ? (
             <div className="p-8 text-center text-sm text-neutral-500 bg-white border rounded-xl">Belum ada pesan dari warga.</div>
          ) : feedbacks.map(item => (
            <div key={item.id_feedback || item.id} className="rounded-2xl border border-neutral-300 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between border-b pb-4">
                <div>
                  <h3 className="font-extrabold text-black">{item.judul || 'Pesan Warga'}</h3>
                  <p className="mt-1 text-xs font-bold uppercase text-neutral-500">
                    Kategori: {item.kategori || 'UMUM'} • {item.tanggal_submit || item.created_at?.slice(0,10) || '-'}
                  </p>
                </div>
                <span className="rounded bg-sky-100 px-3 py-1 text-xs font-bold text-sky-800">
                  {item.status || 'DITERIMA'}
                </span>
              </div>
              <div className="mt-4">
                <p className="text-sm leading-relaxed text-neutral-700">
                  {item.isi_pesan || item.deskripsi || item.isi_feedback}
                </p>
              </div>
              <div className="mt-4 flex items-center gap-3 pt-4 border-t">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-xs font-bold text-black">
                  {item.pelapor?.nama_lengkap?.[0] || 'A'}
                </div>
                <p className="text-sm font-semibold text-black">
                  {item.pelapor?.nama_lengkap || item.nama_pelapor || 'Anonim / Warga'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </PageShell>
  )
}
