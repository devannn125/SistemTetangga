import { useEffect, useMemo, useState } from 'react'
import { PageShell } from '@/components/layout/PageShell'
import { request, getWilayah, impersonateUser } from '@/services/api'
import { getAuthData, setAuthData } from '@/services/authService'
import { DataTable } from '@/components/ui/DataTable'
import { Button } from '@/components/ui/Button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/Dialog'
import { Label } from '@/components/ui/Label'
import { Input } from '@/components/ui/Input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { useConfirm } from '@/components/ui/ConfirmContext'
import { useToast } from '@/components/ui/ToastContext'

export default function AdminUsersPage() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [wilayahs, setWilayahs] = useState([])
  const confirm = useConfirm()
  const { showToast } = useToast()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({
    nama_users: '',
    email: '',
    no_hp: '',
    password: '',
    nik: '',
    jenis_kelamin: 'L',
    id_wilayah: '',
  })

  // ponytail: 4-level kaskade Kelurahan→Dukuh→RW→RT, kirim RT saja (id_wilayah). Validasi parent chain di BE bila perlu.
  const kelurahanOptions = useMemo(() => wilayahs.filter((w) => w.tipe === 'KELURAHAN').sort((a,b)=>a.nama_wilayah.localeCompare(b.nama_wilayah)), [wilayahs])
  const wilayahMap = useMemo(() => new Map(wilayahs.map((w) => [w.id_wilayah, w])), [wilayahs])
  const chain = useMemo(() => {
    const byId = wilayahMap
    const rt = byId.get(form.id_wilayah)
    if (!rt || rt.tipe !== 'RT') return { kelurahanId: '', dukuhId: '', rwId: '', rtId: form.id_wilayah || '' }
    const rw = rt.parent_id ? byId.get(rt.parent_id) : null
    const dukuh = rw?.parent_id ? byId.get(rw.parent_id) : null
    const kel = dukuh?.parent_id ? byId.get(dukuh.parent_id) : null
    return { kelurahanId: kel?.id_wilayah || '', dukuhId: dukuh?.id_wilayah || '', rwId: rw?.id_wilayah || '', rtId: rt.id_wilayah }
  }, [form.id_wilayah, wilayahMap])
  const dukuhOptions = useMemo(() => chain.kelurahanId ? wilayahs.filter((w) => w.tipe === 'DUKUH' && w.parent_id === chain.kelurahanId).sort((a,b)=>a.nama_wilayah.localeCompare(b.nama_wilayah)) : [], [wilayahs, chain.kelurahanId])
  const rwOptions = useMemo(() => chain.dukuhId ? wilayahs.filter((w) => w.tipe === 'RW' && w.parent_id === chain.dukuhId).sort((a,b)=>a.nama_wilayah.localeCompare(b.nama_wilayah)) : [], [wilayahs, chain.dukuhId])
  const rtOptions = useMemo(() => chain.rwId ? wilayahs.filter((w) => w.tipe === 'RT' && w.parent_id === chain.rwId).sort((a,b)=>a.nama_wilayah.localeCompare(b.nama_wilayah)) : wilayahs.filter((w) => w.tipe === 'RT').sort((a,b)=>a.nama_wilayah.localeCompare(b.nama_wilayah)), [wilayahs, chain.rwId])

  function alamatLengkapFor(idWilayah) {
    if (!idWilayah || wilayahMap.size === 0) return '-'
    let cur = wilayahMap.get(idWilayah)
    if (!cur) return idWilayah
    const parts = []
    let guard = 0
    while (cur && guard < 10) {
      parts.unshift(cur.nama_wilayah)
      if (!cur.parent_id) break
      cur = wilayahMap.get(cur.parent_id)
      guard++
    }
    return parts.join(' / ') || '-'
  }

  const enrichedData = useMemo(() => {
    return data.map((r) => {
      const cit = r.citizen || {}
      const wilId = cit.id_wilayah || cit.wilayah?.id_wilayah || null
      const domisili = wilId ? alamatLengkapFor(wilId) : (cit.wilayah?.nama_wilayah || '-')
      const activeRole = r.user_roles?.find(ur => ur.status === 'ACTIVE')
      const roleDisp = activeRole?.kode || r.role || (Array.isArray(r.roles) && r.roles[0]) || 'WARGA'
      return {
        ...r,
        nik: cit.nik || r.nik || '-',
        jenis_kelamin_label: cit.jenis_kelamin === 'L' ? 'Laki-laki' : cit.jenis_kelamin === 'P' ? 'Perempuan' : (cit.jenis_kelamin || '-'),
        no_hp_display: r.no_hp || cit.no_hp || '-',
        email_display: r.email || cit.email || '-',
        domisili,
        role_display: roleDisp,
      }
    })
  }, [data, wilayahMap])

  function pickFirstRtFor(kelId, dukuhId, rwId) {
    // helper: cari RT pertama yang valid di rantai kel→dukuh→rw
    const firstDukuh = dukuhId || wilayahs.find((w) => w.tipe === 'DUKUH' && w.parent_id === kelId)?.id_wilayah
    const firstRw = rwId || (firstDukuh ? wilayahs.find((w) => w.tipe === 'RW' && w.parent_id === firstDukuh)?.id_wilayah : null)
    const firstRt = firstRw ? wilayahs.find((w) => w.tipe === 'RT' && w.parent_id === firstRw)?.id_wilayah : null
    return { firstDukuh, firstRw, firstRt }
  }

  async function loadData() {
    setLoading(true)
    try {
      const [res, resWil] = await Promise.all([
        request('/users?per_page=200'),
        getWilayah({ per_page: 500, all: 1 }).catch(() => ({ data: [] })),
      ])
      setData(Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [])
      const arrWil = Array.isArray(resWil?.data) ? resWil.data : Array.isArray(resWil) ? resWil : []
      setWilayahs(arrWil)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  function openCreate() {
    let rtId = ''
    const kel = wilayahs.find((w) => w.tipe === 'KELURAHAN')
    if (kel) {
      const dukuh = wilayahs.find((w) => w.tipe === 'DUKUH' && w.parent_id === kel.id_wilayah)
      if (dukuh) {
        const rw = wilayahs.find((w) => w.tipe === 'RW' && w.parent_id === dukuh.id_wilayah)
        if (rw) rtId = wilayahs.find((w) => w.tipe === 'RT' && w.parent_id === rw.id_wilayah)?.id_wilayah || ''
      }
    }
    if (!rtId) rtId = wilayahs.find((w) => w.tipe === 'RT')?.id_wilayah || ''
    setEditingId(null)
    setForm({
      nama_users: '',
      email: '',
      no_hp: '',
      password: '',
      nik: '',
      jenis_kelamin: 'L',
      id_wilayah: rtId,
    })
    setIsModalOpen(true)
  }

  function openEdit(row) {
    const cit = row.citizen || {}
    const wilId = cit.id_wilayah || cit.wilayah?.id_wilayah || row.id_wilayah || ''
    setEditingId(row.id_users)
    setForm({
      nama_users: row.nama_users || cit.nama_lengkap || '',
      email: row.email || cit.email || '',
      no_hp: row.no_hp || cit.no_hp || '',
      password: '',
      nik: cit.nik || row.nik || '',
      jenis_kelamin: cit.jenis_kelamin || 'L',
      id_wilayah: wilId,
    })
    setIsModalOpen(true)
  }

  function handleKelurahanChange(kelId) {
    const { firstRt } = pickFirstRtFor(kelId, '', '')
    setForm((f) => ({ ...f, id_wilayah: firstRt || '' }))
  }
  function handleDukuhChange(dukuhId) {
    const rw = wilayahs.find((w) => w.tipe === 'RW' && w.parent_id === dukuhId)?.id_wilayah || ''
    const rt = rw ? wilayahs.find((w) => w.tipe === 'RT' && w.parent_id === rw)?.id_wilayah || '' : ''
    setForm((f) => ({ ...f, id_wilayah: rt || f.id_wilayah }))
  }
  function handleRwChange(rwId) {
    const rt = wilayahs.find((w) => w.tipe === 'RT' && w.parent_id === rwId)?.id_wilayah || ''
    setForm((f) => ({ ...f, id_wilayah: rt || f.id_wilayah }))
  }

  async function handleSave() {
    const isEdit = !!editingId
    if (!form.nama_users.trim() || !form.email.trim() || !form.no_hp.trim() || !form.nik.trim() || !form.id_wilayah) {
      showToast('Nama, email, no HP, NIK, dan domisili (Kelurahan/Dukuh/RW/RT) wajib diisi.', 'error')
      return
    }
    if (!/^[0-9]{16}$/.test(form.nik)) {
      showToast('NIK harus 16 digit angka saja.', 'error')
      return
    }
    if (!isEdit && form.password.length < 6) {
      showToast('Password minimal 6 karakter.', 'error')
      return
    }
    if (isEdit && form.password && form.password.length < 6) {
      showToast('Password minimal 6 karakter (kosongkan bila tidak diubah).', 'error')
      return
    }

    const ok = await confirm({
      title: isEdit ? 'Ubah Pengguna' : 'Buat Akun WARGA',
      message: isEdit ? `Simpan perubahan untuk ${form.nama_users}?` : `Buat akun ${form.nama_users} dengan NIK ${form.nik}? Data citizen akan dibuat otomatis dan terbaca di Perangkat Desa.`,
      confirmLabel: isEdit ? 'Ya, Simpan' : 'Ya, Buat',
    })
    if (!ok) return

    try {
      if (isEdit) {
        const payload = {
          nama_users: form.nama_users,
          email: form.email,
          no_hp: form.no_hp,
          nik: form.nik,
          jenis_kelamin: form.jenis_kelamin,
          id_wilayah: form.id_wilayah,
        }
        if (form.password) payload.password = form.password
        await request(`/users/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        })
        setIsModalOpen(false)
        setEditingId(null)
        loadData()
        showToast('Data pengguna berhasil diperbarui.')
      } else {
        await request('/users', {
          method: 'POST',
          body: JSON.stringify({
            nama_users: form.nama_users,
            email: form.email,
            no_hp: form.no_hp,
            password: form.password,
            nik: form.nik,
            jenis_kelamin: form.jenis_kelamin,
            id_wilayah: form.id_wilayah,
            status: 'ACTIVE',
            auth_provider: 'EMAIL',
            role: 'WARGA',
          })
        })
        setIsModalOpen(false)
        loadData()
        showToast('Akun WARGA + data citizen berhasil dibuat.')
      }
    } catch (err) {
      showToast(err.message || 'Gagal menyimpan', 'error')
    }
  }

  async function handleDelete(row) {
    const ok = await confirm({
      title: 'Nonaktifkan Pengguna',
      message: `Nonaktifkan akun ${row.nama_users} (${row.email})? Akun jadi INACTIVE dan warga jadi tidak aktif.`,
      confirmLabel: 'Ya, Nonaktifkan',
    })
    if (!ok) return
    try {
      await request(`/users/${row.id_users}`, { method: 'DELETE' })
      loadData()
      showToast('Akun dinonaktifkan.')
    } catch (err) {
      showToast(err.message || 'Gagal menghapus', 'error')
    }
  }

  async function handleImpersonate(row) {
    const ok = await confirm({
      title: 'Masuk Sebagai',
      message: `Anda akan login ke sistem sebagai "${row.nama_users}" (Role: ${row.role_display}). Segala aktivitas yang Anda lakukan akan tercatat atas nama pengguna ini.`,
      confirmLabel: 'Ya, Masuk Sebagai Pengguna Ini',
    })
    if (!ok) return
    try {
      const res = await impersonateUser(row.id_users)
      
      // Simpan data admin asli ke localStorage agar bisa "Kembali"
      if (!localStorage.getItem('originalAuthToken')) {
        localStorage.setItem('originalAuthToken', localStorage.getItem('authToken'))
        localStorage.setItem('originalAuthUser', localStorage.getItem('authUser'))
        localStorage.setItem('originalAuthRole', localStorage.getItem('authRole'))
        localStorage.setItem('originalAuthNik', localStorage.getItem('authNik'))
      }

      setAuthData(res)
      const uData = res.data || res
      const aRole = uData.user_roles?.find(ur => ur.status === 'ACTIVE')
      const rKode = (aRole?.kode || uData.role?.kode || (typeof uData.role === 'string' ? uData.role : '')).toLowerCase()
      const roleLower = rKode === 'warga' ? 'warga' : rKode
      const fallbackDest =
        ['warga', 'siskamling', 'pkk', 'karang_taruna'].includes(roleLower)
          ? '/warga'
          : roleLower === 'sekretaris'
            ? '/sek'
            : roleLower === 'bendahara'
              ? '/ben'
              : roleLower === 'dukuh'
                ? '/dukuh'
                : roleLower === 'lurah'
                  ? '/kelurahan'
                  : roleLower === 'admin'
                    ? '/admin'
                    : ['rt', 'rw'].includes(roleLower)
                      ? `/${roleLower}`
                      : `/role/${roleLower}`
      window.location.href = uData.redirect_to || fallbackDest
    } catch (err) {
      showToast(err.message || 'Gagal masuk sebagai pengguna tersebut.', 'error')
    }
  }

  return (
    <PageShell
      eyebrow='Pengaturan Sistem'
      title='Manajemen Pengguna'
      description='Kelola seluruh akun. Buat akun baru — otomatis jadi data warga (NIK angka 16 + domisili RT) dan terbaca di Perangkat Desa.'
    >
      <div className='mt-6 mb-4'>
        <Button onClick={openCreate}>Tambah Pengguna Baru</Button>
      </div>

      <DataTable
        data={enrichedData}
        loading={loading}
        searchPlaceholder='Cari nama, NIK, email, atau alamat...'
        getRowKey={(row) => row.id_users}
        columns={[
          { key: 'nama_users', label: 'Nama Pengguna', render: (val, row) => (
            <div>
              <div className="font-bold leading-tight">{val}</div>
              {row.citizen && <div className="text-xs text-neutral-500">Warga: {row.citizen.nama_lengkap}</div>}
              <div className="text-xs text-neutral-500">{row.no_hp_display} · {row.email_display}</div>
            </div>
          ) },
          { key: 'nik', label: 'NIK', render: (val) => <span className="font-mono text-xs">{val}</span> },
          { key: 'jenis_kelamin_label', label: 'JK' },
          { key: 'domisili', label: 'Domisili (Kelurahan / Dukuh / RW / RT)', render: (val) => <span className="text-xs leading-tight block max-w-[260px] whitespace-normal">{val}</span> },
          { key: 'role_display', label: 'Role', render: (val) => <span className="px-2 py-1 rounded-full text-xs font-bold bg-neutral-100 text-neutral-700">{val}</span> },
          { key: 'status', label: 'Status', render: (val) => (
            <span className={`px-2 py-1 rounded-full text-xs font-bold ${val === 'ACTIVE' ? 'bg-green-100 text-green-700' : val === 'INACTIVE' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
              {val}
            </span>
          )},
          { key: 'actions', label: 'Aksi', render: (_, row) => {
            const currentAuth = getAuthData()
            const isSelf = currentAuth?.id_users === row.id_users
            return (
              <div className='flex flex-wrap gap-2'>
                {!isSelf && row.status === 'ACTIVE' && (
                  <Button size='sm' variant='outline' className='text-amber-600 border-amber-200 hover:bg-amber-50' onClick={() => handleImpersonate(row)}>
                    Masuk Sebagai
                  </Button>
                )}
                <Button size='sm' variant='outline' className='text-blue-600' onClick={() => openEdit(row)}>Edit</Button>
                {!isSelf && (
                  <Button size='sm' variant='outline' className='text-red-600 border-red-200 hover:bg-red-50' onClick={() => handleDelete(row)}>Hapus</Button>
                )}
              </div>
            )
          } }
        ]}
      />

      <Dialog open={isModalOpen} onOpenChange={(v) => { setIsModalOpen(v); if (!v) setEditingId(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Pengguna' : 'Buat Akun Pengguna Baru'}</DialogTitle>
          </DialogHeader>
          <div className='space-y-4 py-4 max-h-[60vh] overflow-y-auto pr-2'>
            <div className='space-y-2'>
              <Label>Nama Pengguna (Display Name)</Label>
              <Input value={form.nama_users} onChange={e => setForm({...form, nama_users: e.target.value})} placeholder="Contoh: Budi Santoso" />
            </div>
            <div className='grid gap-4 sm:grid-cols-2'>
              <div className='space-y-2'>
                <Label>Email</Label>
                <Input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
              </div>
              <div className='space-y-2'>
                <Label>No HP / WA</Label>
                <Input value={form.no_hp} onChange={e => setForm({...form, no_hp: e.target.value})} />
              </div>
            </div>
            <div className='grid gap-4 sm:grid-cols-2'>
              <div className='space-y-2'>
                <Label>NIK <span className="text-red-500">*</span></Label>
                <Input
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={16}
                  value={form.nik}
                  onChange={(e) => setForm({ ...form, nik: e.target.value.replace(/\D/g, '').slice(0, 16) })}
                  placeholder="16 digit angka"
                />
                <p className="text-xs text-neutral-500">{form.nik.length}/16 angka</p>
              </div>
              <div className='space-y-2'>
                <Label>Jenis Kelamin <span className="text-red-500">*</span></Label>
                <Select value={form.jenis_kelamin} onValueChange={(v) => setForm({ ...form, jenis_kelamin: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="L">Laki-laki</SelectItem>
                    <SelectItem value="P">Perempuan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className='grid gap-4 sm:grid-cols-2'>
              <div className='space-y-2'>
                <Label>Kelurahan <span className="text-red-500">*</span></Label>
                <Select value={chain.kelurahanId} onValueChange={handleKelurahanChange}>
                  <SelectTrigger><SelectValue placeholder="Pilih Kelurahan" /></SelectTrigger>
                  <SelectContent>
                    {kelurahanOptions.length === 0 ? <SelectItem value="__none__" disabled>Belum ada Kelurahan</SelectItem> : kelurahanOptions.map((w) => (
                      <SelectItem key={w.id_wilayah} value={w.id_wilayah}>{w.nama_wilayah}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className='space-y-2'>
                <Label>Dukuh <span className="text-red-500">*</span></Label>
                <Select value={chain.dukuhId} onValueChange={handleDukuhChange} disabled={!chain.kelurahanId}>
                  <SelectTrigger><SelectValue placeholder={chain.kelurahanId ? "Pilih Dukuh" : "Pilih Kelurahan dulu"} /></SelectTrigger>
                  <SelectContent>
                    {dukuhOptions.length === 0 ? <SelectItem value="__none__" disabled>{chain.kelurahanId ? "Belum ada Dukuh di Kelurahan ini" : "—"}</SelectItem> : dukuhOptions.map((w) => (
                      <SelectItem key={w.id_wilayah} value={w.id_wilayah}>{w.nama_wilayah}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className='grid gap-4 sm:grid-cols-2'>
              <div className='space-y-2'>
                <Label>RW <span className="text-red-500">*</span></Label>
                <Select value={chain.rwId} onValueChange={handleRwChange} disabled={!chain.dukuhId}>
                  <SelectTrigger><SelectValue placeholder={chain.dukuhId ? "Pilih RW" : "Pilih Dukuh dulu"} /></SelectTrigger>
                  <SelectContent>
                    {rwOptions.length === 0 ? <SelectItem value="__none__" disabled>{chain.dukuhId ? "Belum ada RW di Dukuh ini" : "—"}</SelectItem> : rwOptions.map((w) => (
                      <SelectItem key={w.id_wilayah} value={w.id_wilayah}>{w.nama_wilayah}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className='space-y-2'>
                <Label>RT (Domisili) <span className="text-red-500">*</span></Label>
                <Select value={chain.rtId} onValueChange={(v) => setForm({ ...form, id_wilayah: v })} disabled={!chain.rwId}>
                  <SelectTrigger><SelectValue placeholder={chain.rwId ? "Pilih RT" : "Pilih RW dulu"} /></SelectTrigger>
                  <SelectContent>
                    {rtOptions.length === 0 ? <SelectItem value="__none__" disabled>{chain.rwId ? "Belum ada RT di RW ini" : "—"}</SelectItem> : rtOptions.map((w) => (
                      <SelectItem key={w.id_wilayah} value={w.id_wilayah}>{w.nama_wilayah}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {chain.rtId && (
              <p className="text-xs text-neutral-600 bg-neutral-50 border rounded-lg px-3 py-2">
                Alamat: <span className="font-semibold">{kelurahanOptions.find(w=>w.id_wilayah===chain.kelurahanId)?.nama_wilayah || '-'}</span> / {dukuhOptions.find(w=>w.id_wilayah===chain.dukuhId)?.nama_wilayah || wilayahs.find(w=>w.id_wilayah===chain.dukuhId)?.nama_wilayah || '-'} / {rwOptions.find(w=>w.id_wilayah===chain.rwId)?.nama_wilayah || '-'} / {rtOptions.find(w=>w.id_wilayah===chain.rtId)?.nama_wilayah || '-'}
                <span className="text-neutral-400"> — dikirim sebagai RT: {chain.rtId}</span>
              </p>
            )}
            <div className='grid gap-4 sm:grid-cols-2'>
              <div className='space-y-2'>
                <Label>Role Awal</Label>
                <Input value="WARGA" disabled />
                <p className="text-xs text-neutral-500">Role ditentukan secara otomatis</p>
              </div>
              <div className='space-y-2'>
                <Label>Password {editingId ? '(kosongkan bila tidak diubah)' : '(Min. 6 Karakter)'} {!editingId && <span className="text-red-500">*</span>}</Label>
                <Input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder={editingId ? 'Kosongkan bila tidak ganti' : ''} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => { setIsModalOpen(false); setEditingId(null) }}>Batal</Button>
            <Button onClick={handleSave}>{editingId ? 'Simpan Perubahan' : 'Buat Akun WARGA'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageShell>
  )
}
