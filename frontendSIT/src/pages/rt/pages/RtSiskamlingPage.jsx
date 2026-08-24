import { useState, useEffect } from 'react'
import { PageShell } from '../../../components/layout/PageShell'
import { getSiskamlingSchedules, createSiskamlingSchedule, deleteSiskamlingSchedule, getCitizens, getWilayah } from '../../../services/api'

const initialAlerts = [
  { id: 101, tanggal: '2026-08-20', laporan: 'Mati lampu di blok A, patroli diperketat.', eskalasi: false },
]

export default function RtSiskamlingPage() {
  const [schedules, setSchedules] = useState([])
  const [citizens, setCitizens] = useState([])
  const [wilayahs, setWilayahs] = useState([])
  const [alerts, setAlerts] = useState(initialAlerts)
  const [notice, setNotice] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  const [form, setForm] = useState({ 
    id_wilayah: '', 
    id_petugas_citizen: '', 
    shift: 'MALAM', 
    tanggal_jadwal: new Date().toISOString().split('T')[0] 
  })

  async function loadData() {
    try {
      const [resSched, resCit, resWil] = await Promise.all([
        getSiskamlingSchedules({ per_page: 100 }),
        getCitizens({ per_page: 100 }),
        getWilayah({ per_page: 100 })
      ])
      
      const scData = Array.isArray(resSched?.data) ? resSched.data : Array.isArray(resSched) ? resSched : []
      const cData = Array.isArray(resCit?.data) ? resCit.data : Array.isArray(resCit) ? resCit : []
      const wData = Array.isArray(resWil?.data) ? resWil.data : Array.isArray(resWil) ? resWil : []
      
      setSchedules(scData)
      setCitizens(cData)
      setWilayahs(wData)
      
      if (wData.length > 0 && cData.length > 0) {
        setForm(f => ({ ...f, id_wilayah: wData[0].id_wilayah, id_petugas_citizen: cData[0].id_citizen }))
      }
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  function handleEscalateAlert(id) {
    setAlerts(alerts.map(a => a.id === id ? { ...a, eskalasi: true } : a))
    setNotice('Kejadian berhasil dieskalasi ke tingkat RW/Dukuh secara langsung.')
  }

  async function handleAddSchedule(e) {
    e.preventDefault()
    setNotice('')
    try {
      await createSiskamlingSchedule({
        id_wilayah: form.id_wilayah,
        id_petugas_citizen: form.id_petugas_citizen,
        shift: form.shift,
        tanggal_jadwal: form.tanggal_jadwal
      })
      setNotice('Jadwal ronda baru berhasil ditambahkan.')
      setIsModalOpen(false)
      loadData()
    } catch (err) {
      setNotice('Gagal menyimpan jadwal: ' + err.message)
    }
  }

  async function handleDelete(id) {
    if (!confirm('Hapus jadwal ini?')) return
    try {
      await deleteSiskamlingSchedule(id)
      setNotice('Jadwal berhasil dihapus.')
      loadData()
    } catch (err) {
      setNotice('Gagal menghapus: ' + err.message)
    }
  }

  return (
    <PageShell
      eyebrow="Siskamling"
      title="Jadwal & Kejadian Siskamling"
      description="Kelola jadwal ronda warga. Kejadian atau laporan darurat dapat langsung dieskalasi ke RW/Dukuh tanpa melalui proses bertingkat (Bypass)."
    >
      <section className="mt-8 space-y-8">
        {notice && (
          <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-semibold text-sky-900">
            {notice}
          </div>
        )}

        {/* JADWAL */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-black">Jadwal Ronda (Siskamling)</h2>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="rounded-full bg-black px-4 py-2 text-xs font-extrabold uppercase text-white hover:bg-neutral-900"
            >
              + Tambah Jadwal
            </button>
          </div>
          <div className="rounded-xl border bg-white overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-neutral-50 border-b">
                <tr>
                  <th className="px-4 py-3 font-semibold text-neutral-600">Tanggal</th>
                  <th className="px-4 py-3 font-semibold text-neutral-600">Shift</th>
                  <th className="px-4 py-3 font-semibold text-neutral-600">Petugas</th>
                  <th className="px-4 py-3 font-semibold text-neutral-600 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {schedules.length === 0 ? (
                  <tr><td colSpan="4" className="text-center p-4 text-neutral-500">Belum ada jadwal</td></tr>
                ) : schedules.map(s => (
                  <tr key={s.id_siskamling_schedule || s.id}>
                    <td className="px-4 py-3 font-medium text-black">{s.tanggal_jadwal}</td>
                    <td className="px-4 py-3">{s.shift}</td>
                    <td className="px-4 py-3">
                      {s.petugas?.nama_lengkap || s.id_petugas_citizen || 'Unknown'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => handleDelete(s.id_siskamling_schedule)} className="text-red-600 font-bold uppercase text-xs">Hapus</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* LOG KEJADIAN & ESKALASI */}
        <div>
          <h2 className="text-lg font-bold text-black mb-4">Log Kejadian & Darurat</h2>
          <div className="grid gap-4">
            {alerts.map(alert => (
              <div key={alert.id} className="border p-4 rounded-xl bg-white">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs text-neutral-500 font-bold mb-1">{alert.tanggal}</p>
                    <p className="text-sm text-neutral-900">{alert.laporan}</p>
                  </div>
                  <div>
                    {alert.eskalasi ? (
                      <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-bold">DITERUSKAN KE RW/DUKUH</span>
                    ) : (
                      <button 
                        onClick={() => handleEscalateAlert(alert.id)}
                        className="bg-red-600 text-white px-3 py-2 rounded-lg text-xs font-bold hover:bg-red-700 uppercase"
                      >
                        Bypass Eskalasi
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-black mb-4">Tambah Jadwal Ronda</h3>
            <form onSubmit={handleAddSchedule} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Wilayah</label>
                <select required value={form.id_wilayah} onChange={e => setForm({...form, id_wilayah: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm bg-white">
                  {wilayahs.map(w => <option key={w.id_wilayah} value={w.id_wilayah}>{w.nama_wilayah}</option>)}
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Tanggal</label>
                <input type="date" required value={form.tanggal_jadwal} onChange={e => setForm({...form, tanggal_jadwal: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Shift</label>
                <select required value={form.shift} onChange={e => setForm({...form, shift: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm bg-white">
                  <option value="PAGI">Pagi</option>
                  <option value="SORE">Sore</option>
                  <option value="MALAM">Malam</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Petugas (Warga)</label>
                <select required value={form.id_petugas_citizen} onChange={e => setForm({...form, id_petugas_citizen: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm bg-white">
                  {citizens.map(c => <option key={c.id_citizen} value={c.id_citizen}>{c.nama_lengkap}</option>)}
                </select>
              </div>
              
              <div className="mt-6 flex justify-end gap-3 pt-4 border-t">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-xs font-bold text-neutral-600 hover:text-black">BATAL</button>
                <button type="submit" className="rounded-full bg-black px-5 py-2 text-xs font-extrabold uppercase text-white hover:bg-neutral-900">
                  Simpan Jadwal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageShell>
  )
}
