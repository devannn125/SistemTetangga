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

export default function OrgPage() {
  const leaders = [
    { id: 1, name: 'Haji Mahmud', role: 'Dukuh', phone: '081234567891' },
    { id: 2, name: 'Pak Joko', role: 'RW', phone: '081234567892' },
  ]

  return (
    <PageShell eyebrow="Struktur Organisasi" title="Struktur Organisasi" description="Lihat bagan kepengurusan RT/RW dan kontak.">
      <section className="mt-6 space-y-6">
        <div className="rounded-2xl border border-neutral-300 bg-white p-6">
          <div className="h-64 rounded bg-neutral-100" />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {leaders.map((l) => (
            <div key={l.id} className="rounded-xl border border-neutral-300 bg-white p-4">
              <div className="text-sm font-bold text-black">{l.name}</div>
              <div className="text-xs text-neutral-500">{l.role}</div>
              <div className="mt-2 text-xs text-neutral-500">{l.phone}</div>
            </div>
          ))}
        </div>
      </section>
    </PageShell>
  )
}
