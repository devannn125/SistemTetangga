import { useEffect, useMemo, useState } from 'react'
import { getFinanceTransactions } from '../../../services/api'

function PageShell({ children, eyebrow, title, description }) {
  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <section className="border-2 border-neutral-900 bg-white p-8 max-sm:p-5">
        <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-neutral-500">{eyebrow}</p>
        <h1 className="mt-3 text-3xl font-extrabold leading-tight text-black max-sm:text-2xl">{title}</h1>
        {description ? <p className="mt-4 max-w-2xl text-sm leading-6 text-neutral-600">{description}</p> : null}
      </section>
      {children}
    </div>
  )
}

const fallbackTransactions = [
  { id_keuangan_transaksi: 1, deskripsi: 'Iuran bulan Januari 2024', jumlah: 5500000, tipe: 'PEMASUKAN', tanggal: '2024-01-31' },
  { id_keuangan_transaksi: 2, deskripsi: 'Gaji petugas kebersihan Januari', jumlah: 1500000, tipe: 'PENGELUARAN', tanggal: '2024-01-31' },
  { id_keuangan_transaksi: 3, deskripsi: 'Pembayaran listrik Balai RT', jumlah: 350000, tipe: 'PENGELUARAN', tanggal: '2024-01-25' },
  { id_keuangan_transaksi: 4, deskripsi: 'Iuran bulan Februari 2024', jumlah: 6100000, tipe: 'PEMASUKAN', tanggal: '2024-02-28' },
  { id_keuangan_transaksi: 5, deskripsi: 'Perbaikan lampu jalan', jumlah: 900000, tipe: 'PENGELUARAN', tanggal: '2024-02-18' },
  { id_keuangan_transaksi: 6, deskripsi: 'Iuran bulan Maret 2024', jumlah: 8000000, tipe: 'PEMASUKAN', tanggal: '2024-03-31' },
  { id_keuangan_transaksi: 7, deskripsi: 'Kerja bakti dan kebersihan', jumlah: 6250000, tipe: 'PENGELUARAN', tanggal: '2024-03-24' },
]

function normalizeTransactions(response) {
  const rows = Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : []
  return rows.length ? rows : fallbackTransactions
}

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

export default function FinancePage() {
  const [transactions, setTransactions] = useState(fallbackTransactions)
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
        if (alive) setNotice(error.message || 'Backend belum dapat dihubungi. Menampilkan data contoh.')
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
    <PageShell eyebrow="Transparansi Keuangan" title="Transparansi Keuangan" description="Lihat ringkasan arus kas RT dan daftar transaksi bulanan.">
      <section className="mt-6 space-y-6">
        {notice ? (
          <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-semibold text-sky-900">
            {notice}
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-3">
          <article className="rounded-xl border border-neutral-300 bg-white p-6">
            <p className="text-xs font-bold text-neutral-500">Total Saldo</p>
            <div className="mt-3 text-2xl font-extrabold text-black">{formatCurrency(summary.balance)}</div>
            <p className="mt-2 text-sm text-neutral-600">{isLoading ? 'Memuat data...' : 'Berdasarkan transaksi tersedia'}</p>
          </article>
          <article className="rounded-xl border border-neutral-300 bg-white p-6">
            <p className="text-xs font-bold text-neutral-500">Total Pemasukan</p>
            <div className="mt-3 text-2xl font-extrabold text-emerald-700">{formatCurrency(summary.income)}</div>
          </article>
          <article className="rounded-xl border border-neutral-300 bg-white p-6">
            <p className="text-xs font-bold text-neutral-500">Total Pengeluaran</p>
            <div className="mt-3 text-2xl font-extrabold text-red-600">{formatCurrency(summary.expense)}</div>
          </article>
        </div>

        <div className="rounded-2xl border border-neutral-300 bg-white p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-neutral-700">Arus Kas Bulanan</p>
              <p className="mt-1 text-xs text-neutral-500">Hijau untuk pemasukan, merah untuk pengeluaran.</p>
            </div>
            <div className="flex gap-3 text-xs font-bold text-neutral-600">
              <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-emerald-600" /> Pemasukan</span>
              <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-red-500" /> Pengeluaran</span>
            </div>
          </div>
          <CashflowBars data={monthlyData} />
        </div>

        <div className="rounded-2xl border border-neutral-300 bg-white p-6">
          <div className="flex items-center justify-between gap-4 max-sm:flex-col max-sm:items-stretch">
            <h3 className="text-lg font-extrabold text-black">Daftar Transaksi</h3>
            <input
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              className="rounded-full border border-neutral-300 px-4 py-2 text-sm outline-none focus:border-sky-600"
              placeholder="Cari transaksi..."
            />
          </div>
          <ul className="mt-4 divide-y">
            {filteredTransactions.map((transaction) => (
              <li key={transaction.id_keuangan_transaksi || `${transaction.tanggal}-${transaction.deskripsi}`} className="flex items-center justify-between gap-4 py-4">
                <div>
                  <div className="text-sm font-bold text-black">{transaction.deskripsi || transaction.kategori || 'Transaksi'}</div>
                  <div className="text-xs text-neutral-500">{formatDate(transaction.tanggal)}</div>
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
