import { createContext, useContext } from 'react'

export const ConfirmContext = createContext(null)

export function useConfirm() {
  const context = useContext(ConfirmContext)
  if (!context) {
    throw new Error('useConfirm harus dipakai di dalam ConfirmProvider')
  }
  return context.confirm
}
