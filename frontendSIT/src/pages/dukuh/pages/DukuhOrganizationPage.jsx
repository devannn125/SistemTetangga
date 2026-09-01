import { useEffect, useState, useMemo } from 'react'
import { PageShell } from '@/components/layout/PageShell'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/Dialog'
import { Input } from '@/components/ui/Input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { Label } from '@/components/ui/Label'
import { Checkbox } from '@/components/ui/Checkbox'
import { getOrganizationMembers, createOrganizationMember, deleteOrganizationMember, getCitizens, getCitizenMe, getWilayah } from '@/services/api'
import { useConfirm } from '@/components/ui/ConfirmContext'
import { useToast } from '@/components/ui/ToastContext'

const ALLOWED_POSITIONS = [
  'Ketua RW',
  'Ketua RT',
]

export default function DukuhOrganizationPage() {
  const [members, setMembers] = useState([])
  const [citizens, setCitizens] = useState([])
  const [wilayahs, setWilayahs] = useState([])
  const [myWilayah, setMyWilayah] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const confirm = useConfirm()
  const { showToast } = useToast()

  const [form, setForm] = useState({
    id_citizen: '',
    jabatan: '',
    id_wilayah: '',
    periode_mulai: new Date().toISOString().split('T')[0],
    isCustomPeriode: false,
  })

  const loadData = async () => {
    setLoading(true)
    try {
      const [resM, resUsers, resMe, resWilayah] = await Promise.all([
        getOrganizationMembers({ per_page: 100 }),
        getCitizens({ per_page: 100 }),
        getCitizenMe(),
        getWilayah({ per_page: 100 }),
      ])

      const arrM = Array.isArray(resM?.data) ? resM.data : Array.isArray(resM) ? resM : []
      setMyWilayah(resMe?.data?.wilayah || null)

      const arrW = Array.isArray(resWilayah?.data) ? resWilayah.data : Array.isArray(resWilayah) ? resWilayah : []
      setWilayahs(arrW.filter(w => w.tipe === 'RT' || w.tipe === 'RW'))

      const allCitizens = Array.isArray(resUsers?.data) ? resUsers.data : Array.isArray(resUsers) ? resUsers : []
      const arrCitizens = allCitizens.map((c) => ({
        id_citizen: c.id_citizen,
        nama_lengkap: c.nama_lengkap || 'Tanpa Nama',
      }))

      // Dukuh can see all (Dukuh, RW, RT)
      const rank = { KELURAHAN: 1, RW: 2, RT: 3 }
      arrM.sort((a, b) => {
        const rA = rank[a.wilayah?.tipe] || 99
        const rB = rank[b.wilayah?.tipe] || 99
        if (rA !== rB) return rA - rB
        const getJobRank = (job = '') => {
          const j = job.toLowerCase()
          if (j.includes('dukuh')) return 1
          if (j.includes('ketua rw')) return 2
          if (j.includes('ketua rt')) return 3
          if (j.includes('sekretaris')) return 4
          if (j.includes('bendahara')) return 5
          return 99
        }
        return getJobRank(a.jabatan) - getJobRank(b.jabatan)
      })

      setMembers(arrM)
      setCitizens(arrCitizens)
    } catch (error) {
      console.error(error)
      showToast('Gagal: ' + (error.response?.data?.message || error.message), 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const openModal = () => {
    setForm({
      id_citizen: '',
      jabatan: '',
      id_wilayah: '',
      periode_mulai: new Date().toISOString().split('T')[0],
      isCustomPeriode: false,
    })
    setIsModalOpen(true)
  }

  const isPositionOccupied = (jabatan, id_wilayah) => {
    return members.some((m) => m.status_aktif && m.jabatan === jabatan && m.id_wilayah === id_wilayah)
  }

  const handleSave = async () => {
    if (!form.id_citizen || !form.jabatan || !form.id_wilayah || !form.periode_mulai) {
      showToast('Harap lengkapi semua field yang diwajibkan (Warga, Jabatan, Wilayah, Periode Mulai).', 'error')
      return
    }

    if (isPositionOccupied(form.jabatan, form.id_wilayah)) {
      showToast('Jabatan ini sudah dipegang oleh pengurus aktif pada wilayah tersebut.', 'error')
      return
    }

    setIsSubmitting(true)
    try {
      const payload = {
        id_citizen: form.id_citizen,
        jabatan: form.jabatan,
        id_wilayah: form.id_wilayah,
        periode_mulai: form.periode_mulai,
      }
      await createOrganizationMember(payload)
      showToast('Pengurus baru berhasil ditambahkan!')
      setIsModalOpen(false)
      loadData()
    } catch (error) {
      showToast(error.message || 'Gagal menambahkan pengurus.', 'error')
    } finally {
      setIsSubmitting(true)
    }
  }

  const handleDelete = async (id, name, jabatan) => {
    const isOk = await confirm({
      title: 'Cabut Jabatan',
      message: "Anda yakin ingin mencabut jabatan " + jabatan + " dari " + name + "? Data ini akan diubah statusnya menjadi tidak aktif.",
      confirmLabel: 'Cabut Jabatan',
      cancelLabel: 'Batal',
    })
    if (!isOk) return

    try {
      await deleteOrganizationMember(id)
      showToast('Jabatan berhasil dicabut.')
      loadData()
    } catch (error) {
      showToast(error.message || 'Gagal mencabut jabatan.', 'error')
    }
  }

  const formatDate = (isoString) => {
    if (!isoString) return '-'
    const d = new Date(isoString)
    return isNaN(d.getTime()) ? '-' : d.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  return (
    <PageShell
      eyebrow="Struktur Organisasi"
      title="Kelola Struktur Organisasi Dukuh"
      description="Daftar pengurus (Ketua RT, Ketua RW) serta staf tingkat Dukuh."
    >
      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-black">Daftar Pengurus</h2>
          <button
            onClick={openModal}
            className="flex items-center gap-2 rounded-full bg-black px-5 py-2.5 text-sm font-extrabold uppercase tracking-wide text-white transition-all hover:bg-neutral-800 active:scale-95 disabled:opacity-50"
            disabled={loading}
          >
            <span>Tambah RT / RW</span>
          </button>
        </div>

        {loading ? (
          <div className="rounded-xl border border-neutral-300 bg-white p-8 text-center text-sm font-semibold text-neutral-600">
            Memuat data...
          </div>
        ) : members.length === 0 ? (
          <div className="rounded-xl border border-neutral-300 bg-white p-8 text-center text-sm font-semibold text-neutral-600">
            Belum ada data pengurus di Dukuh ini.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {members.map((m) => {
              const isCrudable = ['Ketua RT', 'Ketua RW'].includes(m.jabatan)
              return (
                <div key={m.id_organization_member} className={"flex flex-col items-center rounded-2xl border bg-white p-6 relative " + (m.status_aktif ? 'border-neutral-300' : 'border-red-200 bg-red-50/30 opacity-75')}>
                  {!m.status_aktif && (
                    <span className="absolute top-3 left-3 bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Nonaktif</span>
                  )}
                  {m.status_aktif && isCrudable && (
                    <button
                      onClick={() => handleDelete(m.id_organization_member, m.citizen?.nama_lengkap, m.jabatan)}
                      className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-neutral-500 transition hover:bg-red-100 hover:text-red-600 focus:outline-none"
                      title="Cabut Jabatan"
                    >
                      X
                    </button>
                  )}
                  <div className="mb-4 flex h-32 w-32 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50 text-4xl font-extrabold text-neutral-300 shadow-sm">
                    {m.foto_url ? (
                      <img
                        src={m.foto_url.startsWith('http') ? m.foto_url : 'http://127.0.0.1:8000/storage/' + m.foto_url}
                        alt="Foto Pengurus"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      m.citizen?.nama_lengkap?.[0] || '?'
                    )}
                  </div>
                  <div className="text-center w-full">
                    <h3 className="text-lg font-bold text-black truncate">{m.citizen?.nama_lengkap || 'Warga Terhapus'}</h3>
                    <p className="mt-1 text-xs font-extrabold uppercase tracking-wide text-sky-600">{m.jabatan}</p>
                    <p className="mt-1 text-xs text-neutral-500 font-medium">{m.wilayah?.nama_wilayah || '-'}</p>
                  </div>
                  <p className="mt-4 w-full border-t border-neutral-100 pt-3 text-[10px] text-neutral-400 text-center font-medium">
                    Masa Jabatan: {formatDate(m.periode_mulai)} - {m.periode_selesai ? formatDate(m.periode_selesai) : 'Sekarang'}
                  </p>
                </div>
              )
            })}
          </div>
        )}
      </section>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Angkat Pengurus Baru</DialogTitle>
            <DialogDescription>Tambahkan warga untuk menjabat sebagai Ketua RT atau Ketua RW.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="id_citizen" className="text-sm font-bold text-black">Warga <span className="text-red-500">*</span></Label>
              <Select value={form.id_citizen} onValueChange={(value) => setForm({ ...form, id_citizen: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="-- Pilih Warga --" />
                </SelectTrigger>
                <SelectContent>
                  {citizens.map((c) => {
                    const isActive = members.some((m) => m.status_aktif && m.id_citizen === c.id_citizen)
                    return (
                      <SelectItem key={c.id_citizen} value={c.id_citizen} disabled={isActive}>
                        {c.nama_lengkap} {isActive ? '(Sudah Menjabat)' : ''}
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="jabatan" className="text-sm font-bold text-black">Jabatan <span className="text-red-500">*</span></Label>
              <Select value={form.jabatan} onValueChange={(value) => setForm({ ...form, jabatan: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="-- Pilih Jabatan --" />
                </SelectTrigger>
                <SelectContent>
                  {ALLOWED_POSITIONS.map((pos) => (
                    <SelectItem key={pos} value={pos}>
                      {pos}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="id_wilayah" className="text-sm font-bold text-black">Wilayah Penugasan <span className="text-red-500">*</span></Label>
              <Select value={form.id_wilayah} onValueChange={(value) => setForm({ ...form, id_wilayah: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="-- Pilih Wilayah --" />
                </SelectTrigger>
                <SelectContent>
                  {wilayahs.filter(w => form.jabatan ? (form.jabatan === 'Ketua RW' ? w.tipe === 'RW' : w.tipe === 'RT') : true).map((w) => (
                    <SelectItem key={w.id_wilayah} value={w.id_wilayah} disabled={isPositionOccupied(form.jabatan, w.id_wilayah)}>
                      {w.nama_wilayah} {isPositionOccupied(form.jabatan, w.id_wilayah) ? '(Sudah Diisi)' : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="periode_mulai" className="text-sm font-bold text-black">Periode Mulai <span className="text-red-500">*</span></Label>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="custom-date"
                    checked={form.isCustomPeriode}
                    onCheckedChange={(checked) => setForm({ ...form, isCustomPeriode: checked, periode_mulai: checked ? form.periode_mulai : new Date().toISOString().split('T')[0] })}
                  />
                  <label htmlFor="custom-date" className="text-xs font-medium leading-none text-neutral-500 cursor-pointer">
                    Ubah Tanggal
                  </label>
                </div>
              </div>
              <Input
                id="periode_mulai"
                type="date"
                value={form.periode_mulai}
                onChange={(e) => setForm({ ...form, periode_mulai: e.target.value })}
                disabled={!form.isCustomPeriode}
              />
            </div>
          </div>

          <DialogFooter>
            <button
              onClick={() => setIsModalOpen(false)}
              className="rounded-full px-5 py-2.5 text-sm font-bold text-neutral-500 hover:bg-neutral-100 transition-colors"
              type="button"
            >
              Batal
            </button>
            <button
              onClick={handleSave}
              className="rounded-full bg-black px-6 py-2.5 text-sm font-bold text-white hover:bg-neutral-800 active:scale-95 transition-all disabled:opacity-50"
              disabled={isSubmitting}
              type="button"
            >
              Simpan
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageShell>
  )
}
