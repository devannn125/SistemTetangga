export function toRows(response) {
  return Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : []
}

export function formatCurrency(value) {
  return `Rp ${Number(value || 0).toLocaleString('id-ID')}`
}

export function getPurchaseStatusClass(status) {
  return {
    DIAJUKAN: 'bg-amber-100 text-amber-900',
    DISETUJUI: 'bg-emerald-100 text-emerald-900',
    DITOLAK: 'bg-red-100 text-red-900',
  }[status] || 'bg-neutral-100 text-neutral-900'
}

export function formatDate(value) {
  if (!value) return '-'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '-'
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(d)
}

export function formatPeriod(value) {
  if (!value) return '-'
  const [year, month] = String(value).split('-')
  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
  return `${months[Number(month) - 1] || month} ${year}`
}

export function getStatusClass(status) {
  return {
    LUNAS: 'bg-emerald-100 text-emerald-900',
    BELUM_BAYAR: 'bg-amber-100 text-amber-900',
    SEBAGIAN: 'bg-sky-100 text-sky-900',
  }[status] || 'bg-neutral-100 text-neutral-900'
}
