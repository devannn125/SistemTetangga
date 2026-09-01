import { useState, useCallback, useEffect } from 'react'
import { PageShell } from '@/components/layout/PageShell'
import { createStrukturPengurus, getWilayah, getCitizenMe } from '@/services/api'
import { useToast } from '@/components/ui/ToastContext'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { Label } from '@/components/ui/Label'
import { Input } from '@/components/ui/Input'
import { Icon } from '@/components/ui/Icon'

const JABATAN = { rw: 'Ketua RW', rt: 'Ketua RT' }

export default function DataPengurusPage() {
  const { showToast } = useToast()
  const [jabatan, setJabatan] = useState('rw')
  const [nodes, setNodes] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [form, setForm] = useState({
    nama: '',
    email: '',
    password: '',
    nik: '',
    jenis_kelamin: 'L',
    id_wilayah: '',
  })

  const load = useCallback(async () => {
    try {
      const [resMe, resWil] = await Promise.all([
        getCitizenMe().catch(() => null),
        getWilayah({ per_page: 100, all: 1 }).catch(() => null),
      ])
      const myDukuh = resMe?.data?.wilayah?.tipe === 'DUKUH' ? resMe.data.wilayah.id_wilayah : null
      const arr = Array.isArray(resWil?.data) ? resWil.data : Array.isArray(resWil) ? resWil : []
      const nodesFor = (t) => arr
        .filter((w) => w.tipe === t && (!myDukuh || w.parent_id === myDukuh || (w.tipe === 'RT' && arr.find((rw) => rw.id_wilayah === w.parent_id)?.parent_id === myDukuh)))
        .sort((a, b) => a.nama_wilayah.localeCompare(b.nama_wilayah))
      setNodes({ rw: nodesFor('RW'), rt: nodesFor('RT') })
    } catch (err) {
      console.error(err)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const switchJabatan = (j) => {
    setJabatan(j)
    setForm((f) => ({ ...f, id_wilayah: '' }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const nodesList = (nodes && nodes[jabatan]) || []
    if (!form.nama || !form.email || !form.password || !form.nik || !form.id_wilayah) {
      showToast('Lengkapi semua field (Nama, Email, Password, NIK, Wilayah).', 'error')
      return
    }
    setIsSubmitting(true)
    try {
      await createStrukturPengurus(form)
      showToast(`Data ${JABATAN[jabatan]} berhasil dibuat. Silakan angkat di menu Struktur Organisasi.`)
      setForm({ nama: '', email: '', password: '', nik: '', jenis_kelamin: 'L', id_wilayah: '' })
    } catch (err) {
      showToast(err.message || `Gagal membuat data ${JABATAN[jabatan]}.`, 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const nodesList = (nodes && nodes[jabatan]) || []

  return (
    <PageShell
      eyebrow="Kependudukan"
      title="Data Ketua RW / Ketua RT"
      description="Buat data kepengurusan Ketua RW / Ketua RT sebagai akun (login). Setelah dibuat, angkat di menu Struktur Organisasi."
    >
      <section className="mt-6 mx-auto max-w-2xl">
        <div className="flex justify-center gap-2">
          <button
            onClick={() => switchJabatan('rw')}
            className={`rounded-full px-5 py-2 text-xs font-extrabold transition ${jabatan === 'rw' ? 'bg-black text-white' : 'border border-neutral-300 bg-white text-neutral-700 hover:border-black'}`}
            type="button"
          >
            Ketua RW
          </button>
          <button
            onClick={() => switchJabatan('rt')}
            className={`rounded-full px-5 py-2 text-xs font-extrabold transition ${jabatan === 'rt' ? 'bg-black text-white' : 'border border-neutral-300 bg-white text-neutral-700 hover:border-black'}`}
            type="button"
          >
            Ketua RT
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 rounded-xl border border-neutral-300 bg-white p-6 shadow-sm">
          <div className="space-y-2">
            <Label className="text-sm font-bold text-black">Nama Lengkap <span className="text-red-500">*</span></Label>
            <Input value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} placeholder={`Nama ${JABATAN[jabatan]}`} required />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-sm font-bold text-black">Email (Login) <span className="text-red-500">*</span></Label>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email@contoh.com" required />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-bold text-black">Password (Login) <span className="text-red-500">*</span></Label>
              <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Min. 6 karakter" required />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-sm font-bold text-black">NIK (16 digit) <span className="text-red-500">*</span></Label>
              <Input value={form.nik} onChange={(e) => setForm({ ...form, nik: e.target.value })} placeholder="16 digit NIK" maxLength={16} required />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-bold text-black">Jenis Kelamin <span className="text-red-500">*</span></Label>
              <Select value={form.jenis_kelamin} onValueChange={(v) => setForm({ ...form, jenis_kelamin: v })}>
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
          <div className="space-y-2">
            <Label className="text-sm font-bold text-black">Wilayah Penugasan ({JABATAN[jabatan]}) <span className="text-red-500">*</span></Label>
            <Select value={form.id_wilayah} onValueChange={(v) => setForm({ ...form, id_wilayah: v })}>
              <SelectTrigger>
                <SelectValue placeholder={`-- Pilih ${JABATAN[jabatan]} --`} />
              </SelectTrigger>
              <SelectContent>
                {nodesList.length === 0 ? (
                  <SelectItem value="__none__" disabled>Belum ada wilayah</SelectItem>
                ) : nodesList.map((n) => (
                  <SelectItem key={n.id_wilayah} value={n.id_wilayah}>
                    {n.nama_wilayah}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-black px-6 py-2.5 text-sm font-bold text-white transition hover:bg-neutral-800 disabled:opacity-50"
          >
            <Icon name="userPlus" className="h-4 w-4" />
            Simpan Data {JABATAN[jabatan]}
          </button>
        </form>
      </section>
    </PageShell>
  )
}
