import { useEffect, useState } from 'react'
import { PageShell } from '@/components/layout/PageShell'
import { request, getCitizens } from '@/services/api'
import { DataTable } from '@/components/ui/DataTable'
import { Icon } from '@/components/ui/Icon'
import { Button } from '@/components/ui/Button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/Dialog'
import { Label } from '@/components/ui/Label'
import { Input } from '@/components/ui/Input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'

export default function AdminUsersPage() {
  const [data, setData] = useState([])
  const [citizens, setCitizens] = useState([])
  const [loading, setLoading] = useState(true)
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [form, setForm] = useState({
    nama_users: '',
    email: '',
    no_hp: '',
    password: '',
    id_citizen: '',
    status: 'ACTIVE',
    auth_provider: 'EMAIL',
    role: 'WARGA'
  })

  async function loadData() {
    setLoading(true)
    try {
      const res = await request('/users?per_page=200')
      setData(Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [])
      
      const citRes = await getCitizens({ per_page: 500 })
      setCitizens(Array.isArray(citRes?.data) ? citRes.data : [])
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
    setForm({
      nama_users: '',
      email: '',
      no_hp: '',
      password: '',
      id_citizen: '',
      status: 'ACTIVE',
      auth_provider: 'EMAIL',
      role: 'WARGA'
    })
    setIsModalOpen(true)
  }

  async function handleSave() {
    if (!form.id_citizen && form.role === 'WARGA') {
      return alert('Untuk role WARGA, Anda wajib menghubungkan akun ini dengan data warga (Pilih Warga).')
    }

    try {
      // 1. Create User
      const userRes = await request('/users', {
        method: 'POST',
        body: JSON.stringify({
          nama_users: form.nama_users,
          email: form.email,
          no_hp: form.no_hp,
          password: form.password,
          id_citizen: form.id_citizen || null,
          status: form.status,
          auth_provider: form.auth_provider,
        })
      })
      
      const newUserId = userRes.data?.id_users || userRes.id_users
      
      // 2. Assign Role if a citizen is linked
      if (newUserId && form.id_citizen) {
        await request(`/users/${newUserId}/role`, {
          method: 'POST',
          body: JSON.stringify({ role: form.role })
        })
      }
      
      setIsModalOpen(false)
      loadData()
      alert('Akun berhasil dibuat dan role telah diberikan!')
    } catch (err) {
      alert(err.message || 'Gagal membuat akun')
    }
  }

  return (
    <PageShell
      eyebrow='Pengaturan Sistem'
      title='Manajemen Pengguna'
      description='Kelola seluruh akun yang terdaftar di sistem. Buat akun baru, hubungkan ke data warga, atau blokir akun.'
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
            <div className='space-y-2'>
              <Label>Hubungkan dengan Data Warga</Label>
              <Select value={form.id_citizen} onValueChange={val => setForm({...form, id_citizen: val})}>
                <SelectTrigger><SelectValue placeholder="Pilih Warga (Opsional tapi wajib untuk role WARGA)" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value=''>-- Tanpa Relasi Warga --</SelectItem>
                  {citizens.map(c => (
                    <SelectItem key={c.id_citizen} value={c.id_citizen}>{c.nik} - {c.nama_lengkap}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                <Label>Role Awal</Label>
                <Select value={form.role} onValueChange={val => setForm({...form, role: val})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value='WARGA'>WARGA</SelectItem>
                    <SelectItem value='SISKAMLING'>SISKAMLING</SelectItem>
                    <SelectItem value='PKK'>PKK</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className='space-y-2'>
                <Label>Password (Min. 6 Karakter)</Label>
                <Input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setIsModalOpen(false)}>Batal</Button>
            <Button onClick={handleSave}>Simpan & Berikan Role</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageShell>
  )
}
