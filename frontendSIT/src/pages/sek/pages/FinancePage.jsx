import { useEffect, useMemo, useState } from 'react'
import { PageShell } from '../../../components/layout/PageShell'
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
    <div className="mt-5 h-64 rounded-xl bg-neutral-50 px-4 py-5">
      <div className="flex h-full items-end justify-between gap-3">
        {data.map((item) => (
          <div className="flex h-full min-w-0 flex-1 flex-col justify-end gap-2" key={item.key}>
            <div className="flex flex-1 items-end justify-center gap-1.5">
              <div
                className="w-full max-w-8 rounded-t-lg bg-emerald-600"
                style={{ height: `${Math.max((item.income / maxValue) * 100, item.income ? 6 : 0)}%` }}
                title={`Pemasukan ${formatCurrency(item.income)}`}
              />
              <div
                className="w-full max-w-8 rounded-t-lg bg-red-500"
                style={{ height: `${Math.max((item.expense / maxValue) * 100, item.expense ? 6 : 0)}%` }}
                title={`Pengeluaran ${formatCurrency(item.expense)}`}
              />
            </div>
            <span className="truncate text-center text-xs font-bold text-neutral-500">{item.label}</span>
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

export default function FinancePage() {
  const [transactions, setTransactions] = useState([])
  const [searchText, setSearchText] = useState('')
  const [notice, setNotice] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let alive = true

    async function loadTransactions() {
      setIsLoading(true)
      try {
        const response = await getFinanceTransactions({ per_page: 100 })
        if (alive) setTransactions(normalizeTransactions(response))
      } catch (error) {
        if (alive) setNotice(error.message || 'Backend belum dapat dihubungi.')
      } finally {
        if (alive) setIsLoading(false)
      }
    }

    loadTransactions()

    return () => {
      alive = false
    }
  }, [])

  const summary = useMemo(() => {
    const income = transactions
      .filter((transaction) => transaction.tipe === 'PEMASUKAN')
      .reduce((sum, transaction) => sum + Number(transaction.jumlah || 0), 0)
    const expense = transactions
      .filter((transaction) => transaction.tipe === 'PENGELUARAN')
      .reduce((sum, transaction) => sum + Number(transaction.jumlah || 0), 0)

    return { income, expense, balance: income - expense }
  }, [transactions])

  const monthlyData = useMemo(() => buildMonthlyData(transactions), [transactions])
  const filteredTransactions = transactions.filter((transaction) =>
    [transaction.deskripsi, transaction.kategori, transaction.tipe, transaction.tanggal]
      .join(' ')
      .toLowerCase()
      .includes(searchText.toLowerCase()),
  )

  return (
    <PageShell
      eyebrow="Keuangan"
      title="Dashboard Keuangan RT"
      description="Akses Sekretaris bersifat baca saja: memantau arus kas, memeriksa transaksi, dan mengunduh rekap tanpa mencatat pemasukan, pengeluaran, atau konfirmasi pembayaran."
    >
      <section className="mt-8 space-y-6">
        {notice ? (
          <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-semibold text-sky-900">
            {notice}
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-3">
          <article className="rounded-xl border border-neutral-300 bg-white p-6">
            <p className="text-xs font-bold uppercase text-neutral-500">Saldo</p>
            <div className="mt-3 text-2xl font-extrabold text-black">{formatCurrency(summary.balance)}</div>
            <p className="mt-2 text-sm text-neutral-600">{isLoading ? 'Memuat data...' : 'Baca saja untuk Sekretaris RT'}</p>
          </article>
          <article className="rounded-xl border border-neutral-300 bg-white p-6">
            <p className="text-xs font-bold uppercase text-neutral-500">Pemasukan</p>
            <div className="mt-3 text-2xl font-extrabold text-emerald-700">{formatCurrency(summary.income)}</div>
          </article>
          <article className="rounded-xl border border-neutral-300 bg-white p-6">
            <p className="text-xs font-bold uppercase text-neutral-500">Pengeluaran</p>
            <div className="mt-3 text-2xl font-extrabold text-red-600">{formatCurrency(summary.expense)}</div>
          </article>
        </div>

        <div className="rounded-2xl border border-neutral-300 bg-white p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-neutral-700">Arus Kas Bulanan</p>
              <p className="mt-1 text-xs text-neutral-500">Hijau pemasukan, merah pengeluaran.</p>
            </div>
            <button
              className="rounded-full border border-black px-4 py-2 text-xs font-extrabold uppercase text-black transition hover:bg-neutral-100"
              onClick={() => downloadCsv(filteredTransactions)}
              type="button"
            >
              Unduh CSV
            </button>
          </div>
          {monthlyData.length ? (
            <CashflowBars data={monthlyData} />
          ) : (
            <div className="mt-5 rounded-xl bg-neutral-50 p-8 text-center text-sm font-semibold text-neutral-600">
              Belum ada transaksi untuk ditampilkan.
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-neutral-300 bg-white p-6">
          <div className="flex items-center justify-between gap-4 max-sm:flex-col max-sm:items-stretch">
            <h3 className="text-lg font-extrabold text-black">Transaksi Bendahara</h3>
            <input
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              className="rounded-full border border-neutral-300 px-4 py-2 text-sm outline-none focus:border-sky-600"
              placeholder="Cari transaksi..."
            />
          </div>
          <ul className="mt-4 divide-y divide-neutral-200">
            {filteredTransactions.map((transaction) => (
              <li key={transaction.id_keuangan_transaksi || `${transaction.tanggal}-${transaction.deskripsi}`} className="flex items-center justify-between gap-4 py-4">
                <div>
                  <div className="text-sm font-bold text-black">{transaction.deskripsi || transaction.kategori || 'Transaksi'}</div>
                  <div className="text-xs text-neutral-500">{formatDate(transaction.tanggal || transaction.created_at)}</div>
                </div>
                <div className={`text-right text-sm font-extrabold ${transaction.tipe === 'PEMASUKAN' ? 'text-emerald-700' : 'text-red-600'}`}>
                  {transaction.tipe === 'PEMASUKAN' ? '+' : '-'}{formatCurrency(transaction.jumlah)}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </PageShell>
  )
}