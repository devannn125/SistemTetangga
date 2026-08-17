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

export default function InventoryPage() {
  const items = [
    { id: 1, name: 'Tenda Pesta', qty: 2, location: 'Gudang Balai RT', condition: 'Baik', status: 'Tersedia' },
    { id: 2, name: 'Kursi Lipat', qty: 50, location: 'Gudang Balai RT', condition: 'Baik', status: 'Tersedia' },
    { id: 3, name: 'Meja Lipat', qty: 10, location: 'Gudang Balai RT', condition: 'Baik', status: 'Tersedia' },
  ]

  return (
    <PageShell eyebrow="Inventaris RT" title="Inventaris Barang" description="Lihat daftar inventaris RT dan status peminjaman.">
      <section className="mt-6 space-y-4">
        <div className="rounded-2xl border border-neutral-300 bg-white p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs text-neutral-500">
                <tr>
                  <th className="pb-3">Nama Barang</th>
                  <th className="pb-3">Jumlah</th>
                  <th className="pb-3">Lokasi</th>
                  <th className="pb-3">Kondisi</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it) => (
                  <tr key={it.id} className="border-t">
                    <td className="py-3">{it.name}</td>
                    <td className="py-3">{it.qty}</td>
                    <td className="py-3">{it.location}</td>
                    <td className="py-3"><span className="rounded-full bg-emerald-100 px-2 py-1 text-emerald-700">{it.condition}</span></td>
                    <td className="py-3"><span className="rounded-full bg-emerald-100 px-2 py-1 text-emerald-700">{it.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </PageShell>
  )
}
