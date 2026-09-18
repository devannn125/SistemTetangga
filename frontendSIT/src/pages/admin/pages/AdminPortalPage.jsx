import { useState, useEffect } from 'react'
import { PageShell } from '@/components/layout/PageShell'
import { Icon } from '@/components/ui/Icon'
import { 
  getAdminLandingProfile, updateAdminLandingProfile,
  getAdminLandingArticles, createAdminLandingArticle, updateAdminLandingArticle, deleteAdminLandingArticle,
  getAdminLandingUmkm, createAdminLandingUmkm, updateAdminLandingUmkm, deleteAdminLandingUmkm
} from '@/services/api'
import { useToast } from '@/components/ui/ToastContext'
import { DataTable } from '@/components/ui/DataTable'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/Dialog'
import { Label } from '@/components/ui/Label'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Checkbox } from '@/components/ui/Checkbox'

export default function AdminPortalPage() {
  const [activeTab, setActiveTab] = useState('profile')
  const { toast } = useToast()

  return (
    <PageShell eyebrow="Portal Publik" title="Manajemen Landing Page" description="Kelola konten teks, berita, dan umkm yang tampil di halaman depan.">
      
      {/* Tabs */}
      <div className="mt-6 flex flex-wrap gap-2 border-b border-neutral-200 pb-3" role="tablist">
        {['profile', 'berita', 'umkm'].map((tab) => (
          <button
            key={tab}
            role="tab"
            aria-selected={activeTab === tab}
            onClick={() => setActiveTab(tab)}
            className={`rounded-full border px-5 py-2 text-xs font-extrabold capitalize transition ${
              activeTab === tab
                ? 'border-black bg-black text-white'
                : 'border-neutral-300 bg-white text-neutral-700 hover:border-black hover:bg-neutral-100'
            }`}
          >
            {tab === 'profile' ? 'Profil & Teks' : tab === 'berita' ? 'Berita & Kegiatan' : 'Galeri UMKM'}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {activeTab === 'profile' && <TabProfile />}
        {activeTab === 'berita' && <TabBerita />}
        {activeTab === 'umkm' && <TabUmkm />}
      </div>
    </PageShell>
  )
}

function TabProfile() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    brand_name: '', hero_title: '', hero_subtitle: '', visi: '', misi: '', sejarah: '', 
    video_url: '', video_file: null, hero_image_url: '', hero_image_file: null, 
    kontak_email: '', kontak_hp: '', kontak_alamat: ''
  })

  useEffect(() => {
    getAdminLandingProfile()
      .then(res => {
        if(res.id) setForm(res)
      })
      .catch(() => toast('Gagal memuat profil', 'error'))
      .finally(() => setLoading(false))
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = new FormData();
      Object.keys(form).forEach(key => {
        if (form[key] !== null && form[key] !== undefined && key !== 'video_url' && key !== 'hero_image_url') {
          payload.append(key, form[key]);
        }
      });
      const res = await updateAdminLandingProfile(payload)
      setForm(res)
      toast('Profil berhasil disimpan', 'success')
    } catch (err) {
      toast('Gagal menyimpan profil', 'error')
    } finally {
      setSaving(false)
    }
  }

  if(loading) return <div className="text-sm text-neutral-500">Memuat data...</div>

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl rounded-xl border border-neutral-200 bg-white p-6">
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-black border-b pb-2">Bagian Hero (Atas) & Merek</h3>
        <div><Label>Teks Logo (Kenaran.com)</Label><Input value={form.brand_name || ''} onChange={e => setForm({...form, brand_name: e.target.value})} placeholder="Kenaran.com" /></div>
        <div><Label>Judul Utama</Label><Input value={form.hero_title || ''} onChange={e => setForm({...form, hero_title: e.target.value})} placeholder="Sistem Informasi Terpadu" /></div>
        <div><Label>Sub-judul</Label><Input value={form.hero_subtitle || ''} onChange={e => setForm({...form, hero_subtitle: e.target.value})} placeholder="Kelurahan Serut, Gedangsari, Gunungkidul" /></div>
        <div>
          <Label>Gambar Latar Belakang (Hero Background)</Label>
          {form.hero_image_url && !form.hero_image_file && (
            <div className="mb-2"><img src={form.hero_image_url} alt="Hero" className="h-20 w-auto rounded object-cover" /></div>
          )}
          <Input type="file" accept="image/*" onChange={e => setForm({...form, hero_image_file: e.target.files[0]})} />
          <p className="text-xs text-neutral-500 mt-1">Kosongkan jika tidak ingin mengubah gambar.</p>
        </div>
      </div>
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-black border-b pb-2">Profil & Sejarah</h3>
        <div><Label>Visi</Label><Textarea value={form.visi || ''} onChange={e => setForm({...form, visi: e.target.value})} rows={3} /></div>
        <div><Label>Misi</Label><Textarea value={form.misi || ''} onChange={e => setForm({...form, misi: e.target.value})} rows={4} placeholder="Gunakan enter untuk memisahkan misi..." /></div>
        <div><Label>Sejarah Singkat</Label><Textarea value={form.sejarah || ''} onChange={e => setForm({...form, sejarah: e.target.value})} rows={5} /></div>
        <div>
          <Label>Video Profil (MP4/WebM)</Label>
          {form.video_url && !form.video_file && (
            <div className="mb-2">
              <video src={form.video_url} controls className="h-32 w-auto rounded border" />
            </div>
          )}
          <input 
            type="file" 
            accept="video/mp4,video/webm" 
            onChange={e => setForm({...form, video_file: e.target.files[0]})} 
            className="block w-full text-sm text-neutral-500 file:mr-4 file:rounded-full file:border-0 file:bg-neutral-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-black hover:file:bg-neutral-200"
          />
        </div>
      </div>
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-black border-b pb-2">Kontak</h3>
        <div className="grid grid-cols-2 gap-4">
          <div><Label>Email</Label><Input type="email" value={form.kontak_email || ''} onChange={e => setForm({...form, kontak_email: e.target.value})} /></div>
          <div><Label>No. HP / WhatsApp</Label><Input value={form.kontak_hp || ''} onChange={e => setForm({...form, kontak_hp: e.target.value})} /></div>
        </div>
        <div><Label>Alamat Lengkap</Label><Textarea value={form.kontak_alamat || ''} onChange={e => setForm({...form, kontak_alamat: e.target.value})} rows={2} /></div>
      </div>
      <button type="submit" disabled={saving} className="rounded-full bg-black px-6 py-2.5 text-sm font-bold text-white hover:bg-neutral-800 disabled:opacity-50">
        {saving ? 'Menyimpan...' : 'Simpan Profil'}
      </button>
    </form>
  )
}

