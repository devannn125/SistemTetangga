import { Icon } from '../ui/Icon'

export function Topbar() {
  return (
    <header className="flex h-16 items-center justify-between gap-5 border-b border-neutral-200 bg-neutral-50 px-6 max-md:h-auto max-md:flex-col max-md:items-stretch max-md:p-4">
      <h1 className="text-lg font-bold text-neutral-950">Dashboard</h1>

      <div className="flex items-center gap-3 max-md:grid max-md:grid-cols-[1fr_36px_36px]">
        <label className="flex h-9 w-[min(312px,36vw)] items-center gap-2.5 rounded-lg bg-neutral-100 px-3 text-neutral-500 max-md:w-auto">
          <Icon name="search" className="h-[18px] w-[18px]" />
          <input className="min-w-0 flex-1 border-0 bg-transparent text-sm text-neutral-800 outline-0" placeholder="Cari..." />
          <kbd className="rounded bg-neutral-200 px-1.5 py-0.5 font-mono text-[11px] leading-none text-neutral-500">
            Ctrl K
          </kbd>
        </label>

        <button className="relative grid h-8 w-8 place-items-center rounded-lg text-neutral-500 transition hover:bg-sky-100 hover:text-sky-600" type="button" aria-label="Notifikasi">
          <Icon name="bell" className="h-[18px] w-[18px]" />
          <span className="absolute right-[7px] top-[5px] h-2 w-2 rounded-full border-2 border-neutral-50 bg-sky-600" />
        </button>

        <button className="grid h-8 w-8 place-items-center rounded-lg text-neutral-500 transition hover:bg-sky-100 hover:text-sky-600" type="button" aria-label="Pengaturan">
          <Icon name="settings" className="h-[18px] w-[18px]" />
        </button>
      </div>
    </header>
  )
}
