export function PageShell({ children, eyebrow, title, description }) {
  return (
    <div className="px-6 py-6">
      <section className="border-2 border-neutral-900 bg-white p-6 max-sm:p-4">
        <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-neutral-500">{eyebrow}</p>
        <h1 className="mt-3 text-3xl font-extrabold leading-tight text-black max-sm:text-2xl">{title}</h1>
        {description ? <p className="mt-4 max-w-2xl text-sm leading-6 text-neutral-600">{description}</p> : null}
      </section>
      {children}
    </div>
  )
}