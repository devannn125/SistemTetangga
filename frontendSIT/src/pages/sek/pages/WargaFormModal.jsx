import { useEffect, useState } from 'react'
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog'
import { formatDate } from './utils'

export default function WargaFormModal({
  open,
  onClose,
  onSubmit,
  initialData,
  families,
  masterData,
  loading,
  mode = 'create',
}) {
  const [form, setForm] = useState({
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
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (open) {
      if (initialData && mode === 'edit') {
        setForm({
          nik: initialData.nik || '',
          nama_lengkap: initialData.nama_lengkap || '',
          tempat_lahir: initialData.tempat_lahir || '',
          tanggal_lahir: initialData.tanggal_lahir || '',
          jenis_kelamin: initialData.jenis_kelamin || 'L',
          id_agama: initialData.id_agama || '',
          status_nikah: initialData.status_nikah || 'BELUM_KAWIN',
          id_pendidikan: initialData.id_pendidikan || '',
          id_profesi: initialData.id_profesi || '',
          no_hp: initialData.no_hp || '',
          email: initialData.email || '',
          status_warga: initialData.status_warga || 'TETAP',
          kewarganegaraan: initialData.kewarganegaraan || 'WNI',
          status_ekonomi: initialData.status_ekonomi || 'MAMPU',
          penerima_bansos: initialData.penerima_bansos || false,
          tanggal_masuk_rt: initialData.tanggal_masuk_rt ? formatDate(initialData.tanggal_masuk_rt).split(' ')[0] : new Date().toISOString().split('T')[0],
          alamat_kk_luar_rt: initialData.alamat_kk_luar_rt || false,
          berdomisili_luar_rt: initialData.berdomisili_luar_rt || false,
          id_family: initialData.id_family || '',
          hubungan_keluarga: initialData.hubungan_keluarga || 'LAINNYA',
        })
      } else {
        setForm({
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
          id_family: families?.[0]?.id_family || '',
          hubungan_keluarga: 'LAINNYA',
        })
      }
    } else {
      setForm({
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
      })
    }
  }, [open, initialData, mode, families])

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
      title={mode === 'edit' ? 'Edit Data Warga' : 'Tambah Warga Baru'}
      message={null}
      confirmLabel={isSubmitting ? 'Menyimpan...' : 'Simpan'}
      onConfirm={() => document.getElementById('warga-form')?.requestSubmit()}
      onCancel={onClose}
    >
      <form id="warga-form" onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-bold text-black">
            NIK <span className="text-red-500">*</span>
            <input value={form.nik} onChange={(e) => updateForm('nik', e.target.value)} className="h-11 w-full rounded-xl border border-neutral-300 px-4 text-sm outline-none focus:border-sky-600" required maxLength={32} />
          </label>
          <label className="grid gap-2 text-sm font-bold text-black">
            Nama Lengkap <span className="text-red-500">*</span>
            <input value={form.nama_lengkap} onChange={(e) => updateForm('nama_lengkap', e.target.value)} className="h-11 w-full rounded-xl border border-neutral-300 px-4 text-sm outline-none focus:border-sky-600" required />
          </label>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="grid gap-2 text-sm font-bold text-black">
            Tempat Lahir
            <input value={form.tempat_lahir} onChange={(e) => updateForm('tempat_lahir', e.target.value)} className="h-11 w-full rounded-xl border border-neutral-300 px-4 text-sm outline-none focus:border-sky-600" />
          </label>
          <label className="grid gap-2 text-sm font-bold text-black">
            Tanggal Lahir
            <input type="date" value={form.tanggal_lahir} onChange={(e) => updateForm('tanggal_lahir', e.target.value)} className="h-11 w-full rounded-xl border border-neutral-300 px-4 text-sm outline-none focus:border-sky-600" />
          </label>
          <label className="grid gap-2 text-sm font-bold text-black">
            Jenis Kelamin
            <select value={form.jenis_kelamin} onChange={(e) => updateForm('jenis_kelamin', e.target.value)} className="h-11 w-full rounded-xl border border-neutral-300 px-4 text-sm outline-none focus:border-sky-600">
              <option value="L">Laki-laki</option>
              <option value="P">Perempuan</option>
            </select>
          </label>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="grid gap-2 text-sm font-bold text-black">
            Agama
            <select value={form.id_agama} onChange={(e) => updateForm('id_agama', e.target.value)} className="h-11 w-full rounded-xl border border-neutral-300 px-4 text-sm outline-none focus:border-sky-600">
              <option value="">-- Pilih --</option>
              {masterData.agama?.map((a) => <option key={a.id_master} value={a.id_master}>{a.nama_master}</option>)}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-bold text-black">
            Status Nikah
            <select value={form.status_nikah} onChange={(e) => updateForm('status_nikah', e.target.value)} className="h-11 w-full rounded-xl border border-neutral-300 px-4 text-sm outline-none focus:border-sky-600">
              <option value="BELUM_KAWIN">Belum Kawin</option>
              <option value="KAWIN">Kawin</option>
              <option value="CERAI_HIDUP">Cerai Hidup</option>
              <option value="CERAI_MATI">Cerai Mati</option>
            </select>
          </label>
          <label className="grid gap-2 text-sm font-bold text-black">
            Pendidikan
            <select value={form.id_pendidikan} onChange={(e) => updateForm('id_pendidikan', e.target.value)} className="h-11 w-full rounded-xl border border-neutral-300 px-4 text-sm outline-none focus:border-sky-600">
              <option value="">-- Pilih --</option>
              {masterData.pendidikan?.map((p) => <option key={p.id_master} value={p.id_master}>{p.nama_master}</option>)}
            </select>
          </label>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="grid gap-2 text-sm font-bold text-black">
            Profesi
            <select value={form.id_profesi} onChange={(e) => updateForm('id_profesi', e.target.value)} className="h-11 w-full rounded-xl border border-neutral-300 px-4 text-sm outline-none focus:border-sky-600">
              <option value="">-- Pilih --</option>
              {masterData.profesi?.map((p) => <option key={p.id_master} value={p.id_master}>{p.nama_master}</option>)}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-bold text-black">
            No. HP
            <input value={form.no_hp} onChange={(e) => updateForm('no_hp', e.target.value)} className="h-11 w-full rounded-xl border border-neutral-300 px-4 text-sm outline-none focus:border-sky-600" placeholder="08xxxxxxxxxx" />
          </label>
          <label className="grid gap-2 text-sm font-bold text-black">
            Email
            <input type="email" value={form.email} onChange={(e) => updateForm('email', e.target.value)} className="h-11 w-full rounded-xl border border-neutral-300 px-4 text-sm outline-none focus:border-sky-600" />
          </label>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="grid gap-2 text-sm font-bold text-black">
            Status Warga
            <select value={form.status_warga} onChange={(e) => updateForm('status_warga', e.target.value)} className="h-11 w-full rounded-xl border border-neutral-300 px-4 text-sm outline-none focus:border-sky-600">
              <option value="TETAP">Tetap</option>
              <option value="TIDAK_TETAP">Tidak Tetap</option>
            </select>
          </label>
          <label className="grid gap-2 text-sm font-bold text-black">
            Kewarganegaraan
            <select value={form.kewarganegaraan} onChange={(e) => updateForm('kewarganegaraan', e.target.value)} className="h-11 w-full rounded-xl border border-neutral-300 px-4 text-sm outline-none focus:border-sky-600">
              <option value="WNI">WNI</option>
              <option value="WNA">WNA</option>
            </select>
          </label>
          <label className="grid gap-2 text-sm font-bold text-black">
            Status Ekonomi
            <select value={form.status_ekonomi} onChange={(e) => updateForm('status_ekonomi', e.target.value)} className="h-11 w-full rounded-xl border border-neutral-300 px-4 text-sm outline-none focus:border-sky-600">
              <option value="MAMPU">Mampu</option>
              <option value="KURANG_MAMPU">Kurang Mampu</option>
            </select>
          </label>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="grid gap-2 text-sm font-bold text-black">
            Penerima Bansos
            <select value={String(form.penerima_bansos)} onChange={(e) => updateForm('penerima_bansos', e.target.value === 'true')} className="h-11 w-full rounded-xl border border-neutral-300 px-4 text-sm outline-none focus:border-sky-600">
              <option value="false">Tidak</option>
              <option value="true">Ya</option>
            </select>
          </label>
          <label className="grid gap-2 text-sm font-bold text-black">
            Tanggal Masuk RT
            <input type="date" value={form.tanggal_masuk_rt} onChange={(e) => updateForm('tanggal_masuk_rt', e.target.value)} className="h-11 w-full rounded-xl border border-neutral-300 px-4 text-sm outline-none focus:border-sky-600" />
          </label>
          <label className="grid gap-2 text-sm font-bold text-black">
            Alamat KK Luar RT
            <select value={String(form.alamat_kk_luar_rt)} onChange={(e) => updateForm('alamat_kk_luar_rt', e.target.value === 'true')} className="h-11 w-full rounded-xl border border-neutral-300 px-4 text-sm outline-none focus:border-sky-600">
              <option value="false">Tidak</option>
              <option value="true">Ya</option>
            </select>
          </label>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-bold text-black">
            KK
            <select value={form.id_family} onChange={(e) => updateForm('id_family', e.target.value)} className="h-11 w-full rounded-xl border border-neutral-300 px-4 text-sm outline-none focus:border-sky-600">
              <option value="">-- Pilih KK --</option>
              {families?.filter(f => f.status === 'ACTIVE').map((f) => <option key={f.id_family} value={f.id_family}>{f.no_kk} - {f.kepala_keluarga?.nama_lengkap || ''}</option>)}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-bold text-black">
            Hubungan Keluarga
            <select value={form.hubungan_keluarga} onChange={(e) => updateForm('hubungan_keluarga', e.target.value)} className="h-11 w-full rounded-xl border border-neutral-300 px-4 text-sm outline-none focus:border-sky-600">
              <option value="KEPALA_KELUARGA">Kepala Keluarga</option>
              <option value="ISTRI">Istri</option>
              <option value="ANAK">Anak</option>
              <option value="LAINNYA">Lainnya</option>
            </select>
          </label>
        </div>
        <label className="grid gap-2 text-sm font-bold text-black">
          Berdomisili Luar RT
          <select value={String(form.berdomisili_luar_rt)} onChange={(e) => updateForm('berdomisili_luar_rt', e.target.value === 'true')} className="h-11 w-full rounded-xl border border-neutral-300 px-4 text-sm outline-none focus:border-sky-600">
            <option value="false">Tidak</option>
            <option value="true">Ya</option>
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