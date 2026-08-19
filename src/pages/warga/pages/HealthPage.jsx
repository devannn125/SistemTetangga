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

export default function HealthPage() {
  const records = [
    { id: 1, title: 'Kartu Imunisasi', date: '12 Jan 2024' },
    { id: 2, title: 'Kunjungan Posyandu', date: '05 Mar 2024' },
  ]

  return (
    <PageShell eyebrow="Monitoring Kesehatan" title="Monitoring Kesehatan" description="Lihat data kesehatan pribadi dan jadwal Posyandu.">
      <section className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="rounded-2xl border border-neutral-300 bg-white p-6">
          <h3 className="text-lg font-extrabold text-black">Rekam Medis Singkat</h3>
          <ul className="mt-4 space-y-3 text-sm text-neutral-600">
            {records.map((r) => (
              <li key={r.id} className="border-b pb-3">{r.title} — <span className="text-neutral-500">{r.date}</span></li>
            ))}
          </ul>
        </div>
        <aside className="rounded-2xl border border-neutral-300 bg-white p-6">
          <h4 className="text-sm font-extrabold text-black">Jadwal Posyandu</h4>
          <p className="mt-2 text-sm text-neutral-600">Belum ada jadwal publik untuk saat ini.</p>
        </aside>
      </section>
    </PageShell>
  )
}
