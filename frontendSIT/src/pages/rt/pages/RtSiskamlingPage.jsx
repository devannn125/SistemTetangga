import { useState, useEffect } from 'react'
import { PageShell } from '@/components/layout/PageShell'
import { DataTable } from '@/components/ui/DataTable'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/Dialog'
import { Input } from '@/components/ui/Input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { Label } from '@/components/ui/Label'
import { getSiskamlingSchedules, createSiskamlingSchedule, deleteSiskamlingSchedule, getCitizens, getWilayah } from '@/services/api'
import { useConfirm } from '@/components/ui/ConfirmContext'
import { useToast } from '@/components/ui/ToastContext'

const SHIFT_OPTIONS = [
  { value: 'PAGI', label: 'Pagi' },
  { value: 'SORE', label: 'Sore' },
  { value: 'MALAM', label: 'Malam' },
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
  {
    key: 'bulan_tahun',
    label: 'Bulan / Tahun',
    options: [
      { value: '2026-08', label: 'Agustus 2026' },
      { value: '2026-07', label: 'Juli 2026' },
      { value: '2026-06', label: 'Juni 2026' },
    ]
  }
]

export default function RtSiskamlingPage() {
  const [schedules, setSchedules] = useState([])
  const [citizens, setCitizens] = useState([])
  const [wilayahs, setWilayahs] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Modal Absensi State
  const [isAbsensiModalOpen, setIsAbsensiModalOpen] = useState(false)
  const [selectedAbsensi, setSelectedAbsensi] = useState(null)

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
      
      const scDataEnhanced = scData.map((s, idx) => {
        const hasCheckin = s.checkins && s.checkins.length > 0;
        const checkinData = hasCheckin ? s.checkins[0] : null;

        return {
          ...s,
          nomor: idx + 1,
          bulan_tahun: s.tanggal_jadwal ? s.tanggal_jadwal.substring(0, 7) : '',
          status_absensi: hasCheckin ? 'HADIR' : 'BELUM',
          timestamp_hadir: hasCheckin && checkinData?.checkin_time ? new Date(checkinData.checkin_time).toLocaleString('id-ID') : null,
          foto_url: hasCheckin ? checkinData.foto_url : null
        };
      })

      const cData = Array.isArray(resCit?.data) ? resCit.data : Array.isArray(resCit) ? resCit : []
      const wData = Array.isArray(resWil?.data) ? resWil.data : Array.isArray(resWil) ? resWil : []
      
      setSchedules(scDataEnhanced)
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
      console.error(err)
      showToast('Gagal menyimpan jadwal: ' + (err.response?.data?.message || err.message), 'error')
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

  function handleViewAbsensi(row) {
    setSelectedAbsensi(row)
    setIsAbsensiModalOpen(true)
  }

  const columnsWithAction = [
    {
      key: 'nomor',
      label: '#',
      render: (value) => <span className="text-neutral-500 font-medium">{value}</span>
    },
    {
      key: 'tanggal_jadwal',
      label: 'Tanggal',
      render: (value, row) => <span className="font-bold text-neutral-900">{value}</span>,
    },
    {
      key: 'shift',
      label: 'Shift',
      render: (value, row) => (
        <Badge variant={value === 'MALAM' ? 'info' : value === 'PAGI' ? 'success' : 'default'}>
          {value}
        </Badge>
      ),
    },
    {
      key: 'petugas',
      label: 'Petugas',
      render: (value, row) => value?.nama_lengkap || row.id_petugas_citizen || 'Unknown',
    },
    {
      key: 'status_absensi',
      label: 'Status Absensi',
      render: (value, row) => (
        <div className="flex items-center gap-2">
          {value === 'HADIR' ? (
            <Badge variant="success">Hadir</Badge>
          ) : (
            <Badge variant="outline" className="text-neutral-500">Belum Absen</Badge>
          )}
          {value === 'HADIR' && (
            <button 
              onClick={() => handleViewAbsensi(row)}
              className="text-sky-600 hover:text-sky-800 transition p-1"
              title="Lihat Bukti Absensi"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
              </svg>
            </button>
          )}
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Aksi',
      render: (value, row) => (
        <Button
          variant="destructive"
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
      title="Manajemen Jadwal Ronda"
      description="Kelola jadwal ronda dan periksa bukti presensi petugas siskamling (Role Ketua RT)."
    >
      <div className="space-y-6">
        <Card className="border-2 border-neutral-900 shadow-none rounded-xl">
          <CardHeader className="border-b border-neutral-100">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <CardTitle className="text-xl font-extrabold text-black">Daftar Jadwal & Absensi Ronda</CardTitle>
              <Button onClick={() => setIsModalOpen(true)} className="bg-black text-white hover:bg-neutral-800 font-bold rounded-lg px-4">
                + Tambah Jadwal
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <DataTable
              data={schedules}
              columns={columnsWithAction}
              searchKeys={['tanggal_jadwal', 'petugas.nama_lengkap']}
              searchPlaceholder="Cari nama petugas atau tanggal..."
              filters={SCHEDULE_FILTERS}
              loading={isLoading}
              emptyMessage="Belum ada jadwal ronda."
              rowKey="id_siskamling_schedule"
              getRowKey={(row) => row.id_siskamling_schedule || row.id}
            />
          </CardContent>
        </Card>
      </div>

      {/* Modal Absensi (View Detail) */}
      <Dialog open={isAbsensiModalOpen} onOpenChange={setIsAbsensiModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Detail Bukti Absensi</DialogTitle>
          </DialogHeader>
          {selectedAbsensi && (
            <div className="space-y-4 py-2">
              <div className="w-full h-48 bg-neutral-100 border border-neutral-300 rounded-lg flex items-center justify-center flex-col overflow-hidden text-neutral-400">
                {selectedAbsensi.foto_url ? (
                  <img src={selectedAbsensi.foto_url.startsWith('http') || selectedAbsensi.foto_url.startsWith('data:') ? selectedAbsensi.foto_url : `http://localhost:8000/storage/${selectedAbsensi.foto_url}`} alt="Bukti Selfie" className="w-full h-full object-cover" />
                ) : (
                  <>
                    <svg className="w-12 h-12 mb-2 opacity-30" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd"></path></svg>
                    <span className="text-sm font-bold">[Tidak ada foto]</span>
                  </>
                )}
              </div>
              <div className="grid grid-cols-2 gap-y-2 text-sm border-t pt-4">
                <span className="text-neutral-500 font-medium">Petugas</span>
                <span className="font-bold text-black">{selectedAbsensi.petugas?.nama_lengkap}</span>
                
                <span className="text-neutral-500 font-medium">Shift</span>
                <span className="font-bold text-black">{selectedAbsensi.shift}</span>
                
                <span className="text-neutral-500 font-medium">Waktu Check-in</span>
                <span className="font-bold text-sky-600">{selectedAbsensi.timestamp_hadir || '-'}</span>
              </div>
            </div>
          )}
          <DialogFooter className="sm:justify-end">
            <Button variant="outline" onClick={() => setIsAbsensiModalOpen(false)}>Tutup</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Tambah Jadwal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Tambah Jadwal Ronda</DialogTitle>
            <DialogDescription>Isi formulir di bawah untuk menambahkan jadwal ronda baru.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddSchedule} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="id_wilayah" className="text-sm font-bold text-black">Wilayah <span className="text-red-500">*</span></Label>
              <Select value={form.id_wilayah} onValueChange={(value) => setForm({ ...form, id_wilayah: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih wilayah" />
                </SelectTrigger>
                <SelectContent>
                  {wilayahs.map((w) => (
                    <SelectItem key={w.id_wilayah} value={w.id_wilayah}>{w.nama_wilayah}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tanggal_jadwal" className="text-sm font-bold text-black">Tanggal <span className="text-red-500">*</span></Label>
              <Input
                id="tanggal_jadwal"
                type="date"
                required
                value={form.tanggal_jadwal}
                onChange={(e) => setForm({ ...form, tanggal_jadwal: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="shift" className="text-sm font-bold text-black">Shift <span className="text-red-500">*</span></Label>
              <Select value={form.shift} onValueChange={(value) => setForm({ ...form, shift: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih shift" />
                </SelectTrigger>
                <SelectContent>
                  {SHIFT_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="id_petugas_citizen" className="text-sm font-bold text-black">Petugas (Warga) <span className="text-red-500">*</span></Label>
              <Select value={form.id_petugas_citizen} onValueChange={(value) => setForm({ ...form, id_petugas_citizen: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih petugas" />
                </SelectTrigger>
                <SelectContent>
                  {citizens.map((c) => (
                    <SelectItem key={c.id_citizen} value={c.id_citizen}>{c.nama_lengkap}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter className="flex-col sm:flex-row gap-3">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Batal
              </Button>
              <Button type="submit">Simpan Jadwal</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </PageShell>
  )
}