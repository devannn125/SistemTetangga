import { useState, useEffect } from 'react'
import { getSiskamlingSchedules } from '../../../services/api'

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

  useEffect(() => {
    getSiskamlingSchedules({ per_page: 100 })
      .then(res => {
        const arr = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []
        setSchedules(arr)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [])

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
          <h2 className="font-bold text-lg border-b pb-2 mb-4">Jadwal Mendatang</h2>
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
    </PageShell>
  )
}
