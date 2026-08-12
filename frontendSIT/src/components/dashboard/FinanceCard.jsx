import { Icon } from '../ui/Icon'

const badgeStyles = {
  blue: 'bg-sky-100 text-sky-600',
  green: 'bg-green-100 text-green-600',
  red: 'bg-rose-100 text-rose-600',
}

export function FinanceCard({ item }) {
  return (
    <article className="group flex min-h-20 items-center gap-4 rounded-xl border border-neutral-300 bg-white p-4 transition duration-200 hover:-translate-y-0.5 hover:border-sky-500 hover:bg-sky-50 hover:shadow-md">
      <span className={`grid h-12 w-12 place-items-center rounded-xl transition group-hover:bg-sky-600 group-hover:text-white ${badgeStyles[item.accent]}`}>
        <Icon name={item.icon} className="h-[22px] w-[22px]" />
      </span>
      <div>
        <p className="mb-1 text-sm text-neutral-700">{item.title}</p>
        <strong className="block text-2xl leading-tight text-black group-hover:text-sky-700">{item.value}</strong>
      </div>
    </article>
  )
}
