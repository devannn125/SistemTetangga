import * as React from "react"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        success: "border-transparent bg-emerald-100 text-emerald-900",
        warning: "border-transparent bg-amber-100 text-amber-900",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  ...props
}) {
  return (<div className={cn(badgeVariants({ variant }), className)} {...props} />);
}

const STATUS_LABELS = {
  MENUNGGU: 'Menunggu',
  DISETUJUI: 'Disetujui',
  DITOLAK: 'Ditolak',
  CHECK_OUT: 'Check Out',
  DIAJUKAN: 'Diajukan',
  DIVERIFIKASI: 'Diverifikasi',
  DITANDATANGANI: 'Ditandatangani',
  TERBIT: 'Terbit',
  BELUM_BAYAR: 'Belum Bayar',
  BELUM_LUNAS: 'Belum Lunas',
  LUNAS: 'Lunas',
  SEBAGIAN: 'Sebagian',
  PENDING: 'Pending',
  VERIFIED_RW: 'Terverifikasi RW',
  APPROVED_DUKUH: 'Disetujui',
  REJECTED: 'Ditolak',
  AKTIF: 'Aktif',
  ESKALASI: 'Eskalasi',
}

const STATUS_VARIANTS = {
  MENUNGGU: 'warning',
  DIAJUKAN: 'warning',
  PENDING: 'warning',
  BELUM_BAYAR: 'warning',
  BELUM_LUNAS: 'warning',
  DISETUJUI: 'success',
  LUNAS: 'success',
  AKTIF: 'success',
  APPROVED_DUKUH: 'success',
  TERBIT: 'success',
  VERIFIED_RW: 'success',
  DITOLAK: 'destructive',
  REJECTED: 'destructive',
  CHECK_OUT: 'secondary',
  DITANDATANGANI: 'secondary',
  DIVERIFIKASI: 'secondary',
  SEBAGIAN: 'secondary',
  ESKALASI: 'secondary',
}

function StatusBadge({ status, label }) {
  const variant = STATUS_VARIANTS[status] || 'secondary'
  const text = STATUS_LABELS[status] || status || '-'
  return (
    <div className="inline-flex items-center gap-1.5">
      <Badge variant={variant}>{text}</Badge>
      {label && <span className="text-xs text-neutral-500">{label}</span>}
    </div>
  )
}

function GuestStatusBadge({ status }) {
  const variants = {
    MENUNGGU: 'warning',
    DISETUJUI: 'success',
    DITOLAK: 'destructive',
    CHECK_OUT: 'secondary',
  }
  return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>
}

export { Badge, badgeVariants, StatusBadge, GuestStatusBadge }