import { useEffect, useMemo, useState } from 'react'
import { PageShell } from '@/components/layout/PageShell'
import { getFinanceTransactions } from '@/services/api'
import { formatCurrency, formatDate } from './utils'

export default function RwFinancePage() {
  const [transactions, setTransactions] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    getFinanceTransactions({ per_page: 100 }).then(res => {
      setTransactions(Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [])
      setIsLoading(false)
    }).catch(err => {
      console.error(err)
      setIsLoading(false)
    })
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

  return (
    <PageShell
      eyebrow="Keuangan"
      title="Monitor Keuangan Wilayah"
      description="Akses monitor Ketua RW: memantau total kas dan rekapitulasi pemasukan serta pengeluaran RT."
    >
      <section className="mt-8 space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <article className="rounded-xl border border-neutral-300 bg-white p-6">
            <p className="text-xs font-bold uppercase text-neutral-500">Total Saldo Kas</p>
            <div className="mt-3 text-2xl font-extrabold text-black">{formatCurrency(summary.balance)}</div>
            <p className="mt-2 text-sm text-neutral-600">{isLoading ? 'Memuat data...' : 'Akses read-only RW'}</p>
          </article>
          <article className="rounded-xl border border-neutral-300 bg-white p-6">
            <p className="text-xs font-bold uppercase text-neutral-500">Total Pemasukan</p>
            <div className="mt-3 text-2xl font-extrabold text-emerald-700">{formatCurrency(summary.income)}</div>
          </article>
          <article className="rounded-xl border border-neutral-300 bg-white p-6">
            <p className="text-xs font-bold uppercase text-neutral-500">Total Pengeluaran</p>
            <div className="mt-3 text-2xl font-extrabold text-red-600">{formatCurrency(summary.expense)}</div>
          </article>
        </div>

        <div className="rounded-2xl border border-neutral-300 bg-white p-6">
          <h3 className="text-lg font-extrabold text-black mb-4">Daftar Transaksi</h3>
          {isLoading ? (
            <div className="p-8 text-center text-sm text-neutral-500">Memuat...</div>
          ) : (
            <ul className="divide-y divide-neutral-200">
              {transactions.length === 0 ? (
                <li className="py-4 text-center text-neutral-500">Belum ada transaksi tercatat</li>
              ) : (
                transactions.map((t) => (
                  <li key={t.id_keuangan_transaksi} className="flex items-center justify-between gap-4 py-4">
                    <div>
                      <div className="text-sm font-bold text-black">{t.deskripsi || t.kategori || 'Transaksi'}</div>
                      <div className="text-xs text-neutral-500">Tanggal: {formatDate(t.tanggal)} · RT: {t.wilayah?.nama_wilayah || '-'}</div>
                    </div>
                    <div className={`text-right text-sm font-extrabold ${t.tipe === 'PEMASUKAN' ? 'text-emerald-700' : 'text-red-600'}`}>
                      {t.tipe === 'PEMASUKAN' ? '+' : '-'}{formatCurrency(t.jumlah)}
                    </div>
                  </li>
                ))
              )}
            </ul>
          )}
        </div>
      </section>
    </PageShell>
  )
}
