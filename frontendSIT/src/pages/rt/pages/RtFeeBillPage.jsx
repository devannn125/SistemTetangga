import { useEffect, useMemo, useState } from 'react'
import { PageShell } from '../../../components/layout/PageShell'
import { DataTable } from '../../../components/ui/DataTable'
import { StatusBadge } from '../../../components/ui/Badge'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card'
import { getFeeBills } from '../../../services/api'

function formatCurrency(value) {
  return `Rp ${Number(value || 0).toLocaleString('id-ID')}`
}

function formatDate(value) {
  if (!value) return '-'
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value))
}

function normalizeBills(response) {
  return Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : []
}

const COLUMNS = [
  { key: 'periode', label: 'Periode', render: (row) => <span className="font-semibold text-neutral-900">{row.periode}</span> },
  {
    key: 'family',
    label: 'Keluarga',
    render: (row) => row.family?.kepala_keluarga?.nama_lengkap || row.family?.no_kk || '-',
  },
  { key: 'jatuh_tempo', label: 'Jatuh Tempo', render: (row) => formatDate(row.jatuh_tempo) },
  {
    key: 'jumlah_tagihan',
    label: 'Jumlah',
    render: (row) => <span className="font-semibold">{formatCurrency(row.jumlah_tagihan)}</span>,
  },
  {
    key: 'status',
    label: 'Status',
    render: (row) => <StatusBadge status={row.status} />,
  },
  { key: 'dikonfirmasi_at', label: 'Dikonfirmasi', render: (row) => formatDate(row.dikonfirmasi_at) },
]

const FILTERS = [
  {
    key: 'status',
    label: 'Status',
    options: [
      { value: 'BELUM_BAYAR', label: 'Belum Bayar' },
      { value: 'SEBAGIAN', label: 'Sebagian' },
      { value: 'LUNAS', label: 'Lunas' },
    ],
  },
]

export default function RtFeeBillPage() {
  const [bills, setBills] = useState([])
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let alive = true

    async function loadBills() {
      setIsLoading(true)
      setError(null)
      try {
        const response = await getFeeBills({ per_page: 100 })
        if (alive) setBills(normalizeBills(response))
      } catch (err) {
        if (alive) setError(err.message || 'Backend belum dapat dihubungi.')
      } finally {
        if (alive) setIsLoading(false)
      }
    }

    loadBills()
    return () => { alive = false }
  }, [])

  const summary = useMemo(() => {
    return bills.reduce(
      (acc, bill) => {
        const amount = Number(bill.jumlah_tagihan || 0)
        acc.total += amount
        if (bill.status === 'LUNAS') acc.paid += amount
        else acc.unpaid += amount
        return acc
      },
      { total: 0, paid: 0, unpaid: 0 },
    )
  }, [bills])

  return (
    <PageShell
      eyebrow="Iuran"
      title="Monitoring Iuran Bulanan"
      description="Ketua RT memantau tagihan iuran per KK. Pembuatan tagihan dan konfirmasi pelunasan adalah kewenangan Bendahara RT."
    >
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Total Tagihan</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-neutral-900">{formatCurrency(summary.total)}</p>
              <p className="mt-1 text-sm text-neutral-400">
                {isLoading ? 'Memuat...' : `${bills.length} tagihan`}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Terbayar (Lunas)</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-emerald-600">{formatCurrency(summary.paid)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Belum Terbayar</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-amber-600">{formatCurrency(summary.unpaid)}</p>
            </CardContent>
          </Card>
        </div>

        {/* DataTable dengan search + filter */}
        <Card>
          <CardHeader>
            <CardTitle>Daftar Tagihan</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              data={bills}
              columns={COLUMNS}
              searchKeys={['periode']}
              searchPlaceholder="Cari periode atau nama keluarga..."
              filters={FILTERS}
              loading={isLoading}
              error={error}
              emptyMessage="Belum ada tagihan iuran."
              rowKey="id_iuran_tagihan"
              getRowKey={(row) => row.id_iuran_tagihan || row.id_fee_bill}
            />
          </CardContent>
        </Card>
      </div>
    </PageShell>
  )
}
