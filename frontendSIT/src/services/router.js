import { useEffect, useState } from 'react'

const NAV_EVENT = 'app:navigate'

export function navigate(path) {
  window.history.pushState({}, '', path)
  window.dispatchEvent(new CustomEvent(NAV_EVENT))
}

export function usePathname() {
  const [pathname, setPathname] = useState(window.location.pathname)

  useEffect(() => {
    function onChange() {
      setPathname(window.location.pathname)
    }

    window.addEventListener('popstate', onChange)
    window.addEventListener(NAV_EVENT, onChange)

    return () => {
      window.removeEventListener('popstate', onChange)
      window.removeEventListener(NAV_EVENT, onChange)
    }
  }, [])

  return pathname
}
