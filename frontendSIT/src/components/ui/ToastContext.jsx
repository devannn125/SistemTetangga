import { createContext, useContext, useCallback } from 'react'
import { Toaster, toast } from 'sonner'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const showToast = useCallback((message, options = {}) => {
    toast(message, options)
  }, [])

  return (
    <ToastContext.Provider value={{ toast: showToast }}>
      {children}
      <Toaster
        position="top-right"
        theme="system"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'hsl(var(--background))',
            color: 'hsl(var(--foreground))',
            border: '1px solid hsl(var(--border))',
          },
        }}
      />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}