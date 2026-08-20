import { useState, useEffect } from 'react'
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog'

export default function KKFormModal({
  open,
  onClose,
  onSubmit,
  initialData,
  citizens,
  loading,
  mode = 'create',
}) {
  const [form, setForm] = useState({
    no_kk: '',
    id_kepala_keluarga: '',
    status: 'ACTIVE',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (open) {
      if (initialData && mode === 'edit') {
        setForm({
          no_kk: initialData.no_kk || '',
          id_kepala_keluarga: initialData.id_kepala_keluarga || '',
          status: initialData.status || 'ACTIVE',
        })
      } else {
        setForm({
          no_kk: '',
          id_kepala_keluarga: '',
          status: 'ACTIVE',
        })
      }
    }
  }, [open, initialData, mode])

  function updateForm(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const payload = { ...form }
      Object.keys(payload).forEach(key => {
        if (payload[key] === '') payload[key] = null
      })
      await onSubmit(payload)
      onClose()
    } catch (error) {
      // Error handled by parent
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <ConfirmDialog
      open={open}
      title={mode === 'edit' ? 'Edit Kartu Keluarga' : 'Tambah Kartu Keluarga Baru'}
      message={null}
      confirmLabel={isSubmitting ? 'Menyimpan...' : 'Simpan'}
      onConfirm={() => document.getElementById('kk-form')?.requestSubmit()}
      onCancel={onClose}
    >
      <form id="kk-form" onSubmit={handleSubmit} className="space-y-4">
        <label className="grid gap-2 text-sm font-bold text-black">
          No. KK <span className="text-red-500">*</span>
          <input value={form.no_kk} onChange={(e) => updateForm('no_kk', e.target.value)} className="h-11 w-full rounded-xl border border-neutral-300 px-4 text-sm outline-none focus:border-sky-600" required maxLength={32} />
        </label>
        <label className="grid gap-2 text-sm font-bold text-black">
          Kepala Keluarga
          <select value={form.id_kepala_keluarga} onChange={(e) => updateForm('id_kepala_keluarga', e.target.value)} className="h-11 w-full rounded-xl border border-neutral-300 px-4 text-sm outline-none focus:border-sky-600">
            <option value="">-- Pilih --</option>
            {citizens?.map((c) => <option key={c.id_citizen} value={c.id_citizen}>{c.nama_lengkap} (NIK: {c.nik})</option>)}
          </select>
        </label>
        <label className="grid gap-2 text-sm font-bold text-black">
          Status
          <select value={form.status} onChange={(e) => updateForm('status', e.target.value)} className="h-11 w-full rounded-xl border border-neutral-300 px-4 text-sm outline-none focus:border-sky-600">
            <option value="ACTIVE">Aktif</option>
            <option value="PINDAH">Pindah</option>
            <option value="DIHAPUS">Dihapus</option>
          </select>
        </label>
        <div className="flex flex-wrap gap-3 pt-4 border-t border-neutral-200">
          <button type="submit" className="rounded-full bg-black px-5 py-2 text-xs font-extrabold uppercase text-white transition hover:bg-neutral-900 disabled:cursor-not-allowed disabled:bg-neutral-400" disabled={isSubmitting || loading}>
            {isSubmitting ? 'Menyimpan...' : 'Simpan'}
          </button>
          <button type="button" onClick={onClose} className="rounded-full border border-neutral-300 px-5 py-2 text-xs font-extrabold uppercase text-neutral-700 transition hover:bg-neutral-100">
            Batal
          </button>
        </div>
      </form>
    </ConfirmDialog>
  )
}