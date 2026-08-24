import { useState, useEffect } from 'react'
import { PageShell } from '../../../components/layout/PageShell'
import { getAnnouncements, createAnnouncement, getWilayah } from '../../../services/api'

export default function RtAnnouncementPage() {
  const [announcements, setAnnouncements] = useState([])
  const [wilayahOptions, setWilayahOptions] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({ judul: '', isi: '', krusial: false, kategori: 'LAINNYA', id_wilayah: '' })
  const [notice, setNotice] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  async function loadData() {
    setIsLoading(true)
    try {
      const [resAnn, resWil] = await Promise.all([
        getAnnouncements({ per_page: 100 }),
        getWilayah({ per_page: 100 })
      ])
      
      const annData = Array.isArray(resAnn?.data) ? resAnn.data : Array.isArray(resAnn) ? resAnn : []
      const wilData = Array.isArray(resWil?.data) ? resWil.data : Array.isArray(resWil) ? resWil : []
      
      setAnnouncements(annData)
      setWilayahOptions(wilData)
      if (wilData.length > 0) {
        setFormData(f => ({ ...f, id_wilayah: wilData[0].id_wilayah }))
      }
    } catch (err) {
      setNotice('Gagal memuat data: ' + err.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    // Berdasarkan validasi backend: status_approval = 'RW' jika butuh persetujuan, 'RT' jika lgsg publish
    const statusApproval = formData.krusial ? 'RW' : 'RT'
    
    // Perbaikan: Kita harus mengirimkan atribut sesuai validasi AnnouncementRequest backend
    try {
      const payload = {
        judul: formData.judul,
        isi: formData.isi,
        kategori: formData.kategori,
        id_wilayah: formData.id_wilayah,
        target: 'SEMUA_WARGA', // Default target
        status_approval: statusApproval,
        is_pinned: false,
        // Karena ada validasi required pada created_by di backend, kita gunakan 'USR-001'
        // Jika sistem auth berjalan penuh, harusnya ini diambil dari user context.
        created_by: 'USR-001' 
      }

      await createAnnouncement(payload)
      
      setNotice(formData.krusial ? 'Pengumuman Krusial berhasil diajukan dan sedang Menunggu Persetujuan RW.' : 'Pengumuman berhasil diterbitkan.')
      setIsModalOpen(false)
      setFormData(f => ({ judul: '', isi: '', krusial: false, kategori: 'LAINNYA', id_wilayah: f.id_wilayah }))
      loadData()
    } catch (err) {
      setNotice('Gagal menerbitkan pengumuman: ' + err.message)
    }
  }

  return (
    <PageShell
      eyebrow="Pengumuman"
      title="Pengumuman & Agenda RT"
      description="Buat pengumuman untuk warga di lingkup RT Anda. Pengumuman yang ditandai Krusial memerlukan persetujuan dari RW sebelum diterbitkan."
    >
      <section className="mt-8 space-y-6">
        {notice && (
          <div className={`rounded-2xl border px-4 py-3 text-sm font-semibold ${notice.includes('Gagal') ? 'border-red-200 bg-red-50 text-red-900' : 'border-sky-200 bg-sky-50 text-sky-900'}`}>
            {notice}
          </div>
        )}
        <div className="flex justify-between items-center">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="rounded-full bg-black px-5 py-2 text-xs font-extrabold uppercase text-white hover:bg-neutral-900"
          >
            + Buat Pengumuman
          </button>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-sm text-neutral-500 bg-white rounded-xl border">Memuat...</div>
        ) : (
          <div className="grid gap-4">
            {announcements.map(ann => (
              <div key={ann.id_announcement || ann.id} className="border p-4 rounded-xl bg-white flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-black text-lg">{ann.judul}</h3>
                  <p className="text-sm text-neutral-600 mt-1">{ann.isi}</p>
                  <div className="mt-3 flex gap-2 text-xs font-semibold">
                    <span className="bg-neutral-100 text-neutral-700 px-2 py-1 rounded">Target: {ann.target || 'Warga'}</span>
                    <span className="bg-sky-100 text-sky-800 px-2 py-1 rounded">{ann.kategori}</span>
                  </div>
                </div>
                <div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${ann.status_approval === 'RT' ? 'bg-emerald-100 text-emerald-900' : 'bg-amber-100 text-amber-900'}`}>
                    {ann.status_approval === 'RW' ? 'Menunggu RW' : ann.status_approval || 'Aktif'}
                  </span>
                </div>
              </div>
            ))}
            {announcements.length === 0 && <div className="text-center p-8 text-neutral-500 border rounded-xl bg-white">Belum ada pengumuman</div>}
          </div>
        )}
      </section>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-black mb-4">Buat Pengumuman Baru</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Judul Pengumuman</label>
                <input required value={formData.judul} onChange={e => setFormData({...formData, judul: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Kategori</label>
                  <select value={formData.kategori} onChange={e => setFormData({...formData, kategori: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm bg-white">
                    <option value="KESEHATAN">Kesehatan</option>
                    <option value="KEAMANAN">Keamanan</option>
                    <option value="INFRASTRUKTUR">Infrastruktur</option>
                    <option value="SOSIAL">Sosial</option>
                    <option value="LAINNYA">Lainnya</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Wilayah RT</label>
                  <select required value={formData.id_wilayah} onChange={e => setFormData({...formData, id_wilayah: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm bg-white">
                    {wilayahOptions.map(w => (
                      <option key={w.id_wilayah} value={w.id_wilayah}>{w.nama_wilayah}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Target Akses</label>
                <select disabled className="w-full border rounded-lg px-3 py-2 text-sm bg-neutral-100 text-neutral-500">
                  <option>Semua Warga</option>
                </select>
                <p className="text-xs text-neutral-500 mt-1">Sesuai aturan, RT hanya dapat memberi pengumuman ke warga RT-nya saja.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Isi Pesan</label>
                <textarea required rows="3" value={formData.isi} onChange={e => setFormData({...formData, isi: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm"></textarea>
              </div>

              <div className="flex items-center gap-2">
                <input type="checkbox" id="krusial" checked={formData.krusial} onChange={e => setFormData({...formData, krusial: e.target.checked})} />
                <label htmlFor="krusial" className="text-sm font-semibold text-neutral-800">Tandai sebagai Pengumuman Krusial (Butuh Persetujuan RW)</label>
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-4 border-t">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-xs font-bold text-neutral-600 hover:text-black">BATAL</button>
                <button type="submit" className="rounded-full bg-black px-5 py-2 text-xs font-extrabold uppercase text-white hover:bg-neutral-900">
                  {formData.krusial ? 'Ajukan ke RW' : 'Terbitkan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageShell>
  )
}
