import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ToastContext } from './ToastContext'

const TOAST_DURATION = 4000
const MAX_VISIBLE = 3

let nextId = 1

function ToastItem({ toast, onClose }) {
  const isError = toast.type === 'error'

  return (
    <div
      className="pointer-events-auto flex w-80 max-w-[calc(100vw-3rem)] flex-col border-2 border-neutral-900 bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start gap-3 p-4">
        <span
          className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-extrabold text-white ${
            isError ? 'bg-red-600' : 'bg-emerald-600'
          }`}
        >
          {isError ? '!' : '✓'}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-extrabold uppercase tracking-widest text-neutral-500">
            {isError ? 'Gagal' : 'Berhasil'}
          </p>
          <p className="mt-0.5 break-words text-sm font-semibold leading-5 text-neutral-900">{toast.message}</p>
        </div>
        <button
          className="shrink-0 leading-none text-neutral-400 transition hover:text-black"
          onClick={() => onClose(toast.id)}
          type="button"
          aria-label="Tutup notifikasi"
        >
          ✕
        </button>
      </div>
      <div className="h-1 w-full bg-neutral-100">
        <div
          className={`h-full ${isError ? 'bg-red-600' : 'bg-emerald-600'}`}
          style={{ animation: `toast-progress ${TOAST_DURATION}ms linear forwards` }}
        />
      </div>
    </div>
  )
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const timersRef = useRef(new Map())

  const dismissToast = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
    const timer = timersRef.current.get(id)
    if (timer) {
      clearTimeout(timer)
      timersRef.current.delete(id)
    }
  }, [])

  const showToast = useCallback(
    (message, type = 'success') => {
      if (!message) return
      const id = nextId++
      setToasts((current) => [...current.slice(-(MAX_VISIBLE - 1)), { id, message, type }])
      const timer = setTimeout(() => dismissToast(id), TOAST_DURATION)
      timersRef.current.set(id, timer)
    },
    [dismissToast],
  )

  useEffect(() => {
    const timers = timersRef.current
    return () => timers.forEach((timer) => clearTimeout(timer))
  }, [])

  const value = useMemo(() => ({ showToast }), [showToast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-6 right-6 z-[80] flex flex-col items-end gap-3">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onClose={dismissToast} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}
