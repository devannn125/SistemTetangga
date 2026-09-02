import { useEffect, useState } from 'react'
import { PageShell } from '@/components/layout/PageShell'
import { getCitizens, getWilayah } from '@/services/api'
import { StatCard } from '@/components/dashboard/StatCard'
import { Icon } from '@/components/ui/Icon'

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({ warga: 0, rt: 0, rw: 0, dukuh: 0 })
  const [loading, setLoading] = useState(true)
  const [logs, setLogs] = useState([])

  useEffect(() => {
    async function loadData() {
      try {
        const [wargaRes, wilRes] = await Promise.all([
          getCitizens({ per_page: 1 }),
          getWilayah({ per_page: 500, all: 1 })
        ])
        
        const wargaCount = wargaRes.total || 0
        const arrWil = Array.isArray(wilRes?.data) ? wilRes.data : Array.isArray(wilRes) ? wilRes : []
        const rt = arrWil.filter(w => w.tipe === 'RT').length
        const rw = arrWil.filter(w => w.tipe === 'RW').length
        const dukuh = arrWil.filter(w => w.tipe === 'DUKUH').length

        setStats({ warga: wargaCount, rt, rw, dukuh })

        // Fetch audit logs... (assuming backend supports GET /api/audit-logs)
        const token = localStorage.getItem('sistem_tetangga_token')
        const logRes = await fetch('http://localhost:8000/api/audit-logs?per_page=10', {
          headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }
        }).then(r => r.json())

        if (logRes?.data) {
          setLogs(logRes.data)
        }
      } catch (err) {
        console.error('Failed to load dashboard stats', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  return (
    <PageShell
      eyebrow='Dashboard'
      title='Beranda Sistem'
      description='Pemantauan statistik dan aktivitas sistem secara real-time.'
    >
      <div className='mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4'>
        <StatCard item={{ title: 'Total Warga', value: loading ? '...' : stats.warga, icon: 'users', accent: 'blue' }} />
        <StatCard item={{ title: 'Total RT', value: loading ? '...' : stats.rt, icon: 'map', accent: 'amber' }} />
        <StatCard item={{ title: 'Total RW', value: loading ? '...' : stats.rw, icon: 'map', accent: 'green' }} />
        <StatCard item={{ title: 'Total Dukuh', value: loading ? '...' : stats.dukuh, icon: 'map', accent: 'blue' }} />
      </div>

      <div className='mt-8 rounded-xl border border-neutral-300 bg-white shadow-sm'>
        <div className='border-b px-6 py-4'>
          <h2 className='font-bold text-black'>Audit Trail (Log Aktivitas)</h2>
        </div>
        <div className='p-6'>
          {logs.length === 0 ? (
            <div className='text-center text-sm text-neutral-500'>Belum ada aktivitas tercatat.</div>
          ) : (
            <div className='space-y-4'>
              {logs.map(log => (
                <div key={log.id_audit_log || log.id} className='flex items-start gap-4 border-b border-neutral-100 pb-4 last:border-0 last:pb-0'>
                  <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600'>
                    <Icon name='activity' className='h-5 w-5' />
                  </div>
                  <div>
                    <p className='text-sm text-black'>
                      <span className='font-bold'>{log.actor_name || 'System'}</span> melakukan <span className='font-bold'>{log.action}</span> pada <span className='font-bold'>{log.module}</span>
                    </p>
                    <p className='text-xs text-neutral-500'>
                      {new Date(log.created_at).toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageShell>
  )
}

