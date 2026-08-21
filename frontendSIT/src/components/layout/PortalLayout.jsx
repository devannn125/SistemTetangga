import { useState } from 'react'
import { Icon } from '../ui/Icon'
import { ConfirmDialog } from '../ui/ConfirmDialog'
import { clearAuthData } from '../../services/authService'

function PortalSidebar({ menuItems, activePath, homePath, brandTitle, brandSubtitle }) {
  return (
    <aside className="sticky top-0 flex h-screen w-[250px] shrink-0 flex-col border-r border-neutral-900 bg-white max-md:static max-md:h-auto max-md:w-full max-md:border-r-0 max-md:border-b">
      <div className="flex h-15 border-b border-neutral-900 px-4 py-5">
        <a className="flex items-center gap-2 text-sm font-extrabold text-black no-underline" href={homePath}>
          <Icon name="building" className="h-5 w-5" />
          Kenaran
        </a>
      </div>

      <div className="px-4 py-6">
        <p className="text-xl font-extrabold leading-tight text-black">{brandTitle}</p>
        <p className="mt-1 text-xs font-semibold uppercase leading-5 text-neutral-500">{brandSubtitle}</p>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3 overflow-y-auto max-md:grid max-md:grid-cols-2" aria-label="Menu portal">
        {menuItems.map((item) => {
          const isActive = activePath === item.path

          return (
            <a
              className={`flex min-h-10 items-center gap-3 px-3 text-sm font-bold no-underline transition ${
                isActive ? 'bg-black text-white' : 'text-neutral-700 hover:bg-neutral-100 hover:text-black'
              }`}
              href={item.path}
              key={item.path}
            >
              <Icon name={item.icon} className="h-4 w-4" />
              {item.label}
            </a>
          )
        })}
      </nav>
    </aside>
  )
}

function PortalTopbar() {
  const [confirmLogout, setConfirmLogout] = useState(false)

  function handleLogout() {
    setConfirmLogout(false)
    clearAuthData()
    window.location.assign('/login')
  }

  return (
    <header className="flex h-15 items-center justify-end border-b border-neutral-900 bg-white px-6">
      <button
        className="flex h-9 items-center gap-2 border border-black bg-black px-4 text-xs font-extrabold text-white transition hover:border-sky-600 hover:bg-sky-600"
        onClick={() => setConfirmLogout(true)}
        type="button"
      >
        <Icon name="logout" className="h-4 w-4" />
        Keluar
      </button>
      <ConfirmDialog
        open={confirmLogout}
        title="Konfirmasi Keluar"
        message="Apakah Anda yakin ingin keluar dari akun ini?"
        confirmLabel="Keluar"
        onConfirm={handleLogout}
        onCancel={() => setConfirmLogout(false)}
      />
    </header>
  )
}

function PortalFooter({ label }) {
  return (
    <footer className="border-t border-neutral-900 bg-white px-6 py-5 text-xs font-semibold text-neutral-500">
      <div className="mx-auto flex max-w-6xl justify-between gap-4 max-sm:flex-col">
        <span>&copy; 2024 Kenaran - {label}</span>
        <span>Kontak Pengurus | Bantuan | Kebijakan Privasi</span>
      </div>
    </footer>
  )
}

/**
 * Shell reusable untuk semua portal role (Warga, RT, RW, Dukuh, dst).
 * Tiap role tinggal kirim menuItems dan konten (children) miliknya sendiri.
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
  return (
    <main className="flex min-h-screen bg-neutral-100 text-neutral-900 max-md:block">
      <PortalSidebar
        menuItems={menuItems}
        activePath={activePath}
        homePath={homePath}
        brandTitle={brandTitle}
        brandSubtitle={brandSubtitle}
      />

      <section className="flex min-h-screen min-w-0 flex-1 flex-col">
        <PortalTopbar />
        <div className="flex-1">{children}</div>
        <PortalFooter label={footerLabel} />
      </section>
    </main>
  )
}