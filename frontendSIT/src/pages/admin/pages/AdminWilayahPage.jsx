import { useEffect, useState, useMemo } from 'react'
import { PageShell } from '@/components/layout/PageShell'
import { getWilayah, request } from '@/services/api'
import { Icon } from '@/components/ui/Icon'
import { Button } from '@/components/ui/Button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/Dialog'
import { Label } from '@/components/ui/Label'
import { Input } from '@/components/ui/Input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { useConfirm } from '@/components/ui/ConfirmContext'
import { useToast } from '@/components/ui/ToastContext'

function WilayahNode({ node, icon, colorClass, onEdit, onDelete }) {
  const hasChildren = node.children && node.children.length > 0
  const [isOpen, setIsOpen] = useState(true)

  return (
    <div className='mb-3'>
      <div 
        className={`flex items-center gap-3 rounded-lg border border-neutral-200 bg-white p-3 shadow-sm ${hasChildren ? 'cursor-pointer hover:border-blue-300' : ''}`}
        onClick={() => hasChildren && setIsOpen(!isOpen)}
      >
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md ${colorClass}`}>
          <Icon name={icon} className='h-5 w-5' />
        </div>
        <div className='flex-1'>
          <p className='text-xs font-extrabold uppercase tracking-widest text-neutral-500'>{node.tipe} &bull; {node.kode_wilayah || 'NO-KODE'}</p>
          <h3 className='font-bold text-black'>{node.nama_wilayah}</h3>
        </div>
        
        <div className='flex items-center gap-2' onClick={e => e.stopPropagation()}>
          <Button size='sm' variant='outline' onClick={() => onEdit(node)}>Edit</Button>
          <Button size='sm' variant='outline' className='text-red-600 hover:bg-red-50' onClick={() => onDelete(node)}>Hapus</Button>
        </div>

        {hasChildren && (
          <div className='shrink-0 text-neutral-400 ml-4'>
            <Icon name='chevron' className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
          </div>
        )}
      </div>

      {hasChildren && isOpen && (
        <div className='ml-6 mt-3 border-l-2 border-neutral-100 pl-4'>
          {node.children.map(child => {
            let childIcon = 'map'
            let childColor = 'bg-neutral-100 text-neutral-600'
            
            if (child.tipe === 'DUKUH') {
              childIcon = 'home'
              childColor = 'bg-blue-50 text-blue-600'
            } else if (child.tipe === 'RW') {
              childIcon = 'users'
              childColor = 'bg-amber-50 text-amber-600'
            } else if (child.tipe === 'RT') {
              childIcon = 'user'
              childColor = 'bg-green-50 text-green-600'
            }

            return (
              <WilayahNode 
                key={child.id_wilayah} 
                node={child} 
                icon={childIcon} 
                colorClass={childColor} 
                onEdit={onEdit}
                onDelete={onDelete}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function AdminWilayahPage() {
  const [wilayahs, setWilayahs] = useState([])
  const [loading, setLoading] = useState(true)
  const confirm = useConfirm()
  const { showToast } = useToast()
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({ nama_wilayah: '', tipe: 'RT', kode_wilayah: '', parent_id: '' })

  const loadData = async () => {
    setLoading(true)
    try {
      const res = await getWilayah({ per_page: 500, all: 1 })
      setWilayahs(Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const wilayahById = useMemo(() => {
    const m = {}
    wilayahs.forEach((w) => { m[w.id_wilayah] = w })
    return m
  }, [wilayahs])

  const getWilayahPath = (id) => {
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
  }

  const parentOptions = useMemo(() => {
    const need = { DUKUH: 'KELURAHAN', RW: 'DUKUH', RT: 'RW' }[form.tipe] || null
    if (!need) return []
    return wilayahs
      .filter((w) => w.tipe === need)
      .sort((a, b) => a.nama_wilayah.localeCompare(b.nama_wilayah))
  }, [wilayahs, form.tipe])

  const tree = useMemo(() => {
    if (wilayahs.length === 0) return []
    const kelurahans = wilayahs.filter(w => w.tipe === 'KELURAHAN')
    function getChildren(parentId) {
      return wilayahs
        .filter(w => w.parent_id === parentId)
        .sort((a, b) => a.nama_wilayah.localeCompare(b.nama_wilayah))
        .map(w => ({ ...w, children: getChildren(w.id_wilayah) }))
    }
    return kelurahans.map(k => ({ ...k, children: getChildren(k.id_wilayah) }))
  }, [wilayahs])

  function openCreate() {
    setEditingId(null)
    setForm({ nama_wilayah: '', tipe: 'RT', kode_wilayah: '', parent_id: '' })
    setIsModalOpen(true)
  }

  function openEdit(node) {
    setEditingId(node.id_wilayah)
    setForm({ 
      nama_wilayah: node.nama_wilayah, 
      tipe: node.tipe, 
      kode_wilayah: node.kode_wilayah || '', 
      parent_id: node.parent_id || '' 
    })
    setIsModalOpen(true)
  }

  async function handleDelete(node) {
    const ok = await confirm({
      title: `Hapus ${node.tipe}`,
      message: `Yakin ingin menghapus ${node.tipe} ${node.nama_wilayah}?`,
      confirmLabel: 'Ya, Hapus',
    })
    if (!ok) return
    try {
      await request(`/wilayah/${node.id_wilayah}`, { method: 'DELETE' })
      showToast(`${node.tipe} ${node.nama_wilayah} berhasil dihapus.`)
      loadData()
    } catch (err) {
      showToast(err.message || 'Gagal menghapus wilayah. Pastikan tidak ada data yang terikat (warga/pengurus).', 'error')
    }
  }

  async function handleSave() {
    if (!form.nama_wilayah || !form.tipe) {
      showToast('Nama & tipe wajib diisi.', 'error')
      return
    }
    const ok = await confirm({
      title: editingId ? 'Simpan Perubahan Wilayah' : 'Tambah Wilayah',
      message: `${editingId ? 'Simpan perubahan' : 'Tambah'} wilayah ${form.nama_wilayah} (${form.tipe})?`,
      confirmLabel: 'Ya, Simpan',
    })
    if (!ok) return

    const payload = { ...form }
    if (!payload.parent_id) delete payload.parent_id

    try {
      if (editingId) {
        await request(`/wilayah/${editingId}`, { method: 'PUT', body: JSON.stringify(payload) })
      } else {
        await request('/wilayah', { method: 'POST', body: JSON.stringify(payload) })
      }
      setIsModalOpen(false)
      showToast(editingId ? 'Wilayah berhasil diperbarui.' : 'Wilayah berhasil ditambahkan.')
      loadData()
    } catch (err) {
      showToast(err.message || 'Gagal menyimpan wilayah', 'error')
    }
  }

  return (
    <PageShell
      eyebrow='Pengaturan Sistem'
      title='Manajemen Wilayah'
      description='God-Mode: Edit atau hapus hierarki wilayah RT/RW/Dukuh/Kelurahan secara terstruktur.'
    >
      <div className='mt-6 mb-4'>
        <Button onClick={openCreate}>Tambah Wilayah</Button>
      </div>
      
      <div className='max-w-4xl'>
        {loading ? (
          <div className='animate-pulse text-sm text-neutral-500'>Memuat struktur wilayah...</div>
        ) : tree.length === 0 ? (
          <div className='text-sm text-neutral-500'>Data wilayah kosong.</div>
        ) : (
          tree.map(kel => (
            <div key={kel.id_wilayah} className='mb-8'>
              <WilayahNode 
                node={kel} 
                icon='building' 
                colorClass='bg-indigo-100 text-indigo-700' 
                onEdit={openEdit}
                onDelete={handleDelete}
              />
            </div>
          ))
        )}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Wilayah' : 'Tambah Wilayah'}</DialogTitle>
          </DialogHeader>
          <div className='space-y-4 py-4'>
            <div className='space-y-2'>
              <Label>Tipe Wilayah</Label>
              <Select value={form.tipe} onValueChange={val => setForm({...form, tipe: val})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value='KELURAHAN'>KELURAHAN</SelectItem>
                  <SelectItem value='DUKUH'>DUKUH</SelectItem>
                  <SelectItem value='RW'>RW</SelectItem>
                  <SelectItem value='RT'>RT</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className='space-y-2'>
              <Label>Induk Wilayah (Parent) <span className="text-red-500">*</span></Label>
              <Select value={form.parent_id} onValueChange={val => setForm({...form, parent_id: val})}>
                <SelectTrigger><SelectValue placeholder={form.tipe === 'KELURAHAN' ? '— Kelurahan tidak punya induk —' : parentOptions.length === 0 ? `Belum ada ${ ({ DUKUH: 'Kelurahan', RW: 'Dukuh', RT: 'RW' }[form.tipe] || 'induk')} — buat dulu` : 'Pilih Induk'} /></SelectTrigger>
                <SelectContent>
                  {form.tipe === 'KELURAHAN' ? (
                    <SelectItem value='' disabled>Tidak butuh induk</SelectItem>
                  ) : parentOptions.length === 0 ? (
                    <SelectItem value="__none__" disabled>Belum ada wilayah tipe { ({ DUKUH: 'KELURAHAN', RW: 'DUKUH', RT: 'RW' }[form.tipe]) } — buat induk dulu</SelectItem>
                  ) : parentOptions.map(w => (
                    <SelectItem key={w.id_wilayah} value={w.id_wilayah}>{getWilayahPath(w.id_wilayah)} — {w.id_wilayah}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-neutral-500">
                {form.tipe === 'KELURAHAN' ? 'Kelurahan adalah akar hierarki, tanpa induk.' : form.tipe === 'DUKUH' ? 'Dukuh harus di bawah Kelurahan.' : form.tipe === 'RW' ? 'RW harus di bawah Dukuh (parent_id → Dukuh).' : 'RT harus di bawah RW (parent_id → RW).'}
              </p>
            </div>
            <div className='space-y-2'>
              <Label>Nama Wilayah</Label>
              <Input value={form.nama_wilayah} onChange={e => setForm({...form, nama_wilayah: e.target.value})} placeholder="Contoh: RT 01" />
            </div>
            <div className='space-y-2'>
              <Label>Kode Wilayah (Wajib)</Label>
              <Input value={form.kode_wilayah} onChange={e => setForm({...form, kode_wilayah: e.target.value})} placeholder="Contoh: KEL02, DUK04, RW10" />
            </div>
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
