import { useState, useEffect } from 'react'
import { PageShell } from '../../../components/layout/PageShell'
import { getHouses, createHouse, deleteHouse, getWilayah, getCitizens } from '../../../services/api'
import { useConfirm } from '../../../components/ui/ConfirmContext'
import { useToast } from '../../../components/ui/ToastContext'

export default function RtHousingPage() {
  const [houses, setHouses] = useState([])
  const [wilayahs, setWilayahs] = useState([])
  const [citizens, setCitizens] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [form, setForm] = useState({ tipe: 'NON_KOS', alamat: '', id_wilayah: '', id_pemilik_citizen: '' })
  const confirm = useConfirm()
  const { showToast } = useToast()

  async function loadData() {
    setLoading(true)
    try {
      const [resH, resW, resC] = await Promise.all([
        getHouses({ per_page: 100 }),
        getWilayah({ per_page: 100 }),
        getCitizens({ per_page: 100 })
      ])
      
      const arrH = Array.isArray(resH?.data) ? resH.data : Array.isArray(resH) ? resH : []
      const arrW = Array.isArray(resW?.data) ? resW.data : Array.isArray(resW) ? resW : []
      const arrC = Array.isArray(resC?.data) ? resC.data : Array.isArray(resC) ? resC : []
      
      setHouses(arrH)
      setWilayahs(arrW)
      setCitizens(arrC)

      if (arrW.length > 0) setForm(f => ({ ...f, id_wilayah: arrW[0].id_wilayah }))
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    const approved = await confirm({
      title: 'Konfirmasi Simpan',
      message: `Yakin ingin menyimpan data rumah baru di alamat "${form.alamat}"?`,
      confirmLabel: 'Ya, Simpan',
    })
    if (!approved) return
    try {
      const payload = { ...form }
      if (!payload.id_pemilik_citizen) delete payload.id_pemilik_citizen
      await createHouse(payload)
      showToast('Data rumah berhasil ditambahkan.')
      setIsModalOpen(false)
      loadData()
    } catch (err) {
      showToast('Gagal menyimpan: ' + err.message, 'error')
    }
  }

  async function handleDelete(id) {
    const approved = await confirm({
      title: 'Konfirmasi Hapus',
      message: 'Yakin ingin menghapus data rumah ini? Tindakan ini tidak dapat dibatalkan.',
      confirmLabel: 'Ya, Hapus',
    })
    if (!approved) return
    try {
      await deleteHouse(id)
      showToast('Data rumah berhasil dihapus.')
      loadData()
    } catch (err) {
      showToast('Gagal menghapus: ' + err.message, 'error')
    }
  }

  return (
    <PageShell
      eyebrow="Perumahan"
      title="Data Rumah & Kos"
      description="Kelola data rumah warga dan kos di lingkungan Anda."
    >
      <section className="mt-6 space-y-6">
        <div className="flex justify-end">
          <button onClick={() => setIsModalOpen(true)} className="rounded-full bg-black px-4 py-2 text-xs font-extrabold uppercase text-white hover:bg-neutral-900">
            + Tambah Rumah
          </button>
        </div>

        <div className="rounded-xl border bg-white overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-50 border-b">
              <tr>
                <th className="px-4 py-3 font-semibold text-neutral-600">Alamat</th>
                <th className="px-4 py-3 font-semibold text-neutral-600">Tipe</th>
                <th className="px-4 py-3 font-semibold text-neutral-600">Pemilik (Opsional)</th>
                <th className="px-4 py-3 font-semibold text-neutral-600 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr><td colSpan="4" className="text-center p-4">Memuat data...</td></tr>
              ) : houses.length === 0 ? (
                <tr><td colSpan="4" className="text-center p-4 text-neutral-500">Belum ada data rumah.</td></tr>
              ) : houses.map(h => (
                <tr key={h.id_house || h.id}>
                  <td className="px-4 py-3 font-medium text-black">{h.alamat}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs font-bold rounded-full ${h.tipe === 'KOS' ? 'bg-orange-100 text-orange-800' : 'bg-emerald-100 text-emerald-800'}`}>
                      {h.tipe}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-neutral-600">{h.pemilik?.nama_lengkap || '-'}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleDelete(h.id_house)} className="text-red-600 font-bold uppercase text-xs">Hapus</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-black mb-4">Tambah Data Rumah</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Alamat Lengkap</label>
                <input required value={form.alamat} onChange={e => setForm({...form, alamat: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Contoh: Jl. Kenari Blok A No. 1" />
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Tipe Rumah</label>
                <select required value={form.tipe} onChange={e => setForm({...form, tipe: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm bg-white">
                  <option value="NON_KOS">Rumah Tinggal Biasa (Non-Kos)</option>
                  <option value="KOS">Kos-kosan</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Wilayah</label>
                <select required value={form.id_wilayah} onChange={e => setForm({...form, id_wilayah: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm bg-white">
                  {wilayahs.map(w => <option key={w.id_wilayah} value={w.id_wilayah}>{w.nama_wilayah}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Pemilik (Warga)</label>
                <select value={form.id_pemilik_citizen} onChange={e => setForm({...form, id_pemilik_citizen: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm bg-white">
                  <option value="">-- Tidak Diketahui / Bukan Warga --</option>
                  {citizens.map(c => <option key={c.id_citizen} value={c.id_citizen}>{c.nama_lengkap}</option>)}
                </select>
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
