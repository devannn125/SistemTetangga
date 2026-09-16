import { useState, useEffect, useMemo, useCallback } from 'react'
import { PageShell } from '@/components/layout/PageShell'
import {
  getOrganizationMembers,
  createOrganizationMember,
  deleteOrganizationMember,
  getWilayah,
  getCitizens,
  getUsers,
  updateUser,
} from '@/services/api'
import { Icon } from '@/components/ui/Icon'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/Dialog'
import { useConfirm } from '@/components/ui/ConfirmContext'
import { useToast } from '@/components/ui/ToastContext'

const JABATAN_SUBSET = [
  { label: 'Kepala Lurah', value: 'Kepala Lurah', tipe: 'KELURAHAN' },
  { label: 'Kepala Dukuh', value: 'Kepala Dukuh', tipe: 'DUKUH' },
  { label: 'Ketua RW', value: 'Ketua RW', tipe: 'RW' },
  { label: 'Ketua RT', value: 'Ketua RT', tipe: 'RT' },
  { label: 'Sekretaris', value: 'Sekretaris', tipe: 'RT' },
  { label: 'Bendahara', value: 'Bendahara', tipe: 'RT' },
]

export default function AdminPerangkatPage() {
  const [members, setMembers] = useState([])
  const [wilayahs, setWilayahs] = useState([])
  const [citizens, setCitizens] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [search, setSearch] = useState('')
  const [form, setForm] = useState({
    id_citizen: '',
    jabatan: 'Ketua RT',
    id_wilayah: '',
    periode_mulai: new Date().toISOString().split('T')[0],
  })
  const confirm = useConfirm()
  const { showToast } = useToast()

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [resOrg, resWil, resCit, resUsers] = await Promise.all([
        getOrganizationMembers({ per_page: 200 }),
        getWilayah({ per_page: 500, all: 1 }).catch(() => ({ data: [] })),
        getCitizens({ per_page: 500 }).catch(() => ({ data: [] })),
        getUsers({ per_page: 500 }).catch(() => ({ data: [] })),
      ])
      const arrOrg = Array.isArray(resOrg?.data) ? resOrg.data : Array.isArray(resOrg) ? resOrg : []
      const arrWil = Array.isArray(resWil?.data) ? resWil.data : Array.isArray(resWil) ? resWil : []
      const arrCit = Array.isArray(resCit?.data) ? resCit.data : Array.isArray(resCit) ? resCit : []
      const arrUsers = Array.isArray(resUsers?.data) ? resUsers.data : Array.isArray(resUsers) ? resUsers : []
      setMembers(arrOrg.filter((m) => m.status_aktif))
      setWilayahs(arrWil)
      setCitizens(arrCit)
      setUsers(arrUsers)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const wilayahById = useMemo(() => {
    const m = {}
    wilayahs.forEach((w) => { m[w.id_wilayah] = w })
    return m
  }, [wilayahs])

  const getWilayahName = (id) => wilayahById[id]?.nama_wilayah || id || '-'

  const strategicMembers = useMemo(() => {
    const allowed = new Set(JABATAN_SUBSET.map((j) => j.value))
    return members.filter((m) => allowed.has(m.jabatan))
  }, [members])

  const filteredMembers = useMemo(() => {
    if (!search.trim()) return strategicMembers
    const q = search.toLowerCase()
    return strategicMembers.filter((m) =>
      (m.citizen?.nama_lengkap || '').toLowerCase().includes(q) ||
      (m.jabatan || '').toLowerCase().includes(q) ||
      getWilayahName(m.id_wilayah).toLowerCase().includes(q),
    )
  }, [strategicMembers, search])

  // Dropdown warga: tampilkan SEMUA citizen (hanya data warga), plus label sudah/ belum assign + jabatan
  const assignedMap = useMemo(() => {
    const m = new Map()
    strategicMembers.forEach((mem) => m.set(mem.id_citizen, mem))
    return m
  }, [strategicMembers])
  const calonCitizens = useMemo(() => citizens, [citizens])

  const [calonSearch, setCalonSearch] = useState('')
  const filteredCalon = useMemo(() => {
    const list = !calonSearch.trim()
      ? calonCitizens
      : calonCitizens.filter((c) =>
          (c.nama_lengkap || '').toLowerCase().includes(calonSearch.toLowerCase()) ||
          (c.nik || '').toLowerCase().includes(calonSearch.toLowerCase()),
        )
    return [...list].sort((a, b) => {
      const aAssigned = assignedMap.has(a.id_citizen) ? 1 : 0
      const bAssigned = assignedMap.has(b.id_citizen) ? 1 : 0
      return aAssigned - bAssigned
    }).slice(0, 80)
  }, [calonCitizens, calonSearch, assignedMap])

  // Single flat grouped select: filter by jabatan tipe, show full path
  const getWilayahPath = useCallback((id) => {
    const chain = []
    let cur = wilayahById[id]
    let guard = 0
    while (cur && guard < 10) {
      chain.push(`${cur.tipe} ${cur.nama_wilayah}`)
      if (!cur.parent_id) break
      cur = wilayahById[cur.parent_id]
      guard++
    }
    return chain.reverse().join(' › ')
  }, [wilayahById])

  const wilayahOptions = useMemo(() => {
    const tipe = JABATAN_SUBSET.find((j) => j.value === form.jabatan)?.tipe || 'RT'
    const parentExpect = { RT: 'RW', RW: 'DUKUH', DUKUH: 'KELURAHAN' }[tipe]
    return wilayahs
      .filter((w) => w.tipe === tipe)
      .filter((w) => {
        if (!parentExpect) return true // KELURAHAN no parent needed
        if (!w.parent_id) return false
        const parent = wilayahById[w.parent_id]
        return parent?.tipe === parentExpect
      })
      .map((w) => ({
        value: w.id_wilayah,
        label: getWilayahPath(w.id_wilayah) || `${w.tipe} ${w.nama_wilayah}`,
      }))
      .sort((a, b) => a.label.localeCompare(b.label))
  }, [wilayahs, form.jabatan, getWilayahPath, wilayahById])

  const openAdd = () => {
    const tipe = JABATAN_SUBSET.find((j) => j.value === form.jabatan)?.tipe || 'RT'
    const firstWil = wilayahs.filter((w) => w.tipe === tipe).sort((a, b) => a.nama_wilayah.localeCompare(b.nama_wilayah))[0]?.id_wilayah || ''
    setForm({
      id_citizen: '',
      jabatan: 'Ketua RT',
      id_wilayah: firstWil,
      periode_mulai: new Date().toISOString().split('T')[0],
    })
    setCalonSearch('')
    setOpen(true)
  }

  const handleJabatanChange = (val) => {
    const tipe = JABATAN_SUBSET.find((j) => j.value === val)?.tipe || 'RT'
    const firstWil = wilayahs.filter((w) => w.tipe === tipe).sort((a, b) => a.nama_wilayah.localeCompare(b.nama_wilayah))[0]?.id_wilayah || ''
    setForm((f) => ({ ...f, jabatan: val, id_wilayah: firstWil }))
  }

  async function handleAppoint(e) {
    e.preventDefault()
    if (!form.id_citizen || !form.id_wilayah || !form.periode_mulai || !form.jabatan) {
      showToast('Pilih calon, jabatan, wilayah, dan periode mulai.', 'error')
      return
    }

    const existing = strategicMembers.find(m => m.id_wilayah === form.id_wilayah && m.jabatan === form.jabatan)
    if (existing) {
      showToast(`Gagal: ${getWilayahName(form.id_wilayah)} sudah memiliki ${form.jabatan} (${existing.citizen?.nama_lengkap || 'aktif'}). Cabut jabatan lama terlebih dahulu.`, 'error')
      return
    }

    const citizen = citizens.find((c) => c.id_citizen === form.id_citizen)
    const ok = await confirm({
      title: `Angkat ${form.jabatan}`,
      message: `Angkat ${citizen?.nama_lengkap || 'warga ini'} menjadi ${form.jabatan} di ${getWilayahName(form.id_wilayah)} mulai ${form.periode_mulai}?`,
      confirmLabel: 'Ya, Angkat',
    })
    if (!ok) return
    setIsSubmitting(true)
    try {
      const hasUser = users.some((u) => u.id_citizen === form.id_citizen)
      if (!hasUser && citizen?.email) {
        const warungNull = users.find((u) => !u.id_citizen && u.email && u.email.toLowerCase() === citizen.email.toLowerCase())
        if (warungNull) {
          try {
            await updateUser(warungNull.id_users, {
              nama_users: warungNull.nama_users,
              email: warungNull.email,
              no_hp: warungNull.no_hp,
              id_citizen: form.id_citizen,
              status: warungNull.status || 'ACTIVE',
              auth_provider: warungNull.auth_provider || 'EMAIL',
            })
          } catch (err) {
            console.warn('Gagal hubungkan akun WARGA ke citizen:', err.message)
          }
        }
      }
      await createOrganizationMember({
        id_citizen: form.id_citizen,
        jabatan: form.jabatan,
        id_wilayah: form.id_wilayah,
        periode_mulai: form.periode_mulai,
        status_aktif: true,
      })
      showToast(`${form.jabatan} berhasil diangkat.`)
      setOpen(false)
      loadData()
    } catch (err) {
      showToast(err.message || `Gagal mengangkat ${form.jabatan}.`, 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleRemove(member) {
    const ok = await confirm({
      title: `Cabut ${member.jabatan}`,
      message: `Yakin cabut jabatan "${member.jabatan}" dari ${member.citizen?.nama_lengkap || 'warga ini'}?`,
      confirmLabel: 'Ya, Cabut',
    })
    if (!ok) return
    try {
      await deleteOrganizationMember(member.id_organization_member)
      showToast(`Jabatan ${member.jabatan} dicabut.`)
      loadData()
    } catch (err) {
      showToast(err.message || 'Gagal mencabut jabatan.', 'error')
    }
  }

  if (loading) {
    return (
      <PageShell eyebrow="Perangkat Desa" title="Perangkat Desa" description="Kelola perangkat desa (subset: Lurah, Dukuh, RW, RT, Sekretaris, Bendahara) — assign warga yang telah dibuat menjadi perangkat.">
        <div className="rounded-xl border bg-white p-8 text-center text-sm text-neutral-500">Memuat data perangkat...</div>
      </PageShell>
    )
  }

  return (
    <PageShell
      eyebrow="Perangkat Desa"
      title="Perangkat Desa"
      description="Subset perangkat desa: Kepala Lurah, Kepala Dukuh, Ketua RW, Ketua RT, Sekretaris, Bendahara. Pilih warga yang sudah ada lalu angkat sesuai wilayah."
    >
      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 max-w-md items-center gap-2">
          <Input placeholder="Cari nama, jabatan, atau wilayah..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Button onClick={openAdd} className="shrink-0">
          <Icon name="userPlus" className="h-4 w-4" />
          Angkat Perangkat
        </Button>
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-left text-xs font-bold uppercase text-neutral-500">
            <tr>
              <th className="px-4 py-3">Warga</th>
              <th className="px-4 py-3">Jabatan</th>
              <th className="px-4 py-3">Wilayah</th>
              <th className="px-4 py-3">Periode Mulai</th>
              <th className="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredMembers.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-neutral-500">Belum ada perangkat desa. Klik Angkat Perangkat.</td>
              </tr>
            ) : filteredMembers.map((m) => (
              <tr key={m.id_organization_member} className="hover:bg-neutral-50">
                <td className="px-4 py-3">
                  <div className="font-bold text-black">{m.citizen?.nama_lengkap || '-'}</div>
                  <div className="text-xs text-neutral-500">{m.citizen?.nik || ''} {m.citizen?.nik ? '·' : ''} {m.id_citizen}</div>
                </td>
                <td className="px-4 py-3">
                  <span className="inline-block rounded-full bg-black px-2.5 py-1 text-xs font-bold text-white">{m.jabatan}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-neutral-700">{getWilayahName(m.id_wilayah)}</span>
                  <span className="ml-2 text-xs text-neutral-400">{m.id_wilayah}</span>
                </td>
                <td className="px-4 py-3 text-neutral-600">{m.periode_mulai ? new Date(m.periode_mulai).toLocaleDateString('id-ID') : '-'}</td>
                <td className="px-4 py-3 text-right">
                  <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50" onClick={() => handleRemove(m)}>
                    Cabut
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[86vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Angkat Perangkat Desa</DialogTitle>
            <DialogDescription>Pilih warga yang telah dibuat, tentukan jabatan subset dan wilayah penugasan.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAppoint} className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label>Jabatan <span className="text-red-500">*</span></Label>
              <Select value={form.jabatan} onValueChange={handleJabatanChange}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {JABATAN_SUBSET.map((j) => (
                    <SelectItem key={j.value} value={j.value}>{j.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Wilayah Penugasan <span className="text-red-500">*</span></Label>
              <Select value={form.id_wilayah} onValueChange={(v) => setForm({ ...form, id_wilayah: v })}>
                <SelectTrigger><SelectValue placeholder="Pilih wilayah" /></SelectTrigger>
                <SelectContent>
                  {wilayahOptions.length === 0 ? (
                    <SelectItem value="__none__" disabled>
                      {(() => {
                        const tipe = JABATAN_SUBSET.find((j) => j.value === form.jabatan)?.tipe
                        if (tipe === 'RW') return 'Belum ada RW dengan induk Dukuh — buat di Manajemen Wilayah'
                        if (tipe === 'RT') return 'Belum ada RT dengan induk RW — buat di Manajemen Wilayah'
                        if (tipe === 'DUKUH') return 'Belum ada Dukuh dengan induk Kelurahan — buat di Manajemen Wilayah'
                        return `Belum ada wilayah tipe ${tipe}`
                      })()}
                    </SelectItem>
                  ) : wilayahOptions.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-neutral-500">
                {(() => {
                  const tipe = JABATAN_SUBSET.find((j) => j.value === form.jabatan)?.tipe
                  if (tipe === 'RW') return 'Ketua RW: hanya RW yang parent-nya Dukuh (hierarki lengkap ditampilkan).'
                  if (tipe === 'RT') return 'Ketua RT / Sekretaris / Bendahara: hanya RT yang parent-nya RW.'
                  if (tipe === 'DUKUH') return 'Kepala Dukuh: hanya Dukuh yang parent-nya Kelurahan.'
                  return 'Kelurahan tidak butuh induk.'
                })()}
              </p>
            </div>

            <div className="space-y-2">
              <Label>Pilih Warga <span className="text-red-500">*</span></Label>
              <Input placeholder="Cari NIK atau nama warga..." value={calonSearch} onChange={(e) => setCalonSearch(e.target.value)} />
              <Select value={form.id_citizen} onValueChange={(v) => setForm({ ...form, id_citizen: v })}>
                <SelectTrigger><SelectValue placeholder="Pilih calon perangkat" /></SelectTrigger>
                <SelectContent>
                  {filteredCalon.length === 0 ? (
                    <SelectItem value="__none__" disabled>Tidak ada warga (belum ada data citizen).</SelectItem>
                  ) : filteredCalon.map((c) => {
                    const assigned = assignedMap.get(c.id_citizen)
                    const base = c.nik ? `${c.nik} — ${c.nama_lengkap}` : c.nama_lengkap
                    const suffix = assigned ? ` • Sudah: ${assigned.jabatan} di ${getWilayahName(assigned.id_wilayah)}` : ' • Belum diangkat'
                    return (
                      <SelectItem key={c.id_citizen} value={c.id_citizen} disabled={!!assigned}>
                        {base}{suffix}
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
              {form.id_citizen && (() => {
                const c = citizens.find((x) => x.id_citizen === form.id_citizen)
                const linkedUser = users.find((u) => u.id_citizen === form.id_citizen)
                const hasNullWarga = users.some((u) => !u.id_citizen && c?.email && u.email?.toLowerCase() === c.email.toLowerCase())
                return (
                  <p className="text-xs">
                    {linkedUser ? (
                      <span className="text-emerald-600">Akun terhubung: {linkedUser.email || linkedUser.nama_users} — role akan di-sync.</span>
                    ) : hasNullWarga ? (
                      <span className="text-amber-600">Akun WARGA null ditemukan — akan dihubungkan otomatis ke warga ini.</span>
                    ) : (
                      <span className="text-neutral-500">Warga belum punya akun login — perangkat tetap tercatat, login perlu buat akun WARGA dengan email sama.</span>
                    )}
                  </p>
                )
              })()}
            </div>

            <div className="space-y-2">
              <Label>Periode Mulai <span className="text-red-500">*</span></Label>
              <Input type="date" required value={form.periode_mulai} onChange={(e) => setForm({ ...form, periode_mulai: e.target.value })} />
            </div>

            <DialogFooter className="flex-col gap-3 sm:flex-row">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Batal</Button>
              <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Memproses...' : `Angkat ${form.jabatan}`}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </PageShell>
  )
}
