import { useEffect, useState } from 'react'
import { useConfirm } from '@/components/ui/ConfirmContext'
import { useToast } from '@/components/ui/ToastContext'
import {
  Dialog,
  DialogTrigger,
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
import { Checkbox } from '@/components/ui/Checkbox'

const emptyForm = {
  nik: '',
  nama_lengkap: '',
  tempat_lahir: '',
  tanggal_lahir: '',
  jenis_kelamin: 'L',
  id_agama: '',
  status_nikah: 'BELUM_KAWIN',
  id_pendidikan: '',
  id_profesi: '',
  no_hp: '',
  email: '',
  status_warga: 'TETAP',
  kewarganegaraan: 'WNI',
  status_ekonomi: 'MAMPU',
  penerima_bansos: false,
  tanggal_masuk_rt: new Date().toISOString().split('T')[0],
  alamat_kk_luar_rt: false,
  berdomisili_luar_rt: false,
  id_family: '',
  hubungan_keluarga: 'LAINNYA',
}

export default function WargaFormModal({
  open,
  onClose,
  onSubmit,
  initialData,
  families,
  masterData,
  mode = 'create',
}) {
  const [form, setForm] = useState(emptyForm)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const confirm = useConfirm()
  const { showToast } = useToast()

  useEffect(() => {
    if (open) {
      if (initialData && mode === 'edit') {
        setForm({
          nik: initialData.nik || '',
          nama_lengkap: initialData.nama_lengkap || '',
          tempat_lahir: initialData.tempat_lahir || '',
          tanggal_lahir: initialData.tanggal_lahir || '',
          jenis_kelamin: initialData.jenis_kelamin || 'L',
          id_agama: initialData.agama?.id_master || '',
          status_nikah: initialData.status_nikah || 'BELUM_KAWIN',
          id_pendidikan: initialData.pendidikan?.id_master || '',
          id_profesi: initialData.profesi?.id_master || '',
          no_hp: initialData.no_hp || '',
          email: initialData.email || '',
          status_warga: initialData.status_warga || 'TETAP',
          kewarganegaraan: initialData.kewarganegaraan || 'WNI',
          status_ekonomi: initialData.status_ekonomi || 'MAMPU',
          penerima_bansos: initialData.penerima_bansos || false,
          tanggal_masuk_rt: initialData.tanggal_masuk_rt || new Date().toISOString().split('T')[0],
          alamat_kk_luar_rt: initialData.alamat_kk_luar_rt || false,
          berdomisili_luar_rt: initialData.berdomisili_luar_rt || false,
          id_family: initialData.family?.id_family || '',
          hubungan_keluarga: initialData.hubungan_keluarga || 'LAINNYA',
        })
      } else {
        setForm({
          ...emptyForm,
          id_family: families?.[0]?.id_family || '',
        })
      }
    } else {
      setForm(emptyForm)
    }
  }, [open, initialData, mode])

  function updateForm(field, value) {
    setForm((prev) => {
      const next = { ...prev, [field]: value }
      if (field === 'hubungan_keluarga' && value === 'KEPALA_KELUARGA') {
        next.id_family = ''
      }
      return next
    })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const approved = await confirm({
      title: mode === 'edit' ? 'Konfirmasi Perubahan' : 'Konfirmasi Simpan',
      message:
        mode === 'edit'
          ? `Simpan perubahan data warga atas nama "${form.nama_lengkap || 'warga ini'}"?`
          : `Yakin ingin menyimpan data warga baru atas nama "${form.nama_lengkap}"?`,
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
      showToast(mode === 'edit' ? 'Perubahan data warga berhasil disimpan.' : 'Data warga baru berhasil ditambahkan.')
    } catch (error) {
      showToast(error.message || 'Gagal menyimpan data warga.', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{mode === 'edit' ? 'Edit Data Warga' : 'Tambah Warga Baru'}</DialogTitle>
          <DialogDescription>
            {mode === 'edit'
              ? `Memperbarui data warga: ${initialData?.nama_lengkap || ''}`
              : 'Isi formulir di bawah untuk menambahkan warga baru.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pr-2" id="warga-form">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="nik" className="text-sm font-bold text-black">NIK <span className="text-red-500">*</span></Label>
              <Input
                id="nik"
                value={form.nik}
                onChange={(e) => updateForm('nik', e.target.value)}
                required
                maxLength={32}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nama_lengkap" className="text-sm font-bold text-black">Nama Lengkap <span className="text-red-500">*</span></Label>
              <Input
                id="nama_lengkap"
                value={form.nama_lengkap}
                onChange={(e) => updateForm('nama_lengkap', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="pt-4 border-t border-neutral-200">
            <h4 className="text-xs font-extrabold uppercase tracking-[0.12em] text-neutral-500">Tempat & Tanggal Lahir</h4>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="tempat_lahir" className="text-sm font-bold text-black">Tempat Lahir</Label>
                <Input
                  id="tempat_lahir"
                  value={form.tempat_lahir}
                  onChange={(e) => updateForm('tempat_lahir', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tanggal_lahir" className="text-sm font-bold text-black">Tanggal Lahir <span className="text-red-500">*</span></Label>
                <Input
                  id="tanggal_lahir"
                  type="date"
                  value={form.tanggal_lahir}
                  onChange={(e) => updateForm('tanggal_lahir', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="jenis_kelamin" className="text-sm font-bold text-black">Jenis Kelamin <span className="text-red-500">*</span></Label>
                <Select value={form.jenis_kelamin} onValueChange={(value) => updateForm('jenis_kelamin', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="L">Laki-laki</SelectItem>
                    <SelectItem value="P">Perempuan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-neutral-200">
            <h4 className="text-xs font-extrabold uppercase tracking-[0.12em] text-neutral-500">Agama & Status Keluarga</h4>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="id_agama" className="text-sm font-bold text-black">Agama</Label>
                <Select value={form.id_agama} onValueChange={(value) => updateForm('id_agama', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="-- Pilih --" />
                  </SelectTrigger>
                  <SelectContent>
                    {masterData.agama?.map((o) => (
                      <SelectItem key={o.id_master} value={o.id_master}>{o.nama_master}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status_nikah" className="text-sm font-bold text-black">Status Nikah</Label>
                <Select value={form.status_nikah} onValueChange={(value) => updateForm('status_nikah', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BELUM_KAWIN">Belum Kawin</SelectItem>
                    <SelectItem value="KAWIN">Kawin</SelectItem>
                    <SelectItem value="CERAI_HIDUP">Cerai Hidup</SelectItem>
                    <SelectItem value="CERAI_MATI">Cerai Mati</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="id_pendidikan" className="text-sm font-bold text-black">Pendidikan</Label>
                <Select value={form.id_pendidikan} onValueChange={(value) => updateForm('id_pendidikan', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="-- Pilih --" />
                  </SelectTrigger>
                  <SelectContent>
                    {masterData.pendidikan?.map((o) => (
                      <SelectItem key={o.id_master} value={o.id_master}>{o.nama_master}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="id_profesi" className="text-sm font-bold text-black">Profesi</Label>
                <Select value={form.id_profesi} onValueChange={(value) => updateForm('id_profesi', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="-- Pilih --" />
                  </SelectTrigger>
                  <SelectContent>
                    {masterData.profesi?.map((o) => (
                      <SelectItem key={o.id_master} value={o.id_master}>{o.nama_master}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-neutral-200">
            <h4 className="text-xs font-extrabold uppercase tracking-[0.12em] text-neutral-500">Kontak</h4>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="no_hp" className="text-sm font-bold text-black">No. HP</Label>
                <Input
                  id="no_hp"
                  value={form.no_hp}
                  onChange={(e) => updateForm('no_hp', e.target.value)}
                  placeholder="08xxxxxxxxxx"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-bold text-black">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => updateForm('email', e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-neutral-200">
            <h4 className="text-xs font-extrabold uppercase tracking-[0.12em] text-neutral-500">Kewarganegaraan & Status</h4>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="status_warga" className="text-sm font-bold text-black">Status Warga</Label>
                <Select value={form.status_warga} onValueChange={(value) => updateForm('status_warga', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TETAP">Tetap</SelectItem>
                    <SelectItem value="TIDAK_TETAP">Tidak Tetap</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="kewarganegaraan" className="text-sm font-bold text-black">Kewarganegaraan</Label>
                <Select value={form.kewarganegaraan} onValueChange={(value) => updateForm('kewarganegaraan', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="WNI">WNI</SelectItem>
                    <SelectItem value="WNA">WNA</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status_ekonomi" className="text-sm font-bold text-black">Status Ekonomi</Label>
                <Select value={form.status_ekonomi} onValueChange={(value) => updateForm('status_ekonomi', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MAMPU">Mampu</SelectItem>
                    <SelectItem value="KURANG_MAMPU">Kurang Mampu</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-bold text-black flex items-center gap-2">
                  <Checkbox
                    checked={form.penerima_bansos}
                    onCheckedChange={(checked) => updateForm('penerima_bansos', checked)}
                  />
                  Penerima Bansos
                </Label>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-neutral-200">
            <h4 className="text-xs font-extrabold uppercase tracking-[0.12em] text-neutral-500">Alamat & Domisili</h4>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="tanggal_masuk_rt" className="text-sm font-bold text-black">Tanggal Masuk RT</Label>
                <Input
                  id="tanggal_masuk_rt"
                  type="date"
                  value={form.tanggal_masuk_rt}
                  onChange={(e) => updateForm('tanggal_masuk_rt', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-bold text-black flex items-center gap-2">
                  <Checkbox
                    checked={form.alamat_kk_luar_rt}
                    onCheckedChange={(checked) => updateForm('alamat_kk_luar_rt', checked)}
                  />
                  Alamat KK Luar RT
                </Label>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-bold text-black flex items-center gap-2">
                  <Checkbox
                    checked={form.berdomisili_luar_rt}
                    onCheckedChange={(checked) => updateForm('berdomisili_luar_rt', checked)}
                  />
                  Berdomisili Luar RT
                </Label>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-neutral-200">
            <h4 className="text-xs font-extrabold uppercase tracking-[0.12em] text-neutral-500">Kartu Keluarga</h4>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="id_family" className="text-sm font-bold text-black">
                  KK <span className="text-red-500">{form.hubungan_keluarga !== 'KEPALA_KELUARGA' ? '*' : ''}</span>
                </Label>
                <Select
                  value={form.id_family}
                  onValueChange={(value) => updateForm('id_family', value)}
                  disabled={form.hubungan_keluarga === 'KEPALA_KELUARGA'}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="-- Pilih KK --" />
                  </SelectTrigger>
                  <SelectContent>
                    {families?.filter(f => f.status === 'ACTIVE').map((f) => (
                      <SelectItem key={f.id_family} value={f.id_family}>
                        {f.no_kk} - {f.kepala_keluarga?.nama_lengkap || ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="hubungan_keluarga" className="text-sm font-bold text-black">Hubungan Keluarga <span className="text-red-500">*</span></Label>
                <Select value={form.hubungan_keluarga} onValueChange={(value) => updateForm('hubungan_keluarga', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="KEPALA_KELUARGA">Kepala Keluarga</SelectItem>
                    <SelectItem value="ISTRI">Istri</SelectItem>
                    <SelectItem value="ANAK">Anak</SelectItem>
                    <SelectItem value="LAINNYA">Lainnya</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {form.hubungan_keluarga === 'KEPALA_KELUARGA' && (
                <p className="sm:col-span-2 -mt-2 text-xs font-normal text-neutral-500">
                  Sebagai calon Kepala Keluarga, KK belum perlu dipilih di sini. Simpan data warga ini dulu, lalu buat KK baru lewat menu "Kartu Keluarga (KK)" dan pilih nama ini sebagai Kepala Keluarga.
                </p>
              )}
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