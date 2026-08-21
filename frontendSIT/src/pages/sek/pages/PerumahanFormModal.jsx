import { useEffect, useState } from 'react'
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog'

function Select({ value, onChange, options, placeholder, className = '' }) {
  return (
    <select value={value} onChange={onChange} className={`h-11 w-full rounded-xl border border-neutral-300 px-4 text-sm outline-none focus:border-sky-600 ${className}`}>
      {placeholder && <option value="">{placeholder}</option>}
      {options?.map((o) => <option key={o.id_master || o.id_citizen || o.id_wilayah} value={o.id_master || o.id_citizen || o.id_wilayah}>{o.nama_master || o.nama_lengkap || o.nama_wilayah}</option>)}
    </select>
  )
}

function Input({ value, onChange, type = 'text', placeholder, required, maxLength, className = '' }) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      className={`h-11 w-full rounded-xl border border-neutral-300 px-4 text-sm outline-none focus:border-sky-600 ${className}`}
      placeholder={placeholder}
      required={required}
      maxLength={maxLength}
    />
  )
}

function CheckboxSelect({ value, onChange, label }) {
  return (
    <label className="grid gap-2 text-sm font-bold text-black">
      {label}
      <select value={String(value)} onChange={(e) => onChange(e.target.value === 'true')} className="h-11 w-full rounded-xl border border-neutral-300 px-4 text-sm outline-none focus:border-sky-600">
        <option value="false">Tidak</option>
        <option value="true">Ya</option>
      </select>
    </label>
  )
}

function Section({ title, children }) {
  return (
    <div className="space-y-4 pt-4 border-t border-neutral-200">
      <h4 className="text-xs font-extrabold uppercase tracking-[0.12em] text-neutral-500">{title}</h4>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </div>
  )
}

function Field({ label, required, children, className = '' }) {
  return (
    <label className={`grid gap-2 text-sm font-bold text-black ${className}`}>
      <div className="flex items-start justify-between">
        <span>{label}</span>
        {required && <span className="text-red-500 text-xs leading-none mt-0.5">*</span>}
      </div>
      {children}
    </label>
  )
}

