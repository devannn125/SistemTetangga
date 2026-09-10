import { useEffect, useState } from 'react'
import { PageShell } from '@/components/layout/PageShell'
import { request, getWilayah } from '@/services/api'
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
  const [form, setForm] = useState({
    nama_users: '',
    email: '',
    no_hp: '',
    password: '',
    nik: '',
    jenis_kelamin: 'L',
    id_wilayah: '',
  })

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
    const firstRt = wilayahs.find((w) => w.tipe === 'RT')?.id_wilayah || ''
    setForm({
      nama_users: '',
      email: '',
      no_hp: '',
      password: '',
      nik: '',
      jenis_kelamin: 'L',
      id_wilayah: firstRt,
    })
    setIsModalOpen(true)
  }

  async function handleSave() {
    if (!form.nama_users.trim() || !form.email.trim() || !form.no_hp.trim() || !form.password.trim() || !form.nik.trim() || !form.id_wilayah) {
      showToast('Nama, email, no HP, password, NIK, dan domisili RT wajib diisi.', 'error')
      return
    }
    if (!/^[0-9]{16}$/.test(form.nik)) {
      showToast('NIK harus 16 digit angka saja.', 'error')
      return
    }
    if (form.password.length < 6) {
      showToast('Password minimal 6 karakter.', 'error')
      return
    }

    const ok = await confirm({
      title: 'Buat Akun WARGA',
      message: `Buat akun ${form.nama_users} dengan NIK ${form.nik}? Data citizen akan dibuat otomatis dan terbaca di Perangkat Desa.`,
      confirmLabel: 'Ya, Buat',
    })
    if (!ok) return

    try {
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
    } catch (err) {
      showToast(err.message || 'Gagal membuat akun', 'error')
    }
  }

  const wilayahRtOptions = wilayahs.filter((w) => w.tipe === 'RT')

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
        data={data}
        loading={loading}
        searchPlaceholder='Cari nama pengguna atau email...'
        columns={[
          { key: 'nama_users', label: 'Nama Pengguna', render: (val, row) => (
            <div>
              <div className="font-bold">{val}</div>
              {row.citizen && <div className="text-xs text-neutral-500">Warga: {row.citizen.nama_lengkap}</div>}
            </div>
          ) },
          { key: 'email', label: 'Email' },
          { key: 'status', label: 'Status', render: (val) => (
            <span className={`px-2 py-1 rounded-full text-xs font-bold ${val === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {val}
            </span>
          )},
          { key: 'actions', label: 'Aksi', render: (_, row) => (
            <div className='flex gap-2'>
              <Button size='sm' variant='outline' className='text-blue-600'>Reset Pass</Button>
            </div>
          ) }
        ]}
      />

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Buat Akun Pengguna Baru</DialogTitle>
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
                <Label>Domisili RT <span className="text-red-500">*</span></Label>
                <Select value={form.id_wilayah} onValueChange={(v) => setForm({ ...form, id_wilayah: v })}>
                  <SelectTrigger><SelectValue placeholder="Pilih RT domisili" /></SelectTrigger>
                  <SelectContent>
                    {wilayahRtOptions.length === 0 ? (
                      <SelectItem value="__none__" disabled>Belum ada RT</SelectItem>
                    ) : wilayahRtOptions.map((w) => (
                      <SelectItem key={w.id_wilayah} value={w.id_wilayah}>{w.nama_wilayah} — {w.id_wilayah}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-neutral-500">Pastikan data RT telah ada</p>
              </div>
              <div className='space-y-2'>
                <Label>Role Awal</Label>
                <Input value="WARGA" disabled />
                <p className="text-xs text-neutral-500">Role ditentukan secara otomatis</p>
              </div>
            </div>
            <div className='space-y-2'>
              <Label>Password (Min. 6 Karakter)</Label>
              <Input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
            </div>
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setIsModalOpen(false)}>Batal</Button>
            <Button onClick={handleSave}>Buat Akun WARGA</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageShell>
  )
}
