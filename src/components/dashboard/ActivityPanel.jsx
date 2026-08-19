import { Icon } from '../ui/Icon'

export function ActivityPanel({ items }) {
  return (
    <article className="overflow-hidden rounded-xl border border-neutral-300 bg-white p-5 pb-0">
      <div className="flex items-center justify-between gap-4 pb-4">
        <h3 className="m-0 text-[15px] font-bold leading-tight text-black">Aktivitas Terbaru</h3>
        <a className="text-xs text-sky-600 no-underline transition hover:text-sky-800" href="/">
          Lihat Semua
        </a>
      </div>

      <div className="-mx-5 border-t border-neutral-200">
        {items.map((item) => (
          <div className="group grid min-h-[62px] grid-cols-[32px_minmax(0,1fr)_auto] items-center gap-3 border-b border-neutral-200 px-5 py-2.5 transition duration-200 hover:bg-sky-50 max-md:grid-cols-[32px_minmax(0,1fr)]" key={`${item.title}-${item.time}`}>
            <span className="grid h-8 w-8 place-items-center rounded-full bg-neutral-100 text-neutral-500 transition group-hover:bg-sky-600 group-hover:text-white">
              <Icon name={item.icon} className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <strong className="block text-sm text-neutral-950 group-hover:text-sky-700">{item.title}</strong>
              <p className="mt-0.5 truncate text-xs text-neutral-600">{item.description}</p>
            </div>
            <time className="text-xs text-neutral-600 max-md:col-start-2">{item.time}</time>
          </div>
        ))}
      </div>
    </article>
  )
}