function TabBerita() {
  const { toast } = useToast()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState({ open: false, isEdit: false, id: null })
  const [form, setForm] = useState({ judul: '', konten: '', is_published: true, image: null })

  const loadData = () => {
    setLoading(true)
    getAdminLandingArticles().then(setData).catch(e => toast(e.message, 'error')).finally(() => setLoading(false))
  }

  useEffect(() => { loadData() }, [])

  const handleOpen = (editData = null) => {
    if(editData) {
      setForm({ judul: editData.judul, konten: editData.konten, is_published: editData.is_published, image: null })
      setModal({ open: true, isEdit: true, id: editData.id_article })
    } else {
      setForm({ judul: '', konten: '', is_published: true, image: null })
      setModal({ open: true, isEdit: false, id: null })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const fd = new FormData()
    fd.append('judul', form.judul)
    fd.append('konten', form.konten)
    fd.append('is_published', form.is_published ? 1 : 0)
    if(form.image) fd.append('image', form.image)

    try {
      if(modal.isEdit) await updateAdminLandingArticle(modal.id, fd)
      else await createAdminLandingArticle(fd)
      toast('Berita berhasil disimpan!', 'success')
      setModal({ open: false })
      loadData()
    } catch(err) {
      toast(err.message, 'error')
    }
  }

  const handleDelete = async (id) => {
    if(!confirm('Hapus berita ini?')) return
    try {
      await deleteAdminLandingArticle(id)
      toast('Terhapus', 'success')
      loadData()
    } catch(err) { toast(err.message, 'error') }
  }

  const cols = [





    { key: 'image_url', label: 'Gambar', render: (_, row) => row.image_url ? <img src={row.image_url} alt="" className="h-10 w-10 rounded object-cover" /> : <div className="h-10 w-10 bg-neutral-100 rounded" /> },
    { key: 'judul', label: 'Judul' },
    { key: 'is_published', label: 'Status', render: (_, row) => row.is_published ? <span className="text-emerald-600 font-bold">Publik</span> : <span className="text-neutral-500">Draft</span> },
    { key: 'created_at', label: 'Tanggal', render: (_, row) => new Date(row.created_at).toLocaleDateString('id-ID') },
    { key: 'aksi', label: 'Aksi', render: (_, row) => (
      <div className="flex gap-2">
        <button onClick={() => handleOpen(row)} className="text-xs font-bold text-sky-600 hover:underline">Edit</button>
        <button onClick={() => handleDelete(row.id_article)} className="text-xs font-bold text-red-600 hover:underline">Hapus</button>
      </div>
    )}
  ]

  return (
    <div>
      <div className="mb-4 flex justify-end"><button onClick={() => handleOpen()} className="rounded-full bg-black px-5 py-2 text-xs font-bold text-white hover:bg-neutral-800">Tambah Berita</button></div>
      <DataTable columns={cols} data={data} loading={loading} />
      
      <Dialog open={modal.open} onOpenChange={v => setModal(m => ({ ...m, open: v}))}>
        <DialogContent>
          <DialogHeader><DialogTitle>{modal.isEdit ? 'Edit Berita' : 'Tambah Berita'}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div><Label>Judul Berita</Label><Input required value={form.judul} onChange={e => setForm({...form, judul: e.target.value})} /></div>
            <div><Label>Isi Berita</Label><Textarea required value={form.konten} onChange={e => setForm({...form, konten: e.target.value})} rows={6} /></div>
            <div>
              <Label>Gambar (Kosongkan jika tidak diubah)</Label>
              <Input type="file" accept="image/*" onChange={e => setForm({...form, image: e.target.files[0]})} />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="is_published" checked={form.is_published} onCheckedChange={v => setForm({...form, is_published: v})} />
              <Label htmlFor="is_published">Tampilkan di halaman publik</Label>
            </div>
            <DialogFooter><button type="submit" className="rounded-full bg-black px-6 py-2.5 text-sm font-bold text-white hover:bg-neutral-800">Simpan</button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function TabUmkm() {
  const { toast } = useToast()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState({ open: false, isEdit: false, id: null })
  const [form, setForm] = useState({ nama_usaha: '', deskripsi: '', nama_pemilik: '', no_hp: '', is_active: true, image: null })

  const loadData = () => {
    setLoading(true)
    getAdminLandingUmkm().then(setData).catch(e => toast(e.message, 'error')).finally(() => setLoading(false))
  }

  useEffect(() => { loadData() }, [])

  const handleOpen = (editData = null) => {
    if(editData) {
      setForm({ nama_usaha: editData.nama_usaha, deskripsi: editData.deskripsi || '', nama_pemilik: editData.nama_pemilik || '', no_hp: editData.no_hp || '', is_active: editData.is_active, image: null })
      setModal({ open: true, isEdit: true, id: editData.id_umkm })
    } else {
      setForm({ nama_usaha: '', deskripsi: '', nama_pemilik: '', no_hp: '', is_active: true, image: null })
      setModal({ open: true, isEdit: false, id: null })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const fd = new FormData()
    fd.append('nama_usaha', form.nama_usaha)
    fd.append('deskripsi', form.deskripsi)
    fd.append('nama_pemilik', form.nama_pemilik)
    fd.append('no_hp', form.no_hp)
    fd.append('is_active', form.is_active ? 1 : 0)
    if(form.image) fd.append('image', form.image)

    try {
      if(modal.isEdit) await updateAdminLandingUmkm(modal.id, fd)
      else await createAdminLandingUmkm(fd)
      toast('UMKM berhasil disimpan!', 'success')
      setModal({ open: false })
      loadData()
    } catch(err) {
      toast(err.message, 'error')
    }
  }

  const handleDelete = async (id) => {
    if(!confirm('Hapus UMKM ini?')) return
    try {
      await deleteAdminLandingUmkm(id)
      toast('Terhapus', 'success')
      loadData()
    } catch(err) { toast(err.message, 'error') }
  }

  const cols = [






    { key: 'image_url', label: 'Gambar', render: (_, row) => row.image_url ? <img src={row.image_url} alt="" className="h-10 w-10 rounded object-cover" /> : <div className="h-10 w-10 bg-neutral-100 rounded" /> },
    { key: 'nama_usaha', label: 'Usaha' },
    { key: 'nama_pemilik', label: 'Pemilik' },
    { key: 'no_hp', label: 'No. HP' },
    { key: 'is_active', label: 'Status', render: (_, row) => row.is_active ? <span className="text-emerald-600 font-bold">Aktif</span> : <span className="text-neutral-500">Non-aktif</span> },
    { key: 'aksi', label: 'Aksi', render: (_, row) => (
      <div className="flex gap-2">
        <button onClick={() => handleOpen(row)} className="text-xs font-bold text-sky-600 hover:underline">Edit</button>
        <button onClick={() => handleDelete(row.id_umkm)} className="text-xs font-bold text-red-600 hover:underline">Hapus</button>
      </div>
    )}
  ]

  return (
    <div>
      <div className="mb-4 flex justify-end"><button onClick={() => handleOpen()} className="rounded-full bg-black px-5 py-2 text-xs font-bold text-white hover:bg-neutral-800">Tambah UMKM</button></div>
      <DataTable columns={cols} data={data} loading={loading} />
      
      <Dialog open={modal.open} onOpenChange={v => setModal(m => ({ ...m, open: v}))}>
        <DialogContent>
          <DialogHeader><DialogTitle>{modal.isEdit ? 'Edit UMKM' : 'Tambah UMKM'}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div><Label>Nama Usaha</Label><Input required value={form.nama_usaha} onChange={e => setForm({...form, nama_usaha: e.target.value})} /></div>
            <div><Label>Deskripsi</Label><Textarea value={form.deskripsi} onChange={e => setForm({...form, deskripsi: e.target.value})} rows={3} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Nama Pemilik</Label><Input value={form.nama_pemilik} onChange={e => setForm({...form, nama_pemilik: e.target.value})} /></div>
              <div><Label>No WhatsApp</Label><Input value={form.no_hp} onChange={e => setForm({...form, no_hp: e.target.value})} /></div>
            </div>
            <div>
              <Label>Foto Produk (Kosongkan jika tidak diubah)</Label>
              <Input type="file" accept="image/*" onChange={e => setForm({...form, image: e.target.files[0]})} />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="is_active" checked={form.is_active} onCheckedChange={v => setForm({...form, is_active: v})} />
              <Label htmlFor="is_active">Tampilkan di halaman publik</Label>
            </div>
            <DialogFooter><button type="submit" className="rounded-full bg-black px-6 py-2.5 text-sm font-bold text-white hover:bg-neutral-800">Simpan</button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
