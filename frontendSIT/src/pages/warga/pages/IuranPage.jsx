import { useEffect, useState } from 'react'
import { getFeeBills } from '../../../services/api'

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

function formatCurrency(value) {
  return `Rp ${Number(value || 0).toLocaleString('id-ID')}`
}

function formatDate(value) {
  if (!value) return '-'
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value))
}

function formatPeriod(value) {
  if (!value) return '-'
  const [year, month] = String(value).split('-')
  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
  return `${months[Number(month) - 1] || month} ${year}`
}

function getStatusClass(status) {
  return {
    LUNAS: 'bg-emerald-100 text-emerald-900',
    BELUM_BAYAR: 'bg-amber-100 text-amber-900',
    SEBAGIAN: 'bg-sky-100 text-sky-900',
  }[status] || 'bg-neutral-100 text-neutral-900'
}

function toRows(response) {
  return Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : []
}

export default function IuranPage() {
  const [bills, setBills] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [notice, setNotice] = useState('')

  useEffect(() => {
    let alive = true

    async function loadBills() {
      setIsLoading(true)
      try {
        const response = await getFeeBills({ per_page: 100 })
        if (alive) setBills(toRows(response))
      } catch (error) {
        if (alive) setNotice(error.message || 'Backend belum dapat dihubungi.')
      } finally {
        if (alive) setIsLoading(false)
      }
    }

    loadBills()

    return () => {
      alive = false
    }
  }, [])

  const total = bills.reduce((sum, bill) => sum + Number(bill.jumlah_tagihan || 0), 0)
  const paid = bills
    .filter((bill) => bill.status === 'LUNAS')
    .reduce((sum, bill) => sum + Number(bill.jumlah_tagihan || 0), 0)

  return (
    <PageShell
      description="Pantau tagihan iuran bulanan Kartu Keluarga (KK) Anda dan riwayat pembayarannya."
      eyebrow="Iuran"
      title="Iuran Warga"
    >
      <section className="mt-8 space-y-6">
        {notice ? (
          <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-semibold text-sky-900">
            {notice}
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-3">
          <article className="rounded-2xl border border-neutral-300 bg-white p-6">
            <p className="text-xs font-bold text-neutral-500">Total Tagihan</p>
            <div className="mt-3 text-2xl font-extrabold text-black">{formatCurrency(total)}</div>
          </article>
          <article className="rounded-2xl border border-neutral-300 bg-white p-6">
            <p className="text-xs font-bold text-neutral-500">Sudah Dibayar</p>
            <div className="mt-3 text-2xl font-extrabold text-emerald-700">{formatCurrency(paid)}</div>
          </article>
          <article className="rounded-2xl border border-neutral-300 bg-white p-6">
            <p className="text-xs font-bold text-neutral-500">Belum Lunas</p>
            <div className="mt-3 text-2xl font-extrabold text-amber-700">{formatCurrency(total - paid)}</div>
          </article>
        </div>

        {isLoading ? (
          <div className="rounded-2xl border border-neutral-300 bg-white p-8 text-center text-sm font-semibold text-neutral-600">
            Memuat data iuran...
          </div>
        ) : bills.length === 0 ? (
          <div className="rounded-2xl border border-neutral-300 bg-white p-8 text-center text-sm font-semibold text-neutral-600">
            Belum ada tagihan.
          </div>
        ) : (
          <div className="grid gap-4">
            {bills.map((bill) => (
              <article key={bill.id_iuran_tagihan} className="rounded-2xl border border-neutral-300 bg-white p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-extrabold text-black">{formatPeriod(bill.periode)}</h2>
                    <p className="mt-1 text-sm text-neutral-600">Jatuh tempo {formatDate(bill.jatuh_tempo)}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${getStatusClass(bill.status)}`}>
                    {bill.status === 'BELUM_BAYAR' ? 'Belum Bayar' : bill.status === 'SEBAGIAN' ? 'Sebagian' : 'Lunas'}
                  </span>
                </div>
                <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
                  <div className="text-2xl font-extrabold text-black">{formatCurrency(bill.jumlah_tagihan)}</div>
                  {bill.dikonfirmasi_at ? (
                    <p className="text-xs text-neutral-500">Dikonfirmasi {formatDate(bill.dikonfirmasi_at)}</p>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </PageShell>
  )
}