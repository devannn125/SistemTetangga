import { PageShell } from '../../../components/layout/PageShell'

export default function PlaceholderPage({ title, desc }) {
  return (
    <PageShell
      eyebrow="Portal Sekretaris RT"
      title={title}
      description={desc}
    >
      <section className="mt-8">
        <div className="rounded-2xl border border-neutral-300 bg-white p-12 text-center">
          <div className="text-6xl mb-4">🚧</div>
          <h2 className="text-2xl font-extrabold text-black">{title}</h2>
          <p className="mt-2 text-neutral-600">{desc}</p>
          <p className="mt-4 text-sm text-neutral-400">Halaman ini dalam pengembangan</p>
        </div>
      </section>
    </PageShell>
  )
}