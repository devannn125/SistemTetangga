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
        getOrganizationMembers({ per_page: 100 }),
        getWilayah({ per_page: 100, all: 1 }),
        getCitizens({ per_page: 100 }).catch(() => null),
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
    if (wilayahs.length === 0) return { kelurahan: null, dukuhList: [], kelurahanList: [] }
    const kelurahanList = wilayahs
      .filter((w) => w.tipe === 'KELURAHAN')
      .sort((a, b) => a.nama_wilayah.localeCompare(b.nama_wilayah))
    const kelurahan = kelurahanList[0] || null
    if (kelurahanList.length === 0) return { kelurahan: null, dukuhList: [], kelurahanList }

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

    return { kelurahan, dukuhList, kelurahanList }
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
    const kelId = adminActiveKelurahanId || tree.kelurahan?.id_wilayah
    if (!kelId) return []
    return wilayahs
      .filter((w) => w.parent_id === kelId && w.tipe === 'DUKUH')
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
  }, [isAdmin, adminActiveKelurahanId, tree.kelurahan, wilayahs])

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
  const visibleDukuhs = useMemo(() => {
    if (isAdmin) return adminDukuhList
    if (isDukuh) return currentDukuh ? [currentDukuh] : []
    if (isLurah) {
      const list = lurahDukuhList.length ? lurahDukuhList : tree.dukuhList
      const sel = list.find((d) => d.id_wilayah === activeDukuhId)
      return sel ? [sel] : list.slice(0, 1)
    }
    if (myRwId) return tree.dukuhList.filter((d) => d.rws.some((rw) => rw.id_wilayah === myRwId))
    if (myDukuhFromWilayah) return tree.dukuhList.filter((d) => d.id_wilayah === myDukuhFromWilayah)
    // ponytail: tampil semua dukuh sebagai fallback read-only; rapikan ke scope kelurahan saat RBAC matang
    if (authRoles.length > 0) return tree.dukuhList
    return []
  }, [isAdmin, adminDukuhList, isDukuh, isLurah, currentDukuh, tree.dukuhList, myRwId, activeDukuhId, lurahDukuhList, myDukuhFromWilayah, authRoles])

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

  const openAdd = (type) => {
    const nodes = targetNodes(type)
    setForm({ id_citizen: '', id_wilayah: nodes[0]?.id_wilayah || '', periode_mulai: new Date().toISOString().split('T')[0] })
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

  const adminLurahForTab = useMemo(() => {
    if (!isAdmin) return lurah
    const m = members.find((x) => x.jabatan?.toLowerCase().includes('kepala lurah') && x.id_wilayah === adminActiveKelurahanId)
    return m ? { nama_users: m.citizen?.nama_lengkap || 'Kepala Lurah' } : null
  }, [isAdmin, lurah, members, adminActiveKelurahanId])

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

        {/* Kepala Lurah — sembunyikan jika belum diangkat */}
        {adminLurahForTab && (
          <div className="flex justify-center">
            <div className="flex w-full max-w-sm flex-col items-center rounded-2xl border border-neutral-300 bg-white px-8 py-6 shadow-sm">
              <Avatar member={{ citizen: { nama_lengkap: adminLurahForTab.nama_users } }} size="lg" />
              <p className="mt-3 text-base font-bold text-black">{adminLurahForTab.nama_users}</p>
              <span className="mt-1 inline-block rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-emerald-700">Kepala Lurah</span>
              {isAdmin && <p className="mt-1 text-xs text-neutral-400">{wilayahs.find((w) => w.id_wilayah === adminActiveKelurahanId)?.nama_wilayah || ''}</p>}
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

        {visibleDukuhs.length === 0 && (
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

          {/* Angkat */}
          <form onSubmit={handleAppoint} className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-bold text-black">Wilayah Penugasan <span className="text-red-500">*</span></Label>
              <Select value={form.id_wilayah} onValueChange={(v) => setForm({ ...form, id_wilayah: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="-- Pilih Wilayah --" />
                </SelectTrigger>
                <SelectContent>
                  {addNodes.length === 0 ? (
                    <SelectItem value="__none__" disabled>Belum ada wilayah</SelectItem>
                  ) : addNodes.map((n) => (
                    <SelectItem key={n.id_wilayah} value={n.id_wilayah}>
                      {n._rwLabel ? `${n._rwLabel} - ${n.nama_wilayah}` : n.nama_wilayah}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
