import { useEffect, useState } from 'react'
import { PageShell } from '@/components/layout/PageShell'
import { getInventoryPurchases } from '@/services/api'
import { formatCurrency, formatDate, getPurchaseStatusClass } from './utils'

export default function InventoryPage() {
  const [purchases, setPurchases] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [notice, setNotice] = useState('')

  useEffect(() => {
    let alive = true

    async function load() {
      setIsLoading(true)
      try {
        const response = await getInventoryPurchases({ per_page: 100, status: 'DISETUJUI' })
        const rows = Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : []
        if (alive) setPurchases(rows.filter((p) => p.status === 'DISETUJUI'))
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

  return (
    <PageShell eyebrow="Inventaris" title="Pengajuan Pembelian Disetujui" description="Daftar pengajuan pembelian barang yang telah disetujui Ketua RT, siap untuk dibeli dan dicatat ke inventaris.">
      <section className="mt-8 space-y-4">
        {notice ? <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-semibold text-sky-900">{notice}</div> : null}
        {isLoading ? (
          <div className="rounded-2xl border border-neutral-300 bg-white p-8 text-center text-sm font-semibold text-neutral-600">Memuat data pengajuan...</div>
        ) : purchases.length === 0 ? (
          <div className="rounded-2xl border border-neutral-300 bg-white p-8 text-center text-sm font-semibold text-neutral-600">Belum ada pengajuan yang disetujui.</div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-neutral-300 bg-white">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead>
                <tr className="border-b border-neutral-300 text-xs uppercase text-neutral-500">
                  <th className="px-5 py-3">Nama Barang</th>
                  <th className="px-5 py-3">Jumlah</th>
                  <th className="px-5 py-3">Satuan</th>
                  <th className="px-5 py-3">Perkiraan Biaya</th>
                  <th className="px-5 py-3">Diajukan Oleh</th>
                  <th className="px-5 py-3">Disetujui Oleh</th>
                  <th className="px-5 py-3">Tanggal Approval</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {purchases.map((p) => (
                  <tr key={p.id_inventory_purchase} className="border-b border-neutral-100 last:border-0">
                    <td className="px-5 py-3 font-bold text-black">{p.nama_barang}</td>
                    <td className="px-5 py-3 text-neutral-600">{p.jumlah}</td>
                    <td className="px-5 py-3 text-neutral-600">{p.satuan || '-'}</td>
                    <td className="px-5 py-3 text-neutral-600">{formatCurrency(p.perkiraan_biaya)}</td>
                    <td className="px-5 py-3 text-neutral-600">{p.diajukanOleh?.nama_users || '-'}</td>
                    <td className="px-5 py-3 text-neutral-600">{p.disetujuiOleh?.nama_users || '-'}</td>
                    <td className="px-5 py-3 text-neutral-600">{formatDate(p.disetujui_at)}</td>
                    <td className="px-5 py-3"><span className={`rounded-full px-2 py-1 text-xs font-bold ${getPurchaseStatusClass(p.status)}`}>{p.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </PageShell>
  )
}
