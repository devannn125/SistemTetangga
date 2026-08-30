import { Dialog, DialogContent, DialogTitle } from './Dialog'
import { cn } from '../../lib/utils'

export function ConfirmDialog({ open, title, onCancel, children, className }) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onCancel?.() }}>
      <DialogContent className={cn('max-w-lg', className)}>
        <DialogTitle>{title}</DialogTitle>
        {children}
      </DialogContent>
    </Dialog>
  )
}
