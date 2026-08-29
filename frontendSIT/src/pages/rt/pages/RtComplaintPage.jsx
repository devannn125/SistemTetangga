import { useEffect, useMemo, useState } from 'react'
import { PageShell } from '../../../components/layout/PageShell'
import { DataTable } from '../../../components/ui/DataTable'
import { StatusBadge } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import { Alert } from '../../../components/ui/Alert'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card'
import { getComplaints, updateComplaint } from '../../../services/api'
import { useConfirm } from '../../../components/ui/ConfirmContext'
import { useToast } from '../../../components/ui/ToastContext'

function formatDate(value) {
  if (!value) return '-'
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value))
}

function isPastSla(complaint) {
  if (complaint.status !== 'PENDING') return false
  const createdAt = new Date(complaint.created_at || complaint.tanggal)
  if (Number.isNaN(createdAt.getTime())) return false
  const threeDays = 3 * 24 * 60 * 60 * 1000
  return Date.now() - createdAt.getTime() > threeDays
}

const FILTERS = [
  {
    key: 'status',
    label: 'Status',
    options: [
      { value: 'PENDING', label: 'Perlu Ditugaskan' },
      { value: 'DIPROSES', label: 'Diproses' },
      { value: 'ESKALASI', label: 'Eskalasi' },
      { value: 'SELESAI', label: 'Selesai' },
    ],
  },
  {
    key: 'kategori',
    label: 'Kategori',
    options: [
      { value: 'Infrastruktur', label: 'Infrastruktur' },
      { value: 'Keamanan', label: 'Keamanan' },
      { value: 'Kebersihan', label: 'Kebersihan' },
      { value: 'Sosial', label: 'Sosial' },
      { value: 'Lainnya', label: 'Lainnya' },
    ],
  },
  {
    key: 'urgensi',
    label: 'Urgensi',
    options: [
      { value: 'Rendah', label: 'Rendah' },
      { value: 'Sedang', label: 'Sedang' },
      { value: 'Tinggi', label: 'Tinggi' },
      { value: 'Darurat', label: 'Darurat' },
    ],
  },
]

export default function RtComplaintPage() {
  const [complaints, setComplaints] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [processingId, setProcessingId] = useState('')
  const confirm = useConfirm()
  const { showToast } = useToast()

  useEffect(() => {
    let alive = true

    async function loadComplaints() {
      setIsLoading(true)
      setError(null)
      try {
        const response = await getComplaints({ per_page: 100 })
        const rows = Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : []
        if (alive) setComplaints(rows)
      } catch (err) {
        if (alive) setError(err.message || 'Backend belum dapat dihubungi.')
      } finally {
        if (alive) setIsLoading(false)
      }
    }

    loadComplaints()
    return () => { alive = false }
  }, [])

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
      showToast('Pengaduan berhasil ditugaskan.')
    } catch (err) {
      showToast(err.message || 'Gagal menugaskan pengaduan.', 'error')
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
    } catch (err) {
      showToast(err.message || 'Gagal menandai eskalasi.', 'error')
    } finally {
      setProcessingId('')
    }
  }

  // SLA overdue count untuk info
  const slaOverdueCount = useMemo(
    () => complaints.filter((c) => isPastSla(c)).length,
    [complaints],
  )

  const COLUMNS = [
    {
      key: 'nomor_tiket',
      label: 'Tiket',
      render: (row) => (
        <span className="font-mono text-xs text-neutral-500">
          {row.nomor_tiket || `#${row.id_complaint}`}
        </span>
      ),
    },
    {
      key: 'judul',
      label: 'Judul',
      render: (row) => (
        <div>
          <p className="font-medium text-neutral-900">{row.judul}</p>
          <p className="mt-0.5 text-xs text-neutral-400 line-clamp-1">{row.deskripsi}</p>
        </div>
      ),
    },
    { key: 'kategori', label: 'Kategori' },
    { key: 'urgensi', label: 'Urgensi' },
    { key: 'created_at', label: 'Tanggal', render: (row) => formatDate(row.created_at) },
    {
      key: 'status',
      label: 'Status',
      render: (row) => {
        const lockedBySla = isPastSla(row)
        return <StatusBadge status={lockedBySla ? 'ESKALASI' : row.status} />
      },
    },
    {
      key: 'actions',
      label: 'Aksi',
      render: (row) => {
        const lockedBySla = isPastSla(row)
        if (lockedBySla) {
          return (
            <Button
              variant="warning"
              size="sm"
              disabled={processingId === row.id_complaint}
              onClick={(e) => { e.stopPropagation(); handleEscalate(row) }}
            >
              Eskalasi ke RW
            </Button>
          )
        }
        if (row.status === 'PENDING') {
          return (
            <Button
              variant="default"
              size="sm"
              disabled={processingId === row.id_complaint}
              onClick={(e) => { e.stopPropagation(); handleAssign(row) }}
            >
              Tugaskan
            </Button>
          )
        }
        return null
      },
    },
  ]

  return (
    <PageShell
      eyebrow="SIPANDU"
      title="Assign Pengaduan Warga"
      description="RT menugaskan tiket pending ke petugas. Tiket pending lebih dari 3 hari dikunci dari proses assign RT dan diarahkan untuk eskalasi ke RW."
    >
      <div className="space-y-4">
        {slaOverdueCount > 0 && (
          <Alert variant="warning" title={`${slaOverdueCount} pengaduan melewati SLA 3 hari`}>
            Segera eskalasikan pengaduan tersebut ke RW.
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Daftar Pengaduan</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              data={complaints}
              columns={COLUMNS}
              searchKeys={['judul', 'deskripsi', 'nomor_tiket', 'lokasi']}
              searchPlaceholder="Cari judul, nomor tiket, atau lokasi..."
              filters={FILTERS}
              loading={isLoading}
              error={error}
              emptyMessage="Tidak ada pengaduan."
              rowKey="id_complaint"
            />
          </CardContent>
        </Card>
      </div>
    </PageShell>
  )
}
