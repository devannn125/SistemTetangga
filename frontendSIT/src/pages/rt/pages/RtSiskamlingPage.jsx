import { useState, useEffect } from 'react'
import { PageShell } from '../../../components/layout/PageShell'
import { DataTable } from '../../../components/ui/DataTable'
import { Button } from '../../../components/ui/Button'
import { Badge } from '../../../components/ui/Badge'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card'
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog'
import { getSiskamlingSchedules, createSiskamlingSchedule, deleteSiskamlingSchedule, getCitizens, getWilayah } from '../../../services/api'
import { useConfirm } from '../../../components/ui/ConfirmContext'
import { useToast } from '../../../components/ui/ToastContext'

const initialAlerts = [
  { id: 101, tanggal: '2026-08-20', laporan: 'Mati lampu di blok A, patroli diperketat.', eskalasi: false },
]

const SHIFT_OPTIONS = [
  { value: 'PAGI', label: 'Pagi' },
  { value: 'SORE', label: 'Sore' },
  { value: 'MALAM', label: 'Malam' },
]

const SCHEDULE_COLUMNS = [
  {
    key: 'tanggal_jadwal',
    label: 'Tanggal',
    render: (row) => <span className="font-medium text-neutral-900">{row.tanggal_jadwal}</span>,
  },
  {
    key: 'shift',
    label: 'Shift',
    render: (row) => (
      <Badge variant={row.shift === 'MALAM' ? 'info' : row.shift === 'PAGI' ? 'success' : 'default'}>
        {row.shift}
      </Badge>
    ),
  },
  {
    key: 'petugas',
    label: 'Petugas',
    render: (row) => row.petugas?.nama_lengkap || row.id_petugas_citizen || 'Unknown',
  },
]

const SCHEDULE_FILTERS = [
  {
    key: 'shift',
    label: 'Shift',
    options: [
      { value: 'PAGI', label: 'Pagi' },
      { value: 'SORE', label: 'Sore' },
      { value: 'MALAM', label: 'Malam' },
    ],
  },
]

