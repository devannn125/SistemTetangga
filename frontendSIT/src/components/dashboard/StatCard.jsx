import { Icon } from '../ui/Icon'

const iconStyles = {
  blue: 'bg-neutral-100 text-sky-600',
  amber: 'bg-neutral-100 text-amber-500',
  green: 'bg-neutral-100 text-green-600',
}

export function StatCard({ item }) {
  return (
    <article className="group flex min-h-[118px] min-w-0 justify-between gap-4 rounded-xl border border-neutral-300 bg-white p-5 transition duration-200 hover:-translate-y-0.5 hover:border-sky-500 hover:bg-sky-50 hover:shadow-md">
      <div className="min-w-0">
        <p className="mb-2 text-sm text-neutral-700 truncate">{item.title}</p>
        <strong className="block text-xl sm:text-2xl leading-tight text-black group-hover:text-sky-700 break-words">{item.value}</strong>
        <p className={`mt-2.5 text-[13px] ${item.positive ? 'text-green-600' : 'text-neutral-700'}`}>
          {item.note}
        </p>
        {item.detail && <p className="mt-1.5 text-xs text-neutral-600">{item.detail}</p>}
      </div>
      <span className={`grid h-10 w-10 place-items-center rounded-[9px] transition group-hover:bg-sky-600 group-hover:text-white ${iconStyles[item.accent]}`}>
        <Icon name={item.icon} className="h-[18px] w-[18px]" />
      </span>
    </article>
  )
}
