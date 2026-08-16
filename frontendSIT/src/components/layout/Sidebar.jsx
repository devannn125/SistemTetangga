import { useState } from 'react'
import { Icon } from '../ui/Icon'
import { clearAuthData, getAuthData } from '../../services/authService'

export function Sidebar({ items, user }) {
  const [openMenus, setOpenMenus] = useState(['warga'])
  const authUser = getAuthData()

  const displayName = authUser?.nama_users || user?.name || 'Administrator'
  const displayRole = authUser?.role?.nama_role || user?.role || 'Admin'
  const displayInitial = (displayName || 'A').charAt(0).toUpperCase()

  function toggleMenu(item) {
    if (!item.children) {
      return
    }

    setOpenMenus((currentMenus) =>
      currentMenus.includes(item.id)
        ? currentMenus.filter((menuId) => menuId !== item.id)
        : [...currentMenus, item.id],
    )
  }

  function handleLogout() {
    clearAuthData()
    window.location.assign('/login')
  }

  return (
    <aside className="sticky top-0 flex h-screen flex-col border-r border-neutral-200 bg-neutral-50 max-md:static max-md:h-auto max-md:border-r-0 max-md:border-b">
      <div className="flex h-16 shrink-0 items-center gap-3 border-b border-neutral-200 px-[18px] text-lg font-bold text-black max-md:h-14">
        <span className="grid h-8 w-8 place-items-center rounded-[9px] bg-sky-600 text-white">
          <Icon name="building" className="h-[17px] w-[17px]" />
        </span>
        <span>Tetangga</span>
      </div>

      <nav className="flex min-h-0 flex-1 flex-col gap-[3px] overflow-y-auto p-3 max-md:grid max-md:max-h-none max-md:grid-cols-2 max-md:overflow-visible" aria-label="Menu utama">
        {items.map((item) => {
          const isOpen = openMenus.includes(item.id)

          return (
          <div key={item.id}>
            <button
              aria-expanded={item.children ? isOpen : undefined}
              className={`flex min-h-9 w-full items-center justify-between gap-2 rounded-lg px-3 text-left text-sm transition ${
                item.id === 'dashboard'
                  ? 'bg-neutral-900 text-white'
                  : 'bg-transparent text-neutral-700 hover:bg-neutral-900 hover:text-white'
              }`}
              onClick={() => toggleMenu(item)}
              type="button"
            >
              <span className="flex min-w-0 items-center gap-3">
                <Icon name={item.icon} className="h-4 w-4" />
                <span className="truncate">{item.label}</span>
              </span>
              {item.children && (
                <Icon
                  name="chevron"
                  className={`h-3.5 w-3.5 transition-transform ${isOpen ? 'rotate-90' : 'rotate-0'}`}
                />
              )}
            </button>

            {item.children && (
              <div
                className={`grid transition-[grid-template-rows,opacity] duration-200 ease-out max-md:hidden ${
                  isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                }`}
              >
                <div className="overflow-hidden">
                  <div className="mb-2 mt-1 flex flex-col gap-1 pl-[52px]">
                    {item.children.map((child) => (
                      <button
                        className="min-h-8 rounded-md text-left text-sm text-neutral-500 transition hover:text-neutral-950"
                        key={child}
                        type="button"
                      >
                        {child}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
          )
        })}
      </nav>

      <div className="grid min-h-[60px] shrink-0 grid-cols-[36px_minmax(0,1fr)_28px] items-center gap-3 rounded-lg bg-neutral-100 p-3 md:m-3 md:mb-3">
        <span className="grid h-9 w-9 place-items-center rounded-full bg-sky-600 font-bold text-white">
          {displayInitial}
        </span>
        <div className="min-w-0">
          <strong className="block truncate text-sm leading-tight text-black">{displayName}</strong>
          <small className="mt-0.5 block text-xs text-neutral-500">{displayRole}</small>
        </div>
        <button
          className="grid h-7 w-7 place-items-center text-neutral-500 transition hover:text-red-600"
          onClick={handleLogout}
          type="button"
          aria-label="Keluar"
        >
          <Icon name="logout" className="h-4 w-4" />
        </button>
      </div>
    </aside>
  )
}
