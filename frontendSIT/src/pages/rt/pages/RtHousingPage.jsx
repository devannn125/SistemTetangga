import { useState, useEffect } from 'react'
import { PageShell } from '../../../components/layout/PageShell'
import { DataTable } from '../../../components/ui/DataTable'
import { StatusBadge } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card'
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog'
import { getHouses, createHouse, deleteHouse, getWilayah, getCitizens } from '../../../services/api'
import { useConfirm } from '../../../components/ui/ConfirmContext'
import { useToast } from '../../../components/ui/ToastContext'

const FILTERS = [
  {
    key: 'tipe',
    label: 'Tipe',
    options: [
      { value: 'NON_KOS', label: 'Rumah Tinggal Biasa (Non-Kos)' },
      { value: 'KOS', label: 'Kos-kosan' },
    ],
  },
]

export default function RtHousingPage() {
  const [houses, setHouses] = useState([])
  const [wilayahs, setWilayahs] = useState([])
  const [citizens, setCitizens] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [form, setForm] = useState({ tipe: 'NON_KOS', alamat: '', id_wilayah: '', id_pemilik_citizen: '' })
  const confirm = useConfirm()
  const { showToast } = useToast()

  async function loadData() {
    setLoading(true)
    setError(null)
    try {
      const [resH, resW, resC] = await Promise.all([
        getHouses({ per_page: 100 }),
        getWilayah({ per_page: 100 }),
        getCitizens({ per_page: 100 }),
      ])

      const arrH = Array.isArray(resH?.data) ? resH.data : Array.isArray(resH) ? resH : []
      const arrW = Array.isArray(resW?.data) ? resW.data : Array.isArray(resW) ? resW : []
      const arrC = Array.isArray(resC?.data) ? resC.data : Array.isArray(resC) ? resC : []

      setHouses(arrH)
      setWilayahs(arrW)
      setCitizens(arrC)

      if (arrW.length > 0) setForm((f) => ({ ...f, id_wilayah: f.id_wilayah || arrW[0].id_wilayah }))
    } catch (err) {
      setError(err.message || 'Gagal memuat data perumahan')
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

  const COLUMNS = [
    { key: 'alamat', label: 'Alamat', render: (row) => <span className="font-semibold text-neutral-900">{row.alamat}</span> },
    {
      key: 'tipe',
      label: 'Tipe',
      render: (row) => <StatusBadge status={row.tipe === 'KOS' ? 'ESKALASI' : 'AKTIF'} label={row.tipe} />,
    },
    {
      key: 'pemilik',
      label: 'Pemilik (Opsional)',
      render: (row) => row.pemilik?.nama_lengkap || '-',
    },
    {
      key: 'actions',
      label: 'Aksi',
      className: 'text-right',
      render: (row) => (
        <Button
          variant="danger"
          size="sm"
          onClick={(e) => { e.stopPropagation(); handleDelete(row.id_house) }}
        >
          Hapus
        </Button>
      ),
    },
  ]

  return (
    <PageShell
      eyebrow="Perumahan"
      title="Data Rumah & Kos"
      description="Kelola data rumah warga dan kos di lingkungan Anda."
    >
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Daftar Rumah</CardTitle>
            <Button size="sm" onClick={() => setIsModalOpen(true)}>
              + Tambah Rumah
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            data={houses}
            columns={COLUMNS}
            searchKeys={['alamat']}
            searchPlaceholder="Cari alamat rumah..."
            filters={FILTERS}
            loading={loading}
            error={error}
            emptyMessage="Belum ada data rumah."
            rowKey="id_house"
          />
        </CardContent>
      </Card>

      {/* Modal Tambah Rumah */}
      <ConfirmDialog
        open={isModalOpen}
        title="Tambah Data Rumah"
        onCancel={() => setIsModalOpen(false)}
      >
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">Alamat Lengkap</label>
            <input
              required
              value={form.alamat}
              onChange={(e) => setForm({ ...form, alamat: e.target.value })}
              className="h-9 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm focus:border-sky-500 focus:outline-none"
              placeholder="Contoh: Jl. Kenari Blok A No. 1"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">Tipe Rumah</label>
            <select
              required
              value={form.tipe}
              onChange={(e) => setForm({ ...form, tipe: e.target.value })}
              className="h-9 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm focus:border-sky-500 focus:outline-none"
            >
              <option value="NON_KOS">Rumah Tinggal Biasa (Non-Kos)</option>
              <option value="KOS">Kos-kosan</option>
            </select>
          </div>
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
            <label className="block text-xs font-semibold text-neutral-700 mb-1">Pemilik (Warga)</label>
            <select
              value={form.id_pemilik_citizen}
              onChange={(e) => setForm({ ...form, id_pemilik_citizen: e.target.value })}
              className="h-9 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm focus:border-sky-500 focus:outline-none"
            >
              <option value="">-- Tidak Diketahui / Bukan Warga --</option>
              {citizens.map((c) => (
                <option key={c.id_citizen} value={c.id_citizen}>{c.nama_lengkap}</option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 border-t border-neutral-100 pt-4">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Batal</Button>
            <Button type="submit">Simpan</Button>
          </div>
        </form>
      </ConfirmDialog>
    </PageShell>
  )
}
