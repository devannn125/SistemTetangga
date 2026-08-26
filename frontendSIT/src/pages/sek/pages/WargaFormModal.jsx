import { useEffect, useState } from 'react'
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog'
import { useConfirm } from '../../../components/ui/ConfirmContext'
import { useToast } from '../../../components/ui/ToastContext'

const Select = ({ value, onChange, options, placeholder, className = '', disabled = false }) => (
  <select value={value} onChange={onChange} disabled={disabled} className={`h-11 w-full rounded-xl border border-neutral-300 px-4 text-sm outline-none focus:border-sky-600 disabled:bg-neutral-100 disabled:text-neutral-400 disabled:cursor-not-allowed ${className}`}>
    {placeholder && <option value="">{placeholder}</option>}
    {options?.map((o) => <option key={o.id_master} value={o.id_master}>{o.nama_master}</option>)}
  </select>
)

const Input = ({ value, onChange, type = 'text', placeholder, required, maxLength, className = '' }) => (
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

const CheckboxSelect = ({ value, onChange, label }) => (
  <label className="grid gap-2 text-sm font-bold text-black">
    {label}
    <select value={String(value)} onChange={(e) => onChange(e.target.value === 'true')} className="h-11 w-full rounded-xl border border-neutral-300 px-4 text-sm outline-none focus:border-sky-600">
      <option value="false">Tidak</option>
      <option value="true">Ya</option>
    </select>
  </label>
)

const Section = ({ title, children }) => (
  <div className="space-y-4 pt-4 border-t border-neutral-200">
    <h4 className="text-xs font-extrabold uppercase tracking-[0.12em] text-neutral-500">{title}</h4>
    <div className="grid gap-4 sm:grid-cols-2">{children}</div>
  </div>
)

const Field = ({ label, required, children, className = '' }) => (
  <label className={`grid gap-2 text-sm font-bold text-black ${className}`}>
    <div className="flex items-start justify-between">
      <span>{label}</span>
      {required && <span className="text-red-500 text-xs leading-none mt-0.5">*</span>}
    </div>
    {children}
  </label>
)

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
          // API mengirim tanggal sebagai 'Y-m-d' — pakai apa adanya agar
          // <input type="date"> terisi benar saat edit.
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
    <ConfirmDialog
      open={open}
      title={mode === 'edit' ? 'Edit Data Warga' : 'Tambah Warga Baru'}
      message={null}
      confirmLabel={isSubmitting ? 'Menyimpan...' : 'Simpan'}
      onConfirm={() => document.getElementById('warga-form')?.requestSubmit()}
      onCancel={onClose}
    >
      <form id="warga-form" onSubmit={handleSubmit} className="space-y-4 pr-2">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="NIK" required>
            <Input value={form.nik} onChange={(e) => updateForm('nik', e.target.value)} required maxLength={32} />
          </Field>
          <Field label="Nama Lengkap" required>
            <Input value={form.nama_lengkap} onChange={(e) => updateForm('nama_lengkap', e.target.value)} required />
          </Field>
        </div>

        <Section title="Tempat & Tanggal Lahir">
          <Field label="Tempat Lahir">
            <Input value={form.tempat_lahir} onChange={(e) => updateForm('tempat_lahir', e.target.value)} />
          </Field>
          <Field label="Tanggal Lahir" required>
            <Input type="date" value={form.tanggal_lahir} onChange={(e) => updateForm('tanggal_lahir', e.target.value)} required />
          </Field>
          <Field label="Jenis Kelamin" required>
            <Select value={form.jenis_kelamin} onChange={(e) => updateForm('jenis_kelamin', e.target.value)} options={[
              { id_master: 'L', nama_master: 'Laki-laki' },
              { id_master: 'P', nama_master: 'Perempuan' },
            ]} />
          </Field>
        </Section>

        <Section title="Agama & Status Keluarga">
          <Field label="Agama">
            <Select value={form.id_agama} onChange={(e) => updateForm('id_agama', e.target.value)} options={masterData.agama} placeholder="-- Pilih --" />
          </Field>
          <Field label="Status Nikah">
            <Select value={form.status_nikah} onChange={(e) => updateForm('status_nikah', e.target.value)} options={[
              { id_master: 'BELUM_KAWIN', nama_master: 'Belum Kawin' },
              { id_master: 'KAWIN', nama_master: 'Kawin' },
              { id_master: 'CERAI_HIDUP', nama_master: 'Cerai Hidup' },
              { id_master: 'CERAI_MATI', nama_master: 'Cerai Mati' },
            ]} />
          </Field>
          <Field label="Pendidikan">
            <Select value={form.id_pendidikan} onChange={(e) => updateForm('id_pendidikan', e.target.value)} options={masterData.pendidikan} placeholder="-- Pilih --" />
          </Field>
          <Field label="Profesi">
            <Select value={form.id_profesi} onChange={(e) => updateForm('id_profesi', e.target.value)} options={masterData.profesi} placeholder="-- Pilih --" />
          </Field>
        </Section>

        <Section title="Kontak">
          <Field label="No. HP">
            <Input value={form.no_hp} onChange={(e) => updateForm('no_hp', e.target.value)} placeholder="08xxxxxxxxxx" />
          </Field>
          <Field label="Email">
            <Input type="email" value={form.email} onChange={(e) => updateForm('email', e.target.value)} />
          </Field>
        </Section>

        <Section title="Kewarganegaraan & Status">
          <Field label="Status Warga">
            <Select value={form.status_warga} onChange={(e) => updateForm('status_warga', e.target.value)} options={[
              { id_master: 'TETAP', nama_master: 'Tetap' },
              { id_master: 'TIDAK_TETAP', nama_master: 'Tidak Tetap' },
            ]} />
          </Field>
          <Field label="Kewarganegaraan">
            <Select value={form.kewarganegaraan} onChange={(e) => updateForm('kewarganegaraan', e.target.value)} options={[
              { id_master: 'WNI', nama_master: 'WNI' },
              { id_master: 'WNA', nama_master: 'WNA' },
            ]} />
          </Field>
          <Field label="Status Ekonomi">
            <Select value={form.status_ekonomi} onChange={(e) => updateForm('status_ekonomi', e.target.value)} options={[
              { id_master: 'MAMPU', nama_master: 'Mampu' },
              { id_master: 'KURANG_MAMPU', nama_master: 'Kurang Mampu' },
            ]} />
          </Field>
          <CheckboxSelect
            value={form.penerima_bansos}
            onChange={(v) => updateForm('penerima_bansos', v)}
            label="Penerima Bansos"
          />
        </Section>

        <Section title="Alamat & Domisili">
          <Field label="Tanggal Masuk RT">
            <Input type="date" value={form.tanggal_masuk_rt} onChange={(e) => updateForm('tanggal_masuk_rt', e.target.value)} />
          </Field>
          <CheckboxSelect
            value={form.alamat_kk_luar_rt}
            onChange={(v) => updateForm('alamat_kk_luar_rt', v)}
            label="Alamat KK Luar RT"
          />
          <CheckboxSelect
            value={form.berdomisili_luar_rt}
            onChange={(v) => updateForm('berdomisili_luar_rt', v)}
            label="Berdomisili Luar RT"
          />
        </Section>

        <Section title="Kartu Keluarga">
          <Field label="KK" required={form.hubungan_keluarga !== 'KEPALA_KELUARGA'}>
            <Select
              value={form.id_family}
              onChange={(e) => updateForm('id_family', e.target.value)}
              options={families?.filter(f => f.status === 'ACTIVE').map((f) => ({
                id_master: f.id_family,
                nama_master: `${f.no_kk} - ${f.kepala_keluarga?.nama_lengkap || ''}`,
              }))}
              placeholder="-- Pilih KK --"
              disabled={form.hubungan_keluarga === 'KEPALA_KELUARGA'}
            />
          </Field>
          <Field label="Hubungan Keluarga" required>
            <Select value={form.hubungan_keluarga} onChange={(e) => updateForm('hubungan_keluarga', e.target.value)} options={[
              { id_master: 'KEPALA_KELUARGA', nama_master: 'Kepala Keluarga' },
              { id_master: 'ISTRI', nama_master: 'Istri' },
              { id_master: 'ANAK', nama_master: 'Anak' },
              { id_master: 'LAINNYA', nama_master: 'Lainnya' },
            ]} />
          </Field>
          {form.hubungan_keluarga === 'KEPALA_KELUARGA' && (
            <p className="sm:col-span-2 -mt-2 text-xs font-normal text-neutral-500">
              Sebagai calon Kepala Keluarga, KK belum perlu dipilih di sini. Simpan data warga ini dulu, lalu buat KK baru lewat menu "Kartu Keluarga (KK)" dan pilih nama ini sebagai Kepala Keluarga.
            </p>
          )}
        </Section>
      </form>
    </ConfirmDialog>
  )
}