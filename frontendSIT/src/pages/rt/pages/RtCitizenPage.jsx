import { useEffect, useState } from 'react'
import { PageShell } from '../../../components/layout/PageShell'
import { DataTable } from '../../../components/ui/DataTable'
import { StatusBadge } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card'
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog'
import { getCitizens, updateCitizen, createCitizen, getWilayah } from '../../../services/api'
import { useConfirm } from '../../../components/ui/ConfirmContext'
import { useToast } from '../../../components/ui/ToastContext'

const FILTERS = [
  {
    key: 'status_warga',
    label: 'Status Warga',
    options: [
      { value: 'TETAP', label: 'Tetap' },
      { value: 'TIDAK_TETAP', label: 'Tidak Tetap' },
    ],
  },
  {
    key: 'status_verifikasi',
    label: 'Verifikasi',
    options: [
      { value: 'PENDING', label: 'Pending' },
      { value: 'VERIFIED_RW', label: 'Terverifikasi RW' },
      { value: 'APPROVED_DUKUH', label: 'Disetujui' },
      { value: 'REJECTED', label: 'Ditolak' },
    ],
  },
]

export default function RtCitizenPage() {
  const [citizens, setCitizens] = useState([])
  const [wilayahOptions, setWilayahOptions] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingData, setEditingData] = useState(null)
  const confirm = useConfirm()
  const { showToast } = useToast()

  const [formData, setFormData] = useState({
    nik: '',
    nama_lengkap: '',
    jenis_kelamin: 'L',
    status_warga: 'TETAP',
    id_wilayah: '',
  })

  async function loadData() {
    setIsLoading(true)
    setError(null)
    try {
      const [resCit, resWil] = await Promise.all([
        getCitizens({ per_page: 100 }),
        getWilayah({ per_page: 100 }),
      ])

      const citData = Array.isArray(resCit?.data) ? resCit.data : Array.isArray(resCit) ? resCit : []
      const wilData = Array.isArray(resWil?.data) ? resWil.data : Array.isArray(resWil) ? resWil : []

      setCitizens(citData)
      setWilayahOptions(wilData)

      if (wilData.length > 0) {
        setFormData((f) => ({ ...f, id_wilayah: f.id_wilayah || wilData[0].id_wilayah }))
      }
    } catch (err) {
      setError(err.message || 'Gagal memuat data warga')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  function handleOpenModal(data = null) {
    if (data) {
      setEditingData(data)
      setFormData({
        nik: data.nik || '',
        nama_lengkap: data.nama_lengkap || '',
        jenis_kelamin: data.jenis_kelamin || 'L',
        status_warga: data.status_warga || 'TETAP',
        id_wilayah: data.id_wilayah || (wilayahOptions[0]?.id_wilayah || ''),
      })
    } else {
      setEditingData(null)
      setFormData({
        nik: '',
        nama_lengkap: '',
        jenis_kelamin: 'L',
        status_warga: 'TETAP',
        id_wilayah: wilayahOptions[0]?.id_wilayah || '',
      })
    }
    setIsModalOpen(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const approved = await confirm({
      title: editingData ? 'Konfirmasi Perubahan' : 'Konfirmasi Simpan',
      message: editingData
        ? `Simpan perubahan data warga atas nama "${formData.nama_lengkap}" dan ajukan ulang verifikasi ke RW?`
        : `Yakin ingin menambahkan warga baru atas nama "${formData.nama_lengkap}"? Data akan berstatus Pending untuk diverifikasi RW.`,
      confirmLabel: 'Ya, Simpan',
    })
    if (!approved) return
    try {
      const payload = { ...formData, status_verifikasi: 'PENDING' }
      if (editingData) {
        await updateCitizen(editingData.id_citizen, payload)
        showToast('Data warga berhasil diperbarui dan diajukan ulang ke RW.')
      } else {
        await createCitizen(payload)
        showToast('Warga baru berhasil ditambahkan dengan status Pending.')
      }
      setIsModalOpen(false)
      loadData()
    } catch (err) {
      showToast(err.message || 'Gagal menyimpan data', 'error')
    }
  }

  const COLUMNS = [
    { key: 'nik', label: 'NIK', render: (value, row) => <span className="font-semibold text-neutral-900">{value}</span> },
    { key: 'nama_lengkap', label: 'Nama Lengkap' },
    { key: 'status_warga', label: 'Status Warga' },
    {
      key: 'status_verifikasi',
      label: 'Status Verifikasi',
      render: (value, row) => <StatusBadge status={value || 'PENDING'} />,
    },
    {
      key: 'actions',
      label: 'Aksi',
      className: 'text-right',
      render: (value, row) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => { e.stopPropagation(); handleOpenModal(row) }}
        >
          Edit
        </Button>
      ),
    },
  ]

  return (
    <PageShell
      eyebrow="Kependudukan"
      title="Data Warga RT"
      description="Kelola data warga di RT Anda. Tambahkan warga baru atau perbarui data. Data yang baru dimasukkan akan otomatis berstatus Pending dan memerlukan Verifikasi dari RW."
    >
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Daftar Warga</CardTitle>
            <Button size="sm" onClick={() => handleOpenModal()}>
              + Tambah Warga
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            data={citizens}
            columns={COLUMNS}
            searchKeys={['nik', 'nama_lengkap']}
            searchPlaceholder="Cari NIK atau nama..."
            filters={FILTERS}
            loading={isLoading}
            error={error}
            emptyMessage="Belum ada data warga."
            rowKey="id_citizen"
          />
        </CardContent>
      </Card>

      {/* Modal Tambah/Edit Warga */}
      <ConfirmDialog
        open={isModalOpen}
        title={editingData ? 'Edit Data Warga' : 'Tambah Warga Baru'}
        onCancel={() => setIsModalOpen(false)}
      >
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">NIK</label>
            <input
              required
              value={formData.nik}
              onChange={(e) => setFormData({ ...formData, nik: e.target.value })}
              className="h-9 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm focus:border-sky-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">Nama Lengkap</label>
            <input
              required
              value={formData.nama_lengkap}
              onChange={(e) => setFormData({ ...formData, nama_lengkap: e.target.value })}
              className="h-9 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm focus:border-sky-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">Wilayah RT</label>
            <select
              required
              value={formData.id_wilayah}
              onChange={(e) => setFormData({ ...formData, id_wilayah: e.target.value })}
              className="h-9 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm focus:border-sky-500 focus:outline-none"
            >
              <option value="">-- Pilih Wilayah --</option>
              {wilayahOptions.map((w) => (
                <option key={w.id_wilayah} value={w.id_wilayah}>{w.nama_wilayah}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Jenis Kelamin</label>
              <select
                value={formData.jenis_kelamin}
                onChange={(e) => setFormData({ ...formData, jenis_kelamin: e.target.value })}
                className="h-9 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm focus:border-sky-500 focus:outline-none"
              >
                <option value="L">Laki-laki</option>
                <option value="P">Perempuan</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Status Warga</label>
              <select
                value={formData.status_warga}
                onChange={(e) => setFormData({ ...formData, status_warga: e.target.value })}
                className="h-9 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm focus:border-sky-500 focus:outline-none"
              >
                <option value="TETAP">Tetap</option>
                <option value="TIDAK_TETAP">Tidak Tetap</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t border-neutral-100 pt-4">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Batal</Button>
            <Button type="submit">Ajukan Verifikasi</Button>
          </div>
        </form>
      </ConfirmDialog>
    </PageShell>
  )
}
