import { useState, useEffect, useMemo, useCallback } from 'react'
import { PageShell } from '@/components/layout/PageShell'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
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
import { getOrganizationMembers, createOrganizationMember, deleteOrganizationMember, getUsers, getCitizenMe } from '@/services/api'
import { useConfirm } from '@/components/ui/ConfirmContext'
import { useToast } from '@/components/ui/ToastContext'

const ALL_POSITIONS = [
  'Sekretaris',
  'Bendahara',
  'Pengurus Siskamling',
  'Ibu PKK',
  'Karang Taruna',
]

export default function RtOrganizationPage() {
  const [members, setMembers] = useState([])
  const [citizens, setCitizens] = useState([])
  const [myWilayah, setMyWilayah] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const confirm = useConfirm()
  const { showToast } = useToast()

  const [form, setForm] = useState({
    id_citizen: '',
    jabatan: '',
    id_wilayah: '',
    periode_mulai: new Date().toISOString().split('T')[0],
    status_aktif: true,
    foto: null,
  })

  const occupiedPositions = useMemo(() => {
    return members
      .filter((m) => m.status_aktif)
      .reduce((acc, m) => {
        const key = `${m.jabatan}-${m.id_wilayah}-${m.periode_mulai}`
        acc[key] = m
        return acc
      }, {})
  }, [members])

  const isPositionOccupied = useCallback((jabatan, idWilayah, periodeMulai) => {
    return Boolean(occupiedPositions[`${jabatan}-${idWilayah}-${periodeMulai}`])
  }, [occupiedPositions])

  async function loadData() {
    setLoading(true)
    try {
      const resMe = await getCitizenMe()
      const wil = resMe?.data?.wilayah || null
      if (!wil?.id_wilayah) {
        throw new Error('Akun Anda tidak terhubung ke data warga/wilayah RT manapun.')
      }
      setMyWilayah(wil)
      setForm((f) => ({ ...f, id_wilayah: wil.id_wilayah }))

      const [resM, resUsers] = await Promise.all([
        getOrganizationMembers({ per_page: 100 }),
        getUsers({ per_page: 100 }),
      ])

      const arrM = Array.isArray(resM?.data) ? resM.data : Array.isArray(resM) ? resM : []
      const allUsers = Array.isArray(resUsers?.data) ? resUsers.data : Array.isArray(resUsers) ? resUsers : []

      const filteredUsers = allUsers.filter((u) => {
        const roles = (u.user_roles || []).filter((r) => r.status === 'ACTIVE').map((r) => r.kode)
        return !roles.includes('ADMIN') && !roles.includes('DUKUH') && !roles.includes('RW')
      })

      const arrC = filteredUsers
        .filter((u) => u.id_citizen && u.status === 'ACTIVE')
        .map((u) => ({
          id_citizen: u.id_citizen,
          nama_lengkap: u.nama_users,
        }))

      setMembers(arrM)
      setCitizens(arrC)

      setForm((f) => {
        const isActive = (cId) => arrM.some((m) => m.status_aktif && (m.id_citizen === cId || m.citizen?.id_citizen === cId))
        const availableCitizens = arrC.filter((c) => !isActive(c.id_citizen))
        const isCurrentValid = f.id_citizen && !isActive(f.id_citizen) && arrC.some((c) => c.id_citizen === f.id_citizen)

        return {
          ...f,
          id_citizen: isCurrentValid ? f.id_citizen : (availableCitizens[0]?.id_citizen || ''),
        }
      })
    } catch (err) {
      console.error(err)
      showToast('Gagal memuat data struktur organisasi: ' + err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    const approved = await confirm({
      title: 'Konfirmasi Simpan',
      message: 'Yakin ingin menunjuk warga ini sebagai "' + form.jabatan + '"? Perubahan pengurus otomatis menyesuaikan hak aksesnya di sistem.',
      confirmLabel: 'Ya, Simpan',
    })
    if (!approved) return
    try {
      const payload = new FormData()
      payload.append('id_citizen', form.id_citizen)
      payload.append('jabatan', form.jabatan)
      payload.append('id_wilayah', form.id_wilayah)
      payload.append('periode_mulai', form.periode_mulai)
      payload.append('status_aktif', form.status_aktif ? '1' : '0')
      if (form.foto) {
        payload.append('foto', form.foto)
      }

      await createOrganizationMember(payload)
      showToast('Pengurus berhasil ditambahkan.')
      setIsModalOpen(false)
      loadData()
    } catch (err) {
      showToast('Gagal menyimpan: ' + err.message, 'error')
    }
  }

  async function handleDelete(id) {
    const approved = await confirm({
      title: 'Konfirmasi Cabut',
      message: 'Yakin ingin mencabut pengurus ini dari struktur organisasi?',
      confirmLabel: 'Ya, Cabut',
    })
    if (!approved) return
    try {
      await deleteOrganizationMember(id)
      showToast('Data pengurus berhasil dihapus.')
      loadData()
    } catch (err) {
      showToast('Gagal menghapus: ' + err.message, 'error')
    }
  }

  const activeMembers = useMemo(() => members.filter((m) => m.status_aktif), [members])

  return (
    <PageShell
      eyebrow="Organisasi"
      title="Struktur Organisasi & Pengurus"
      description="Kelola jabatan dan periode pengurus lingkungan (RT)."
    >
      <div className="space-y-6">
        <div className="flex justify-end">
          <Button size="sm" onClick={() => setIsModalOpen(true)}>
            + Tambah Pengurus
          </Button>
        </div>

        {/* Member Grid */}
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="flex flex-col items-center p-6 space-y-4">
                  <div className="h-32 w-32 rounded-2xl bg-neutral-200" />
                  <div className="h-4 w-28 bg-neutral-200 rounded" />
                  <div className="h-3 w-16 bg-neutral-200 rounded" />
                </div>
              </Card>
            ))
          ) : activeMembers.length === 0 ? (
            <div className="col-span-full rounded-xl border border-neutral-200 bg-white p-8 text-center text-sm font-medium text-neutral-500">
              Belum ada data struktur organisasi.
            </div>
          ) : (
            activeMembers.map((m) => (
              <Card key={m.id_organization_member || m.id} className="relative flex flex-col items-center p-6 text-center">
                <span
                  className={`absolute top-4 right-4 h-2.5 w-2.5 rounded-full ${m.status_aktif ? 'bg-emerald-500' : 'bg-neutral-300'}`}
                  title={m.status_aktif ? 'Aktif' : 'Nonaktif'}
                />

                <div className="mb-4 flex h-32 w-32 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-neutral-100 bg-neutral-50 text-3xl font-extrabold text-neutral-300 shadow-sm">
                  {m.foto_url ? (
                    <img
                      src={
                        m.foto_url.startsWith('http')
                          ? m.foto_url
                          : (import.meta.env.VITE_API_URL
                              ? import.meta.env.VITE_API_URL.replace('/api', '')
                              : 'http://127.0.0.1:8000') +
                            '/storage/' +
                            m.foto_url
                      }
                      alt="Foto Pengurus"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    m.citizen?.nama_lengkap?.[0] || '?'
                  )}
                </div>

                <h3 className="text-base font-bold text-neutral-900 line-clamp-1">
                  {m.citizen?.nama_lengkap || 'Warga Terhapus'}
                </h3>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-sky-600">
                  {m.jabatan}
                </p>

                <div className="mt-6 flex w-full items-center justify-between border-t border-neutral-100 pt-4 text-xs">
                  <span className="text-neutral-400">Mulai: {m.periode_mulai}</span>
                  {(m.jabatan?.toLowerCase().includes('sekretaris') || m.jabatan?.toLowerCase().includes('bendahara')) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-red-600 hover:bg-red-50 hover:text-red-700"
                      onClick={() => handleDelete(m.id_organization_member || m.id)}
                    >
                      Cabut
                    </Button>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Modal Assign Pengurus */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Pengurus Baru</DialogTitle>
            <DialogDescription>Pilih warga dan jabatan untuk ditunjuk sebagai pengurus.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="id_citizen" className="text-sm font-bold text-black">Pilih Warga <span className="text-red-500">*</span></Label>
              {citizens.length === 0 ? (
                <p className="w-full rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-400">
                  Tidak ada warga aktif di RT ini yang dapat ditunjuk.
                </p>
              ) : (
                <Select value={form.id_citizen} onValueChange={(value) => setForm({ ...form, id_citizen: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="-- Pilih Warga --" />
                  </SelectTrigger>
                  <SelectContent>
                    {citizens.map((c) => {
                      const isActive = members.some((m) => m.status_aktif && (m.id_citizen === c.id_citizen || m.citizen?.id_citizen === c.id_citizen))
                      return (
                        <SelectItem key={c.id_citizen} value={c.id_citizen} disabled={isActive}>
                          {c.nama_lengkap} {isActive ? '(Sudah Menjabat)' : ''}
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="jabatan" className="text-sm font-bold text-black">Jabatan <span className="text-red-500">*</span></Label>
              <Select value={form.jabatan} onValueChange={(value) => setForm({ ...form, jabatan: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="-- Pilih Jabatan --" />
                </SelectTrigger>
                <SelectContent>
                  {ALL_POSITIONS.map((pos) => (
                    <SelectItem
                      key={pos}
                      value={pos}
                      disabled={isPositionOccupied(pos, form.id_wilayah, form.periode_mulai)}
                    >
                      {pos} {isPositionOccupied(pos, form.id_wilayah, form.periode_mulai) ? '(Sudah diisi)' : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.jabatan && isPositionOccupied(form.jabatan, form.id_wilayah, form.periode_mulai) && (
                <p className="mt-1 text-xs text-red-500">Jabatan ini sudah dipegang oleh pengurus lain pada periode ini.</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="id_wilayah" className="text-sm font-bold text-black">Wilayah (RT) <span className="text-red-500">*</span></Label>
              <Input
                id="id_wilayah"
                type="text"
                readOnly
                value={myWilayah ? myWilayah.nama_wilayah : ''}
                title="Struktur organisasi hanya dapat dikelola di RT Anda sendiri"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="periode_mulai" className="text-sm font-bold text-black">Periode Mulai <span className="text-red-500">*</span></Label>
              <Input
                id="periode_mulai"
                type="date"
                required
                value={form.periode_mulai}
                onChange={(e) => setForm({ ...form, periode_mulai: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="foto" className="text-sm font-bold text-black">Foto Pengurus</Label>
              <Input
                id="foto"
                type="file"
                accept="image/*"
                onChange={(e) => setForm({ ...form, foto: e.target.files[0] })}
              />
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="status_aktif"
                checked={form.status_aktif}
                onCheckedChange={(checked) => setForm({ ...form, status_aktif: checked })}
              />
              <Label htmlFor="status_aktif" className="text-sm text-neutral-700 cursor-pointer">Status Aktif Menjabat</Label>
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-3">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={form.jabatan && isPositionOccupied(form.jabatan, form.id_wilayah, form.periode_mulai)}>
                Simpan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </PageShell>
  )
}