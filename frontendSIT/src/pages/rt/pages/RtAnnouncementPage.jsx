import { useState, useEffect } from 'react'
import { PageShell } from '@/components/layout/PageShell'
import { DataTable } from '@/components/ui/DataTable'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
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
import { Textarea } from '@/components/ui/Textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { Label } from '@/components/ui/Label'
import { Checkbox } from '@/components/ui/Checkbox'
import { getAnnouncements, createAnnouncement, getWilayah } from '@/services/api'
import { useConfirm } from '@/components/ui/ConfirmContext'
import { useToast } from '@/components/ui/ToastContext'

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
    render: (value, row) => <span className="font-medium text-neutral-900">{value}</span>,
  },
  {
    key: 'isi',
    label: 'Isi',
    render: (value, row) => (
      <p className="max-w-xs text-sm text-neutral-500 line-clamp-2">{value}</p>
    ),
  },
  {
    key: 'kategori',
    label: 'Kategori',
    render: (value, row) => <Badge variant="info">{value}</Badge>,
  },
  {
    key: 'target',
    label: 'Target',
    render: (value, row) => <Badge variant="default">{value || 'Warga'}</Badge>,
  },
  {
    key: 'status_approval',
    label: 'Status',
    render: (value, row) => (
      <Badge variant={value === 'RT' ? 'success' : 'warning'}>
        {value === 'RW' ? 'Menunggu RW' : value || 'Aktif'}
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
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Buat Pengumuman Baru</DialogTitle>
            <DialogDescription>Isi formulir di bawah untuk membuat pengumuman baru.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="judul" className="text-sm font-bold text-black">Judul Pengumuman <span className="text-red-500">*</span></Label>
              <Input
                id="judul"
                required
                value={formData.judul}
                onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="kategori" className="text-sm font-bold text-black">Kategori</Label>
                <Select value={formData.kategori} onValueChange={(value) => setFormData({ ...formData, kategori: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    {KATEGORI_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="id_wilayah" className="text-sm font-bold text-black">Wilayah RT <span className="text-red-500">*</span></Label>
                <Select value={formData.id_wilayah} onValueChange={(value) => setFormData({ ...formData, id_wilayah: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih wilayah" />
                  </SelectTrigger>
                  <SelectContent>
                    {wilayahOptions.map((w) => (
                      <SelectItem key={w.id_wilayah} value={w.id_wilayah}>{w.nama_wilayah}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="isi" className="text-sm font-bold text-black">Isi Pesan <span className="text-red-500">*</span></Label>
              <Textarea
                id="isi"
                required
                rows="3"
                value={formData.isi}
                onChange={(e) => setFormData({ ...formData, isi: e.target.value })}
              />
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                checked={formData.krusial}
                onCheckedChange={(checked) => setFormData({ ...formData, krusial: checked })}
                id="krusial"
              />
              <Label htmlFor="krusial" className="text-sm text-neutral-700 cursor-pointer">
                Tandai sebagai <strong>Krusial</strong> (Butuh Persetujuan RW)
              </Label>
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-3">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Batal
              </Button>
              <Button type="submit">
                {formData.krusial ? 'Ajukan ke RW' : 'Terbitkan'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </PageShell>
  )
}