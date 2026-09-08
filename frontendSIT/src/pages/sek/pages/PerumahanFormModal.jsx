import { useEffect, useState } from 'react'
import L from 'leaflet'
import { MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
import 'leaflet/dist/leaflet.css'
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

const DEFAULT_CENTER = [-7.7956, 110.3695]

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
})

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
    jumlah_penghuni: '',
    status_pajak: 'LUNAS',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const confirm = useConfirm()
  const { showToast } = useToast()

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
          jumlah_penghuni: initialData.jumlah_penghuni ?? '',
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
          jumlah_penghuni: '',
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
        jumlah_penghuni: '',
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
      updateForm('jumlah_penghuni', '')
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
    const approved = await confirm({
      title: mode === 'edit' ? 'Konfirmasi Perubahan' : 'Konfirmasi Simpan',
      message:
        mode === 'edit'
          ? 'Simpan perubahan data perumahan ini?'
          : 'Yakin ingin menyimpan data perumahan baru?',
      confirmLabel: 'Ya, Simpan',
    })
    if (!approved) return
    setIsSubmitting(true)
    try {
      const payload = { ...form }
      Object.keys(payload).forEach(key => {
        if (payload[key] === '') payload[key] = null
      })
      if (form.tipe === 'NON_KOS') {
        payload.id_kategori_kos = null
        payload.jumlah_kamar = null
        payload.jumlah_penghuni = null
      }
      await onSubmit(payload)
      onClose()
      showToast(mode === 'edit' ? 'Perubahan data perumahan berhasil disimpan.' : 'Data perumahan baru berhasil ditambahkan.')
    } catch (error) {
      showToast(error.message || 'Gagal menyimpan data perumahan.', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const latitude = Number(form.latitude)
  const longitude = Number(form.longitude)
  const hasCoordinate = form.latitude !== '' && form.longitude !== ''
    && Number.isFinite(latitude) && Number.isFinite(longitude)

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{mode === 'edit' ? 'Edit Data Perumahan' : 'Tambah Perumahan Baru'}</DialogTitle>
          <DialogDescription>
            {mode === 'edit'
              ? `Memperbarui data perumahan: ${initialData?.alamat || ''}`
              : 'Isi formulir di bawah untuk menambahkan data perumahan baru.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pr-2" id="perumahan-form">
          <div className="pt-4 border-t border-neutral-200">
            <h4 className="text-xs font-extrabold uppercase tracking-[0.12em] text-neutral-500">Jenis & Alamat</h4>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="tipe" className="text-sm font-bold text-black">Tipe <span className="text-red-500">*</span></Label>
                <Select value={form.tipe} onValueChange={(value) => handleTipeChange(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NON_KOS">Rumah Warga</SelectItem>
                    <SelectItem value="KOS">Kos/Kost</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="alamat" className="text-sm font-bold text-black">Alamat <span className="text-red-500">*</span></Label>
                <Input
                  id="alamat"
                  value={form.alamat}
                  onChange={(e) => updateForm('alamat', e.target.value)}
                  required
                  placeholder="Jl. Contoh No. 123"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-neutral-200">
            <h4 className="text-xs font-extrabold uppercase tracking-[0.12em] text-neutral-500">Koordinat (Opsional)</h4>
            <div className="mt-4 sm:col-span-2 space-y-3">
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
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-red-600 border-red-300 hover:bg-red-50"
                    onClick={handleClearCoordinate}
                  >
                    Hapus Koordinat
                  </Button>
                </div>
              ) : (
                <p className="text-xs font-normal text-neutral-400">Belum ada koordinat yang dipilih.</p>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-neutral-200">
            <h4 className="text-xs font-extrabold uppercase tracking-[0.12em] text-neutral-500">Pemilik</h4>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="id_pemilik_citizen" className="text-sm font-bold text-black">Pemilik <span className="text-red-500">*</span></Label>
                <Select value={form.id_pemilik_citizen} onValueChange={(value) => updateForm('id_pemilik_citizen', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="-- Pilih Pemilik --" />
                  </SelectTrigger>
                  <SelectContent>
                    {citizens?.map((c) => (
                      <SelectItem key={c.id_citizen} value={c.id_citizen}>{c.nama_lengkap}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {form.tipe === 'NON_KOS' && (
            <div className="pt-4 border-t border-neutral-200">
              <h4 className="text-xs font-extrabold uppercase tracking-[0.12em] text-neutral-500">Detail Rumah Warga</h4>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="status_kepemilikan" className="text-sm font-bold text-black">Status Kepemilikan <span className="text-red-500">*</span></Label>
                  <Select value={form.status_kepemilikan} onValueChange={(value) => updateForm('status_kepemilikan', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MILIK_SENDIRI">Milik Sendiri</SelectItem>
                      <SelectItem value="KONTRAK">Kontrak</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {form.tipe === 'KOS' && (
            <div className="pt-4 border-t border-neutral-200">
              <h4 className="text-xs font-extrabold uppercase tracking-[0.12em] text-neutral-500">Detail Kos/Kost</h4>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="id_kategori_kos" className="text-sm font-bold text-black">Kategori Kos <span className="text-red-500">*</span></Label>
                  <Select value={form.id_kategori_kos} onValueChange={(value) => updateForm('id_kategori_kos', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="-- Pilih Kategori --" />
                    </SelectTrigger>
                    <SelectContent>
                      {masterData.kategori_kos?.map((o) => (
                        <SelectItem key={o.id_master} value={o.id_master}>{o.nama_master}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="jumlah_kamar" className="text-sm font-bold text-black">Jumlah Kamar <span className="text-red-500">*</span></Label>
                  <Input
                    id="jumlah_kamar"
                    type="number"
                    min="1"
                    value={form.jumlah_kamar}
                    onChange={(e) => updateForm('jumlah_kamar', e.target.value)}
                    required
                    placeholder="4"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="jumlah_penghuni" className="text-sm font-bold text-black">Jumlah Penghuni <span className="text-red-500">*</span></Label>
                  <Input
                    id="jumlah_penghuni"
                    type="number"
                    min="0"
                    value={form.jumlah_penghuni}
                    onChange={(e) => updateForm('jumlah_penghuni', e.target.value)}
                    required
                    placeholder="12"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-neutral-200">
            <h4 className="text-xs font-extrabold uppercase tracking-[0.12em] text-neutral-500">Status Pajak</h4>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="status_pajak" className="text-sm font-bold text-black">Status Pajak <span className="text-red-500">*</span></Label>
                <Select value={form.status_pajak} onValueChange={(value) => updateForm('status_pajak', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LUNAS">Lunas</SelectItem>
                    <SelectItem value="BELUM_LUNAS">Belum Lunas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-3">
            <Button variant="outline" onClick={onClose}>
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}