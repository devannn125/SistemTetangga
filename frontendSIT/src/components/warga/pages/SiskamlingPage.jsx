import { Icon } from '../../ui/Icon'

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

export default function SiskamlingPage() {
  const schedule = [
    { id: 1, date: '20 Mar 2024', shift: '21:00 - 00:00', members: ['Rizki Ramadan', 'Ahmad Fauzi', 'Andi Prasetyo'], status: 'selesai' },
    { id: 2, date: '20 Mar 2024', shift: '00:00 - 04:00', members: ['Teguh Prakoso', 'Gunawan Setiawan'], status: 'selesai' },
  ]

  return (
    <PageShell eyebrow="Jadwal Siskamling" title="Jadwal Siskamling" description="Lihat kalender ronda dan jadwal petugas.">
      <section className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="rounded-2xl border border-neutral-300 bg-white p-6">
          <div className="h-80 rounded bg-neutral-100" />
        </div>
        <aside className="space-y-4">
          {schedule.map((s) => (
            <div key={s.id} className="rounded-xl border border-neutral-300 bg-white p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-black">{s.date}</div>
                  <div className="text-xs text-neutral-500">Shift {s.shift}</div>
                </div>
                <div className="text-xs font-bold text-emerald-700">{s.status === 'selesai' ? 'Selesai' : 'Terjadwal'}</div>
              </div>
              <div className="mt-3 flex gap-2 text-xs">
                {s.members.map((m) => (
                  <span key={m} className="rounded-full bg-neutral-100 px-2 py-1 text-neutral-700">{m}</span>
                ))}
              </div>
            </div>
          ))}
        </aside>
      </section>
    </PageShell>
  )
}