export default function RtSiskamlingPage() {
  const [schedules, setSchedules] = useState([])
  const [citizens, setCitizens] = useState([])
  const [wilayahs, setWilayahs] = useState([])
  const [alerts, setAlerts] = useState(initialAlerts)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const confirm = useConfirm()
  const { showToast } = useToast()

  const [form, setForm] = useState({
    id_wilayah: '',
    id_petugas_citizen: '',
    shift: 'MALAM',
    tanggal_jadwal: new Date().toISOString().split('T')[0],
  })

  async function loadData() {
    setIsLoading(true)
    try {
      const [resSched, resCit, resWil] = await Promise.all([
        getSiskamlingSchedules({ per_page: 100 }),
        getCitizens({ per_page: 100 }),
        getWilayah({ per_page: 100 }),
      ])
      const scData = Array.isArray(resSched?.data) ? resSched.data : Array.isArray(resSched) ? resSched : []
      const cData = Array.isArray(resCit?.data) ? resCit.data : Array.isArray(resCit) ? resCit : []
      const wData = Array.isArray(resWil?.data) ? resWil.data : Array.isArray(resWil) ? resWil : []
      setSchedules(scData)
      setCitizens(cData)
      setWilayahs(wData)
      if (wData.length > 0 && cData.length > 0) {
        setForm((f) => ({ ...f, id_wilayah: wData[0].id_wilayah, id_petugas_citizen: cData[0].id_citizen }))
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  function handleEscalateAlert(id) {
    setAlerts(alerts.map((a) => (a.id === id ? { ...a, eskalasi: true } : a)))
    showToast('Kejadian berhasil dieskalasi ke tingkat RW/Dukuh secara langsung.')
  }

  async function handleAddSchedule(e) {
    e.preventDefault()
    const approved = await confirm({
      title: 'Konfirmasi Jadwal',
      message: `Yakin ingin menambahkan jadwal ronda pada tanggal ${form.tanggal_jadwal} (shift ${form.shift})?`,
      confirmLabel: 'Ya, Simpan',
    })
    if (!approved) return
    try {
      await createSiskamlingSchedule({
        id_wilayah: form.id_wilayah,
        id_petugas_citizen: form.id_petugas_citizen,
        shift: form.shift,
        tanggal_jadwal: form.tanggal_jadwal,
      })
      showToast('Jadwal ronda baru berhasil ditambahkan.')
      setIsModalOpen(false)
      loadData()
    } catch (err) {
      showToast('Gagal menyimpan jadwal: ' + err.message, 'error')
    }
  }

  async function handleDelete(id) {
    const approved = await confirm({
      title: 'Konfirmasi Hapus',
      message: 'Yakin ingin menghapus jadwal ronda ini?',
      confirmLabel: 'Ya, Hapus',
    })
    if (!approved) return
    try {
      await deleteSiskamlingSchedule(id)
      showToast('Jadwal berhasil dihapus.')
      loadData()
    } catch (err) {
      showToast('Gagal menghapus: ' + err.message, 'error')
    }
  }

  const columnsWithAction = [
    ...SCHEDULE_COLUMNS,
    {
      key: 'actions',
      label: 'Aksi',
      render: (row) => (
        <Button
          variant="danger"
          size="sm"
          onClick={(e) => { e.stopPropagation(); handleDelete(row.id_siskamling_schedule) }}
        >
          Hapus
        </Button>
      ),
    },
  ]

  return (
    <PageShell
      eyebrow="Siskamling"
      title="Jadwal & Kejadian Siskamling"
      description="Kelola jadwal ronda warga. Kejadian atau laporan darurat dapat langsung dieskalasi ke RW/Dukuh tanpa melalui proses bertingkat (Bypass)."
    >
      <div className="space-y-6">
        {/* Jadwal Ronda */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Jadwal Ronda (Siskamling)</CardTitle>
              <Button size="sm" onClick={() => setIsModalOpen(true)}>
                + Tambah Jadwal
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <DataTable
              data={schedules}
              columns={columnsWithAction}
              searchKeys={['tanggal_jadwal']}
              searchPlaceholder="Cari tanggal atau nama petugas..."
              filters={SCHEDULE_FILTERS}
              loading={isLoading}
              emptyMessage="Belum ada jadwal ronda."
              rowKey="id_siskamling_schedule"
              getRowKey={(row) => row.id_siskamling_schedule || row.id}
            />
          </CardContent>
        </Card>

        {/* Log Kejadian & Eskalasi */}
        <Card>
          <CardHeader>
            <CardTitle>Log Kejadian & Darurat</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {alerts.map((alert) => (
                <div key={alert.id} className="flex items-start justify-between gap-4 rounded-lg border border-neutral-100 bg-neutral-50 p-4">
                  <div>
                    <p className="text-xs font-semibold text-neutral-400">{alert.tanggal}</p>
                    <p className="mt-1 text-sm text-neutral-900">{alert.laporan}</p>
                  </div>
                  {alert.eskalasi ? (
                    <Badge variant="danger" className="shrink-0">Diteruskan ke RW</Badge>
                  ) : (
                    <Button
                      variant="danger"
                      size="sm"
                      className="shrink-0"
                      onClick={() => handleEscalateAlert(alert.id)}
                    >
                      Bypass Eskalasi
                    </Button>
                  )}
                </div>
              ))}
              {alerts.length === 0 && (
                <p className="py-4 text-center text-sm text-neutral-400">Tidak ada laporan kejadian.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal Tambah Jadwal */}
      <ConfirmDialog
        open={isModalOpen}
        title="Tambah Jadwal Ronda"
        onCancel={() => setIsModalOpen(false)}
      >
        <form onSubmit={handleAddSchedule} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">Wilayah</label>
            <select
              required
              value={form.id_wilayah}
              onChange={(e) => setForm({ ...form, id_wilayah: e.target.value })}
              className="h-9 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm focus:border-sky-500 focus:outline-none"
            >
              {wilayahs.map((w) => (
                <option key={w.id_wilayah} value={w.id_wilayah}>{w.nama_wilayah}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">Tanggal</label>
            <input
              type="date"
              required
              value={form.tanggal_jadwal}
              onChange={(e) => setForm({ ...form, tanggal_jadwal: e.target.value })}
              className="h-9 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm focus:border-sky-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">Shift</label>
            <select
              required
              value={form.shift}
              onChange={(e) => setForm({ ...form, shift: e.target.value })}
              className="h-9 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm focus:border-sky-500 focus:outline-none"
            >
              {SHIFT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">Petugas (Warga)</label>
            <select
              required
              value={form.id_petugas_citizen}
              onChange={(e) => setForm({ ...form, id_petugas_citizen: e.target.value })}
              className="h-9 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm focus:border-sky-500 focus:outline-none"
            >
              {citizens.map((c) => (
                <option key={c.id_citizen} value={c.id_citizen}>{c.nama_lengkap}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2 border-t border-neutral-100 pt-4">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Batal</Button>
            <Button type="submit">Simpan Jadwal</Button>
          </div>
        </form>
      </ConfirmDialog>
    </PageShell>
  )
}
