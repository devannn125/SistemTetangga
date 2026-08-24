import { useEffect, useMemo, useState } from 'react'
import { PageShell } from '../../../components/layout/PageShell'
import { getComplaints, updateComplaint } from '../../../services/api'
import { useConfirm } from '../../../components/ui/ConfirmContext'
import { useToast } from '../../../components/ui/ToastContext'

const statusTabs = [
  { id: 'PENDING', label: 'Perlu Ditugaskan' },
  { id: 'DIPROSES', label: 'Diproses' },
  { id: 'ESKALASI', label: 'Eskalasi' },
  { id: 'SELESAI', label: 'Selesai' },
  { id: 'all', label: 'Semua' },
]

function formatDate(value) {
  if (!value) return '-'
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value))
}

function getStatusClass(status) {
  return {
    PENDING: 'bg-amber-100 text-amber-900',
    DIPROSES: 'bg-sky-100 text-sky-900',
    ESKALASI: 'bg-orange-100 text-orange-900',
    SELESAI: 'bg-emerald-100 text-emerald-900',
    DITOLAK: 'bg-red-100 text-red-900',
  }[status] || 'bg-neutral-100 text-neutral-900'
}

function isPastSla(complaint) {
  if (complaint.status !== 'PENDING') return false
  const createdAt = new Date(complaint.created_at || complaint.tanggal)
  if (Number.isNaN(createdAt.getTime())) return false
  const threeDays = 3 * 24 * 60 * 60 * 1000
  return Date.now() - createdAt.getTime() > threeDays
}

