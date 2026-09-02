export function formatCurrency(value) {
  return `Rp ${Number(value || 0).toLocaleString('id-ID')}`
}

export function formatDate(value) {
  if (!value) return '-'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '-'
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(d)
}

export function getVerificationStatusClass(status) {
  return {
    PENDING: 'bg-amber-100 text-amber-900',
    VERIFIED_RW: 'bg-sky-100 text-sky-900',
    APPROVED_DUKUH: 'bg-emerald-100 text-emerald-900',
    REJECTED: 'bg-red-100 text-red-900',
  }[status] || 'bg-neutral-100 text-neutral-900'
}

export function getVerificationStatusLabel(status) {
  return {
    PENDING: 'Pending',
    VERIFIED_RW: 'Terverifikasi RW',
    APPROVED_DUKUH: 'Disetujui',
    REJECTED: 'Ditolak',
  }[status] || status || 'Pending'
}
