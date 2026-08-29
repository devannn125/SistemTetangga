import { useEffect, useState } from 'react'
import { PageShell } from '@/components/layout/PageShell'
import { DataTable } from '@/components/ui/DataTable'
import { StatusBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getGuests, updateGuest } from '@/services/api'
import { useConfirm } from '@/components/ui/ConfirmContext'
import { useToast } from '@/components/ui/ToastContext'

function formatDate(value) {
  if (!value) return '-'
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(value))
}

const FILTERS = [
  {
    key: 'status',
    label: 'Status',
    options: [
      { value: 'MENUNGGU', label: 'Menunggu' },
      { value: 'DISETUJUI', label: 'Disetujui' },
      { value: 'DITOLAK', label: 'Ditolak' },
      { value: 'CHECK_OUT', label: 'Check Out' },
    ],
  },
]

export default function ApprovalGuestPage() {
  const [guests, setGuests] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [processingId, setProcessingId] = useState('')
  const confirm = useConfirm()
  const { showToast } = useToast()

  useEffect(() => {
    let alive = true

    async function loadGuests() {
      setIsLoading(true)
      setError(null)
      try {
        const response = await getGuests({ per_page: 100 })
        const rows = Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : []
        if (alive) setGuests(rows)
      } catch (err) {
        if (alive) setError(err.message || 'Backend belum dapat dihubungi.')
      } finally {
        if (alive) setIsLoading(false)
      }
    }

    loadGuests()
    return () => { alive = false }
  }, [])

  async function handleDecision(id, status) {
    const approved = await confirm({
      title: status === 'DISETUJUI' ? 'Konfirmasi Persetujuan' : 'Konfirmasi Penolakan',
      message:
        status === 'DISETUJUI'
          ? 'Setujui pendaftaran tamu ini untuk menginap?'
          : 'Tolak pendaftaran tamu ini?',
      confirmLabel: status === 'DISETUJUI' ? 'Ya, Setujui' : 'Ya, Tolak',
    })
    if (!approved) return
    setProcessingId(id)
    try {
      await updateGuest(id, { status })
      setGuests((current) =>
        current.map((guest) => (guest.id_guest === id ? { ...guest, status } : guest)),
      )
      showToast(`Tamu berhasil ${status === 'DISETUJUI' ? 'disetujui' : 'ditolak'}.`)
    } catch (err) {
      showToast(err.message || 'Gagal memperbarui status tamu.', 'error')
    } finally {
      setProcessingId('')
    }
  }

  const COLUMNS = [
    {
      key: 'nama',
      label: 'Nama Tamu',
      render: (row) => <span className="font-medium text-neutral-900">{row.nama}</span>,
    },
    { key: 'nik', label: 'NIK', render: (row) => row.nik || '-' },
    { key: 'asal', label: 'Asal', render: (row) => row.asal || '-' },
    { key: 'house', label: 'Rumah Tujuan', render: (row) => row.house?.alamat || '-' },
    { key: 'jam_masuk', label: 'Masuk', render: (row) => formatDate(row.jam_masuk) },
    { key: 'jam_keluar', label: 'Keluar', render: (row) => formatDate(row.jam_keluar) },
    { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    {
      key: 'actions',
      label: 'Aksi',
      render: (row) => row.status === 'MENUNGGU' ? (
        <div className="flex items-center gap-2">
          <Button
            variant="default"
            size="sm"
            disabled={processingId === row.id_guest}
            onClick={(e) => { e.stopPropagation(); handleDecision(row.id_guest, 'DISETUJUI') }}
          >
            Setujui
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={processingId === row.id_guest}
            onClick={(e) => { e.stopPropagation(); handleDecision(row.id_guest, 'DITOLAK') }}
          >
            Tolak
          </Button>
        </div>
      ) : null,
    },
  ]

  return (
    <PageShell
      description="Setujui atau tolak pendaftaran tamu yang diajukan warga. Tamu yang tinggal lebih dari 1x24 jam wajib mendapat persetujuan RT."
      eyebrow="Tamu"
      title="Approval Pendaftaran Tamu"
    >
      <Card>
        <CardHeader>
          <CardTitle>Daftar Pendaftaran Tamu</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={guests}
            columns={COLUMNS}
            searchKeys={['nama', 'nik', 'asal']}
            searchPlaceholder="Cari nama, NIK, atau asal tamu..."
            filters={FILTERS}
            loading={isLoading}
            error={error}
            emptyMessage="Tidak ada pendaftaran tamu."
            rowKey="id_guest"
          />
        </CardContent>
      </Card>
    </PageShell>
  )
}