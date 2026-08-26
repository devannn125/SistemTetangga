import { useState, useEffect, useMemo } from 'react'
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog'
import { useConfirm } from '../../../components/ui/ConfirmContext'
import { useToast } from '../../../components/ui/ToastContext'

export default function KKFormModal({
  open,
  onClose,
  onSubmit,
  initialData,
  citizens,
  families,
  loading,
  mode = 'create',
}) {
  // Kandidat kepala keluarga (PRD 6.2.2: hanya satu kepala keluarga aktif
  // per KK): warga ber-hubungan KEPALA_KELUARGA yang belum menjadi kepala
  // KK berstatus ACTIVE lain. Pada mode edit, nilai terpilih saat ini tetap
  // ditampilkan agar tidak ter-reset.
  const eligibleKepala = useMemo(() => {
    const list = (citizens || []).filter((c) => {
      if (c.hubungan_keluarga !== 'KEPALA_KELUARGA') return false
      const leadsOtherActiveKK = (families || []).some(
        (f) =>
          f.status === 'ACTIVE' &&
          f.id_kepala_keluarga === c.id_citizen &&
          f.id_family !== initialData?.id_family
      )
      return !leadsOtherActiveKK
    })
    const currentId = initialData?.id_kepala_keluarga
    if (currentId && !list.some((c) => c.id_citizen === currentId)) {
      const current = (citizens || []).find((c) => c.id_citizen === currentId)
      if (current) list.unshift(current)
    }
    return list
  }, [citizens, families, initialData])
  const [form, setForm] = useState({
    no_kk: '',
    id_kepala_keluarga: '',
    status: 'ACTIVE',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const confirm = useConfirm()
  const { showToast } = useToast()

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
    const approved = await confirm({
      title: mode === 'edit' ? 'Konfirmasi Perubahan' : 'Konfirmasi Simpan',
      message:
        mode === 'edit'
          ? `Simpan perubahan data KK nomor "${form.no_kk}"?`
          : `Yakin ingin menyimpan Kartu Keluarga baru dengan nomor "${form.no_kk}"?`,
      confirmLabel: 'Ya, Simpan',
    })
    if (!approved) return
    setIsSubmitting(true)
    try {
      const payload = { ...form }
      Object.keys(payload).forEach(key => {
        if (payload[key] === '') payload[key] = null
      })
      await onSubmit(payload)
      onClose()
      showToast(mode === 'edit' ? 'Perubahan data KK berhasil disimpan.' : 'Data KK baru berhasil ditambahkan.')
    } catch (error) {
      showToast(error.message || 'Gagal menyimpan data KK.', 'error')
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
            {eligibleKepala.map((c) => (
              <option key={c.id_citizen} value={c.id_citizen}>
                {c.nama_lengkap} (NIK: {c.nik})
              </option>
            ))}
          </select>
          {eligibleKepala.length === 0 ? (
            <span className="text-xs font-semibold text-neutral-500">
              Tidak ada warga ber-status kepala keluarga yang tersedia. Tambahkan warga dengan hubungan &quot;Kepala Keluarga&quot; terlebih dahulu.
            </span>
          ) : null}
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