export default function PerumahanFormModal({
  open,
  onClose,
  onSubmit,
  initialData,
  citizens,
  masterData,
  wilayah,
  loading,
  mode = 'create',
}) {
  const [form, setForm] = useState({
    tipe: 'NON_KOS',
    alamat: '',
    id_wilayah: '',
    latitude: '',
    longitude: '',
    id_pemilik_citizen: '',
    status_kepemilikan: 'MILIK_SENDIRI',
    id_kategori_kos: '',
    jumlah_kamar: '',
    status_pajak: 'LUNAS',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (open) {
      if (initialData && mode === 'edit') {
        setForm({
          tipe: initialData.tipe || 'NON_KOS',
          alamat: initialData.alamat || '',
          id_wilayah: initialData.id_wilayah || '',
          latitude: initialData.latitude || '',
          longitude: initialData.longitude || '',
          id_pemilik_citizen: initialData.id_pemilik_citizen || '',
          status_kepemilikan: initialData.status_kepemilikan || 'MILIK_SENDIRI',
          id_kategori_kos: initialData.id_kategori_kos || '',
          jumlah_kamar: initialData.jumlah_kamar || '',
          status_pajak: initialData.status_pajak || 'LUNAS',
        })
      } else {
        setForm({
          tipe: 'NON_KOS',
          alamat: '',
          id_wilayah: wilayah?.[0]?.id_wilayah || '',
          latitude: '',
          longitude: '',
          id_pemilik_citizen: citizens?.[0]?.id_citizen || '',
          status_kepemilikan: 'MILIK_SENDIRI',
          id_kategori_kos: '',
          jumlah_kamar: '',
          status_pajak: 'LUNAS',
        })
      }
    } else {
      setForm({
        tipe: 'NON_KOS',
        alamat: '',
        id_wilayah: '',
        latitude: '',
        longitude: '',
        id_pemilik_citizen: '',
        status_kepemilikan: 'MILIK_SENDIRI',
        id_kategori_kos: '',
        jumlah_kamar: '',
        status_pajak: 'LUNAS',
      })
    }
  }, [open, initialData, mode, citizens, masterData, wilayah])

  function updateForm(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleTipeChange(value) {
    updateForm('tipe', value)
    if (value === 'NON_KOS') {
      updateForm('id_kategori_kos', '')
      updateForm('jumlah_kamar', '')
    } else {
      updateForm('status_kepemilikan', '')
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const payload = { ...form }
      Object.keys(payload).forEach(key => {
        if (payload[key] === '') payload[key] = null
      })
      if (form.tipe === 'NON_KOS') {
        payload.id_kategori_kos = null
        payload.jumlah_kamar = null
      } else {
        payload.status_kepemilikan = null
      }
      await onSubmit(payload)
      onClose()
    } catch (error) {
      // Error handled by parent
    } finally {
      setIsSubmitting(false)
    }
  }

  const rtWilayah = wilayah?.filter(w => w.tipe === 'RT') || []

  return (
    <ConfirmDialog
      open={open}
      title={mode === 'edit' ? 'Edit Data Perumahan' : 'Tambah Perumahan Baru'}
      message={null}
      confirmLabel={isSubmitting ? 'Menyimpan...' : 'Simpan'}
      onConfirm={() => document.getElementById('perumahan-form')?.requestSubmit()}
      onCancel={onClose}
    >
      <form id="perumahan-form" onSubmit={handleSubmit} className="space-y-4 pr-2">
        <Section title="Jenis & Alamat">
          <Field label="Tipe" required>
            <Select
              value={form.tipe}
              onChange={(e) => handleTipeChange(e.target.value)}
              options={[
                { id_master: 'NON_KOS', nama_master: 'Rumah Warga' },
                { id_master: 'KOS', nama_master: 'Kos/Kost' },
              ]}
            />
          </Field>
          <Field label="Alamat" required>
            <Input value={form.alamat} onChange={(e) => updateForm('alamat', e.target.value)} required placeholder="Jl. Contoh No. 123" />
          </Field>
          <Field label="RT" required>
            <Select
              value={form.id_wilayah}
              onChange={(e) => updateForm('id_wilayah', e.target.value)}
              options={rtWilayah}
              placeholder="-- Pilih RT --"
            />
          </Field>
        </Section>

        <Section title="Koordinat (Opsional)">
          <Field label="Latitude">
            <Input type="number" step="any" value={form.latitude} onChange={(e) => updateForm('latitude', e.target.value)} placeholder="-7.7956000" />
          </Field>
          <Field label="Longitude">
            <Input type="number" step="any" value={form.longitude} onChange={(e) => updateForm('longitude', e.target.value)} placeholder="110.3695000" />
          </Field>
        </Section>

        <Section title="Pemilik">
          <Field label="Pemilik" required>
            <Select
              value={form.id_pemilik_citizen}
              onChange={(e) => updateForm('id_pemilik_citizen', e.target.value)}
              options={citizens}
              placeholder="-- Pilih Pemilik --"
            />
          </Field>
        </Section>

        {form.tipe === 'NON_KOS' && (
          <Section title="Detail Rumah Warga">
            <Field label="Status Kepemilikan" required>
              <Select
                value={form.status_kepemilikan}
                onChange={(e) => updateForm('status_kepemilikan', e.target.value)}
                options={[
                  { id_master: 'MILIK_SENDIRI', nama_master: 'Milik Sendiri' },
                  { id_master: 'KONTRAK', nama_master: 'Kontrak' },
                ]}
              />
            </Field>
          </Section>
        )}

        {form.tipe === 'KOS' && (
          <Section title="Detail Kos/Kost">
            <Field label="Kategori Kos" required>
              <Select
                value={form.id_kategori_kos}
                onChange={(e) => updateForm('id_kategori_kos', e.target.value)}
                options={masterData.kategori_kos}
                placeholder="-- Pilih Kategori --"
              />
            </Field>
            <Field label="Jumlah Kamar" required>
              <Input type="number" min="1" value={form.jumlah_kamar} onChange={(e) => updateForm('jumlah_kamar', e.target.value)} required placeholder="4" />
            </Field>
          </Section>
        )}

        <Section title="Status Pajak">
          <Field label="Status Pajak" required>
            <Select
              value={form.status_pajak}
              onChange={(e) => updateForm('status_pajak', e.target.value)}
              options={[
                { id_master: 'LUNAS', nama_master: 'Lunas' },
                { id_master: 'BELUM_LUNAS', nama_master: 'Belum Lunas' },
              ]}
            />
          </Field>
        </Section>
      </form>
    </ConfirmDialog>
  )
}