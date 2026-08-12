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

export default function RulesPage() {
  const docs = [
    { id: 1, title: 'Tata Tertib Warga Tetap' },
    { id: 2, title: 'Peraturan Lingkungan RT 005' },
  ]

  return (
    <PageShell eyebrow="Peraturan & Tata Tertib" title="Peraturan Lingkungan" description="Baca peraturan dan tata tertib lingkungan.">
      <section className="mt-6 grid gap-4">
        {docs.map((d) => (
          <article key={d.id} className="rounded-xl border border-neutral-300 bg-white p-5">
            <h3 className="font-extrabold text-black">{d.title}</h3>
            <p className="mt-2 text-sm text-neutral-600">Klik untuk membaca.</p>
          </article>
        ))}
      </section>
    </PageShell>
  )
}
