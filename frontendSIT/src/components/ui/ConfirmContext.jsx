import { createContext, useContext, useState, useCallback } from 'react'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/AlertDialog'

const ConfirmContext = createContext(null)

export function ConfirmProvider({ children }) {
  const [state, setState] = useState({
    open: false,
    title: '',
    message: '',
    confirmLabel: 'Ya, Lanjutkan',
    cancelLabel: 'Batal',
    onConfirm: () => {},
    onCancel: () => {},
  })

  const confirm = useCallback((options = {}) => {
    const { onConfirm, onCancel, ...rest } = options
    return new Promise((resolve) => {
      setState({
        ...rest,
        open: true,
        title: options.title || 'Konfirmasi',
        message: options.message || '',
        confirmLabel: options.confirmLabel || 'Ya, Lanjutkan',
        cancelLabel: options.cancelLabel || 'Batal',
        onConfirm: () => { onConfirm?.(); resolve(true) },
        onCancel: () => { onCancel?.(); resolve(false) },
      })
    })
  }, [])

  const handleConfirm = useCallback(() => {
    state.onConfirm()
    setState((s) => ({ ...s, open: false }))
  }, [state.onConfirm])

  const handleCancel = useCallback(() => {
    state.onCancel()
    setState((s) => ({ ...s, open: false }))
  }, [state.onCancel])

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      <AlertDialog open={state.open} onOpenChange={(open) => !open && handleCancel()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{state.title}</AlertDialogTitle>
            <AlertDialogDescription>{state.message}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancel}>{state.cancelLabel}</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm}>{state.confirmLabel}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ConfirmContext.Provider>
  )
}

export function useConfirm() {
  const context = useContext(ConfirmContext)
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmProvider')
  }
  return context.confirm
}