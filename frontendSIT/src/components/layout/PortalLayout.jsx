import { Icon } from '@/components/ui/Icon'
import { useConfirm } from '@/components/ui/ConfirmContext'
import { clearAuthData, getAuthData } from '@/services/authService'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'

/**
 * PortalSidebar â€” sidebar navigasi portal dengan item aktif + hover.
 */
function PortalSidebar({ menuItems, activePath, homePath, brandTitle, brandSubtitle, onLogout }) {
  const authUser = getAuthData()
  const displayName = authUser?.nama_users || 'Pengguna'
  const displayRole = authUser?.role?.nama_role || 'Role'
  const displayInitial = (displayName || 'P').charAt(0).toUpperCase()

  return (
    <aside className="sticky top-0 flex h-screen w-[240px] shrink-0 flex-col border-r border-neutral-100 bg-white max-md:static max-md:h-auto max-md:w-full max-md:border-r-0 max-md:border-b">
      {/* Brand */}
      <div className="flex h-14 items-center gap-2.5 border-b border-neutral-100 px-5">
        <a
          className="flex items-center gap-2 text-sm font-bold text-neutral-900 no-underline"
          href={homePath}
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-600 text-white">
            <Icon name="building" className="h-4 w-4" />
          </span>
          Kenaran
        </a>
      </div>

      {/* Portal Title */}
      <div className="px-5 pb-4 pt-5">
        <p className="text-base font-bold leading-tight text-neutral-900">{brandTitle}</p>
        {brandSubtitle && (
          <p className="mt-0.5 text-xs font-medium text-neutral-400">{brandSubtitle}</p>
        )}
      </div>

      {/* Navigation */}
      <nav
        className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-3 pb-3 max-md:grid max-md:grid-cols-2 max-md:overflow-visible"
        aria-label="Menu portal"
      >
        {menuItems.map((item) => {
          const isActive = activePath === item.path
          return (
            <a
              key={item.path}
              href={item.path}
              className={cn(
                'flex min-h-9 items-center gap-3 rounded-md px-3 text-sm font-medium no-underline transition-colors hover:bg-black hover:text-white',
                isActive
                  ? 'bg-black text-white font-semibold'
                  : 'text-neutral-600',
              )}
            >
              <Icon
                name={item.icon}
                className={cn(
                  'h-4 w-4 shrink-0',
                  isActive ? 'text-white' : 'text-neutral-400',
                )}
              />
              <span className="truncate">{item.label}</span>
              {isActive && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-white shrink-0" />
              )}
            </a>
          )
        })}
      </nav>

      {/* User info di bawah sidebar */}
      <div className="border-t border-neutral-100 p-3">
        <div className="grid grid-cols-[36px_minmax(0,1fr)_28px] items-center gap-2.5 rounded-lg bg-neutral-50 px-3 py-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sm font-bold text-sky-700">
            {displayInitial}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-neutral-900">{displayName}</p>
            <p className="truncate text-xs text-neutral-400">{displayRole}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-neutral-500 hover:text-red-600"
            onClick={onLogout}
            aria-label="Keluar"
          >
            <Icon name="logout" className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </aside>
  )
}

/**
 * PortalTopbar â€” topbar dengan tombol logout.
 */
function PortalTopbar() {
  return (
    <header className="flex h-14 items-center justify-end border-b border-neutral-100 bg-white px-6" />
  )
}

/**
 * PortalFooter â€” footer sederhana.
 */
function PortalFooter({ label }) {
  return (
    <footer className="border-t border-neutral-100 bg-white px-6 py-4 text-xs text-neutral-400">
      <div className="flex justify-between gap-4 max-sm:flex-col">
        <span>Â© 2024 Kenaran &mdash; {label}</span>
        <span>Kontak Pengurus Â· Bantuan Â· Kebijakan Privasi</span>
      </div>
    </footer>
  )
}

/**
 * PortalLayout â€” shell reusable untuk semua portal role (Warga, RT, RW, dst).
 * Tiap role tinggal kirim menuItems dan konten (children) miliknya sendiri.
 *
 * Props tidak berubah sama sekali â€” backward compatible.
 */
export function PortalLayout({
  menuItems,
  activePath,
  homePath,
  brandTitle,
  brandSubtitle,
  footerLabel = 'Kenaran',
  children,
}) {
  const { confirm } = useConfirm()

  function handleLogout() {
    confirm({
      title: 'Konfirmasi Keluar',
      message: 'Apakah Anda yakin ingin keluar dari akun ini?',
      confirmLabel: 'Keluar',
      onConfirm: () => {
        clearAuthData()
        window.location.assign('/login')
      },
    })
  }

  return (
    <div className="flex min-h-screen bg-neutral-50 text-neutral-900 max-md:block">
      <PortalSidebar
        menuItems={menuItems}
        activePath={activePath}
        homePath={homePath}
        brandTitle={brandTitle}
        brandSubtitle={brandSubtitle}
        onLogout={handleLogout}
      />

      <section className="flex min-h-screen min-w-0 flex-1 flex-col">
        <PortalTopbar />
        <div className="flex-1">{children}</div>
        <PortalFooter label={footerLabel} />
      </section>
    </div>
  )
}