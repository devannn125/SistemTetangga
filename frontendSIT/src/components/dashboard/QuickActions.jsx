import { Icon } from '../ui/Icon'

export function QuickActions({ items }) {
  return (
    <article className="overflow-hidden rounded-xl border border-neutral-300 bg-white p-5 pb-0">
      <h3 className="mb-[18px] mt-0 text-[15px] font-bold leading-tight text-black">Aksi Cepat</h3>
      <div className="grid grid-cols-2 gap-3">
        {items.map((item) => (
          <button
            className="group flex min-h-[54px] items-center justify-center gap-2.5 rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm font-bold text-neutral-900 transition duration-200 hover:border-sky-500 hover:bg-sky-50 hover:text-sky-700 hover:shadow-sm"
            key={item.label}
            type="button"
          >
            <span className="grid h-9 w-9 place-items-center rounded-[9px] bg-sky-100 text-sky-600 transition group-hover:bg-sky-600 group-hover:text-white">
              <Icon name={item.icon} className="h-[18px] w-[18px]" />
            </span>
            <span className="truncate">{item.label}</span>
          </button>
        ))}
      </div>
    </article>
  )
}
