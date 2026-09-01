import { useState, useCallback, useEffect } from 'react'
import { PageShell } from '@/components/layout/PageShell'
import { createStrukturPengurus, getCitizens, getOrganizationMembers, getWilayah } from '@/services/api'
import { useToast } from '@/components/ui/ToastContext'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { Label } from '@/components/ui/Label'
import { Input } from '@/components/ui/Input'
import { Icon } from '@/components/ui/Icon'

export default function DataKepalaDukuhPage() {
  const { showToast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [dataList, setDataList] = useState([])
  
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({
    nama: '',
    email: '',
    password: '',
    nik: '',
    no_hp: '',
    jenis_kelamin: 'L',
    id_wilayah: '',
  })

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [resCit, resOrg, resWil] = await Promise.all([
        getCitizens({ per_page: 200 }).catch(() => null),
        getOrganizationMembers({ per_page: 100 }).catch(() => null),
        getWilayah({ per_page: 100, all: 1 }),
      ])
      const arrCit = Array.isArray(resCit?.data) ? resCit.data : Array.isArray(resCit) ? resCit : []
      const arrOrg = Array.isArray(resOrg?.data) ? resOrg.data : Array.isArray(resOrg) ? resOrg : []
      const arrWil = Array.isArray(resWil?.data) ? resWil.data : Array.isArray(resWil) ? resWil : []

      const kelurahanId = arrWil.find(w => w.tipe === 'KELURAHAN')?.id_wilayah;
      if (kelurahanId) setForm(f => ({ ...f, id_wilayah: kelurahanId }));

      const appointed = new Set(arrOrg.filter((m) => m.status_aktif).map((m) => m.id_citizen))

      const calons = arrCit
        .filter((c) => {
          const wId = c.wilayah?.id_wilayah || c.id_wilayah;
          return wId === kelurahanId && !appointed.has(c.id_citizen);
        })
        .map((c) => {
          return { ...c, _dukuh: 'Belum Ditugaskan' };
        })
      setDataList(calons)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.nama || !form.email || !form.password || !form.nik || !form.no_hp || !form.id_wilayah) {
      showToast('Lengkapi semua field (Nama, Email, Password, NIK, No. HP).', 'error')
      return
    }
    setIsSubmitting(true)
    try {
      await createStrukturPengurus(form)
      showToast('Data Kepala Dukuh berhasil dibuat. Silakan angkat di menu Struktur Organisasi.')
      setForm((f) => ({ ...f, nama: '', email: '', password: '', nik: '', no_hp: '', jenis_kelamin: 'L' }))
      loadData()
    } catch (err) {
      showToast(err.message || 'Gagal membuat data Kepala Dukuh.', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <PageShell
      eyebrow="Kependudukan"
      title="Data Kepala Dukuh"
      description="Buat data kepengurusan Kepala Dukuh sebagai akun (login). Angkat jabatan ini ke wilayah spesifik melalui menu Struktur Organisasi."
    >
      <section className="mx-auto mt-6 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-neutral-300 bg-white p-6 shadow-sm">
          <div className="space-y-2">
            <Label className="text-sm font-bold text-black">Nama Lengkap <span className="text-red-500">*</span></Label>
            <Input value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} placeholder="Nama Kepala Dukuh" required />
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
              <Label className="text-sm font-bold text-black">No. HP <span className="text-red-500">*</span></Label>
              <Input value={form.no_hp} onChange={(e) => setForm({ ...form, no_hp: e.target.value })} placeholder="08xxxxxxxxxx" maxLength={20} required />
            </div>
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
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-black px-6 py-2.5 text-sm font-bold text-white transition hover:bg-neutral-800 disabled:opacity-50"
          >
            <Icon name="userPlus" className="h-4 w-4" />
            Simpan Data Kepala Dukuh
          </button>
        </form>

        <div className="mt-8">
          <h2 className="text-lg font-bold text-black">Data Kepala Dukuh Terinput</h2>
          <div className="mt-3 overflow-hidden overflow-x-auto rounded-xl border border-neutral-300 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="bg-neutral-50 border-b">
                <tr className="text-xs uppercase text-neutral-500">
                  <th className="px-5 py-3 font-semibold">Nama</th>
                  <th className="px-5 py-3 font-semibold">Email</th>
                  <th className="px-5 py-3 font-semibold">Status Wilayah</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {loading ? (
                  <tr><td colSpan="3" className="p-5 text-center text-neutral-500">Memuat data...</td></tr>
                ) : dataList.length === 0 ? (
                  <tr><td colSpan="3" className="p-5 text-center text-neutral-500">Belum ada data Kepala Dukuh terinput.</td></tr>
                ) : dataList.map((c) => (
                  <tr key={c.id_citizen} className="hover:bg-neutral-50">
                    <td className="px-5 py-3 font-bold text-black">{c.nama_lengkap}</td>
                    <td className="px-5 py-3">{c.email || '-'}</td>
                    <td className="px-5 py-3"><span className="inline-block rounded-full bg-yellow-100 text-yellow-800 px-2 py-0.5 text-xs font-semibold">{c._dukuh}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </PageShell>
  )
}
