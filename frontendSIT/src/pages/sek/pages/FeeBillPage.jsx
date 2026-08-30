import { useEffect, useMemo, useState } from 'react'
import { PageShell } from '../../../components/layout/PageShell'
import { getFeeBills } from '../../../services/api'

function formatCurrency(value) {
  return `Rp ${Number(value || 0).toLocaleString('id-ID')}`
}

function formatDate(value) {
  if (!value) return '-'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '-'
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(d)
}

function getStatusClass(status) {
  return {
    BELUM_BAYAR: 'bg-amber-100 text-amber-900',
    SEBAGIAN: 'bg-sky-100 text-sky-900',
    LUNAS: 'bg-emerald-100 text-emerald-900',
  }[status] || 'bg-neutral-100 text-neutral-900'
}

function normalizeBills(response) {
  return Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : []
}

export default function FeeBillPage() {
  const [bills, setBills] = useState([])
  const [notice, setNotice] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [searchText, setSearchText] = useState('')

  useEffect(() => {
    let alive = true

    async function loadBills() {
      setIsLoading(true)
      try {
        const response = await getFeeBills({ per_page: 100 })
        if (alive) setBills(normalizeBills(response))
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

  const filteredBills = useMemo(() => {
    if (!searchText) return bills
    const lower = searchText.toLowerCase()
    return bills.filter((b) =>
      b.periode?.toLowerCase().includes(lower)
      || b.family?.kepala_keluarga?.nama_lengkap?.toLowerCase().includes(lower)
      || b.family?.no_kk?.toLowerCase().includes(lower)
    )
  }, [bills, searchText])

  const summary = useMemo(() => {
    return filteredBills.reduce(
      (acc, bill) => {
        const amount = Number(bill.jumlah_tagihan || 0)
        acc.total += amount
        if (bill.status === 'LUNAS') {
          acc.paid += amount
        } else {
          acc.unpaid += amount
        }
        return acc
      },
      { total: 0, paid: 0, unpaid: 0 },
    )
  }, [filteredBills])

  return (
    <PageShell
      eyebrow="Iuran"
      title="Monitoring Iuran Bulanan"
      description="Sekretaris memantau tagihan iuran per KK. Pembuatan tagihan dan konfirmasi pelunasan adalah kewenangan Bendahara RT."
    >
      <section className="mt-8 space-y-6">
        {notice ? (
          <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-semibold text-sky-900">
            {notice}
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-3">
          <article className="rounded-xl border border-neutral-300 bg-white p-6">
            <p className="text-xs font-bold uppercase text-neutral-500">Total Tagihan</p>
            <div className="mt-3 text-2xl font-extrabold text-black">{formatCurrency(summary.total)}</div>
            <p className="mt-2 text-sm text-neutral-600">{isLoading ? 'Memuat data...' : `${bills.length} tagihan`}</p>
          </article>
          <article className="rounded-xl border border-neutral-300 bg-white p-6">
            <p className="text-xs font-bold uppercase text-neutral-500">Terbayar (Lunas)</p>
            <div className="mt-3 text-2xl font-extrabold text-emerald-700">{formatCurrency(summary.paid)}</div>
          </article>
          <article className="rounded-xl border border-neutral-300 bg-white p-6">
            <p className="text-xs font-bold uppercase text-neutral-500">Belum Terbayar</p>
            <div className="mt-3 text-2xl font-extrabold text-amber-700">{formatCurrency(summary.unpaid)}</div>
          </article>
        </div>

        <div className="rounded-2xl border border-neutral-300 bg-white p-6">
          <div className="flex items-center justify-between gap-4 max-sm:flex-col max-sm:items-stretch">
            <h3 className="text-lg font-extrabold text-black">Daftar Tagihan</h3>
            <input
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              className="rounded-full border border-neutral-300 px-4 py-2 text-sm outline-none focus:border-sky-600"
              placeholder="Cari tagihan..."
            />
          </div>

          {filteredBills.length === 0 ? (
            <div className="mt-4 rounded-xl bg-neutral-50 p-8 text-center text-sm font-semibold text-neutral-600">
              Tidak ada tagihan untuk ditampilkan.
            </div>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead>
                  <tr className="border-b border-neutral-200 text-xs uppercase text-neutral-500">
                    <th className="py-3 pr-4">Periode</th>
                    <th className="py-3 pr-4">Keluarga</th>
                    <th className="py-3 pr-4">Jatuh Tempo</th>
                    <th className="py-3 pr-4">Jumlah</th>
                    <th className="py-3 pr-4">Status</th>
                    <th className="py-3 pr-4">Dikonfirmasi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBills.map((bill) => (
                    <tr key={bill.id_iuran_tagihan || bill.id_fee_bill} className="border-b border-neutral-100">
                      <td className="py-4 pr-4 font-bold text-black">{bill.periode}</td>
                      <td className="py-4 pr-4 text-neutral-600">{bill.family?.kepala_keluarga?.nama_lengkap || bill.family?.no_kk || '-'}</td>
                      <td className="py-4 pr-4 text-neutral-600">{formatDate(bill.jatuh_tempo)}</td>
                      <td className="py-4 pr-4 font-bold text-black">{formatCurrency(bill.jumlah_tagihan)}</td>
                      <td className="py-4 pr-4">
                        <span className={`rounded-full px-3 py-1 text-xs font-bold ${getStatusClass(bill.status)}`}>{bill.status}</span>
                      </td>
                      <td className="py-4 pr-4 text-neutral-500">{formatDate(bill.dikonfirmasi_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </PageShell>
  )
}