import { useEffect, useMemo, useState } from 'react'
import { PageShell } from '../../../components/layout/PageShell'
import { getFeeBills } from '../../../services/api'

function formatCurrency(value) {
  return `Rp ${Number(value || 0).toLocaleString('id-ID')}`
}

function formatDate(value) {
  if (!value) return '-'
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value))
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

export default function RtFeeBillPage() {
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

  const summary = useMemo(() => {
    const total = bills.reduce((sum, bill) => sum + Number(bill.jumlah_tagihan || 0), 0)
    const paid = bills.filter((bill) => bill.status === 'LUNAS').reduce((sum, bill) => sum + Number(bill.jumlah_tagihan || 0), 0)
    return { total, paid, unpaid: total - paid }
  }, [bills])

  const filteredBills = bills.filter((bill) =>
    [bill.periode, bill.status, bill.keterangan, bill.family?.nomor_kk, bill.family?.kepala_keluarga]
      .join(' ')
      .toLowerCase()
      .includes(searchText.toLowerCase()),
  )

  return (
    <PageShell
      eyebrow="Iuran"
      title="Approval Iuran Bulanan"
      description="Ketua RT memeriksa draf tagihan yang disiapkan Bendahara. Konfirmasi pembayaran warga tetap menjadi kewenangan Bendahara RT."
    >
      <section className="mt-8 space-y-6">
        {notice ? (
          <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-semibold text-sky-900">
            {notice}
          </div>
        ) : null}

        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900">
          Backend saat ini hanya menyimpan status pembayaran. Tombol publish draf belum diaktifkan agar RT tidak berubah menjadi konfirmator pembayaran.
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <article className="rounded-xl border border-neutral-300 bg-white p-6">
            <p className="text-xs font-bold uppercase text-neutral-500">Total Tagihan</p>
            <div className="mt-3 text-2xl font-extrabold text-black">{formatCurrency(summary.total)}</div>
            <p className="mt-2 text-sm text-neutral-600">{isLoading ? 'Memuat data...' : `${bills.length} tagihan`}</p>
          </article>
          <article className="rounded-xl border border-neutral-300 bg-white p-6">
            <p className="text-xs font-bold uppercase text-neutral-500">Terbayar</p>
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
                  </tr>
                </thead>
                <tbody>
                  {filteredBills.map((bill) => (
                    <tr key={bill.id_fee_bill} className="border-b border-neutral-100">
                      <td className="py-4 pr-4 font-bold text-black">{bill.periode}</td>
                      <td className="py-4 pr-4 text-neutral-600">{bill.family?.kepala_keluarga || bill.family?.nomor_kk || '-'}</td>
                      <td className="py-4 pr-4 text-neutral-600">{formatDate(bill.jatuh_tempo)}</td>
                      <td className="py-4 pr-4 font-bold text-black">{formatCurrency(bill.jumlah_tagihan)}</td>
                      <td className="py-4 pr-4">
                        <span className={`rounded-full px-3 py-1 text-xs font-bold ${getStatusClass(bill.status)}`}>{bill.status}</span>
                      </td>
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
