import { useState, useEffect } from 'react'
import { PageShell } from '../../../components/layout/PageShell'
import { getOrganizationMembers, createOrganizationMember, deleteOrganizationMember, getCitizens, getWilayah } from '../../../services/api'

export default function RtOrganizationPage() {
  const [members, setMembers] = useState([])
  const [citizens, setCitizens] = useState([])
  const [wilayahs, setWilayahs] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [notice, setNotice] = useState('')
  
  const [form, setForm] = useState({ 
    id_citizen: '', 
    jabatan: '', 
    id_wilayah: '', 
    periode_mulai: new Date().toISOString().split('T')[0], 
    status_aktif: true 
  })

  async function loadData() {
    setLoading(true)
    try {
      const [resM, resC, resW] = await Promise.all([
        getOrganizationMembers({ per_page: 100 }),
        getCitizens({ per_page: 100 }),
        getWilayah({ per_page: 100 })
      ])
      
      const arrM = Array.isArray(resM?.data) ? resM.data : Array.isArray(resM) ? resM : []
      const arrC = Array.isArray(resC?.data) ? resC.data : Array.isArray(resC) ? resC : []
      const arrW = Array.isArray(resW?.data) ? resW.data : Array.isArray(resW) ? resW : []
      
      setMembers(arrM)
      setCitizens(arrC)
      setWilayahs(arrW)

      if (arrC.length > 0 && arrW.length > 0) {
        setForm(f => ({ ...f, id_citizen: arrC[0].id_citizen, id_wilayah: arrW[0].id_wilayah }))
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      await createOrganizationMember(form)
      setNotice('Pengurus berhasil ditambahkan.')
      setIsModalOpen(false)
      loadData()
    } catch (err) {
      setNotice('Gagal menyimpan: ' + err.message)
    }
  }

  async function handleDelete(id) {
    if (!confirm('Hapus data pengurus ini?')) return
    try {
      await deleteOrganizationMember(id)
      setNotice('Data pengurus berhasil dihapus.')
      loadData()
    } catch (err) {
      setNotice('Gagal menghapus: ' + err.message)
    }
  }

  return (
    <PageShell
      eyebrow="Organisasi"
      title="Struktur Organisasi & Pengurus"
      description="Kelola jabatan dan periode pengurus lingkungan (RT)."
    >
      <section className="mt-6 space-y-6">
        {notice && (
          <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-semibold text-sky-900">
            {notice}
          </div>
        )}

        <div className="flex justify-end">
          <button onClick={() => setIsModalOpen(true)} className="rounded-full bg-black px-4 py-2 text-xs font-extrabold uppercase text-white hover:bg-neutral-900">
            + Tambah Pengurus
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {loading ? (
             <div className="col-span-full p-8 text-center text-sm text-neutral-500 bg-white border rounded-xl">Memuat data pengurus...</div>
          ) : members.length === 0 ? (
             <div className="col-span-full p-8 text-center text-sm text-neutral-500 bg-white border rounded-xl">Belum ada data struktur organisasi.</div>
          ) : members.map(m => (
            <div key={m.id_organization_member || m.id} className="relative rounded-2xl border border-neutral-300 bg-white p-5">
              <span className={`absolute top-4 right-4 h-3 w-3 rounded-full ${m.status_aktif ? 'bg-emerald-500' : 'bg-neutral-300'}`} title={m.status_aktif ? 'Aktif' : 'Nonaktif'} />
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 font-extrabold text-black">
                  {m.citizen?.nama_lengkap?.[0] || '?'}
                </div>
                <div>
                  <h3 className="font-bold text-black">{m.citizen?.nama_lengkap || 'Warga Terhapus'}</h3>
                  <p className="text-xs font-bold uppercase text-sky-700">{m.jabatan}</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t flex items-center justify-between">
                <p className="text-xs text-neutral-500">Mulai: {m.periode_mulai}</p>
                <button onClick={() => handleDelete(m.id_organization_member || m.id)} className="text-xs font-bold uppercase text-red-600 hover:text-red-700">Cabut</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-black mb-4">Assign Pengurus Baru</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Pilih Warga</label>
                <select required value={form.id_citizen} onChange={e => setForm({...form, id_citizen: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm bg-white">
                  {citizens.map(c => <option key={c.id_citizen} value={c.id_citizen}>{c.nama_lengkap}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Jabatan</label>
                <input required value={form.jabatan} onChange={e => setForm({...form, jabatan: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Contoh: Sekretaris RT" />
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Wilayah</label>
                <select required value={form.id_wilayah} onChange={e => setForm({...form, id_wilayah: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm bg-white">
                  {wilayahs.map(w => <option key={w.id_wilayah} value={w.id_wilayah}>{w.nama_wilayah}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Periode Mulai</label>
                <input type="date" required value={form.periode_mulai} onChange={e => setForm({...form, periode_mulai: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" />
              </div>
              <div className="flex items-center gap-2 mt-2">
                <input type="checkbox" id="status" checked={form.status_aktif} onChange={e => setForm({...form, status_aktif: e.target.checked})} />
                <label htmlFor="status" className="text-sm text-black">Status Aktif Menjabat</label>
              </div>
              <div className="mt-6 flex justify-end gap-3 pt-4 border-t">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-xs font-bold text-neutral-600 hover:text-black">BATAL</button>
                <button type="submit" className="rounded-full bg-black px-5 py-2 text-xs font-extrabold uppercase text-white hover:bg-neutral-900">
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageShell>
  )
}
