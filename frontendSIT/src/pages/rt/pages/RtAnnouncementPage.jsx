import { useState, useEffect } from 'react'
import { PageShell } from '../../../components/layout/PageShell'
import { DataTable } from '../../../components/ui/DataTable'
import { Badge } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import { Alert } from '../../../components/ui/Alert'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card'
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog'
import { getAnnouncements, createAnnouncement, getWilayah } from '../../../services/api'
import { useConfirm } from '../../../components/ui/ConfirmContext'
import { useToast } from '../../../components/ui/ToastContext'

const KATEGORI_OPTIONS = [
  { value: 'KESEHATAN', label: 'Kesehatan' },
  { value: 'KEAMANAN', label: 'Keamanan' },
  { value: 'INFRASTRUKTUR', label: 'Infrastruktur' },
  { value: 'SOSIAL', label: 'Sosial' },
  { value: 'LAINNYA', label: 'Lainnya' },
]

const FILTERS = [
  {
    key: 'kategori',
    label: 'Kategori',
    options: KATEGORI_OPTIONS,
  },
  {
    key: 'status_approval',
    label: 'Status',
    options: [
      { value: 'RT', label: 'Aktif (RT)' },
      { value: 'RW', label: 'Menunggu RW' },
    ],
  },
]

const COLUMNS = [
  {
    key: 'judul',
    label: 'Judul',
    render: (row) => <span className="font-medium text-neutral-900">{row.judul}</span>,
  },
  {
    key: 'isi',
    label: 'Isi',
    render: (row) => (
      <p className="max-w-xs text-sm text-neutral-500 line-clamp-2">{row.isi}</p>
    ),
  },
  {
    key: 'kategori',
    label: 'Kategori',
    render: (row) => <Badge variant="info">{row.kategori}</Badge>,
  },
  {
    key: 'target',
    label: 'Target',
    render: (row) => <Badge variant="default">{row.target || 'Warga'}</Badge>,
  },
  {
    key: 'status_approval',
    label: 'Status',
    render: (row) => (
      <Badge variant={row.status_approval === 'RT' ? 'success' : 'warning'}>
        {row.status_approval === 'RW' ? 'Menunggu RW' : row.status_approval || 'Aktif'}
      </Badge>
    ),
  },
]

export default function RtAnnouncementPage() {
  const [announcements, setAnnouncements] = useState([])
  const [wilayahOptions, setWilayahOptions] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({ judul: '', isi: '', krusial: false, kategori: 'LAINNYA', id_wilayah: '' })
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const confirm = useConfirm()
  const { showToast } = useToast()

  async function loadData() {
    setIsLoading(true)
    setError(null)
    try {
      const [resAnn, resWil] = await Promise.all([
        getAnnouncements({ per_page: 100 }),
        getWilayah({ per_page: 100 }),
      ])
      const annData = Array.isArray(resAnn?.data) ? resAnn.data : Array.isArray(resAnn) ? resAnn : []
      const wilData = Array.isArray(resWil?.data) ? resWil.data : Array.isArray(resWil) ? resWil : []
      setAnnouncements(annData)
      setWilayahOptions(wilData)
      if (wilData.length > 0) {
        setFormData((f) => ({ ...f, id_wilayah: wilData[0].id_wilayah }))
      }
    } catch (err) {
      setError('Gagal memuat data: ' + err.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    const approved = await confirm({
      title: formData.krusial ? 'Konfirmasi Pengajuan' : 'Konfirmasi Terbitkan',
      message: formData.krusial
        ? `Ajukan pengumuman "${formData.judul}" ke RW untuk disetujui?`
        : `Terbitkan pengumuman "${formData.judul}" kepada seluruh warga RT?`,
      confirmLabel: formData.krusial ? 'Ya, Ajukan' : 'Ya, Terbitkan',
    })
    if (!approved) return
    try {
      const statusApproval = formData.krusial ? 'RW' : 'RT'
      await createAnnouncement({
        judul: formData.judul,
        isi: formData.isi,
        kategori: formData.kategori,
        id_wilayah: formData.id_wilayah,
        target: 'SEMUA_WARGA',
        status_approval: statusApproval,
        is_pinned: false,
        created_by: 'USR-001',
      })
      showToast(
        formData.krusial
          ? 'Pengumuman krusial berhasil diajukan dan menunggu persetujuan RW.'
          : 'Pengumuman berhasil diterbitkan.',
      )
      setIsModalOpen(false)
      setFormData((f) => ({ judul: '', isi: '', krusial: false, kategori: 'LAINNYA', id_wilayah: f.id_wilayah }))
      loadData()
    } catch (err) {
      showToast('Gagal menerbitkan pengumuman: ' + err.message, 'error')
    }
  }

  return (
    <PageShell
      eyebrow="Pengumuman"
      title="Pengumuman & Agenda RT"
      description="Buat pengumuman untuk warga di lingkup RT Anda. Pengumuman yang ditandai Krusial memerlukan persetujuan dari RW sebelum diterbitkan."
    >
      <div className="space-y-4">
        {error && <Alert variant="warning">{error}</Alert>}

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Daftar Pengumuman</CardTitle>
              <Button size="sm" onClick={() => setIsModalOpen(true)}>
                + Buat Pengumuman
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <DataTable
              data={announcements}
              columns={COLUMNS}
              searchKeys={['judul', 'isi']}
              searchPlaceholder="Cari judul atau isi pengumuman..."
              filters={FILTERS}
              loading={isLoading}
              error={error}
              emptyMessage="Belum ada pengumuman yang diterbitkan."
              rowKey="id_announcement"
              getRowKey={(row) => row.id_announcement || row.id}
            />
          </CardContent>
        </Card>
      </div>

      {/* Modal Buat Pengumuman */}
      <ConfirmDialog
        open={isModalOpen}
        title="Buat Pengumuman Baru"
        onCancel={() => setIsModalOpen(false)}
      >
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">Judul Pengumuman</label>
            <input
              required
              value={formData.judul}
              onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
              className="h-9 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm focus:border-sky-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Kategori</label>
              <select
                value={formData.kategori}
                onChange={(e) => setFormData({ ...formData, kategori: e.target.value })}
                className="h-9 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm focus:border-sky-500 focus:outline-none"
              >
                {KATEGORI_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Wilayah RT</label>
              <select
                required
                value={formData.id_wilayah}
                onChange={(e) => setFormData({ ...formData, id_wilayah: e.target.value })}
                className="h-9 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm focus:border-sky-500 focus:outline-none"
              >
                {wilayahOptions.map((w) => (
                  <option key={w.id_wilayah} value={w.id_wilayah}>{w.nama_wilayah}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">Isi Pesan</label>
            <textarea
              required
              rows="3"
              value={formData.isi}
              onChange={(e) => setFormData({ ...formData, isi: e.target.value })}
              className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-sky-500 focus:outline-none resize-none"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.krusial}
              onChange={(e) => setFormData({ ...formData, krusial: e.target.checked })}
              className="accent-sky-600"
            />
            <span className="text-sm text-neutral-700">Tandai sebagai <strong>Krusial</strong> (Butuh Persetujuan RW)</span>
          </label>

          <div className="flex justify-end gap-2 border-t border-neutral-100 pt-4">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Batal</Button>
            <Button type="submit">
              {formData.krusial ? 'Ajukan ke RW' : 'Terbitkan'}
            </Button>
          </div>
        </form>
      </ConfirmDialog>
    </PageShell>
  )
}
