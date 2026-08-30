import { useState, useEffect } from 'react'
import { PageShell } from '../../../components/layout/PageShell'
import { getSiskamlingSchedules, getSiskamlingIncidents, getCitizens, getWilayah } from '../../../services/api'

export default function SiskamlingPage() {
  const [schedules, setSchedules] = useState([])
  const [incidents, setIncidents] = useState([])
  const [citizens, setCitizens] = useState([])
  const [wilayahs, setWilayahs] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [notice, setNotice] = useState('')

  async function loadData() {
    try {
      const [resSched, resInc, resCit, resWil] = await Promise.all([
        getSiskamlingSchedules({ per_page: 100 }),
        getSiskamlingIncidents({ per_page: 100 }),
        getCitizens({ per_page: 100 }),
        getWilayah({ per_page: 100 })
      ])

      const scData = Array.isArray(resSched?.data) ? resSched.data : Array.isArray(resSched) ? resSched : []
      const incData = Array.isArray(resInc?.data) ? resInc.data : Array.isArray(resInc) ? resInc : []
      const cData = Array.isArray(resCit?.data) ? resCit.data : Array.isArray(resCit) ? resCit : []
      const wData = Array.isArray(resWil?.data) ? resWil.data : Array.isArray(resWil) ? resWil : []

      setSchedules(scData)
      setIncidents(incData)
      setCitizens(cData)
      setWilayahs(wData)
    } catch (err) {
      console.error(err)
      setNotice('Gagal memuat data: ' + err.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    let alive = true
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData().finally(() => { if (alive) setIsLoading(false) })
    return () => { alive = false }
  }, [])

  function getWilayahName(id) {
    return wilayahs?.find(w => w.id_wilayah === id)?.nama_wilayah || '-'
  }

  function getPetugasName(id) {
    return citizens?.find(c => c.id_citizen === id)?.nama_lengkap || '-'
  }

  function getIncidentStatusClass(status) {
    return {
      BARU: 'bg-amber-100 text-amber-900',
      DITINDAKLANJUTI: 'bg-sky-100 text-sky-900',
      SELESAI: 'bg-emerald-100 text-emerald-900',
    }[status] || 'bg-neutral-100 text-neutral-900'
  }

  function formatDate(value) {
  if (!value) return '-'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '-'
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(d)
}

function formatDateOnly(value) {
  if (!value) return '-'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '-'
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(d)
  }

  return (
    <PageShell
      eyebrow="Siskamling"
      title="Jadwal & Kejadian Siskamling"
      description="Melihat jadwal ronda warga dan log kejadian (Read-only). Pengelolaan jadwal dan eskalasi kejadian dilakukan oleh Ketua RT."
    >
      <section className="mt-8 space-y-8">
        {notice ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-900">
            {notice}
          </div>
        ) : null}

        {/* JADWAL */}
        <div>
          <h2 className="text-lg font-bold text-black mb-4">Jadwal Ronda (Siskamling)</h2>
          <div className="rounded-xl border bg-white overflow-hidden">
            {isLoading ? (
              <div className="p-8 text-center text-sm text-neutral-500">Memuat data...</div>
            ) : schedules.length === 0 ? (
              <div className="p-8 text-center text-sm text-neutral-500">Belum ada jadwal ronda.</div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="bg-neutral-50 border-b">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-neutral-600">Tanggal</th>
                    <th className="px-4 py-3 font-semibold text-neutral-600">Shift</th>
                    <th className="px-4 py-3 font-semibold text-neutral-600">Wilayah</th>
                    <th className="px-4 py-3 font-semibold text-neutral-600">Petugas</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {schedules.map(s => (
                    <tr key={s.id_siskamling_schedule || s.id}>
                      <td className="px-4 py-3 font-medium text-black">{formatDateOnly(s.tanggal_jadwal)}</td>
                      <td className="px-4 py-3">
                        <span className="rounded-full px-2 py-1 text-xs font-bold bg-sky-100 text-sky-900">{s.shift}</span>
                      </td>
                      <td className="px-4 py-3 text-neutral-600">{getWilayahName(s.id_wilayah)}</td>
                      <td className="px-4 py-3 text-neutral-600">{getPetugasName(s.id_petugas_citizen)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* LOG KEJADIAN */}
        <div>
          <h2 className="text-lg font-bold text-black mb-4">Log Kejadian & Darurat</h2>
          {isLoading ? (
            <div className="p-8 text-center text-sm text-neutral-500">Memuat data...</div>
          ) : incidents.length === 0 ? (
            <div className="rounded-xl border border-neutral-300 bg-white p-8 text-center text-sm font-semibold text-neutral-600">
              Belum ada kejadian tercatat.
            </div>
          ) : (
            <div className="grid gap-4">
              {incidents.map(incident => (
                <div key={incident.id_siskamling_incident || incident.id} className="border border-neutral-300 bg-white p-6 rounded-2xl">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs text-neutral-500 font-bold mb-1">{formatDate(incident.created_at)}</p>
                      <p className="text-sm text-neutral-900">{incident.deskripsi || '-'}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${getIncidentStatusClass(incident.status)}`}>
                      {incident.status}
                    </span>
                  </div>

                  <div className="mt-5 grid gap-2 text-sm text-neutral-500 sm:grid-cols-2 lg:grid-cols-4">
                    <p><span className="font-bold text-neutral-900">Jenis:</span> {incident.jenis_kejadian?.nama_master || '-'}</p>
                    <p><span className="font-bold text-neutral-900">Lokasi:</span> {incident.lokasi || '-'}</p>
                    <p><span className="font-bold text-neutral-900">Pelapor:</span> {incident.dilaporkanOleh?.nama_users || '-'}</p>
                    {incident.is_panic && (
                      <span className="rounded-full bg-red-100 text-red-800 px-3 py-1 text-xs font-bold">PANIC BUTTON</span>
                    )}
                  </div>

                  {incident.foto_url && (
                    <div className="mt-4">
                      <img src={incident.foto_url.startsWith('http') ? incident.foto_url : (import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://127.0.0.1:8000') + '/storage/' + incident.foto_url} alt="Foto kejadian" className="max-h-48 rounded-lg border border-neutral-200" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </PageShell>
  )
}