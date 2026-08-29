import { useState } from 'react'
import { Icon } from '@/components/ui/Icon'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'

export function Topbar() {
  const [searchOpen, setSearchOpen] = useState(false)

  return (
    <header className="flex h-16 items-center justify-between gap-5 border-b border-neutral-200 bg-neutral-50 px-6 max-md:h-auto max-md:flex-col max-md:items-stretch max-md:p-4">
      <h1 className="text-lg font-bold text-neutral-950">Dashboard</h1>

      <div className="flex items-center gap-3 max-md:grid max-md:grid-cols-[1fr_36px_36px]">
        <label className={`flex h-9 w-[min(312px,36vw)] items-center gap-2.5 rounded-lg bg-neutral-100 px-3 text-neutral-500 transition max-md:w-auto ${searchOpen ? 'ring-2 ring-sky-500/20' : ''}`}>
          <Icon name="search" className="h-[18px] w-[18px]" />
          <Input
            className="min-w-0 flex-1 border-0 bg-transparent text-sm text-neutral-800 outline-0"
            placeholder="Cari..."
            onFocus={() => setSearchOpen(true)}
            onBlur={() => setSearchOpen(false)}
          />
          <kbd className="rounded bg-neutral-200 px-1.5 py-0.5 font-mono text-[11px] leading-none text-neutral-500 hidden max-md:block">
            Ctrl K
          </kbd>
        </label>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative text-neutral-500 hover:bg-sky-100 hover:text-sky-600" aria-label="Notifikasi">
              <Icon name="bell" className="h-[18px] w-[18px]" />
              <span className="absolute right-[7px] top-[5px] h-2 w-2 rounded-full border-2 border-neutral-50 bg-sky-600" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Notifikasi</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-sm text-neutral-500">Belum ada notifikasi baru</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => console.log('View all')}>Lihat semua</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="text-neutral-500 hover:bg-sky-100 hover:text-sky-600" aria-label="Pengaturan">
              <Icon name="settings" className="h-[18px] w-[18px]" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Pengaturan</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profil</DropdownMenuItem>
            <DropdownMenuItem>Pengaturan Notifikasi</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600">Keluar</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}