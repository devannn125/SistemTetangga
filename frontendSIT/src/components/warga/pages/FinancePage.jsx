import { Icon } from '../../ui/Icon'

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

export default function FinancePage() {
  const transactions = [
    { id: 1, title: 'Iuran bulan Januari 2024', amount: 5500000, type: 'in', date: '31 Jan 2024' },
    { id: 2, title: 'Gaji petugas kebersihan Januari', amount: 1500000, type: 'out', date: '31 Jan 2024' },
    { id: 3, title: 'Pembayaran listrik Balai RT', amount: 350000, type: 'out', date: '25 Jan 2024' },
  ]

  return (
    <PageShell eyebrow="Transparansi Keuangan" title="Transparansi Keuangan" description="Lihat ringkasan arus kas RT dan daftar transaksi bulanan.">
      <section className="mt-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <article className="rounded-xl border border-neutral-300 bg-white p-6">
            <p className="text-xs font-bold text-neutral-500">Total Saldo</p>
            <div className="mt-3 text-2xl font-extrabold text-black">Rp 10.600.000</div>
            <p className="mt-2 text-sm text-neutral-600">Periode Januari - Maret 2024</p>
          </article>
          <article className="rounded-xl border border-neutral-300 bg-white p-6">
            <p className="text-xs font-bold text-neutral-500">Total Pemasukan</p>
            <div className="mt-3 text-2xl font-extrabold text-emerald-700">Rp 19.600.000</div>
          </article>
          <article className="rounded-xl border border-neutral-300 bg-white p-6">
            <p className="text-xs font-bold text-neutral-500">Total Pengeluaran</p>
            <div className="mt-3 text-2xl font-extrabold text-red-600">Rp 9.000.000</div>
          </article>
        </div>

        <div className="rounded-2xl border border-neutral-300 bg-white p-6">
          <p className="text-sm font-bold text-neutral-700">Arus Kas (placeholder chart)</p>
          <div className="mt-4 h-52 w-full rounded-lg bg-neutral-100" />
        </div>

        <div className="rounded-2xl border border-neutral-300 bg-white p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-extrabold text-black">Daftar Transaksi</h3>
            <input className="ml-4 rounded-full border border-neutral-300 px-4 py-2 text-sm outline-none" placeholder="Cari transaksi..." />
          </div>
          <ul className="mt-4 divide-y">
            {transactions.map((t) => (
              <li key={t.id} className="flex items-center justify-between py-4">
                <div>
                  <div className="text-sm font-bold text-black">{t.title}</div>
                  <div className="text-xs text-neutral-500">{t.date}</div>
                </div>
                <div className={`text-sm font-extrabold ${t.type === 'in' ? 'text-emerald-700' : 'text-red-600'}`}>
                  {t.type === 'in' ? '+' : '-'}Rp {t.amount.toLocaleString('id')}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </PageShell>
  )
}
