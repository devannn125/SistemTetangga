import { cva } from 'class-variance-authority'
import { cn } from '../../lib/utils'

/**
 * Alert — komponen notifikasi/informasi inline.
 *
 * Variant:
 *   info    → biru langit (default)
 *   success → hijau
 *   warning → amber
 *   danger  → merah
 */

const alertVariants = cva(
  'relative flex items-start gap-3 rounded-lg border px-4 py-3 text-sm',
  {
    variants: {
      variant: {
        info:    'border-sky-200 bg-sky-50 text-sky-900',
        success: 'border-emerald-200 bg-emerald-50 text-emerald-900',
        warning: 'border-amber-200 bg-amber-50 text-amber-900',
        danger:  'border-red-200 bg-red-50 text-red-900',
      },
    },
    defaultVariants: {
      variant: 'info',
    },
  }
)

export function Alert({ className, variant, icon, title, children, ...props }) {
  return (
    <div className={cn(alertVariants({ variant }), className)} role="alert" {...props}>
      {icon && <span className="mt-0.5 shrink-0">{icon}</span>}
      <div className="flex-1 min-w-0">
        {title && <p className="font-semibold">{title}</p>}
        {children && <p className={cn('text-sm', title && 'mt-1')}>{children}</p>}
      </div>
    </div>
  )
}