export default function RtComplaintPage() {
  const [activeStatus, setActiveStatus] = useState('PENDING')
  const [complaints, setComplaints] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [processingId, setProcessingId] = useState('')
  const [notice, setNotice] = useState('')
  const confirm = useConfirm()
  const { showToast } = useToast()

  useEffect(() => {
    let alive = true

    async function loadComplaints() {
      setIsLoading(true)
      try {
        const response = await getComplaints({ per_page: 100 })
        const rows = Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : []
        if (alive) setComplaints(rows)
      } catch (error) {
        if (alive) setNotice(error.message || 'Backend belum dapat dihubungi.')
      } finally {
        if (alive) setIsLoading(false)
      }
    }

    loadComplaints()

    return () => {
      alive = false
    }
  }, [])

  const filteredComplaints = useMemo(
    () => complaints.filter((complaint) => activeStatus === 'all' || complaint.status === activeStatus),
    [activeStatus, complaints],
  )

  async function handleAssign(complaint) {
    const approved = await confirm({
      title: 'Konfirmasi Penugasan',
      message: `Tugaskan pengaduan "${complaint.judul}" ke petugas dan ubah statusnya menjadi Diproses?`,
      confirmLabel: 'Ya, Tugaskan',
    })
    if (!approved) return
    setProcessingId(complaint.id_complaint)
    try {
      await updateComplaint(complaint.id_complaint, {
        judul: complaint.judul,
        kategori: complaint.kategori,
        deskripsi: complaint.deskripsi,
        lokasi: complaint.lokasi,
        urgensi: complaint.urgensi,
        status: 'DIPROSES',
      })
      setComplaints((current) =>
        current.map((item) => (item.id_complaint === complaint.id_complaint ? { ...item, status: 'DIPROSES' } : item)),
      )
      showToast('Pengaduan berhasil ditugaskan dan status berubah menjadi Diproses.')
    } catch (error) {
      showToast(error.message || 'Gagal menugaskan pengaduan.', 'error')
    } finally {
      setProcessingId('')
    }
  }

  async function handleEscalate(complaint) {
    const approved = await confirm({
      title: 'Konfirmasi Eskalasi',
      message: `Eskalasikan pengaduan "${complaint.judul}" ke tingkat RW?`,
      confirmLabel: 'Ya, Eskalasi',
    })
    if (!approved) return
    setProcessingId(complaint.id_complaint)
    try {
      await updateComplaint(complaint.id_complaint, {
        judul: complaint.judul,
        kategori: complaint.kategori,
        deskripsi: complaint.deskripsi,
        lokasi: complaint.lokasi,
        urgensi: complaint.urgensi,
        status: 'ESKALASI',
      })
      setComplaints((current) =>
        current.map((item) => (item.id_complaint === complaint.id_complaint ? { ...item, status: 'ESKALASI' } : item)),
      )
      showToast('Pengaduan ditandai Eskalasi dan perlu diteruskan ke RW.')
    } catch (error) {
      showToast(error.message || 'Gagal menandai eskalasi.', 'error')
    } finally {
      setProcessingId('')
    }
  }

  return (
    <PageShell
      eyebrow="SIPANDU"
      title="Assign Pengaduan Warga"
      description="RT menugaskan tiket pending ke petugas. Tiket pending lebih dari 3 hari dikunci dari proses assign RT dan diarahkan untuk eskalasi ke RW."
    >
      <section className="mt-8 space-y-6">
        {notice ? (
          <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-semibold text-sky-900">
            {notice}
          </div>
        ) : null}

        <div className="flex flex-wrap gap-3">
          {statusTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`rounded-full border px-4 py-2 text-xs font-extrabold transition ${
                activeStatus === tab.id
                  ? 'border-black bg-black text-white'
                  : 'border-neutral-300 bg-white text-neutral-700 hover:border-black hover:bg-neutral-100'
              }`}
              onClick={() => setActiveStatus(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="rounded-xl border border-neutral-300 bg-white p-8 text-center text-sm font-semibold text-neutral-600">
            Memuat data pengaduan...
          </div>
        ) : filteredComplaints.length === 0 ? (
          <div className="rounded-xl border border-neutral-300 bg-white p-8 text-center text-sm font-semibold text-neutral-600">
            Tidak ada pengaduan pada status ini.
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredComplaints.map((complaint) => {
              const lockedBySla = isPastSla(complaint)
              return (
                <article key={complaint.id_complaint} className="border border-neutral-300 bg-white p-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-neutral-500">
                        {complaint.nomor_tiket || `#${complaint.id_complaint}`} · {complaint.kategori}
                      </p>
                      <h2 className="mt-3 text-xl font-extrabold text-black">{complaint.judul}</h2>
                      <p className="mt-2 max-w-3xl text-sm leading-6 text-neutral-600">{complaint.deskripsi}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${lockedBySla ? getStatusClass('ESKALASI') : getStatusClass(complaint.status)}`}>
                      {lockedBySla ? 'ESKALASI' : complaint.status}
                    </span>
                  </div>

                  <div className="mt-4 grid gap-2 text-sm text-neutral-500 sm:grid-cols-2 lg:grid-cols-4">
                    <p><span className="font-bold text-neutral-900">Lokasi:</span> {complaint.lokasi || '-'}</p>
                    <p><span className="font-bold text-neutral-900">Urgensi:</span> {complaint.urgensi}</p>
                    <p><span className="font-bold text-neutral-900">Tanggal:</span> {formatDate(complaint.created_at)}</p>
                    <p><span className="font-bold text-neutral-900">Pelapor:</span> {complaint.pengirim?.nama_users || '-'}</p>
                  </div>

                  {lockedBySla ? (
                    <div className="mt-5 flex flex-wrap items-center gap-3">
                      <p className="text-sm font-semibold text-orange-900">
                        SLA 3 hari terlewati. Akses assign RT diblokir dan tiket harus dieskalasi ke RW.
                      </p>
                      <button
                        className="rounded-full bg-orange-600 px-5 py-2 text-xs font-extrabold uppercase text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
                        disabled={processingId === complaint.id_complaint}
                        onClick={() => handleEscalate(complaint)}
                        type="button"
                      >
                        Tandai Eskalasi
                      </button>
                    </div>
                  ) : complaint.status === 'PENDING' ? (
                    <div className="mt-5 flex flex-wrap gap-3">
                      <button
                        className="rounded-full bg-black px-5 py-2 text-xs font-extrabold uppercase text-white transition hover:bg-neutral-900 disabled:cursor-not-allowed disabled:opacity-50"
                        disabled={processingId === complaint.id_complaint}
                        onClick={() => handleAssign(complaint)}
                        type="button"
                      >
                        Tugaskan
                      </button>
                    </div>
                  ) : null}
                </article>
              )
            })}
          </div>
        )}
      </section>
    </PageShell>
  )
}
