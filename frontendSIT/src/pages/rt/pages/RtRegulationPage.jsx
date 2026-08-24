import { useEffect, useMemo, useState } from 'react'
import { PageShell } from '../../../components/layout/PageShell'
import { createRegulation, deleteRegulation, getRegulations, getWilayah, updateRegulation } from '../../../services/api'

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
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value))
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

    return () => {
      alive = false
    }
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
    setNotice('')
    setIsSaving(true)

    try {
      const payload = { ...form }
      const response = editingId ? await updateRegulation(editingId, payload) : await createRegulation(payload)
      const saved = response?.data || response
      setRegulations((current) => {
        if (editingId) return current.map((item) => (item.id_regulation === editingId ? saved : item))
        return [saved, ...current]
      })
      setNotice(editingId ? 'Peraturan RT berhasil diperbarui.' : 'Peraturan RT berhasil dibuat.')
      resetForm()
    } catch (error) {
      setNotice(error.message || 'Gagal menyimpan peraturan.')
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDeactivate(id) {
    setNotice('')
    try {
      await deleteRegulation(id)
      setRegulations((current) => current.map((item) => (item.id_regulation === id ? { ...item, status: 'NONAKTIF' } : item)))
      setNotice('Peraturan berhasil dinonaktifkan.')
    } catch (error) {
      setNotice(error.message || 'Gagal menonaktifkan peraturan.')
    }
  }

  return (
    <PageShell
      eyebrow="Peraturan"
      title="Tata Tertib RT"
      description="RT hanya dapat mengelola Tata Tertib Warga Tetap dan Peraturan Tamu. Aturan penghuni tidak tetap atau kos dikelola oleh RW."
    >
      <section className="mt-8 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <form className="space-y-4 rounded-2xl border border-neutral-300 bg-white p-6" onSubmit={handleSubmit}>
          <h2 className="text-lg font-extrabold text-black">{editingId ? 'Edit Peraturan' : 'Buat Peraturan'}</h2>

          <label className="grid gap-2 text-sm font-bold text-black">
            Kategori
            <select
              className="rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none focus:border-sky-600"
              value={form.kategori}
              onChange={(event) => updateForm('kategori', event.target.value)}
            >
              {allowedCategories.map((category) => (
                <option key={category.id} value={category.id}>{category.label}</option>
              ))}
            </select>
          </label>

          <label className="grid gap-2 text-sm font-bold text-black">
            Wilayah
            <select
              className="rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none focus:border-sky-600"
              value={form.id_wilayah}
              onChange={(event) => updateForm('id_wilayah', event.target.value)}
              required
            >
              <option value="">Pilih wilayah</option>
              {wilayahOptions.map((wilayah) => (
                <option key={wilayah.id_wilayah} value={wilayah.id_wilayah}>
                  {wilayah.nama_wilayah || wilayah.kode_wilayah || `Wilayah ${wilayah.id_wilayah}`}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2 text-sm font-bold text-black">
            Judul
            <input
              className="rounded-xl border border-neutral-300 px-4 py-3 text-sm outline-none focus:border-sky-600"
              value={form.judul}
              onChange={(event) => updateForm('judul', event.target.value)}
              required
            />
          </label>

          <label className="grid gap-2 text-sm font-bold text-black">
            Isi
            <textarea
              className="min-h-40 rounded-xl border border-neutral-300 px-4 py-3 text-sm outline-none focus:border-sky-600"
              value={form.isi}
              onChange={(event) => updateForm('isi', event.target.value)}
              required
            />
          </label>

          <label className="grid gap-2 text-sm font-bold text-black">
            Tanggal Berlaku
            <input
              className="rounded-xl border border-neutral-300 px-4 py-3 text-sm outline-none focus:border-sky-600"
              type="date"
              value={form.tanggal_berlaku}
              onChange={(event) => updateForm('tanggal_berlaku', event.target.value)}
              required
            />
          </label>

          <div className="flex flex-wrap gap-3">
            <button
              className="rounded-full bg-black px-5 py-3 text-xs font-extrabold uppercase text-white transition hover:bg-neutral-900 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isSaving || !form.id_wilayah}
              type="submit"
            >
              {editingId ? 'Simpan Perubahan' : 'Terbitkan'}
            </button>
            {editingId ? (
              <button
                className="rounded-full border border-black px-5 py-3 text-xs font-extrabold uppercase text-black transition hover:bg-neutral-100"
                onClick={resetForm}
                type="button"
              >
                Batal
              </button>
            ) : null}
          </div>
        </form>

        <div className="space-y-4">
          {notice ? (
            <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-semibold text-sky-900">
              {notice}
            </div>
          ) : null}

          {isLoading ? (
            <div className="rounded-xl border border-neutral-300 bg-white p-8 text-center text-sm font-semibold text-neutral-600">
              Memuat peraturan...
            </div>
          ) : activeRegulations.length === 0 ? (
            <div className="rounded-xl border border-neutral-300 bg-white p-8 text-center text-sm font-semibold text-neutral-600">
              Belum ada peraturan RT.
            </div>
          ) : (
            activeRegulations.map((regulation) => (
              <article key={regulation.id_regulation} className="border border-neutral-300 bg-white p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-neutral-500">
                      {categoryLabel(regulation.kategori)} · Versi {regulation.versi || 1}
                    </p>
                    <h2 className="mt-3 text-xl font-extrabold text-black">{regulation.judul}</h2>
                    <p className="mt-2 line-clamp-3 text-sm leading-6 text-neutral-600">{regulation.isi}</p>
                  </div>
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-900">{regulation.status}</span>
                </div>
                <p className="mt-4 text-sm text-neutral-500">Berlaku: {formatDate(regulation.tanggal_berlaku)}</p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    className="rounded-full bg-black px-5 py-2 text-xs font-extrabold uppercase text-white transition hover:bg-neutral-900"
                    onClick={() => startEdit(regulation)}
                    type="button"
                  >
                    Edit
                  </button>
                  <button
                    className="rounded-full border border-black px-5 py-2 text-xs font-extrabold uppercase text-black transition hover:bg-neutral-100"
                    onClick={() => handleDeactivate(regulation.id_regulation)}
                    type="button"
                  >
                    Nonaktifkan
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </PageShell>
  )
}
