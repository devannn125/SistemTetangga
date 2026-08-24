import { useEffect, useState } from 'react'
import L from 'leaflet'
import { MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
import 'leaflet/dist/leaflet.css'
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog'

const DEFAULT_CENTER = [-7.7956, 110.3695]

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
})

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

function MapClickHandler({ onPick }) {
  useMapEvents({
    click: (e) => onPick(e.latlng.lat, e.latlng.lng),
  })
  return null
}

export default function PerumahanFormModal({
  open,
  onClose,
  onSubmit,
  initialData,
  citizens,
  masterData,
  mode = 'create',
}) {
  const [form, setForm] = useState({
    tipe: 'NON_KOS',
    alamat: '',
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
          latitude: initialData.latitude ?? '',
          longitude: initialData.longitude ?? '',
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
        latitude: '',
        longitude: '',
        id_pemilik_citizen: '',
        status_kepemilikan: 'MILIK_SENDIRI',
        id_kategori_kos: '',
        jumlah_kamar: '',
        status_pajak: 'LUNAS',
      })
    }
  }, [open, initialData, mode, citizens, masterData])

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

  function handlePickCoordinate(lat, lng) {
    setForm((prev) => ({ ...prev, latitude: lat.toFixed(7), longitude: lng.toFixed(7) }))
  }

  function handleClearCoordinate() {
    setForm((prev) => ({ ...prev, latitude: '', longitude: '' }))
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
    } catch {
      // Error handled by parent
    } finally {
      setIsSubmitting(false)
    }
  }

  const latitude = Number(form.latitude)
  const longitude = Number(form.longitude)
  const hasCoordinate = form.latitude !== '' && form.longitude !== ''
    && Number.isFinite(latitude) && Number.isFinite(longitude)

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
        </Section>

        <Section title="Koordinat (Opsional)">
          <div className="sm:col-span-2 space-y-3">
            <p className="text-xs font-normal text-neutral-500">
              Klik peta untuk menandai lokasi rumah, lalu geser pin bila perlu penyesuaian.
            </p>
            <div className="relative z-0 h-72 w-full overflow-hidden rounded-xl border border-neutral-300">
              <MapContainer
                center={hasCoordinate ? [latitude, longitude] : DEFAULT_CENTER}
                zoom={16}
                className="h-full w-full"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapClickHandler onPick={handlePickCoordinate} />
                {hasCoordinate && (
                  <Marker
                    draggable
                    position={[latitude, longitude]}
                    eventHandlers={{
                      dragend: (e) => {
                        const { lat, lng } = e.target.getLatLng()
                        handlePickCoordinate(lat, lng)
                      },
                    }}
                  />
                )}
              </MapContainer>
            </div>
            {hasCoordinate ? (
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-neutral-100 px-4 py-2.5 text-xs font-semibold text-neutral-700">
                <span>Latitude: {form.latitude} &middot; Longitude: {form.longitude}</span>
                <button
                  type="button"
                  onClick={handleClearCoordinate}
                  className="rounded-lg border border-red-300 px-3 py-1 font-bold text-red-600 transition hover:bg-red-50"
                >
                  Hapus Koordinat
                </button>
              </div>
            ) : (
              <p className="text-xs font-normal text-neutral-400">Belum ada koordinat yang dipilih.</p>
            )}
          </div>
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
