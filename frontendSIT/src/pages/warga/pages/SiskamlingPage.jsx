import { useState, useEffect } from 'react'
import { getSiskamlingSchedules, createSiskamlingSchedule, getCitizens, getWilayah } from '../../../services/api'
import { getAuthData } from '../../../services/authService'
import { useConfirm } from '../../../components/ui/ConfirmContext'
import { useToast } from '../../../components/ui/ToastContext'

function PageShell({ children, eyebrow, title, description }) {
  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <section className="border-2 border-neutral-900 bg-white p-8 max-sm:p-5">
        <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-neutral-500">{eyebrow}</p>
        <h1 className="mt-3 text-3xl font-extrabold leading-tight text-black max-sm:text-2xl">{title}</h1>
        {description ? <p className="mt-4 max-w-2xl text-sm leading-6 text-neutral-600">{description}</p> : null}
      </section>
      {children}
    </div>
  )
}

function CalendarWidget({ schedules }) {
  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth() // 0-indexed
  
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  
  const days = []
  for (let i = 0; i < firstDay; i++) {
    days.push(null)
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i)
  }

  // Create a map of date string -> schedule array
  const scheduleMap = {}
  schedules.forEach(s => {
    const d = s.tanggal_jadwal
    if (!scheduleMap[d]) scheduleMap[d] = []
    scheduleMap[d].push(s)
  })

  const monthName = new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(today)

  return (
    <div className="w-full">
      <h2 className="text-xl font-bold text-black mb-4 text-center">{monthName}</h2>
      <div className="grid grid-cols-7 gap-2 mb-2 text-center text-xs font-bold text-neutral-500">
        <div>Min</div><div>Sen</div><div>Sel</div><div>Rab</div><div>Kam</div><div>Jum</div><div>Sab</div>
      </div>
      <div className="grid grid-cols-7 gap-2">
        {days.map((day, idx) => {
          if (!day) return <div key={idx} className="h-20 sm:h-24 bg-neutral-50 rounded-lg"></div>
          
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          const hasSchedule = scheduleMap[dateStr] && scheduleMap[dateStr].length > 0
          
          return (
            <div key={idx} className={`relative flex flex-col items-center justify-start h-20 sm:h-24 p-1 sm:p-2 border rounded-lg ${hasSchedule ? 'bg-sky-50 border-sky-300' : 'bg-white border-neutral-200'}`}>
              <span className={`text-sm font-bold ${hasSchedule ? 'text-sky-800' : 'text-neutral-700'}`}>{day}</span>
              {hasSchedule && (
                <div className="mt-1 flex flex-col gap-1 w-full px-1">
                  {scheduleMap[dateStr].slice(0, 2).map((s, i) => (
                    <div key={i} className="text-[10px] bg-sky-200 text-sky-900 rounded px-1 truncate w-full" title={s.petugas?.nama_lengkap}>
                      {s.petugas?.nama_lengkap || 'Ronda'}
                    </div>
                  ))}
                  {scheduleMap[dateStr].length > 2 && (
                    <div className="text-[10px] text-sky-700 text-center font-bold">+{scheduleMap[dateStr].length - 2}</div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function SiskamlingPage() {
  const [schedules, setSchedules] = useState([])
  const [loading, setLoading] = useState(true)
  const [citizens, setCitizens] = useState([])
  const [wilayahs, setWilayahs] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const confirm = useConfirm()
  const { showToast } = useToast()
  
  const authUser = getAuthData()
  const hasAdminSiskamling = authUser?.available_roles?.includes('SISKAMLING') || authUser?.role?.kode === 'SISKAMLING' || authUser?.role === 'SISKAMLING'
  
  const [form, setForm] = useState({ 
    id_wilayah: '', 
    id_petugas_citizen: '', 
    shift: 'MALAM', 
    tanggal_jadwal: new Date().toISOString().split('T')[0] 
  })

  async function loadData() {
    setLoading(true)
    try {
      const [resSched, resCit, resWil] = await Promise.all([
        getSiskamlingSchedules({ per_page: 100 }),
        hasAdminSiskamling ? getCitizens({ per_page: 100 }) : Promise.resolve([]),
        hasAdminSiskamling ? getWilayah({ per_page: 100 }) : Promise.resolve([])
      ])
      
      const arr = Array.isArray(resSched?.data) ? resSched.data : Array.isArray(resSched) ? resSched : []
      setSchedules(arr)

      if (hasAdminSiskamling) {
        const cData = Array.isArray(resCit?.data) ? resCit.data : Array.isArray(resCit) ? resCit : []
        const wData = Array.isArray(resWil?.data) ? resWil.data : Array.isArray(resWil) ? resWil : []
        setCitizens(cData)
        setWilayahs(wData)
        if (wData.length > 0 && cData.length > 0) {
          setForm(f => ({ ...f, id_wilayah: wData[0].id_wilayah, id_petugas_citizen: cData[0].id_citizen }))
        }
      }
      setLoading(false)
    } catch (err) {
      console.error(err)
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  async function handleAddSchedule(e) {
    e.preventDefault()
    const approved = await confirm({
      title: 'Konfirmasi Jadwal',
      message: "Yakin ingin menambahkan jadwal ronda pada tanggal " + form.tanggal_jadwal + " (shift " + form.shift + ")?",
      confirmLabel: 'Ya, Simpan',
    })
    if (!approved) return
    try {
      await createSiskamlingSchedule({
        id_wilayah: form.id_wilayah,
        id_petugas_citizen: form.id_petugas_citizen,
        shift: form.shift,
        tanggal_jadwal: form.tanggal_jadwal
      })
      showToast('Jadwal ronda baru berhasil ditambahkan.')
      setIsModalOpen(false)
      loadData()
    } catch (err) {
      showToast('Gagal menyimpan jadwal: ' + err.message, 'error')
    }
  }

  return (
    <PageShell eyebrow="Jadwal Siskamling" title="Jadwal Siskamling" description="Lihat kalender ronda dan jadwal petugas.">
      <section className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="rounded-2xl border border-neutral-300 bg-white p-6">
          {loading ? (
             <div className="flex h-full items-center justify-center text-sm text-neutral-500">Memuat kalender...</div>
          ) : (
            <CalendarWidget schedules={schedules} />
          )}
        </div>
        <div className="space-y-4">
                    <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-lg border-b pb-2 flex-grow">Jadwal Mendatang</h2>
            {hasAdminSiskamling && (
              <button onClick={() => setIsModalOpen(true)} className="ml-4 rounded-full bg-black px-4 py-2 text-xs font-extrabold uppercase text-white hover:bg-neutral-900">
                + Tambah Jadwal
              </button>
            )}
          </div>
          {loading ? (
             <div className="text-sm text-neutral-500 p-4 bg-white border rounded-xl text-center">Memuat jadwal...</div>
          ) : schedules.length === 0 ? (
             <div className="text-sm text-neutral-500 p-4 bg-white border rounded-xl text-center">Belum ada jadwal siskamling aktif.</div>
          ) : (
            schedules
              .filter(s => new Date(s.tanggal_jadwal) >= new Date(new Date().setHours(0,0,0,0)))
              .sort((a,b) => new Date(a.tanggal_jadwal) - new Date(b.tanggal_jadwal))
              .slice(0, 5)
              .map((item) => (
              <article className="rounded-xl border border-neutral-300 bg-white p-5" key={item.id_siskamling_schedule || item.id}>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-extrabold text-black">{item.tanggal_jadwal}</h3>
                    <p className="mt-1 text-xs font-bold uppercase text-neutral-500">Shift {item.shift || 'MALAM'}</p>
                  </div>
                  <span className="text-xs font-bold text-emerald-600">Aktif</span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded bg-neutral-100 px-3 py-1 text-xs font-bold text-black">
                    {item.petugas?.nama_lengkap || item.nama_petugas || 'Warga (Terhapus)'}
                  </span>
                </div>
              </article>
            ))
          )}
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
                <label className="block text-xs font-bold text-neutral-700 mb-1">Pilih Petugas (Warga)</label>
                <select required value={form.id_petugas_citizen} onChange={e => setForm({...form, id_petugas_citizen: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm bg-white">
                  {citizens.map(c => <option key={c.id_citizen} value={c.id_citizen}>{c.nama_lengkap}</option>)}
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

              <div className="mt-6 flex justify-end gap-3 pt-4 border-t">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-xs font-bold text-neutral-600 hover:text-black">BATAL</button>
                <button type="submit" className="rounded-full bg-black px-5 py-2 text-xs font-extrabold uppercase text-white hover:bg-neutral-900">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageShell>
  )
}

