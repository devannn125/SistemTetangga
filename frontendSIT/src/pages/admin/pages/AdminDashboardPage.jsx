import { useEffect, useState } from 'react'
import { PageShell } from '@/components/layout/PageShell'
import { getAuditLogs, getCitizens, getWilayah } from '@/services/api'
import { StatCard } from '@/components/dashboard/StatCard'
import { Icon } from '@/components/ui/Icon'

const ACTION_LABELS = {
  CREATE: 'Menambahkan',
  UPDATE: 'Memperbarui',
  DELETE: 'Menghapus',
  ASSIGN_ROLE: 'Mengubah peran',
  LOGIN: 'Login',
  LOGOUT: 'Logout',
  CHANGE_PASSWORD: 'Mengubah password',
}

const PER_PAGE = 10

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({ warga: 0, rt: 0, rw: 0, dukuh: 0 })
  const [loading, setLoading] = useState(true)
  const [logs, setLogs] = useState([])
  const [logsError, setLogsError] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        const [wargaRes, wilRes, auditRes] = await Promise.all([
          getCitizens({ per_page: 1, exclude_admin: 1 }),
          getWilayah({ per_page: 500, all: 1 }),
          getAuditLogs({
            per_page: PER_PAGE,
            page,
            ...(dateFrom ? { from: dateFrom } : {}),
            ...(dateTo ? { to: dateTo } : {}),
          }),
        ])

        const wargaCount = wargaRes?.meta?.total ?? 0
        const arrWil = Array.isArray(wilRes?.data) ? wilRes.data : Array.isArray(wilRes) ? wilRes : []
        const rt = arrWil.filter(w => w.tipe === 'RT').length
        const rw = arrWil.filter(w => w.tipe === 'RW').length
        const dukuh = arrWil.filter(w => w.tipe === 'DUKUH').length

        setStats({ warga: wargaCount, rt, rw, dukuh })

        const arrLogs = Array.isArray(auditRes?.data) ? auditRes.data : Array.isArray(auditRes) ? auditRes : []
        setLogs(arrLogs)
        setTotalPages(auditRes?.meta?.last_page || (arrLogs.length > 0 ? 1 : 1))
        setLogsError('')
      } catch (err) {
        console.error('Failed to load dashboard stats', err)
        setLogsError(err?.message || 'Gagal memuat log aktivitas.')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [page, dateFrom, dateTo])

  function handleFromChange(value) {
    setDateFrom(value)
    setPage(1)
  }

  function handleToChange(value) {
    setDateTo(value)
    setPage(1)
  }

  function handleResetFilters() {
    setDateFrom('')
    setDateTo('')
    setPage(1)
  }

  function goToPage(next) {
    if (next < 1 || next > totalPages) return
    setPage(next)
  }

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
        <div className='border-b px-6 py-4'>
          <div className='flex flex-wrap items-end gap-3'>
            <label className='flex flex-col gap-1 text-xs font-semibold text-neutral-600'>
              Dari Tanggal
              <input
                type='date'
                value={dateFrom}
                onChange={(e) => handleFromChange(e.target.value)}
                className='rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-sm text-neutral-900 focus:border-black focus:outline-none'
              />
            </label>
            <label className='flex flex-col gap-1 text-xs font-semibold text-neutral-600'>
              Sampai Tanggal
              <input
                type='date'
                value={dateTo}
                min={dateFrom || undefined}
                onChange={(e) => handleToChange(e.target.value)}
                className='rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-sm text-neutral-900 focus:border-black focus:outline-none'
              />
            </label>
            <button
              type='button'
              onClick={handleResetFilters}
              disabled={!dateFrom && !dateTo}
              className='rounded-full border border-neutral-300 bg-white px-4 py-1.5 text-xs font-extrabold uppercase text-neutral-700 transition hover:border-black hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-40'
            >
              Reset
            </button>
          </div>
        </div>
        <div className='p-6'>
          {logsError ? (
            <div className='rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-900'>
              {logsError}
            </div>
          ) : loading ? (
            <div className='space-y-4'>
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className='flex animate-pulse items-start gap-4'>
                  <div className='h-10 w-10 shrink-0 rounded-full bg-neutral-200' />
                  <div className='flex-1 space-y-2'>
                    <div className='h-4 w-2/3 rounded bg-neutral-200' />
                    <div className='h-3 w-1/3 rounded bg-neutral-100' />
                  </div>
                </div>
              ))}
            </div>
          ) : logs.length === 0 ? (
            <div className='text-center text-sm text-neutral-500'>Belum ada aktivitas tercatat.</div>
          ) : (
            <div className='space-y-4'>
              {logs.map(log => (
                <div key={log.id_action_log || log.id} className='flex items-start gap-4 border-b border-neutral-100 pb-4 last:border-0 last:pb-0'>
                  <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600'>
                    <Icon name='clock' className='h-5 w-5' />
                  </div>
                  <div>
                    <p className='text-sm text-black'>
                      <span className='font-bold'>{log.actor_name || 'System'}</span> melakukan <span className='font-bold'>{ACTION_LABELS[log.id_permission_action] || log.id_permission_action}</span> pada <span className='font-bold'>{log.module?.nama_module || '-'}</span>
                    </p>
                    <p className='text-xs text-neutral-500'>
                      {new Date(log.created_at).toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!logsError && !loading && logs.length > 0 && (
            <div className='mt-4 flex items-center justify-between border-t border-neutral-100 pt-4'>
              <button
                type='button'
                onClick={() => goToPage(page - 1)}
                disabled={page <= 1}
                className='rounded-full border border-neutral-300 bg-white px-4 py-1.5 text-xs font-extrabold uppercase text-neutral-700 transition hover:border-black hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-40'
              >
                Sebelumnya
              </button>
              <span className='text-xs font-semibold text-neutral-500'>Halaman {page} dari {totalPages}</span>
              <button
                type='button'
                onClick={() => goToPage(page + 1)}
                disabled={page >= totalPages}
                className='rounded-full border border-neutral-300 bg-white px-4 py-1.5 text-xs font-extrabold uppercase text-neutral-700 transition hover:border-black hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-40'
              >
                Berikutnya
              </button>
            </div>
          )}
        </div>
      </div>
    </PageShell>
  )
}