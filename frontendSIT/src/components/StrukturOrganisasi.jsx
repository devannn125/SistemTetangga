import { useState, useEffect, useMemo, useCallback } from 'react'
import { PageShell } from '@/components/layout/PageShell'
import {
  getOrganizationMembers,
  createOrganizationMember,
  deleteOrganizationMember,
  getWilayah,
  getCitizenMe,
  getCitizens,
} from '@/services/api'
import { getAuthRole, getAuthData } from '@/services/authService'
import { Icon } from '@/components/ui/Icon'
import { useConfirm } from '@/components/ui/ConfirmContext'
import { useToast } from '@/components/ui/ToastContext'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/Dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { Label } from '@/components/ui/Label'
import { Input } from '@/components/ui/Input'

function avatarUrl(urlBytes) {
  if (!urlBytes) return null
  return urlBytes.startsWith('http')
    ? urlBytes
    : (import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://127.0.0.1:8000') + '/storage/' + urlBytes
}

function Avatar({ member, size = 'md' }) {
  const name = member?.citizen?.nama_lengkap || member?.nama_users || '?'
  const url = avatarUrl(member?.foto_url)
  const box = size === 'lg'
    ? 'h-20 w-20 text-3xl'
    : size === 'md'
      ? 'h-12 w-12 text-lg'
      : 'h-9 w-9 text-sm'

  return (
    <div className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-neutral-200 bg-neutral-50 font-extrabold text-neutral-300 ${box}`}>
      {url ? <img src={url} alt={name} className="h-full w-full object-cover" /> : (name[0] || '?')}
    </div>
  )
}

function SectionHeading({ children }) {
  return (
    <div className="flex items-center gap-4 py-3">
      <div className="h-px flex-1 bg-neutral-200" />
      <p className="shrink-0 text-xs font-extrabold uppercase tracking-[0.12em] text-neutral-500">{children}</p>
      <div className="h-px flex-1 bg-neutral-200" />
    </div>
  )
}

function OfficialRow({ member }) {
  return (
    <div className="flex items-center gap-4 py-3">
      <Avatar member={member} size="md" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-black truncate">{member.citizen?.nama_lengkap || 'Tidak Diketahui'}</p>
        <p className="text-xs font-extrabold uppercase tracking-wide text-sky-600">{member.jabatan}</p>
      </div>
    </div>
  )
}

const JABATAN = {
  dukuh: 'Kepala Dukuh',
  rw: 'Ketua RW',
  rt: 'Ketua RT',
  sek: 'Sekretaris',
  ben: 'Bendahara',
}

export default function StrukturOrganisasi() {
  const role = getAuthRole()
  const isAdmin = role === 'ADMIN'
  const isDukuh = role === 'DUKUH'
  const isLurah = role === 'LURAH'
  const isRtRole = role === 'RT'
  const canManageSekBen = isRtRole && !isAdmin
  const canManageDukuh = isLurah && !isAdmin
  const canManageRw = isDukuh && !isAdmin

  const [members, setMembers] = useState([])
  const [wilayahs, setWilayahs] = useState([])
  const [myWilayah, setMyWilayah] = useState(null)
  const [lurah, setLurah] = useState(null)
  const [citizens, setCitizens] = useState([])
  const [loading, setLoading] = useState(true)

  const [addModal, setAddModal] = useState({ type: null, open: false })
  const [selectedDukuhId, setSelectedDukuhId] = useState(null)
  const [adminActiveKelurahanId, setAdminActiveKelurahanId] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [form, setForm] = useState({
    id_citizen: '',
    id_wilayah: '',
    periode_mulai: new Date().toISOString().split('T')[0],
  })
  const confirm = useConfirm()
  const { showToast } = useToast()

  const authRoles = useMemo(() => (getAuthData()?.user_roles || []), [])

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const resMe = await getCitizenMe().catch(() => null)
      setMyWilayah(resMe?.data?.wilayah || null)

      const [resOrg, resWil, resCit] = await Promise.all([
        getOrganizationMembers({ per_page: 500 }),
        getWilayah({ per_page: 500, all: 1 }),
        getCitizens({ per_page: 500 }).catch(() => null),
      ])

      const arrOrg = Array.isArray(resOrg?.data) ? resOrg.data : Array.isArray(resOrg) ? resOrg : []
      const arrWil = Array.isArray(resWil?.data) ? resWil.data : Array.isArray(resWil) ? resWil : []
      const arrCit = Array.isArray(resCit?.data) ? resCit.data : Array.isArray(resCit) ? resCit : []

      const activeMembers = arrOrg.filter((m) => m.status_aktif)
      setMembers(activeMembers)
      setWilayahs(arrWil)

      // Kepala Lurah diambil dari organization_member jabatan "Kepala Lurah" (bukan modul USER).
      const lurahMember = activeMembers.find((m) => m.jabatan?.toLowerCase().includes('kepala lurah'))
      setLurah(lurahMember ? { nama_users: lurahMember.citizen?.nama_lengkap || 'Kepala Lurah' } : null)

      // Calon pengurus = warga yang belum memegang jabatan struktural aktif.
      const appointedCitizens = new Set(activeMembers.map((m) => m.id_citizen))
      const calons = arrCit
        .filter((c) => !appointedCitizens.has(c.id_citizen))
        .map((c) => ({ 
          id_citizen: c.id_citizen, 
          nama_lengkap: c.nama_lengkap,
          id_wilayah: c.wilayah?.id_wilayah || c.id_wilayah,
          calon_jabatan: c.calon_jabatan
        }))
      setCitizens(calons)
    } catch (err) {
      console.error('Gagal memuat struktur organisasi:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const tree = useMemo(() => {
    if (wilayahs.length === 0) return { kelurahan: null, dukuhList: [], kelurahanList: [], orphanRws: [], orphanRts: [] }
    const kelurahanList = wilayahs
      .filter((w) => w.tipe === 'KELURAHAN')
      .sort((a, b) => a.nama_wilayah.localeCompare(b.nama_wilayah))
    const kelurahan = kelurahanList[0] || null
    if (kelurahanList.length === 0) return { kelurahan: null, dukuhList: [], kelurahanList: [], orphanRws: [], orphanRts: [] }

    const wilayahById = new Map(wilayahs.map((w) => [w.id_wilayah, w]))
    const dukuhIds = new Set(wilayahs.filter((w) => w.tipe === 'DUKUH').map((w) => w.id_wilayah))
    const rwIds = new Set(wilayahs.filter((w) => w.tipe === 'RW').map((w) => w.id_wilayah))

    // ponytail: tampil semua dukuh lintas kelurahan; upgrade ke filter per kelurahan bila multi-kelurahan aktif
    const dukuhList = wilayahs
      .filter((w) => w.tipe === 'DUKUH')
      .sort((a, b) => a.nama_wilayah.localeCompare(b.nama_wilayah))
      .map((d) => ({
        ...d,
        rws: wilayahs
          .filter((w) => w.parent_id === d.id_wilayah && w.tipe === 'RW')
          .sort((a, b) => a.nama_wilayah.localeCompare(b.nama_wilayah))
          .map((rw) => ({
            ...rw,
            rts: wilayahs
              .filter((w) => w.parent_id === rw.id_wilayah && w.tipe === 'RT')
              .sort((a, b) => a.nama_wilayah.localeCompare(b.nama_wilayah)),
          })),
      }))

    // Orphan fallback: RW yang parent-nya bukan DUKUH (mis. masih KELURAHAN atau hilang) dan RT yang parent-nya bukan RW.
    // Tanpa ini, data seperti dump awal (RW→KEL) membuat tree kosong dan member tersembunyi.
    const orphanRws = wilayahs
      .filter((w) => w.tipe === 'RW' && !dukuhIds.has(w.parent_id))
      .sort((a, b) => a.nama_wilayah.localeCompare(b.nama_wilayah))
      .map((rw) => ({
        ...rw,
        _isOrphan: true,
        _orphanReason: wilayahById.get(rw.parent_id)?.tipe ? `parent ${wilayahById.get(rw.parent_id).tipe}` : 'tanpa Dukuh',
        rts: wilayahs
          .filter((x) => x.parent_id === rw.id_wilayah && x.tipe === 'RT')
          .sort((a, b) => a.nama_wilayah.localeCompare(b.nama_wilayah)),
      }))
    const orphanRts = wilayahs
      .filter((w) => w.tipe === 'RT' && !rwIds.has(w.parent_id))
      .sort((a, b) => a.nama_wilayah.localeCompare(b.nama_wilayah))

    return { kelurahan, dukuhList, kelurahanList, orphanRws, orphanRts }
  }, [wilayahs])

  const adminKelurahanList = useMemo(() => {
    if (!isAdmin) return []
    return tree.kelurahanList || []
  }, [isAdmin, tree.kelurahanList])

  useEffect(() => {
    if (isAdmin && adminKelurahanList.length > 0 && !adminActiveKelurahanId) {
      setAdminActiveKelurahanId(adminKelurahanList[0].id_wilayah)
    }
  }, [isAdmin, adminKelurahanList, adminActiveKelurahanId])

  const adminDukuhList = useMemo(() => {
    if (!isAdmin) return []
    // Admin melihat SEMUA kelurahan (view-only), bukan cuma tab aktif.
    // Gunakan tree.dukuhList yang sudah berisi semua dukuh di semua kelurahan.
    return tree.dukuhList
  }, [isAdmin, tree.dukuhList])

  const myDukuhId = useMemo(() => {
    const active = authRoles.find((r) => (r.kode === 'DUKUH' || r.role?.kode_role === 'DUKUH') && r.status === 'ACTIVE')
    if (active?.id_wilayah) return active.id_wilayah
    if (myWilayah?.tipe === 'DUKUH') return myWilayah.id_wilayah
    return null
  }, [authRoles, myWilayah])

  const myRwId = useMemo(() => {
    const rw = authRoles.find((r) => (r.kode === 'RW' || r.role?.kode_role === 'RW') && r.status === 'ACTIVE')
    if (rw?.id_wilayah) return rw.id_wilayah
    const rtId = authRoles
      .find((r) => (['RT', 'SEKRETARIS', 'BENDAHARA', 'WARGA'].includes(r.kode) || ['RT', 'SEKRETARIS', 'BENDAHARA', 'WARGA'].includes(r.role?.kode_role)) && r.status === 'ACTIVE')
      ?.id_wilayah
    const rtNode = rtId && wilayahs.find((w) => w.id_wilayah === rtId)
    if (rtNode?.parent_id) return rtNode.parent_id
    if (myWilayah?.tipe === 'RW') return myWilayah.id_wilayah
    if (myWilayah?.tipe === 'RT') return myWilayah.parent_id
    return null
  }, [authRoles, wilayahs, myWilayah])

  const myRtId = useMemo(() => {
    const rtId = authRoles
      .find((r) => (['RT', 'SEKRETARIS', 'BENDAHARA', 'WARGA'].includes(r.kode) || ['RT', 'SEKRETARIS', 'BENDAHARA', 'WARGA'].includes(r.role?.kode_role)) && r.status === 'ACTIVE')
      ?.id_wilayah
    if (rtId) return rtId
    return myWilayah?.tipe === 'RT' ? myWilayah.id_wilayah : null
  }, [authRoles, myWilayah])

  const isRwRole = useMemo(() => authRoles.some((r) => (r.kode === 'RW' || r.role?.kode_role === 'RW') && r.status === 'ACTIVE'), [authRoles])

  const currentDukuh = useMemo(() => {
    if (isDukuh) return tree.dukuhList.find((d) => d.id_wilayah === myDukuhId)
    return null
  }, [isDukuh, tree.dukuhList, myDukuhId])

  // Kelurahan anchor untuk LURAH (KELURAHAN node dari user_role LURAH)
  const lurahAnchorKelurahanId = useMemo(() => {
    if (!isLurah) return null
    const lurahRole = authRoles.find((r) => (r.kode === 'LURAH' || r.role?.kode === 'LURAH' || r.role?.kode_role === 'LURAH') && r.status === 'ACTIVE')
    const anchorId = lurahRole?.id_wilayah || myWilayah?.id_wilayah
    if (!anchorId) return null
    const anchor = wilayahs.find((w) => w.id_wilayah === anchorId)
    if (!anchor) return anchorId
    if (anchor.tipe === 'KELURAHAN') return anchor.id_wilayah
    // naik ke parent sampai KELURAHAN
    let cur = anchor
    while (cur?.parent_id) {
      const parent = wilayahs.find((w) => w.id_wilayah === cur.parent_id)
      if (!parent) break
      if (parent.tipe === 'KELURAHAN') return parent.id_wilayah
      cur = parent
    }
    return anchorId
  }, [isLurah, authRoles, myWilayah, wilayahs])

  const lurahDukuhList = useMemo(() => {
    if (!isLurah) return []
    if (lurahAnchorKelurahanId) {
      return tree.dukuhList.filter((d) => d.parent_id === lurahAnchorKelurahanId)
    }
    return tree.dukuhList
  }, [isLurah, lurahAnchorKelurahanId, tree.dukuhList])

  const activeDukuhId = isLurah
    ? (selectedDukuhId || lurahDukuhList[0]?.id_wilayah || tree.dukuhList[0]?.id_wilayah)
    : null

  const scopeRwOnly = useMemo(() => !isAdmin && !isDukuh && !isLurah && (isRwRole || Boolean(myRtId)), [isAdmin, isDukuh, isLurah, isRwRole, myRtId])

  // Fallback: cari Dukuh ancestor dari myWilayah bila myRwId kosong (mis. warga di node DUKUH/RT)
  const myDukuhFromWilayah = useMemo(() => {
    if (!myWilayah) return null
    if (myWilayah.tipe === 'DUKUH') return myWilayah.id_wilayah
    if (myWilayah.tipe === 'RW') return myWilayah.parent_id
    if (myWilayah.tipe === 'RT') {
      const rw = wilayahs.find((w) => w.id_wilayah === myWilayah.parent_id)
      return rw?.parent_id || null
    }
    return null
  }, [myWilayah, wilayahs])

  // Role berbasis wilayah (RW/RT/SEK/BEN/Warga) hanya melihat RW miliknya sendiri;
  // Dukuh & Lurah melihat semua RW utk keperluan kelola. Admin (view-only) lihat per tab kelurahan.
  // Fallback: bila tree kosong (orphan) tapi ada member, deduplicate via member wilayah.
  const visibleDukuhs = useMemo(() => {
    if (isAdmin) return tree.dukuhList
    if (isDukuh) {
      if (currentDukuh) return [currentDukuh]
      // Orphan fallback: dukuh belum ada di wilayahs tapi myWilayah adalah DUKUH
      if (myDukuhFromWilayah) return tree.dukuhList.filter((d) => d.id_wilayah === myDukuhFromWilayah)
      return tree.dukuhList.slice(0, 1)
    }
    if (isLurah) {
      const list = lurahDukuhList.length ? lurahDukuhList : tree.dukuhList
      const sel = list.find((d) => d.id_wilayah === activeDukuhId)
      return sel ? [sel] : list.slice(0, 1)
    }
    if (myRwId) {
      const hit = tree.dukuhList.filter((d) => d.rws.some((rw) => rw.id_wilayah === myRwId))
      if (hit.length) return hit
      // Orphan: RW ada tapi tidak terikat dukuh (parent masih KEL) — tetap tampilkan dukuh ancestor via wilayah
      const rwNode = wilayahs.find((w) => w.id_wilayah === myRwId)
      if (rwNode?.parent_id) {
        const dukuhNode = wilayahs.find((w) => w.id_wilayah === rwNode.parent_id)
        if (dukuhNode && dukuhNode.tipe === 'DUKUH') return tree.dukuhList.filter((d) => d.id_wilayah === dukuhNode.id_wilayah)
      }
    }
    if (myDukuhFromWilayah) {
      const hit = tree.dukuhList.filter((d) => d.id_wilayah === myDukuhFromWilayah)
      if (hit.length) return hit
    }
    // Fallback terakhir: tampilkan dukuh yang memiliki member RT/RW yang relevan dengan wilayah actor (cover Michael case)
    if (members.length > 0 && (myRwId || myRtId || myWilayah)) {
      const actorWilayahIds = new Set([myRwId, myRtId, myWilayah?.id_wilayah, myWilayah?.parent_id].filter(Boolean))
      const memberWilayahIds = new Set(members.map((m) => m.id_wilayah))
      // Jika actor wilayah bersinggungan dengan member, tampilkan dukuh yang menampung member tersebut
      for (const mid of memberWilayahIds) {
        if (actorWilayahIds.has(mid)) {
          // mid adalah RT/RW aktor sendiri -> tampilkan dukuhnya
          return tree.dukuhList
        }
      }
    }
    // ponytail: tampil semua dukuh sebagai fallback read-only; rapikan ke scope kelurahan saat RBAC matang
    if (authRoles.length > 0) return tree.dukuhList
    return []
  }, [isAdmin, adminDukuhList, isDukuh, isLurah, currentDukuh, tree.dukuhList, myRwId, myRtId, myWilayah, wilayahs, activeDukuhId, lurahDukuhList, myDukuhFromWilayah, authRoles, members])

  const getRwMembers = (rwId) => members.filter((m) => m.id_wilayah === rwId)
  const getRtMembers = (rtId) => members.filter((m) => m.id_wilayah === rtId)
  const getDukuhMember = (dukuhId) => members.find((m) => m.id_wilayah === dukuhId && m.jabatan?.toLowerCase().includes('dukuh'))

  // Node target utk mengangkat jabatan tertentu
  const targetNodes = useCallback((type) => {
    if (type === 'dukuh') return tree.dukuhList
    if (type === 'rw') {
      if (isAdmin) return tree.dukuhList.flatMap((d) => d.rws.map((rw) => ({ ...rw, _dukuhLabel: d.nama_wilayah })))
      return currentDukuh?.rws || []
    }
    if (type === 'rt') {
      if (isAdmin) return tree.dukuhList.flatMap((d) => d.rws.flatMap((rw) => rw.rts.map((rt) => ({ ...rt, _rwLabel: rw.nama_wilayah, _dukuhLabel: d.nama_wilayah }))))
      return (currentDukuh?.rws || []).flatMap((rw) =>
        (rw.rts || []).map((rt) => ({ ...rt, _rwLabel: rw.nama_wilayah }))
      )
    }
    if (type === 'sek' || type === 'ben') {
      if (isAdmin) return tree.dukuhList.flatMap((d) => d.rws.flatMap((rw) => rw.rts.map((rt) => ({ ...rt, _rwLabel: rw.nama_wilayah }))))
      const rt = myRtId ? wilayahs.find((w) => w.id_wilayah === myRtId) : null
      return rt ? [{ id_wilayah: rt.id_wilayah, nama_wilayah: rt.nama_wilayah }] : []
    }
    return []
  }, [isAdmin, tree.dukuhList, currentDukuh, myRtId, wilayahs])

  const modalWilayahOptions = useMemo(() => {
    const type = addModal.type
    if (!type) return []
    const tipe = type === 'rw' ? 'RW' : type === 'rt' || type === 'sek' || type === 'ben' ? 'RT' : type === 'dukuh' ? 'DUKUH' : 'KELURAHAN'
    const parentExpect = { RT: 'RW', RW: 'DUKUH', DUKUH: 'KELURAHAN' }[tipe]
    return wilayahs
      .filter((w) => w.tipe === tipe)
      .filter((w) => {
        if (!parentExpect) return true
        if (!w.parent_id) return false
        const parent = wilayahs.find((p) => p.id_wilayah === w.parent_id)
        return parent?.tipe === parentExpect
      })
      .map((w) => {
        const chain = []
        let cur = w
        let guard = 0
        while (cur && guard < 10) {
          chain.push(`${cur.tipe} ${cur.nama_wilayah}`)
          if (!cur.parent_id) break
          cur = wilayahs.find((p) => p.id_wilayah === cur.parent_id)
          guard++
        }
        return { value: w.id_wilayah, label: chain.reverse().join(' › ') }
      })
      .sort((a, b) => a.label.localeCompare(b.label))
  }, [wilayahs, addModal.type])

  const openAdd = (type) => {
    const nodes = targetNodes(type)
    const tipe = type === 'rw' ? 'RW' : type === 'rt' || type === 'sek' || type === 'ben' ? 'RT' : 'DUKUH'
    const firstWil = nodes[0]?.id_wilayah || wilayahs.filter((w) => w.tipe === tipe).sort((a, b) => a.nama_wilayah.localeCompare(b.nama_wilayah))[0]?.id_wilayah || ''
    setForm({ id_citizen: '', id_wilayah: firstWil, periode_mulai: new Date().toISOString().split('T')[0] })
    setAddModal({ type, open: true })
  }

  async function handleAppoint(e) {
    e.preventDefault()
    const { type } = addModal
    const jabatan = JABATAN[type]
    if (!form.id_citizen || !form.id_wilayah || !form.periode_mulai) {
      showToast('Pilih calon pengurus, wilayah, dan periode mulai.', 'error')
      return
    }
    setIsSubmitting(true)
    try {
      await createOrganizationMember({
        id_citizen: form.id_citizen,
        jabatan,
        id_wilayah: form.id_wilayah,
        periode_mulai: form.periode_mulai,
        status_aktif: true,
      })
      showToast(`${jabatan} berhasil diangkat.`)
      setAddModal((m) => ({ ...m, open: false }))
      loadData()
    } catch (err) {
      showToast(err.message || `Gagal mengangkat ${jabatan}.`, 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleRemove(member, jabatanLabel) {
    const ok = await confirm({
      title: `Cabut Jabatan ${jabatanLabel}`,
      message: `Yakin ingin mencabut jabatan "${member.jabatan}" dari ${member.citizen?.nama_lengkap}?`,
      confirmLabel: 'Ya, Cabut',
    })
    if (!ok) return
    try {
      await deleteOrganizationMember(member.id_organization_member)
      showToast(`Jabatan ${jabatanLabel} dicabut.`)
      loadData()
    } catch (err) {
      showToast(err.message || 'Gagal mencabut jabatan.', 'error')
    }
  }

  const desc = isAdmin
    ? 'Susunan kepengurusan penuh — kelurahan, dukuh, RW, RT, sekretaris & bendahara. Admin melihat semua wilayah (view-only).'
    : isDukuh
      ? 'Susunan kepengurusan dari Kepala Lurah hingga RT. Anda dapat membuat data lalu mengangkat Ketua RW / Ketua RT di dukuh Anda.'
      : isLurah
        ? 'Susunan kepengurusan seluruh kelurahan. Anda dapat membuat data lalu mengangkat Kepala Dukuh.'
        : 'Susunan kepengurusan di lingkungan Anda, dari Kepala Lurah hingga RT.'

  const addJabatan = addModal.type ? JABATAN[addModal.type] : ''
  const addNodes = addModal.type ? targetNodes(addModal.type) : []
  const availableCitizens = form.id_wilayah ? citizens.filter((c) => {
    if (addModal.type === 'dukuh') {
      const kelId = wilayahs.find(w => w.tipe === 'KELURAHAN')?.id_wilayah;
      return c.id_wilayah === kelId;
    }
    if (addModal.type === 'rw' || addModal.type === 'rt') {
      const wantJabatan = addModal.type === 'rw' ? 'RW' : 'RT';
      return c.id_wilayah === currentDukuh?.id_wilayah && c.calon_jabatan === wantJabatan;
    }
    if (addModal.type === 'sek' || addModal.type === 'ben') {
      return c.id_wilayah === myRtId;
    }
    return c.id_wilayah === form.id_wilayah;
  }) : []

  const adminLurahAll = useMemo(() => {
    if (!isAdmin) return []
    return tree.kelurahanList.map((kel) => {
      const m = members.find((x) => x.jabatan?.toLowerCase().includes('kepala lurah') && x.id_wilayah === kel.id_wilayah)
      return m ? { nama_users: m.citizen?.nama_lengkap || 'Kepala Lurah', kelurahan: kel.nama_wilayah, kelurahanId: kel.id_wilayah } : null
    }).filter(Boolean)
  }, [isAdmin, tree.kelurahanList, members])

  const adminLurahForTab = useMemo(() => {
    if (isAdmin) return null
    return lurah
  }, [isAdmin, lurah])

  if (loading) {
    return (
      <PageShell eyebrow="Struktur Organisasi" title="Struktur Organisasi & Kepengurusan" description="">
        <div className="rounded-xl border border-neutral-200 bg-white p-8 text-center text-sm text-neutral-500">Memuat data struktur organisasi...</div>
      </PageShell>
    )
  }

  return (
    <PageShell
      eyebrow="Struktur Organisasi"
      title="Struktur Organisasi & Kepengurusan"
      description={isAdmin ? 'View-only — tab per wilayah Lurah, tiap tab memuat struktur kelurahan tersebut.' : desc}
    >
      <section className="mx-auto mt-6 max-w-4xl space-y-6">
        {isAdmin && adminKelurahanList.length > 0 && (
          <div className="flex flex-wrap gap-2 border-b border-neutral-200 pb-3" role="tablist" aria-label="Wilayah Lurah">
            {adminKelurahanList.map((kel) => (
              <button
                key={kel.id_wilayah}
                role="tab"
                aria-selected={adminActiveKelurahanId === kel.id_wilayah}
                onClick={() => setAdminActiveKelurahanId(kel.id_wilayah)}
                className={`rounded-full border px-5 py-2 text-xs font-extrabold transition ${
                  adminActiveKelurahanId === kel.id_wilayah
                    ? 'border-black bg-black text-white'
                    : 'border-neutral-300 bg-white text-neutral-700 hover:border-black hover:bg-neutral-100'
                }`}
              >
                {kel.nama_wilayah}
              </button>
            ))}
          </div>
        )}

        {/* Kepala Lurah — admin tampilkan semua kelurahan */}
        {isAdmin && adminLurahAll.length > 0 && (
          <div className="flex flex-wrap justify-center gap-4">
            {adminLurahAll.map((lurahItem) => (
              <div key={lurahItem.kelurahanId} className="flex w-full max-w-sm flex-col items-center rounded-2xl border border-neutral-300 bg-white px-8 py-6 shadow-sm">
                <Avatar member={{ citizen: { nama_lengkap: lurahItem.nama_users } }} size="lg" />
                <p className="mt-3 text-base font-bold text-black">{lurahItem.nama_users}</p>
                <span className="mt-1 inline-block rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-emerald-700">Kepala Lurah</span>
                <p className="mt-1 text-xs text-neutral-400">{lurahItem.kelurahan}</p>
              </div>
            ))}
          </div>
        )}
        {!isAdmin && adminLurahForTab && (
          <div className="flex justify-center">
            <div className="flex w-full max-w-sm flex-col items-center rounded-2xl border border-neutral-300 bg-white px-8 py-6 shadow-sm">
              <Avatar member={{ citizen: { nama_lengkap: adminLurahForTab.nama_users } }} size="lg" />
              <p className="mt-3 text-base font-bold text-black">{adminLurahForTab.nama_users}</p>
              <span className="mt-1 inline-block rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-emerald-700">Kepala Lurah</span>
            </div>
          </div>
        )}

        {/* Pilih Dukuh (LURAH) + tombol Tambah Kepala Dukuh sejajar */}
        {isLurah && (
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              {(lurahDukuhList.length > 1 ? lurahDukuhList : tree.dukuhList).length > 1 && (lurahDukuhList.length > 0 ? lurahDukuhList : tree.dukuhList).map((d) => (
                <button
                  key={d.id_wilayah}
                  onClick={() => setSelectedDukuhId(d.id_wilayah)}
                  className={`rounded-full border px-5 py-2 text-xs font-extrabold transition ${
                    activeDukuhId === d.id_wilayah
                      ? 'border-black bg-black text-white'
                      : 'border-neutral-300 bg-white text-neutral-700 hover:border-black hover:bg-neutral-100'
                  }`}
                >
                  {d.nama_wilayah}
                </button>
              ))}
            </div>
            {canManageDukuh && (
              <button
                onClick={() => openAdd('dukuh')}
                className="flex items-center gap-2 rounded-full bg-black px-5 py-2 text-xs font-extrabold uppercase tracking-wide text-white transition hover:bg-neutral-800"
              >
                <Icon name="userPlus" className="h-4 w-4" />
                Tambah Kepala Dukuh
              </button>
            )}
          </div>
        )}

        {/* Kepala Dukuh (list per dukuh) */}
        {visibleDukuhs.length > 0 && (
          <>
            <SectionHeading>Kepala Dukuh</SectionHeading>
            <div className="space-y-4">
              {visibleDukuhs.map((dk) => {
                const dkMember = getDukuhMember(dk.id_wilayah)
                return (
                  <div key={dk.id_wilayah} className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
                    <div className="mb-3 flex items-center gap-2">
                      <Icon name="building" className="h-4 w-4 text-neutral-400" />
                      <p className="text-sm font-extrabold text-black">{dk.nama_wilayah}</p>
                    </div>
                    <div className="divide-y divide-neutral-200 rounded-lg bg-white px-4">
                      {dkMember ? (
                        <div className="flex items-center gap-4 py-3">
                          <Avatar member={dkMember} size="lg" />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-bold text-black truncate">{dkMember.citizen?.nama_lengkap || 'Tidak Diketahui'}</p>
                            <p className="text-xs font-extrabold uppercase tracking-wide text-sky-600">Kepala Dukuh</p>
                          </div>
                          {canManageDukuh && (
                            <button
                              onClick={() => handleRemove(dkMember, 'Kepala Dukuh')}
                              className="rounded-full bg-neutral-100 px-3 py-1 text-[10px] font-bold uppercase text-neutral-500 transition hover:bg-red-100 hover:text-red-600"
                            >
                              Cabut
                            </button>
                          )}
                        </div>
                      ) : (
                        <p className="py-3 text-xs text-neutral-400 italic">Kepala Dukuh belum ditunjuk</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}

        {/* Pengurus RW */}
        {visibleDukuhs.length > 0 && (
          <>
            <SectionHeading>Pengurus RW</SectionHeading>
            {canManageRw && (
              <div className="flex flex-wrap justify-center gap-2">
                <button
                  onClick={() => openAdd('rw')}
                  className="flex items-center gap-2 rounded-full bg-black px-5 py-2.5 text-xs font-extrabold uppercase tracking-wide text-white transition hover:bg-neutral-800"
                >
                  <Icon name="userPlus" className="h-4 w-4" />
                  Tambah Ketua RW
                </button>
                <button
                  onClick={() => openAdd('rt')}
                  className="flex items-center gap-2 rounded-full border border-neutral-300 bg-white px-5 py-2.5 text-xs font-extrabold uppercase tracking-wide text-neutral-700 transition hover:border-black hover:bg-neutral-100"
                >
                  <Icon name="userPlus" className="h-4 w-4" />
                  Tambah Ketua RT
                </button>
              </div>
            )}

            <div className="space-y-4">
              {visibleDukuhs.map((dk) => {
                const rwList = scopeRwOnly ? dk.rws.filter((rw) => rw.id_wilayah === myRwId) : dk.rws
                return (
                <div key={dk.id_wilayah} className="space-y-3">
                  {rwList.length === 0 && (
                    <p className="rounded-xl border border-neutral-200 bg-white p-4 text-center text-xs text-neutral-400">Dukuh ini belum memiliki RW</p>
                  )}
                  {rwList.map((rw) => {
                    const rwMembers = getRwMembers(rw.id_wilayah)
                    return (
                      <div key={rw.id_wilayah} className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
                        <div className="mb-3 flex items-center gap-2">
                          <Icon name="building" className="h-4 w-4 text-neutral-400" />
                          <p className="text-sm font-extrabold text-black">{rw.nama_wilayah}</p>
                        </div>
                        <div className="divide-y divide-neutral-200 rounded-lg bg-white px-4">
                          {rwMembers.length === 0 ? (
                            <p className="py-3 text-xs text-neutral-400 italic">Belum ada pengurus</p>
                          ) : rwMembers.map((m) => (
                            <div key={m.id_organization_member} className="flex items-center gap-4 py-3">
                              <Avatar member={m} size="md" />
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-bold text-black truncate">{m.citizen?.nama_lengkap || 'Tidak Diketahui'}</p>
                                <p className="text-xs font-extrabold uppercase tracking-wide text-sky-600">{m.jabatan}</p>
                              </div>
                              {m.jabatan?.toLowerCase().includes('ketua rw') && canManageRw && (
                                <button
                                  onClick={() => handleRemove(m, 'Ketua RW')}
                                  className="rounded-full bg-neutral-100 px-3 py-1 text-[10px] font-bold uppercase text-neutral-500 transition hover:bg-red-100 hover:text-red-600"
                                >
                                  Cabut
                                </button>
                              )}
                            </div>
                          ))}
                        </div>

                        {rw.rts.filter((rt) => (isRwRole || isDukuh || isLurah) ? true : rt.id_wilayah === myRtId).map((rt) => (
                          <div key={rt.id_wilayah} className="mt-3 rounded-lg border border-neutral-200 bg-white px-4">
                            <div className="flex items-center gap-2 border-b border-neutral-100 py-2">
                              <Icon name="building" className="h-3.5 w-3.5 text-neutral-400" />
                              <p className="text-xs font-extrabold text-black">{rt.nama_wilayah}</p>
                              {canManageSekBen && (
                                <div className="ml-auto flex gap-2">
                                  <button
                                    onClick={() => openAdd('sek')}
                                    className="rounded-full bg-black px-3 py-1 text-[10px] font-bold uppercase text-white transition hover:bg-neutral-800"
                                  >
                                    Tambah Sekretaris
                                  </button>
                                  <button
                                    onClick={() => openAdd('ben')}
                                    className="rounded-full border border-neutral-300 bg-white px-3 py-1 text-[10px] font-bold uppercase text-neutral-700 transition hover:border-black"
                                  >
                                    Tambah Bendahara
                                  </button>
                                </div>
                              )}
                            </div>
                            {getRtMembers(rt.id_wilayah).length === 0 ? (
                              <p className="py-2 text-[11px] text-neutral-400 italic">Belum ada pengurus RT</p>
                            ) : (
                              <div className="divide-y divide-neutral-100">
                                {getRtMembers(rt.id_wilayah).map((m) => (
                                  <div key={m.id_organization_member} className="flex items-center gap-3">
                                    <div className="min-w-0 flex-1">
                                      <OfficialRow member={m} />
                                    </div>
                                    {canManageSekBen && (m.jabatan === 'Sekretaris' || m.jabatan === 'Bendahara') && (
                                      <button
                                        onClick={() => handleRemove(m, m.jabatan)}
                                        className="shrink-0 rounded-full bg-neutral-100 px-3 py-1 text-[10px] font-bold uppercase text-neutral-500 transition hover:bg-red-100 hover:text-red-600"
                                      >
                                        Cabut
                                      </button>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )
                  })}
                </div>
                )
              })}
            </div>
          </>
        )}

        {/* Orphan RW/RT: tampilkan meski tidak terikat Dukuh agar Michael tetap muncul saat hierarki belum rapi */}
        {(tree.orphanRws?.length > 0 || tree.orphanRts?.length > 0) && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-xs font-bold text-amber-800">Perlu penataan hierarki: beberapa wilayah belum terikat induk (RW tanpa Dukuh atau RT tanpa RW). Perbaiki di Admin → Manajemen Wilayah.</p>
            {tree.orphanRws.length > 0 && (
              <div className="mt-3 space-y-3">
                <p className="text-xs font-extrabold uppercase tracking-wide text-neutral-500">RW tanpa Dukuh ({tree.orphanRws.length})</p>
                {tree.orphanRws.map((rw) => {
                  const rwOrphanMembers = getRwMembers(rw.id_wilayah)
                  return (
                    <div key={rw.id_wilayah} className="rounded-lg border border-amber-200 bg-white p-3">
                      <p className="text-xs font-bold text-black">{rw.nama_wilayah} — {rw.id_wilayah} <span className="text-amber-600">({rw._orphanReason})</span></p>
                      {rw.rts.length > 0 && (
                        <div className="mt-2 space-y-2">
                          {rw.rts.map((rt) => (
                            <div key={rt.id_wilayah} className="rounded border border-neutral-200 bg-neutral-50 px-3 py-2">
                              <p className="text-xs font-bold text-black">{rt.nama_wilayah} — {rt.id_wilayah}</p>
                              {getRtMembers(rt.id_wilayah).length === 0 ? (
                                <p className="text-[11px] text-neutral-400 italic">Belum ada pengurus RT</p>
                              ) : getRtMembers(rt.id_wilayah).map((m) => <OfficialRow key={m.id_organization_member} member={m} />)}
                            </div>
                          ))}
                        </div>
                      )}
                      {rwOrphanMembers.length > 0 && (
                        <div className="mt-2 divide-y divide-neutral-100">
                          {rwOrphanMembers.map((m) => (
                            <div key={m.id_organization_member} className="flex items-center gap-3 py-2">
                              <Avatar member={m} size="md" />
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-bold text-black truncate">{m.citizen?.nama_lengkap || '?'}</p>
                                <p className="text-xs font-extrabold uppercase tracking-wide text-sky-600">{m.jabatan}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
            {tree.orphanRts.length > 0 && (
              <div className="mt-3">
                <p className="text-xs font-extrabold uppercase tracking-wide text-neutral-500">RT tanpa RW ({tree.orphanRts.length})</p>
                <div className="mt-2 space-y-2">
                  {tree.orphanRts.map((rt) => (
                    <div key={rt.id_wilayah} className="rounded border border-neutral-200 bg-white px-3 py-2">
                      <p className="text-xs font-bold text-black">{rt.nama_wilayah} — {rt.id_wilayah}</p>
                      {getRtMembers(rt.id_wilayah).length === 0 ? (
                        <p className="text-[11px] text-neutral-400 italic">Belum ada pengurus RT</p>
                      ) : getRtMembers(rt.id_wilayah).map((m) => <OfficialRow key={m.id_organization_member} member={m} />)}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {visibleDukuhs.length === 0 && tree.orphanRws.length === 0 && tree.orphanRts.length === 0 && (
          <p className="rounded-xl border border-neutral-200 bg-white p-8 text-center text-sm text-neutral-500">
            Belum ada data struktur organisasi.
          </p>
        )}
      </section>

      {/* Modal: Angkat Jabatan */}
      <Dialog open={addModal.open} onOpenChange={(v) => setAddModal((m) => ({ ...m, open: v }))}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Angkat {addJabatan}</DialogTitle>
            <DialogDescription>
              Pilih calon {addJabatan} dari data yang sudah dibuat.
            </DialogDescription>
          </DialogHeader>

          {/* Angkat — single flat grouped select */}
          <form onSubmit={handleAppoint} className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-bold text-black">Wilayah Penugasan <span className="text-red-500">*</span></Label>
              <Select value={form.id_wilayah} onValueChange={(v) => setForm({ ...form, id_wilayah: v })}>
                <SelectTrigger><SelectValue placeholder="-- Pilih Wilayah --" /></SelectTrigger>
                <SelectContent>
                  {modalWilayahOptions.length === 0 ? (
                    <SelectItem value="__none__" disabled>
                      {(() => {
                        const type = addModal.type
                        if (type === 'rw') return 'Belum ada RW dengan induk Dukuh — buat di Manajemen Wilayah'
                        if (type === 'rt' || type === 'sek' || type === 'ben') return 'Belum ada RT dengan induk RW — buat di Manajemen Wilayah'
                        if (type === 'dukuh') return 'Belum ada Dukuh dengan induk Kelurahan — buat di Manajemen Wilayah'
                        return 'Belum ada wilayah'
                      })()}
                    </SelectItem>
                  ) : modalWilayahOptions.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-neutral-500">
                {(() => {
                  const type = addModal.type
                  if (type === 'rw') return 'Ketua RW: hanya RW yang parent-nya Dukuh (hierarki lengkap ditampilkan).'
                  if (type === 'rt' || type === 'sek' || type === 'ben') return 'Ketua RT / Sekretaris / Bendahara: hanya RT yang parent-nya RW.'
                  if (type === 'dukuh') return 'Kepala Dukuh: hanya Dukuh yang parent-nya Kelurahan.'
                  return ''
                })()}
              </p>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-bold text-black">Pilih Calon <span className="text-red-500">*</span></Label>
              <Select value={form.id_citizen} onValueChange={(v) => setForm({ ...form, id_citizen: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="-- Pilih Calon Pengurus --" />
                </SelectTrigger>
                  <SelectContent>
                    {availableCitizens.length === 0 ? (
                      <SelectItem value="__none__" disabled>Tidak ada calon di wilayah ini.</SelectItem>
                    ) : availableCitizens.map((c) => (
                      <SelectItem key={c.id_citizen} value={c.id_citizen}>
                        {c.nama_lengkap}
                      </SelectItem>
                    ))}
                  </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-bold text-black">Periode Mulai <span className="text-red-500">*</span></Label>
              <Input type="date" required value={form.periode_mulai} onChange={(e) => setForm({ ...form, periode_mulai: e.target.value })} />
            </div>
            <DialogFooter className="flex-col gap-3 sm:flex-row">
              <button type="button" onClick={() => setAddModal((m) => ({ ...m, open: false }))} className="rounded-full px-5 py-2.5 text-sm font-bold text-neutral-500 hover:bg-neutral-100">
                Tutup
              </button>
              <button type="submit" disabled={isSubmitting} className="rounded-full bg-black px-6 py-2.5 text-sm font-bold text-white hover:bg-neutral-800 disabled:opacity-50">
                Angkat {addJabatan}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </PageShell>
  )
}
