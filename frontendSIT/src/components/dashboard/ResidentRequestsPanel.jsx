import { Icon } from '../ui/Icon'

export function ResidentRequestsPanel({ items }) {
  if (!items.length) {
    return null
  }

  return (
    <section className="mb-6 border border-neutral-900 bg-white p-5" aria-label="Pengajuan warga">
      <div className="flex items-center justify-between gap-4 max-sm:flex-col max-sm:items-start">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-sky-700">Pengajuan Baru</p>
          <h2 className="mt-1 text-xl font-extrabold text-black">Menunggu Persetujuan Ketua RT</h2>
        </div>
        <span className="border border-neutral-900 bg-neutral-50 px-3 py-1 text-sm font-extrabold text-black">
          {items.length} pengajuan
        </span>
      </div>

      <div className="mt-5 grid gap-3">
        {items.map((item) => (
          <article className="border border-neutral-300 bg-neutral-50 p-4" key={item.id}>
            <div className="flex items-start justify-between gap-4 max-sm:flex-col">
              <div>
                <h3 className="text-base font-extrabold text-black">{item.name}</h3>
                <p className="mt-1 text-sm font-semibold text-neutral-600">NIK: {item.nik}</p>
                {item.rt ? <p className="mt-1 text-sm font-semibold text-neutral-600">{item.rt}</p> : null}
                <p className="mt-2 text-sm leading-6 text-neutral-700">{item.address}</p>
                {item.note ? <p className="mt-2 text-sm leading-6 text-neutral-500">{item.note}</p> : null}
              </div>

              <span className="inline-flex items-center gap-2 border border-sky-700 bg-sky-50 px-3 py-1 text-xs font-extrabold text-sky-800">
                <Icon name="userPlus" className="h-4 w-4" />
                {item.status}
              </span>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
