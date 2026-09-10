import { useEffect, useState } from 'react'
import { PageShell } from '@/components/layout/PageShell'
import { Icon } from '@/components/ui/Icon'
import { Button } from '@/components/ui/Button'
import { DataTable } from '@/components/ui/DataTable'
import { request } from '@/services/api'
import { Input } from '@/components/ui/Input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/Dialog'
import { Label } from '@/components/ui/Label'
import { useConfirm } from '@/components/ui/ConfirmContext'
import { useToast } from '@/components/ui/ToastContext'

const CATEGORIES = [
  { title: 'Agama', type: 'AGAMA', icon: 'book' },
  { title: 'Tingkat Pendidikan', type: 'PENDIDIKAN', icon: 'award' },
  { title: 'Profesi / Pekerjaan', type: 'PROFESI', icon: 'briefcase' },
  { title: 'Kategori Bansos', type: 'KATEGORI_BANSOS', icon: 'heart' },
  { title: 'Kategori Kejadian Siskamling', type: 'JENIS_KEJADIAN_SISKAMLING', icon: 'shield' },
]

export default function AdminMasterDataPage() {
  const [activeCategory, setActiveCategory] = useState(null)
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const confirm = useConfirm()
  const { showToast } = useToast()
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({ kode_master: '', nama_master: '', urutan: 0 })

  useEffect(() => {
    if (activeCategory) loadData()
  }, [activeCategory])

  async function loadData() {
    setLoading(true)
    try {
      const res = await request(`/master-data?tipe=${activeCategory.type}&per_page=100`)
      setData(res.data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    const ok = await confirm({
      title: editingId ? 'Simpan Perubahan Master Data' : 'Tambah Master Data',
      message: `${editingId ? 'Simpan perubahan' : 'Tambah'} data ${form.nama_master || form.kode_master}?`,
      confirmLabel: 'Ya, Simpan',
    })
    if (!ok) return
    try {
      if (editingId) {
        await request(`/master-data/${editingId}`, { method: 'PUT', body: JSON.stringify({ ...form, tipe: activeCategory.type, is_active: true }) })
      } else {
        await request('/master-data', { method: 'POST', body: JSON.stringify({ ...form, tipe: activeCategory.type, is_active: true }) })
      }
      setIsModalOpen(false)
      showToast(editingId ? 'Master data berhasil diperbarui.' : 'Master data berhasil ditambahkan.')
      loadData()
    } catch (err) {
      showToast(err.message || 'Gagal menyimpan data', 'error')
    }
  }

  function openEdit(row) {
    setEditingId(row.id_master)
    setForm({ kode_master: row.kode_master, nama_master: row.nama_master, urutan: row.urutan || 0 })
    setIsModalOpen(true)
  }

  function openCreate() {
    setEditingId(null)
    setForm({ kode_master: '', nama_master: '', urutan: 0 })
    setIsModalOpen(true)
  }

  if (activeCategory) {
    return (
      <PageShell
        eyebrow='Master Data'
        title={`Kelola ${activeCategory.title}`}
        description={`Mengelola data referensi untuk ${activeCategory.title}.`}
      >
        <div className='mb-4 flex gap-4'>
          <Button variant='outline' onClick={() => setActiveCategory(null)}>Kembali</Button>
          <Button onClick={openCreate}>Tambah Data</Button>
        </div>

        <DataTable
          data={data}
          loading={loading}
          searchPlaceholder='Cari data...'
          columns={[
            { key: 'kode_master', label: 'Kode' },
            { key: 'nama_master', label: 'Nama' },
            ...(activeCategory.type === 'PENDIDIKAN' ? [{ key: 'urutan', label: 'Urutan' }] : []),
            { key: 'is_active', label: 'Status', render: (val) => val ? 'Aktif' : 'Tidak Aktif' },
            { key: 'actions', label: 'Aksi', render: (_, row) => (
              <Button size='sm' variant='outline' onClick={() => openEdit(row)}>Edit</Button>
            )}
          ]}
        />

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit Data' : 'Tambah Data'}</DialogTitle>
            </DialogHeader>
            <div className='space-y-4 py-4'>
              <div className='space-y-2'>
                <Label>Kode</Label>
                <Input value={form.kode_master} onChange={e => setForm({...form, kode_master: e.target.value})} />
              </div>
              <div className='space-y-2'>
                <Label>Nama</Label>
                <Input value={form.nama_master} onChange={e => setForm({...form, nama_master: e.target.value})} />
              </div>
              {activeCategory.type === 'PENDIDIKAN' && (
                <div className='space-y-2'>
                  <Label>Urutan</Label>
                  <Input type='number' value={form.urutan} onChange={e => setForm({...form, urutan: parseInt(e.target.value)})} />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant='outline' onClick={() => setIsModalOpen(false)}>Batal</Button>
              <Button onClick={handleSave}>Simpan</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageShell>
    )
  }

  return (
    <PageShell
      eyebrow='Pengaturan Sistem'
      title='Master Data'
      description='Kelola data referensi seperti Agama, Pendidikan, Pekerjaan, Kategori Keuangan, dll.'
    >
      <div className='mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
        {CATEGORIES.map(item => (
          <div key={item.title} onClick={() => setActiveCategory(item)} className='flex cursor-pointer items-center gap-4 rounded-xl border border-neutral-300 bg-white p-5 transition hover:border-blue-500 hover:shadow-sm'>
            <div className='flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600'>
              <Icon name={item.icon} className='h-6 w-6' />
            </div>
            <div>
              <h3 className='font-bold text-black'>{item.title}</h3>
              <p className='text-xs text-neutral-500'>Kelola data referensi</p>
            </div>
          </div>
        ))}
      </div>
    </PageShell>
  )
}
