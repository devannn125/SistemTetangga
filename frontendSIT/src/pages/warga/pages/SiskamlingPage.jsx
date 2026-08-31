import { useState, useEffect, useRef } from 'react'
import { getSiskamlingSchedules, createSiskamlingCheckin } from '@/services/api'
import { getAuthData } from '@/services/authService'
import { useToast } from '@/components/ui/ToastContext'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { PageShell } from '@/components/layout/PageShell'

function CalendarWidget({ schedules }) {
  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth() 
  
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  
  const days = []
  for (let i = 0; i < firstDay; i++) days.push(null)
  for (let i = 1; i <= daysInMonth; i++) days.push(i)
    
  return (
    <div className="border border-neutral-200 p-6 rounded-2xl bg-white shadow-sm">
      <h3 className="text-center font-extrabold text-black mb-6">Agustus 2026</h3>
      <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-neutral-400 mb-2">
        <div>Min</div><div>Sen</div><div>Sel</div><div>Rab</div><div>Kam</div><div>Jum</div><div>Sab</div>
      </div>
      <div className="grid grid-cols-7 gap-2">
        {days.map((d, idx) => {
          if (!d) return <div key={idx} className="h-14"></div>
          
          const dateStr = `2026-08-${String(d).padStart(2, '0')}`
          const daySchedules = schedules.filter(s => s.tanggal_jadwal === dateStr)
          
          let bgClass = "bg-neutral-50 border border-neutral-100 text-neutral-600 hover:bg-neutral-100 transition-colors"
          if (daySchedules.length > 0) bgClass = "bg-sky-50 border-sky-200 text-sky-800 font-extrabold"
          if (d === today.getDate()) bgClass = "bg-amber-100 border-amber-300 text-amber-900 font-extrabold ring-2 ring-amber-400"
          
          return (
            <div key={idx} className={`h-16 rounded-xl flex flex-col items-center justify-center relative p-1 ${bgClass}`}>
              <span className="text-xs mb-1">{d}</span>
              {daySchedules.length > 0 && (
                <div className="flex flex-col gap-0.5 w-full items-center">
                  {daySchedules.map((sc, i) => (
                    <span key={i} className="text-[9px] leading-tight bg-white/60 px-1 rounded truncate w-full text-center">
                      {sc.petugas?.nama_lengkap?.split(' ')[0] || 'Petugas'}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function WargaSiskamlingPage() {
  const [schedules, setSchedules] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('kalender')
  
  const [todaySchedule, setTodaySchedule] = useState(null)
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false)
  const [photo, setPhoto] = useState(null)
  const [isCheckingIn, setIsCheckingIn] = useState(false)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  
  const authUser = getAuthData()
  const { showToast } = useToast()

  async function loadData() {
    setLoading(true)
    try {
      const res = await getSiskamlingSchedules({ per_page: 100 })
      const arr = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []
      setSchedules(arr)
      
      const today = new Date()
      const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
      
      const duty = arr.find(s => 
        s.tanggal_jadwal === todayStr && 
        (s.id_petugas_citizen === authUser?.id_citizen || s.petugas?.nama_lengkap === authUser?.nama_users)
      )
      setTodaySchedule(duty || null)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    let stream = null
    if (isCameraModalOpen && !photo) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
        .then((s) => {
          stream = s
          if (videoRef.current) videoRef.current.srcObject = s
        })
        .catch((err) => {
          console.error(err)
          showToast('Kamera tidak dapat diakses', 'error')
        })
    }
    return () => {
      if (stream) stream.getTracks().forEach(t => t.stop())
    }
  }, [isCameraModalOpen, photo])

  function handleCapture() {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext('2d')
      
      ctx.translate(canvas.width, 0)
      ctx.scale(-1, 1)
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      
      setPhoto(canvas.toDataURL('image/jpeg', 0.8))
    }
  }

  function handleRetake() {
    setPhoto(null)
  }

  function handleCloseModal() {
    setIsCameraModalOpen(false)
    setPhoto(null)
  }

  async function handleCheckin() {
    if (!todaySchedule || !photo) return
    setIsCheckingIn(true)
    try {
      await createSiskamlingCheckin({
        id_siskamling_schedule: todaySchedule.id_siskamling_schedule,
        checkin_time: new Date().toISOString(),
        latitude: -6.200000,
        longitude: 106.816666,
        foto_url: photo
      })
      showToast('Check-in absensi berhasil disimpan!')
      handleCloseModal()
      loadData()
    } catch (err) {
      console.error(err)
      showToast('Gagal menyimpan absensi: ' + (err.response?.data?.message || err.message), 'error')
    } finally {
      setIsCheckingIn(false)
    }
  }

  const logRiwayat = schedules.filter(s => {
    const d = new Date(s.tanggal_jadwal)
    return d.getMonth() < 7
  }).sort((a,b) => new Date(b.tanggal_jadwal) - new Date(a.tanggal_jadwal))
  
  if (logRiwayat.length === 0) {
    logRiwayat.push({ id_siskamling_schedule: 'hist-1', tanggal_jadwal: '2026-07-28', shift: 'PAGI', petugas: { nama_lengkap: 'Andi Santoso' }})
    logRiwayat.push({ id_siskamling_schedule: 'hist-2', tanggal_jadwal: '2026-06-15', shift: 'MALAM', petugas: { nama_lengkap: 'Budi Santoso' }})
  }

  return (
    <PageShell
      eyebrow="Keamanan Lingkungan"
      title="Siskamling & Ronda"
      description="Jadwal keamanan dan presensi ronda tingkat Warga."
    >
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-2/3 border-2 border-neutral-900 bg-white p-6 rounded-xl">
          <div className="flex gap-4 border-b-2 border-neutral-100 mb-6 pb-2">
            <button 
              className={`text-sm font-extrabold uppercase px-2 py-1 ${activeTab === 'kalender' ? 'text-black border-b-4 border-black' : 'text-neutral-400 hover:text-black'}`}
              onClick={() => setActiveTab('kalender')}
            >
              Kalender Ronda
            </button>
            <button 
              className={`text-sm font-extrabold uppercase px-2 py-1 ${activeTab === 'log' ? 'text-black border-b-4 border-black' : 'text-neutral-400 hover:text-black'}`}
              onClick={() => setActiveTab('log')}
            >
              Log Riwayat
            </button>
          </div>

          {activeTab === 'kalender' ? (
            <CalendarWidget schedules={schedules} />
          ) : (
            <div className="space-y-4">
              <h2 className="font-bold text-lg text-black mb-4">Riwayat Bulan Sebelumnya (Juli, Juni)</h2>
              <div className="flex flex-col gap-3">
                {logRiwayat.map((log) => (
                  <div key={log.id_siskamling_schedule} className="flex justify-between items-center p-4 border rounded-xl bg-neutral-50">
                    <div>
                      <p className="text-sm font-extrabold text-black">{log.tanggal_jadwal}</p>
                      <p className="text-xs text-neutral-600 mt-1">Petugas: {log.petugas?.nama_lengkap || 'Unknown'}</p>
                    </div>
                    <Badge variant={log.shift === 'MALAM' ? 'info' : log.shift === 'PAGI' ? 'success' : 'default'}>
                      Shift {log.shift}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="w-full lg:w-1/3">
          {todaySchedule ? (
            todaySchedule.checkins && todaySchedule.checkins.length > 0 ? (
              <div className="border-4 border-emerald-500 bg-emerald-50 p-6 rounded-2xl shadow-sm text-center">
                <div className="mx-auto w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <h3 className="text-xl font-extrabold text-emerald-900 mb-1">Tugas Selesai</h3>
                <p className="text-sm font-bold text-emerald-700 mb-4">Shift {todaySchedule.shift}</p>
                <div className="rounded-lg overflow-hidden border border-emerald-200 mb-3 bg-black">
                  <img 
                    src={todaySchedule.checkins[0].foto_url.startsWith('http') || todaySchedule.checkins[0].foto_url.startsWith('data:') ? todaySchedule.checkins[0].foto_url : `http://localhost:8000/storage/${todaySchedule.checkins[0].foto_url}`} 
                    alt="Bukti Check-in" 
                    className="w-full h-auto object-cover opacity-90"
                  />
                </div>
                <p className="text-xs font-bold text-emerald-600 bg-emerald-100 py-2 rounded-md">
                  Waktu: {new Date(todaySchedule.checkins[0].checkin_time).toLocaleString('id-ID')}
                </p>
              </div>
            ) : (
              <div className="border-4 border-amber-400 bg-amber-50 p-6 rounded-2xl shadow-sm text-center">
                <div className="mx-auto w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd"></path></svg>
                </div>
                <h3 className="text-xl font-extrabold text-amber-900 mb-1">Tugas Anda Hari Ini</h3>
                <p className="text-sm font-bold text-amber-700 mb-6">Shift {todaySchedule.shift}</p>
                
                <Button size="lg" className="w-full text-base py-6 shadow-md" onClick={() => setIsCameraModalOpen(true)} disabled={isCheckingIn}>
                  {isCheckingIn ? 'Menyimpan...' : 'Mulai Ronda (Check-in)'}
                </Button>
              </div>
            )
          ) : (
            <div className="border border-neutral-200 bg-neutral-50 p-6 rounded-2xl text-center">
              <p className="text-sm font-bold text-neutral-500">Tidak ada jadwal ronda untuk Anda hari ini.</p>
            </div>
          )}
        </div>
      </div>

      <Dialog open={isCameraModalOpen} onOpenChange={(open) => { if (!open) handleCloseModal() }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Kamera Aktif - Bukti Check-in</DialogTitle>
            <DialogDescription>Arahkan wajah ke kamera untuk mengambil bukti presensi kehadiran.</DialogDescription>
          </DialogHeader>
          <div className="w-full h-72 bg-black rounded-lg flex items-center justify-center relative overflow-hidden">
            {photo ? (
              <img src={photo} alt="Bukti Kehadiran" className="w-full h-full object-cover" />
            ) : (
              <>
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover transform scale-x-[-1]" />
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-xs font-bold text-white shadow-black drop-shadow-md">LIVE</span>
                </div>
              </>
            )}
            <canvas ref={canvasRef} className="hidden"></canvas>
          </div>
          
          <DialogFooter className="mt-4 flex sm:justify-between w-full">
            <Button variant="outline" onClick={handleCloseModal}>Batal</Button>
            {photo ? (
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleRetake}>Ulangi</Button>
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleCheckin} disabled={isCheckingIn}>
                  {isCheckingIn ? 'Menyimpan...' : 'Simpan Absensi'}
                </Button>
              </div>
            ) : (
              <Button onClick={handleCapture}>Jepret Foto</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageShell>
  )
}
