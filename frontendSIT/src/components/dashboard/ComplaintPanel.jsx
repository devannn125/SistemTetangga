export function ComplaintPanel({ items }) {
  const total = items.reduce((sum, item) => sum + item.total, 0)
  const radius = 42
  const circumference = 2 * Math.PI * radius
  const segments = items.reduce(
    (result, item) => {
      const dash = (item.total / total) * circumference
      const segment = {
        dash,
        label: item.label,
        offset: result.offset,
      }

      return {
        items: [...result.items, segment],
        offset: result.offset + dash + 4,
      }
    },
    { items: [], offset: 0 },
  ).items

  return (
    <article className="flex min-h-[334px] flex-col rounded-xl border border-neutral-300 bg-white p-5 transition duration-200 hover:border-sky-500 hover:shadow-md">
      <div>
        <h3 className="m-0 text-[15px] font-bold leading-tight text-black">Pengaduan per Kategori</h3>
        <p className="mt-0.5 text-xs text-neutral-600">Distribusi pengaduan bulan ini</p>
      </div>

      <div className="grid flex-1 grid-cols-[190px_minmax(0,1fr)] items-center gap-8 max-md:grid-cols-1 max-md:gap-5">
        <svg className="mx-auto h-44 w-44 -rotate-90" viewBox="0 0 120 120" aria-label="Donut kategori pengaduan">
          <circle cx="60" cy="60" r={radius} fill="none" stroke="#f2f2f2" strokeWidth="18" />
          {segments.map((segment) => (
            <circle
              cx="60"
              cy="60"
              fill="none"
              key={segment.label}
              r={radius}
              stroke="#050505"
              strokeDasharray={`${segment.dash} ${circumference - segment.dash}`}
              strokeDashoffset={-segment.offset}
              strokeLinecap="butt"
              strokeWidth="18"
            />
          ))}
          <circle cx="60" cy="60" r="26" fill="#fff" />
        </svg>

        <div className="ml-auto flex w-full max-w-[372px] flex-col gap-2.5">
          {items.map((item) => (
            <div className="flex items-center justify-between gap-5 rounded-md px-2 py-1 text-sm text-neutral-700 transition hover:bg-sky-50 hover:text-sky-700" key={item.label}>
              <span>{item.label}</span>
              <strong className="text-black">{item.total}</strong>
            </div>
          ))}
        </div>
      </div>
    </article>
  )
}
