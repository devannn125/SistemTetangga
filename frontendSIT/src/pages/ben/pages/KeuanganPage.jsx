import { useEffect, useState } from 'react'
import { PageShell } from '@/components/layout/PageShell'
import { getFinanceTransactions, createFinanceTransaction, deleteFinanceTransaction } from '@/services/api'
import { useConfirm } from '@/components/ui/ConfirmContext'
import { useToast } from '@/components/ui/ToastContext'
import { toRows, formatCurrency, formatDate } from './utils'

const initialTransaction = { tipe: 'PEMASUKAN', kategori: '', jumlah: '', tanggal: '', deskripsi: '' }

export default function KeuanganPage() {
  const [transactions, setTransactions] = useState([])
  const [form, setForm] = useState(initialTransaction)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [notice, setNotice] = useState('')
  const confirm = useConfirm()
  const { showToast } = useToast()

  useEffect(() => {
    let alive = true

    async function load() {
      setIsLoading(true)
      try {
        const response = await getFinanceTransactions({ per_page: 100 })
        if (alive) setTransactions(toRows(response))
      } catch (error) {
        if (alive) setNotice(error.message || 'Backend belum dapat dihubungi.')
      } finally {
        if (alive) setIsLoading(false)
      }
    }

    load()

    return () => {
      alive = false
    }
  }, [])

  const income = transactions.filter((t) => t.tipe === 'PEMASUKAN').reduce((s, t) => s + Number(t.jumlah || 0), 0)
  const expense = transactions.filter((t) => t.tipe === 'PENGELUARAN').reduce((s, t) => s + Number(t.jumlah || 0), 0)

  function updateForm(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  async function handleCreate(event) {
    event.preventDefault()
    const approved = await confirm({
      title: 'Konfirmasi Simpan',
      message: `Catat ${form.tipe === 'PEMASUKAN' ? 'pemasukan' : 'pengeluaran'} sebesar ${formatCurrency(form.jumlah)}${form.kategori ? ` (${form.kategori})` : ''}?`,
      confirmLabel: 'Ya, Simpan',
    })
    if (!approved) return
    setIsSubmitting(true)
    try {
      const response = await createFinanceTransaction({
        tipe: form.tipe,
        kategori: form.kategori.trim() || null,
        jumlah: Number(form.jumlah),
        tanggal: form.tanggal,
        deskripsi: form.deskripsi.trim() || null,
      })
      const created = response?.data || response
      setTransactions((current) => [created, ...current])
      setForm(initialTransaction)
      showToast('Transaksi berhasil dicatat.')
    } catch (error) {
      showToast(error.message || 'Gagal menyimpan transaksi.', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDelete(id) {
    const approved = await confirm({
      title: 'Konfirmasi Hapus',
      message: 'Yakin ingin menghapus transaksi ini?',
      confirmLabel: 'Ya, Hapus',
    })
    if (!approved) return
    try {
      await deleteFinanceTransaction(id)
      setTransactions((current) => current.filter((t) => t.id_keuangan_transaksi !== id))
      showToast('Transaksi berhasil dihapus.')
    } catch (error) {
      showToast(error.message || 'Gagal menghapus transaksi.', 'error')
    }
  }

  return (
    <PageShell eyebrow="Keuangan" title="Kas RT" description="Catat pemasukan & pengeluaran kas RT.">
      <section className="mt-8 space-y-6">
        {notice ? (
          <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-semibold text-sky-900">{notice}</div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-3">
          <article className="rounded-2xl border border-neutral-300 bg-white p-6">
            <p className="text-xs font-bold text-neutral-500">Pemasukan</p>
            <div className="mt-3 text-2xl font-extrabold text-emerald-700">{formatCurrency(income)}</div>
          </article>
          <article className="rounded-2xl border border-neutral-300 bg-white p-6">
            <p className="text-xs font-bold text-neutral-500">Pengeluaran</p>
            <div className="mt-3 text-2xl font-extrabold text-red-600">{formatCurrency(expense)}</div>
          </article>
          <article className="rounded-2xl border border-neutral-300 bg-white p-6">
            <p className="text-xs font-bold text-neutral-500">Saldo</p>
            <div className="mt-3 text-2xl font-extrabold text-black">{formatCurrency(income - expense)}</div>
          </article>
        </div>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-3">
            {isLoading ? (
              <div className="rounded-2xl border border-neutral-300 bg-white p-8 text-center text-sm font-semibold text-neutral-600">Memuat transaksi...</div>
            ) : transactions.length === 0 ? (
              <div className="rounded-2xl border border-neutral-300 bg-white p-8 text-center text-sm font-semibold text-neutral-600">Belum ada transaksi.</div>
            ) : (
              transactions.map((t) => (
                <article key={t.id_keuangan_transaksi} className="flex items-center justify-between gap-4 rounded-2xl border border-neutral-300 bg-white p-5">
                  <div>
                    <div className="text-sm font-bold text-black">{t.deskripsi || t.kategori || 'Transaksi'}</div>
                    <div className="text-xs text-neutral-500">{formatDate(t.tanggal)}{t.kategori ? ` · ${t.kategori}` : ''}</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className={`text-right text-sm font-extrabold ${t.tipe === 'PEMASUKAN' ? 'text-emerald-700' : 'text-red-600'}`}>
                      {t.tipe === 'PEMASUKAN' ? '+' : '-'}{formatCurrency(t.jumlah)}
                    </div>
                    <button className="text-xs font-bold text-red-600 hover:underline" onClick={() => handleDelete(t.id_keuangan_transaksi)} type="button">Hapus</button>
                  </div>
                </article>
              ))
            )}
          </div>

          <aside className="h-fit rounded-2xl border border-neutral-300 bg-white p-6">
            <h2 className="text-lg font-extrabold text-black">Catat Transaksi</h2>
            <form className="mt-4 space-y-4" onSubmit={handleCreate}>
              <label className="grid gap-2 text-sm font-bold text-black">
                Tipe
                <select value={form.tipe} onChange={(e) => updateForm('tipe', e.target.value)} className="h-11 w-full rounded-xl border border-neutral-300 bg-white px-4 text-sm outline-none focus:border-sky-600">
                  <option value="PEMASUKAN">Pemasukan</option>
                  <option value="PENGELUARAN">Pengeluaran</option>
                </select>
              </label>
              <label className="grid gap-2 text-sm font-bold text-black">
                Kategori
                <input value={form.kategori} onChange={(e) => updateForm('kategori', e.target.value)} className="h-11 w-full rounded-xl border border-neutral-300 px-4 text-sm outline-none focus:border-sky-600" placeholder="Contoh: Iuran warga" />
              </label>
              <label className="grid gap-2 text-sm font-bold text-black">
                Jumlah
                <input type="number" min="0" step="500" value={form.jumlah} onChange={(e) => updateForm('jumlah', e.target.value)} className="h-11 w-full rounded-xl border border-neutral-300 px-4 text-sm outline-none focus:border-sky-600" placeholder="0" />
              </label>
              <label className="grid gap-2 text-sm font-bold text-black">
                Tanggal
                <input type="date" value={form.tanggal} onChange={(e) => updateForm('tanggal', e.target.value)} className="h-11 w-full rounded-xl border border-neutral-300 px-4 text-sm outline-none focus:border-sky-600" />
              </label>
              <label className="grid gap-2 text-sm font-bold text-black">
                Deskripsi
                <input value={form.deskripsi} onChange={(e) => updateForm('deskripsi', e.target.value)} className="h-11 w-full rounded-xl border border-neutral-300 px-4 text-sm outline-none focus:border-sky-600" placeholder="Keterangan" />
              </label>
              <button className="w-full rounded-full bg-black px-5 py-3 text-sm font-extrabold uppercase text-white transition hover:bg-neutral-900 disabled:cursor-not-allowed disabled:bg-neutral-400" disabled={isSubmitting} type="submit">
                {isSubmitting ? 'Menyimpan...' : 'Simpan'}
              </button>
            </form>
          </aside>
        </div>
      </section>
    </PageShell>
  )
}
