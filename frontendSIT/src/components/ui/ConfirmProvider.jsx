import { useCallback, useRef, useState } from 'react'
import { ConfirmDialog } from './ConfirmDialog'
import { ConfirmContext } from './ConfirmContext'

export function ConfirmProvider({ children }) {
  const [options, setOptions] = useState(null)
  const resolverRef = useRef(null)

  const confirm = useCallback((config = {}) => {
    return new Promise((resolve) => {
      if (resolverRef.current) {
        resolverRef.current(false)
      }
      resolverRef.current = resolve
      setOptions(config)
    })
  }, [])

  const settle = useCallback((result) => {
    resolverRef.current?.(result)
    resolverRef.current = null
    setOptions(null)
  }, [])

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {options ? (
        <ConfirmDialog
          open
          title={options.title || 'Konfirmasi'}
          message={options.message}
          confirmLabel={options.confirmLabel || 'Ya, Lanjutkan'}
          cancelLabel={options.cancelLabel || 'Batal'}
          onConfirm={() => settle(true)}
          onCancel={() => settle(false)}
        >
          {options.children}
        </ConfirmDialog>
      ) : null}
    </ConfirmContext.Provider>
  )
}
