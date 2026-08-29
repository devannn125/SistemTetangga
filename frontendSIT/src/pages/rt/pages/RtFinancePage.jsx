import { useEffect, useMemo, useState } from 'react'
import { PageShell } from '../../../components/layout/PageShell'
import { DataTable } from '../../../components/ui/DataTable'
import { Button } from '../../../components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle, CardDesc } from '../../../components/ui/Card'
import { getFinanceTransactions } from '../../../services/api'

function formatCurrency(value) {
  return `Rp ${Number(value || 0).toLocaleString('id-ID')}`
}

function formatDate(value) {
  if (!value) return '-'
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value))
}

function monthLabel(value) {
  return new Intl.DateTimeFormat('id-ID', { month: 'short' }).format(new Date(value))
}

function normalizeTransactions(response) {
  return Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : []
}

function buildMonthlyData(transactions) {
  const groups = new Map()
  transactions.forEach((transaction) => {
    const date = transaction.tanggal || transaction.created_at
    if (!date) return
    const key = date.slice(0, 7)
    const current = groups.get(key) || { key, label: monthLabel(date), income: 0, expense: 0 }
    if (transaction.tipe === 'PEMASUKAN') current.income += Number(transaction.jumlah || 0)
    if (transaction.tipe === 'PENGELUARAN') current.expense += Number(transaction.jumlah || 0)
    groups.set(key, current)
  })
  return [...groups.values()].sort((a, b) => a.key.localeCompare(b.key)).slice(-6)
}

function CashflowBars({ data }) {
  const maxValue = Math.max(...data.flatMap((item) => [item.income, item.expense]), 1)
  return (
    <div className="h-56 rounded-lg bg-neutral-50 px-4 py-4">
      <div className="flex h-full items-end justify-between gap-3">
        {data.map((item) => (
          <div className="flex h-full min-w-0 flex-1 flex-col justify-end gap-1.5" key={item.key}>
            <div className="flex flex-1 items-end justify-center gap-1">
              <div
                className="w-full max-w-6 rounded-t-md bg-emerald-500"
                style={{ height: `${Math.max((item.income / maxValue) * 100, item.income ? 4 : 0)}%` }}
                title={`Pemasukan ${formatCurrency(item.income)}`}
              />
              <div
                className="w-full max-w-6 rounded-t-md bg-red-400"
                style={{ height: `${Math.max((item.expense / maxValue) * 100, item.expense ? 4 : 0)}%` }}
                title={`Pengeluaran ${formatCurrency(item.expense)}`}
              />
            </div>
            <span className="truncate text-center text-[10px] font-semibold text-neutral-400">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function downloadCsv(rows) {
  const headers = ['Tanggal', 'Tipe', 'Kategori', 'Deskripsi', 'Jumlah']
  const body = rows.map((row) => [
    row.tanggal || row.created_at || '',
    row.tipe || '',
    row.kategori || '',
    row.deskripsi || '',
    row.jumlah || 0,
  ])
  const csv = [headers, ...body]
    .map((line) => line.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(','))
    .join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'rekap-keuangan-rt.csv'
  link.click()
  URL.revokeObjectURL(url)
}

const COLUMNS = [
  {
    key: 'tanggal',
    label: 'Tanggal',
    render: (row) => formatDate(row.tanggal || row.created_at),
  },
  {
    key: 'tipe',
    label: 'Tipe',
    render: (row) => (
      <span className={`text-xs font-semibold ${row.tipe === 'PEMASUKAN' ? 'text-emerald-700' : 'text-red-600'}`}>
        {row.tipe}
      </span>
    ),
  },
  { key: 'kategori', label: 'Kategori', render: (row) => row.kategori || '-' },
  { key: 'deskripsi', label: 'Deskripsi', render: (row) => row.deskripsi || '-' },
  {
    key: 'jumlah',
    label: 'Jumlah',
    render: (row) => (
      <span className={`font-semibold ${row.tipe === 'PEMASUKAN' ? 'text-emerald-700' : 'text-red-600'}`}>
        {row.tipe === 'PEMASUKAN' ? '+' : '-'}{formatCurrency(row.jumlah)}
      </span>
    ),
  },
]

const FILTERS = [
  {
    key: 'tipe',
    label: 'Tipe',
    options: [
      { value: 'PEMASUKAN', label: 'Pemasukan' },
      { value: 'PENGELUARAN', label: 'Pengeluaran' },
    ],
  },
]

export default function RtFinancePage() {
  const [transactions, setTransactions] = useState([])
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let alive = true

    async function loadTransactions() {
      setIsLoading(true)
      setError(null)
      try {
        const response = await getFinanceTransactions({ per_page: 100 })
        if (alive) setTransactions(normalizeTransactions(response))
      } catch (err) {
        if (alive) setError(err.message || 'Backend belum dapat dihubungi.')
      } finally {
        if (alive) setIsLoading(false)
      }
    }

    loadTransactions()
    return () => { alive = false }
  }, [])

  const summary = useMemo(() => {
    const income = transactions
      .filter((t) => t.tipe === 'PEMASUKAN')
      .reduce((sum, t) => sum + Number(t.jumlah || 0), 0)
    const expense = transactions
      .filter((t) => t.tipe === 'PENGELUARAN')
      .reduce((sum, t) => sum + Number(t.jumlah || 0), 0)
    return { income, expense, balance: income - expense }
  }, [transactions])

  const monthlyData = useMemo(() => buildMonthlyData(transactions), [transactions])

  return (
    <PageShell
      eyebrow="Keuangan"
      title="Dashboard Keuangan RT"
      description="Akses Ketua RT bersifat baca saja: memantau arus kas, memeriksa transaksi, dan mengunduh rekap tanpa mencatat pemasukan, pengeluaran, atau konfirmasi pembayaran."
    >
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Saldo</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-neutral-900">{formatCurrency(summary.balance)}</p>
              <p className="mt-1 text-sm text-neutral-400">{isLoading ? 'Memuat...' : 'Baca saja untuk Ketua RT'}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Pemasukan</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-emerald-600">{formatCurrency(summary.income)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Pengeluaran</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(summary.expense)}</p>
            </CardContent>
          </Card>
        </div>

        {/* Cashflow chart */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Arus Kas Bulanan</CardTitle>
                <CardDesc className="mt-1">Hijau = pemasukan · Merah = pengeluaran (6 bulan terakhir)</CardDesc>
              </div>
              <Button variant="outline" size="sm" onClick={() => downloadCsv(transactions)}>
                Unduh CSV
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {monthlyData.length ? (
              <CashflowBars data={monthlyData} />
            ) : (
              <p className="py-8 text-center text-sm text-neutral-400">Belum ada transaksi.</p>
            )}
          </CardContent>
        </Card>

        {/* DataTable transaksi */}
        <Card>
          <CardHeader>
            <CardTitle>Riwayat Transaksi</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              data={transactions}
              columns={COLUMNS}
              searchKeys={['deskripsi', 'kategori', 'tipe']}
              searchPlaceholder="Cari deskripsi, kategori, atau tipe..."
              filters={FILTERS}
              loading={isLoading}
              error={error}
              emptyMessage="Belum ada transaksi keuangan."
              getRowKey={(row) => row.id_keuangan_transaksi || `${row.tanggal}-${row.deskripsi}`}
            />
          </CardContent>
        </Card>
      </div>
    </PageShell>
  )
}
