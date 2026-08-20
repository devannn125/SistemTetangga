export function formatDate(value) {
  if (!value) return '-'
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(value))
}

export function formatDateShort(value) {
  if (!value) return '-'
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value))
}

export function getStatusClass(status) {
  return {
    DIAJUKAN: 'bg-amber-100 text-amber-900',
    DIVERIFIKASI: 'bg-sky-100 text-sky-900',
    DISETUJUI: 'bg-emerald-100 text-emerald-900',
    DITOLAK: 'bg-red-100 text-red-900',
    DITANDATANGANI: 'bg-violet-100 text-violet-900',
    TERBIT: 'bg-neutral-100 text-neutral-900',
    BELUM_BAYAR: 'bg-amber-100 text-amber-900',
    LUNAS: 'bg-emerald-100 text-emerald-900',
    SEBAGIAN: 'bg-sky-100 text-sky-900',
    LUNAS: 'bg-emerald-100 text-emerald-900',
    BELUM_LUNAS: 'bg-amber-100 text-amber-900',
  }[status] || 'bg-neutral-100 text-neutral-900'
}

export function getPurchaseStatusClass(status) {
  return {
    DIAJUKAN: 'bg-amber-100 text-amber-900',
    DISETUJUI: 'bg-emerald-100 text-emerald-900',
    DITOLAK: 'bg-red-100 text-red-900',
  }[status] || 'bg-neutral-100 text-neutral-900'
}

export function formatCurrency(value) {
  return `Rp ${Number(value || 0).toLocaleString('id-ID')}`
}

export function toRows(response) {
  return Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : []
}

export function getStatusSteps(status) {
  const steps = ['DIAJUKAN', 'DIVERIFIKASI', 'DISETUJUI']
  if (status === 'DITOLAK') return ['DIAJUKAN', 'DITOLAK']
  const index = steps.indexOf(status)
  return index >= 0 ? steps.slice(0, index + 1) : steps
}

export function getAgamaName(masterData, id) {
  return masterData.agama?.find(a => a.id_master === id)?.nama_master || '-'
}

export function getPendidikanName(masterData, id) {
  return masterData.pendidikan?.find(p => p.id_master === id)?.nama_master || '-'
}

export function getProfesiName(masterData, id) {
  return masterData.profesi?.find(p => p.id_master === id)?.nama_master || '-'
}

export function getFamilyName(families, id) {
  return families?.find(f => f.id_family === id)?.no_kk || '-'
}

export function getKepalaName(citizens, id) {
  return citizens?.find(c => c.id_citizen === id)?.nama_lengkap || '-'
}