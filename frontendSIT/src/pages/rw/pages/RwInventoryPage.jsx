import { useEffect, useState } from 'react'
import { PageShell } from '@/components/layout/PageShell'
import { getInventoryPurchases } from '@/services/api'
import { formatCurrency, formatDate } from './utils'

export default function RwInventoryPage() {
  const [purchases, setPurchases] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    getInventoryPurchases({ per_page: 100 }).then(res => {
      setPurchases(Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [])
      setIsLoading(false)
    }).catch(err => {
      console.error(err)
      setIsLoading(false)
    })
  }, [])

  return (
    <PageShell
      eyebrow="Inventaris"
      title="Monitoring Pengajuan Barang"
      description="Tinjau daftar aset inventaris dan status pengajuan pembelian barang tingkat RT."
    >
      <section className="mt-8">
        {isLoading ? (
          <div className="p-8 text-center text-sm text-neutral-500 bg-white border rounded-xl">Memuat data inventaris...</div>
        ) : purchases.length === 0 ? (
          <div className="p-8 text-center text-sm text-neutral-500 bg-white border rounded-xl">Belum ada pengajuan pembelian inventaris.</div>
        ) : (
          <div className="grid gap-4">
            {purchases.map((p) => (
              <article key={p.id_inventory_purchase} className="border border-neutral-300 bg-white p-6 rounded-xl">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-extrabold text-black">{p.nama_barang}</h2>
                    <p className="mt-1 text-sm text-neutral-600">
                      Jumlah: {p.jumlah} {p.satuan || ''} · Perkiraan Biaya: {formatCurrency(p.perkiraan_biaya)}
                    </p>
                    {p.alasan && <p className="mt-1 text-sm text-neutral-500">Alasan: {p.alasan}</p>}
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${p.status === 'DISETUJUI' ? 'bg-emerald-100 text-emerald-900' : p.status === 'DITOLAK' ? 'bg-red-100 text-red-900' : 'bg-amber-100 text-amber-900'}`}>
                    {p.status}
                  </span>
                </div>
                <div className="mt-4 grid gap-2 text-sm text-neutral-500 sm:grid-cols-2 lg:grid-cols-3 border-t pt-3">
                  <p><span className="font-bold text-neutral-900">Diajukan:</span> {formatDate(p.created_at)}</p>
                  <p><span className="font-bold text-neutral-900">Oleh:</span> {p.diajukanOleh?.nama_users || '-'}</p>
                  <p><span className="font-bold text-neutral-900">RT:</span> {p.wilayah?.nama_wilayah || '-'}</p>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </PageShell>
  )
}
