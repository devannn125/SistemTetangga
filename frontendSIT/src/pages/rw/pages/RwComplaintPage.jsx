import { useEffect, useState } from 'react'
import { PageShell } from '@/components/layout/PageShell'
import { getComplaints, updateComplaint } from '@/services/api'
import { useConfirm } from '@/components/ui/ConfirmContext'
import { useToast } from '@/components/ui/ToastContext'
import { formatDate } from './utils'

export default function RwComplaintPage() {
  const [complaints, setComplaints] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [processingId, setProcessingId] = useState('')
  const confirm = useConfirm()
  const { showToast } = useToast()

  function loadComplaints() {
    setIsLoading(true)
    getComplaints({ per_page: 100 }).then(res => {
      setComplaints(Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [])
      setIsLoading(false)
    }).catch(err => {
      console.error(err)
      setIsLoading(false)
    })
  }

  useEffect(() => {
    loadComplaints()
  }, [])

  async function handleResolve(complaint) {
    const approved = await confirm({
      title: 'Selesaikan Pengaduan',
      message: `Apakah Anda yakin ingin menyelesaikan tiket pengaduan eskalasi "${complaint.judul}"?`,
      confirmLabel: 'Ya, Selesaikan',
    })
    if (!approved) return
    setProcessingId(complaint.id_complaint)
    try {
      await updateComplaint(complaint.id_complaint, {
        ...complaint,
        status: 'SELESAI'
      })
      showToast('Tiket pengaduan eskalasi berhasil diselesaikan.')
      loadComplaints()
    } catch (err) {
      showToast(err.message || 'Gagal memperbarui status pengaduan.', 'error')
    } finally {
      setProcessingId('')
    }
  }

  const escalatedList = complaints.filter(c => c.status === 'ESKALASI')

  return (
    <PageShell
      eyebrow="SIPANDU"
      title="Eskalasi Pengaduan RW"
      description="Proses tiket pengaduan warga yang telah melampaui SLA 3 hari di tingkat RT and telah dieskalasi ke tingkat RW."
    >
      <section className="mt-8 space-y-6">
        {isLoading ? (
          <div className="p-8 text-center text-sm text-neutral-500 bg-white border rounded-xl">Memuat data pengaduan...</div>
        ) : escalatedList.length === 0 ? (
          <div className="p-8 text-center text-sm text-neutral-500 bg-white border rounded-xl">Tidak ada tiket pengaduan eskalasi aktif saat ini.</div>
        ) : (
          <div className="grid gap-4">
            {escalatedList.map(c => (
              <article key={c.id_complaint} className="border border-neutral-300 bg-white p-6 rounded-xl">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-neutral-500">
                      {c.nomor_tiket || `#${c.id_complaint}`} · {c.kategori}
                    </p>
                    <h2 className="mt-3 text-xl font-extrabold text-black break-all">{c.judul}</h2>
                    <p className="mt-2 max-w-3xl text-sm leading-6 text-neutral-600 break-all whitespace-pre-wrap">{c.deskripsi}</p>
                  </div>
                  <span className="rounded-full bg-orange-100 text-orange-900 px-3 py-1 text-xs font-bold uppercase">
                    ESKALASI
                  </span>
                </div>

                <div className="mt-4 grid gap-2 text-sm text-neutral-500 sm:grid-cols-2 lg:grid-cols-4">
                  <p><span className="font-bold text-neutral-900">Lokasi:</span> <span className="break-all">{c.lokasi || '-'}</span></p>
                  <p><span className="font-bold text-neutral-900">Urgensi:</span> {c.urgensi}</p>
                  <p><span className="font-bold text-neutral-900">Tanggal:</span> {formatDate(c.created_at)}</p>
                  <p><span className="font-bold text-neutral-900">RT:</span> {c.wilayah?.nama_wilayah || '-'}</p>
                </div>

                <div className="mt-5 flex gap-3">
                  <button
                    disabled={processingId === c.id_complaint}
                    onClick={() => handleResolve(c)}
                    className="rounded-full bg-black px-5 py-2 text-xs font-extrabold uppercase text-white hover:bg-neutral-900 transition"
                  >
                    Tandai Selesai
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </PageShell>
  )
}
