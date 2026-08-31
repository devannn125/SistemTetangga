import { useEffect, useState } from 'react'
import { PageShell } from '../../../components/layout/PageShell'
import { DataTable } from '../../../components/ui/DataTable'
import { StatusBadge } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card'
import { getLetterRequests, updateLetterRequest } from '../../../services/api'
import { useConfirm } from '../../../components/ui/ConfirmContext'
import { useToast } from '../../../components/ui/ToastContext'

function formatDate(value) {
  if (!value) return '-'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '-'
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(d)
}

const FILTERS = [
  {
    key: 'status',
    label: 'Status',
    options: [
      { value: 'DIAJUKAN', label: 'Diajukan' },
      { value: 'DIVERIFIKASI', label: 'Perlu Persetujuan' },
      { value: 'DISETUJUI', label: 'Disetujui' },
      { value: 'DITOLAK', label: 'Ditolak' },
    ],
  },
  {
    key: 'jenis_surat',
    label: 'Jenis Surat',
    options: [
      { value: 'DOMISILI', label: 'Domisili' },
      { value: 'USAHA', label: 'Usaha' },
    ],
  },
]

export default function ApprovalLetterPage() {
  const [letters, setLetters] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [processingId, setProcessingId] = useState('')
  const confirm = useConfirm()
  const { showToast } = useToast()

  useEffect(() => {
    let alive = true

    async function loadLetters() {
      setIsLoading(true)
      setError(null)
      try {
        const response = await getLetterRequests({ per_page: 100 })
        const rows = Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : []
        if (alive) setLetters(rows)
      } catch (err) {
        if (alive) setError(err.message || 'Backend belum dapat dihubungi.')
      } finally {
        if (alive) setIsLoading(false)
      }
    }

    loadLetters()
    return () => { alive = false }
  }, [])

  async function handleDecision(id, status) {
    const approved = await confirm({
      title: status === 'DISETUJUI' ? 'Konfirmasi Persetujuan' : 'Konfirmasi Penolakan',
      message:
        status === 'DISETUJUI'
          ? 'Setujui permohonan surat ini dan terbitkan tanda tangan digital RT?'
          : 'Tolak permohonan surat ini?',
      confirmLabel: status === 'DISETUJUI' ? 'Ya, Setujui' : 'Ya, Tolak',
    })
    if (!approved) return
    setProcessingId(id)
    try {
      await updateLetterRequest(id, { status })
      setLetters((current) =>
        current.map((letter) => (letter.id_letter_request === id ? { ...letter, status } : letter)),
      )
      showToast(`Permohonan surat berhasil ${status === 'DISETUJUI' ? 'disetujui' : 'ditolak'}.`)
    } catch (err) {
      showToast(err.message || 'Gagal memperbarui status surat.', 'error')
    } finally {
      setProcessingId('')
    }
  }

  const COLUMNS = [
    {
      key: 'jenis_surat',
      label: 'Jenis Surat',
      render: (value, row) => (
        <span className="font-medium text-neutral-900">
          {value === 'DOMISILI' ? 'Surat Ket. Domisili' : 'Surat Ket. Usaha'}
        </span>
      ),
    },
    {
      key: 'pemohon',
      label: 'Pemohon',
      render: (value, row) => value?.nama_lengkap || '-',
    },
    {
      key: 'keperluan',
      label: 'Keperluan / Usaha',
      render: (value, row) => row.jenis_surat === 'DOMISILI' ? (value || '-') : (row.nama_usaha || '-'),
    },
    { key: 'created_at', label: 'Diajukan', render: (value, row) => formatDate(value) },
    { key: 'status', label: 'Status', render: (value, row) => <StatusBadge status={value} /> },
    {
      key: 'actions',
      label: 'Aksi',
      render: (value, row) => (row.status === 'DIVERIFIKASI' || row.status === 'DIAJUKAN') ? (
        <div className="flex items-center gap-2">
          <Button
            variant="default"
            size="sm"
            disabled={processingId === row.id_letter_request}
            onClick={(e) => { e.stopPropagation(); handleDecision(row.id_letter_request, 'DISETUJUI') }}
          >
            Setujui
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={processingId === row.id_letter_request}
            onClick={(e) => { e.stopPropagation(); handleDecision(row.id_letter_request, 'DITOLAK') }}
          >
            Tolak
          </Button>
        </div>
      ) : null,
    },
  ]

  return (
    <PageShell
      description="Berikan persetujuan (tanda tangan digital RT) pada permohonan surat warga."
      eyebrow="Surat Keterangan"
      title="Approval Permohonan Surat"
    >
      <Card>
        <CardHeader>
          <CardTitle>Daftar Permohonan Surat</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={letters}
            columns={COLUMNS}
            searchKeys={['jenis_surat', 'keperluan', 'nama_usaha']}
            searchPlaceholder="Cari nama pemohon atau jenis surat..."
            filters={FILTERS}
            loading={isLoading}
            error={error}
            emptyMessage="Tidak ada permohonan surat."
            rowKey="id_letter_request"
          />
        </CardContent>
      </Card>
    </PageShell>
  )
}