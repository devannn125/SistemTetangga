import { useEffect, useState } from 'react'
import { PageShell } from '@/components/layout/PageShell'
import { getAuthData } from '@/services/authService'
import { DemographyCharts } from '@/components/dashboard/DemographyCharts'

function toArray(res) {
  return Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []
}

function rupiah(n) {
  return `Rp ${Number(n || 0).toLocaleString('id-ID')}`
}

export default function HomePage() {
  const authUser = getAuthData()
  const [income, setIncome] = useState(0)
  const [expense, setExpense] = useState(0)
  const [paid, setPaid] = useState(0)
  const [unpaid, setUnpaid] = useState(0)
  const [bansos, setBansos] = useState(0)
  const [summary, setSummary] = useState(null)

  useEffect(() => {
    import('@/services/api').then((api) => {
      api.getFinanceTransactions({ per_page: 200 }).then((r) => {
        const arr = toArray(r)
        setIncome(arr.filter((t) => t.tipe === 'PEMASUKAN').reduce((s, t) => s + Number(t.jumlah || 0), 0))
        setExpense(arr.filter((t) => t.tipe === 'PENGELUARAN').reduce((s, t) => s + Number(t.jumlah || 0), 0))
      }).catch(() => {})
      api.getFeeBills({ per_page: 200 }).then((r) => {
        const arr = toArray(r)
        setPaid(arr.filter((b) => b.status === 'LUNAS').length)
        setUnpaid(arr.filter((b) => b.status === 'BELUM_BAYAR' || b.status === 'SEBAGIAN').length)
      }).catch(() => {})
      api.getCitizens({ per_page: 200 }).then((r) => {
        setBansos(toArray(r).filter((c) => c.penerima_bansos).length)
      }).catch(() => {})
      api.getStatistikSummary().then((r) => setSummary(r?.data || r)).catch(() => {})
    })
  }, [])

  const compliance = (paid + unpaid) > 0 ? Math.round((paid / (paid + unpaid)) * 100) : 0

  return (
    <PageShell
      eyebrow="Portal Bendahara RT"
      title={`Selamat datang, ${authUser?.nama_users || 'Bendahara'}`}
      description="Kelola pemasukan & pengeluaran kas RT, tagihan iuran, serta pemantauan data warga dan perumahan."
    >
      <section className="mt-8 grid gap-5 md:grid-cols-3">
        <a href="/ben/keuangan" className="block border border-neutral-900 bg-white p-6 no-underline hover:shadow-lg transition">
          <p className="text-2xl font-extrabold text-black">
            {rupiah(income - expense)}
          </p>
          <h2 className="mt-2 text-lg font-extrabold text-black">Saldo Kas RT</h2>
          <p className="mt-1 text-xs text-neutral-500">Masuk {rupiah(income)} · Keluar {rupiah(expense)}</p>
          <span className="mt-4 inline-flex text-xs font-extrabold uppercase text-black hover:text-sky-700">Buka Keuangan</span>
        </a>
        <a href="/ben/iuran" className="block border border-neutral-900 bg-white p-6 no-underline hover:shadow-lg transition">
          <p className="text-3xl font-extrabold text-black">{paid} <span className="text-lg text-neutral-400">/ {paid + unpaid}</span></p>
          <h2 className="mt-2 text-lg font-extrabold text-black">Iuran Lunas</h2>
          <p className="mt-1 text-xs text-neutral-500">{unpaid} tagihan belum/sebagian bayar</p>
          <span className="mt-4 inline-flex text-xs font-extrabold uppercase text-black hover:text-sky-700">Buka Iuran</span>
        </a>
        <a href="/ben/warga" className="block border border-neutral-900 bg-white p-6 no-underline hover:shadow-lg transition">
          <p className="text-3xl font-extrabold text-black">{compliance}%</p>
          <h2 className="mt-2 text-lg font-extrabold text-black">Tingkat Kepatuhan Iuran</h2>
          <p className="mt-1 text-xs text-neutral-500">{bansos} warga penerima bansos</p>
          <span className="mt-4 inline-flex text-xs font-extrabold uppercase text-black hover:text-sky-700">Buka Perumahan</span>
        </a>
      </section>
      <section className="mt-8">
        <h2 className="text-sm font-extrabold uppercase tracking-wider text-neutral-500">Statistik Lingkungan</h2>
        <div className="mt-3">
          <DemographyCharts summary={summary} />
        </div>
      </section>
    </PageShell>
  )
}
