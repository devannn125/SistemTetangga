import { useEffect, useMemo, useState } from 'react'
import { PageShell } from '../../../components/layout/PageShell'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card'
import { Badge } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import { Alert } from '../../../components/ui/Alert'
import { Input } from '../../../components/ui/Input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/Select'
import { SkeletonCard } from '../../../components/ui/Skeleton'
import { createRegulation, deleteRegulation, getRegulations, getWilayah, updateRegulation } from '../../../services/api'
import { useConfirm } from '../../../components/ui/ConfirmContext'
import { useToast } from '../../../components/ui/ToastContext'

const allowedCategories = [
  { id: 'WARGA_TETAP', label: 'Tata Tertib Warga Tetap' },
  { id: 'TAMU', label: 'Peraturan Tamu' },
]

const initialForm = {
  kategori: 'WARGA_TETAP',
  judul: '',
  isi: '',
  tanggal_berlaku: new Date().toISOString().slice(0, 10),
  status: 'AKTIF',
  id_wilayah: '',
}

function formatDate(value) {
  if (!value) return '-'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '-'
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(d)
}

function categoryLabel(value) {
  return allowedCategories.find((category) => category.id === value)?.label || value
}

function normalizeRows(response) {
  return Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : []
}

export default function RtRegulationPage() {
  const [regulations, setRegulations] = useState([])
  const [wilayahOptions, setWilayahOptions] = useState([])
  const [form, setForm] = useState(initialForm)
  const [editingId, setEditingId] = useState('')
  const [notice, setNotice] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const confirm = useConfirm()
  const { showToast } = useToast()

  useEffect(() => {
    let alive = true

    async function loadData() {
      setIsLoading(true)
      try {
        const [regulationResponse, wilayahResponse] = await Promise.all([
          getRegulations({ per_page: 100 }),
          getWilayah({ per_page: 100 }),
        ])
        const nextRegulations = normalizeRows(regulationResponse).filter((item) =>
          allowedCategories.some((category) => category.id === item.kategori),
        )
        const nextWilayah = normalizeRows(wilayahResponse)
        if (alive) {
          setRegulations(nextRegulations)
          setWilayahOptions(nextWilayah)
          setForm((current) => ({ ...current, id_wilayah: current.id_wilayah || nextWilayah[0]?.id_wilayah || '' }))
        }
      } catch (error) {
        if (alive) setNotice(error.message || 'Backend belum dapat dihubungi.')
      } finally {
        if (alive) setIsLoading(false)
      }
    }

    loadData()
    return () => { alive = false }
  }, [])

  const activeRegulations = useMemo(() => regulations.filter((item) => item.status !== 'NONAKTIF'), [regulations])

  function updateForm(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function startEdit(regulation) {
    setEditingId(regulation.id_regulation)
    setForm({
      kategori: regulation.kategori,
      judul: regulation.judul || '',
      isi: regulation.isi || '',
      tanggal_berlaku: (regulation.tanggal_berlaku || new Date().toISOString()).slice(0, 10),
      status: regulation.status || 'AKTIF',
      id_wilayah: regulation.id_wilayah || regulation.wilayah?.id_wilayah || '',
    })
  }

  function resetForm() {
    setEditingId('')
    setForm({ ...initialForm, id_wilayah: wilayahOptions[0]?.id_wilayah || '' })
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const approved = await confirm({
      title: editingId ? 'Konfirmasi Perubahan' : 'Konfirmasi Simpan',
      message: editingId
        ? `Simpan perubahan peraturan "${form.judul}"? Perubahan akan tercatat sebagai versi baru.`
        : `Yakin ingin menerbitkan peraturan "${form.judul}"? Warga akan menerima notifikasi peraturan baru.`,
      confirmLabel: 'Ya, Simpan',
    })
    if (!approved) return
    setIsSaving(true)

    try {
      const payload = { ...form }
      const response = editingId ? await updateRegulation(editingId, payload) : await createRegulation(payload)
      const saved = response?.data || response
      setRegulations((current) => {
        if (editingId) return current.map((item) => (item.id_regulation === editingId ? saved : item))
        return [saved, ...current]
      })
      showToast(editingId ? 'Peraturan RT berhasil diperbarui.' : 'Peraturan RT berhasil dibuat.')
      resetForm()
    } catch (error) {
      showToast(error.message || 'Gagal menyimpan peraturan.', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDeactivate(id) {
    const approved = await confirm({
      title: 'Konfirmasi Nonaktifkan',
      message: 'Yakin ingin menonaktifkan peraturan ini?',
      confirmLabel: 'Ya, Nonaktifkan',
    })
    if (!approved) return
    try {
      await deleteRegulation(id)
      setRegulations((current) => current.map((item) => (item.id_regulation === id ? { ...item, status: 'NONAKTIF' } : item)))
      showToast('Peraturan berhasil dinonaktifkan.')
    } catch (error) {
      showToast(error.message || 'Gagal menonaktifkan peraturan.', 'error')
    }
  }

  const selectWilayahOptions = wilayahOptions.map((w) => ({
    value: w.id_wilayah,
    label: w.nama_wilayah || w.kode_wilayah || `Wilayah ${w.id_wilayah}`,
  }))

  const selectCategoryOptions = allowedCategories.map((c) => ({
    value: c.id,
    label: c.label,
  }))

  return (
    <PageShell
      eyebrow="Peraturan"
      title="Tata Tertib RT"
      description="RT hanya dapat mengelola Tata Tertib Warga Tetap dan Peraturan Tamu. Aturan penghuni tidak tetap atau kos dikelola oleh RW."
    >
      <div className="mt-8 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        {/* Form Peraturan */}
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? 'Edit Peraturan' : 'Buat Peraturan'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-sm font-medium text-neutral-700">Kategori</label>
              <Select
                value={form.kategori || undefined}
                onValueChange={(v) => updateForm('kategori', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  {selectCategoryOptions.map((o) => (
                    <SelectItem key={o.value} value={String(o.value)}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-sm font-medium text-neutral-700">Wilayah</label>
              <Select
                value={form.id_wilayah || undefined}
                onValueChange={(v) => updateForm('id_wilayah', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih wilayah" />
                </SelectTrigger>
                <SelectContent>
                  {selectWilayahOptions.map((o) => (
                    <SelectItem key={o.value} value={String(o.value)}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-sm font-medium text-neutral-700">Judul</label>
              <Input
                value={form.judul}
                onChange={(e) => updateForm('judul', e.target.value)}
                required
              />
            </div>

              <div className="flex flex-col gap-1.5 w-full">
                <label className="text-sm font-medium text-neutral-700">Isi</label>
                <textarea
                  className="min-h-36 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                  value={form.isi}
                  onChange={(e) => updateForm('isi', e.target.value)}
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5 w-full">
                <label className="text-sm font-medium text-neutral-700">Tanggal Berlaku</label>
                <Input
                  type="date"
                  value={form.tanggal_berlaku}
                  onChange={(e) => updateForm('tanggal_berlaku', e.target.value)}
                  required
                />
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                <Button
                  type="submit"
                  disabled={isSaving || !form.id_wilayah}
                >
                  {editingId ? 'Simpan Perubahan' : 'Terbitkan'}
                </Button>
                {editingId && (
                  <Button variant="ghost" type="button" onClick={resetForm}>
                    Batal
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* List Peraturan */}
        <div className="space-y-4">
          {notice && <Alert variant="info">{notice}</Alert>}

          {isLoading ? (
            Array.from({ length: 2 }).map((_, i) => <SkeletonCard key={i} />)
          ) : activeRegulations.length === 0 ? (
            <div className="rounded-xl border border-neutral-200 bg-white p-8 text-center text-sm font-medium text-neutral-500">
              Belum ada peraturan RT.
            </div>
          ) : (
            activeRegulations.map((regulation) => (
              <Card key={regulation.id_regulation}>
                <CardHeader className="border-b border-neutral-100">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-sky-600">
                        {categoryLabel(regulation.kategori)} · Versi {regulation.versi || 1}
                      </p>
                      <CardTitle className="mt-2 text-lg">{regulation.judul}</CardTitle>
                    </div>
                    <Badge variant="success">{regulation.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <p className="text-sm leading-relaxed text-neutral-600 whitespace-pre-wrap">{regulation.isi}</p>
                  <p className="mt-4 text-xs text-neutral-400">Berlaku: {formatDate(regulation.tanggal_berlaku)}</p>
                  <div className="mt-5 flex gap-2">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => startEdit(regulation)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeactivate(regulation.id_regulation)}
                    >
                      Nonaktifkan
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </PageShell>
  )
}
