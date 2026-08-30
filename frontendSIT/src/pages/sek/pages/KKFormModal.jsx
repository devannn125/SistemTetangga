import { useState, useEffect, useMemo } from 'react'
import { useConfirm } from '@/components/ui/ConfirmContext'
import { useToast } from '@/components/ui/ToastContext'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { Label } from '@/components/ui/Label'

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
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{mode === 'edit' ? 'Edit Kartu Keluarga' : 'Tambah Kartu Keluarga Baru'}</DialogTitle>
          <DialogDescription>
            {mode === 'edit'
              ? `Memperbarui data KK: ${initialData?.no_kk || ''}`
              : 'Isi formulir di bawah untuk menambahkan Kartu Keluarga baru.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4" id="kk-form">
          <div className="space-y-2">
            <Label htmlFor="no_kk" className="text-sm font-bold text-black">No. KK <span className="text-red-500">*</span></Label>
            <Input
              id="no_kk"
              value={form.no_kk}
              onChange={(e) => updateForm('no_kk', e.target.value)}
              required
              maxLength={32}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="id_kepala_keluarga" className="text-sm font-bold text-black">Kepala Keluarga</Label>
            <Select value={form.id_kepala_keluarga} onValueChange={(value) => updateForm('id_kepala_keluarga', value)}>
              <SelectTrigger>
                <SelectValue placeholder="-- Pilih --" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">-- Pilih --</SelectItem>
                {eligibleKepala.map((c) => (
                  <SelectItem key={c.id_citizen} value={c.id_citizen}>
                    {c.nama_lengkap} (NIK: {c.nik})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {eligibleKepala.length === 0 && (
              <p className="text-xs font-semibold text-neutral-500">
                Tidak ada warga ber-status kepala keluarga yang tersedia. Tambahkan warga dengan hubungan "Kepala Keluarga" terlebih dahulu.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="status" className="text-sm font-bold text-black">Status</Label>
            <Select value={form.status} onValueChange={(value) => updateForm('status', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">Aktif</SelectItem>
                <SelectItem value="PINDAH">Pindah</SelectItem>
                <SelectItem value="DIHAPUS">Dihapus</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-3">
            <Button variant="outline" onClick={onClose} disabled={isSubmitting || loading}>
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting || loading}>
              {isSubmitting ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}