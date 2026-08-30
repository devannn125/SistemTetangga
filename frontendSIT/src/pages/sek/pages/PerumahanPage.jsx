import { useEffect, useState } from 'react'
import { getHouses, createHouse, updateHouse, getCitizens, getMasterData, getWilayah } from '../../../services/api'
import { PageShell } from '../../../components/layout/PageShell'
import { useConfirm } from '../../../components/ui/ConfirmContext'
import { useToast } from '../../../components/ui/ToastContext'
import { DataTable } from '../../../components/ui/DataTable'
import { Button } from '../../../components/ui/Button'
import PerumahanFormModal from './PerumahanFormModal'
import { toRows } from './utils'

export default function PerumahanPage() {
  const [houses, setHouses] = useState([])
  const [citizens, setCitizens] = useState([])
  const [masterData, setMasterData] = useState({ kategori_kos: [] })
  const [wilayah, setWilayah] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const [perumahanModal, setPerumahanModal] = useState({ open: false, mode: 'create', data: null })
  const confirm = useConfirm()
  const { showToast } = useToast()

  useEffect(() => {
    async function loadAllData() {
      try {
        const [housesRes, citizensRes, masterRes, wilayahRes] = await Promise.all([
          getHouses({ per_page: 200 }),
          getCitizens({ per_page: 200, status_aktif: true }),
          getMasterData({ tipe: 'KATEGORI_KOS', per_page: 100 }),
          getWilayah({ per_page: 100 }),
        ])
        setHouses(toRows(housesRes))
        setCitizens(toRows(citizensRes))
        setMasterData({ kategori_kos: toRows(masterRes) })
        setWilayah(toRows(wilayahRes))
      } catch (error) {
        console.error('Failed to load data:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadAllData()
  }, [])

  function openCreatePerumahan() {
    setPerumahanModal({ open: true, mode: 'create', data: null })
  }

  function openEditPerumahan(house) {
    setPerumahanModal({ open: true, mode: 'edit', data: house })
  }

  async function handlePerumahanSubmit(payload) {
    if (perumahanModal.mode === 'edit') {
      await updateHouse(perumahanModal.data.id_house, payload)
      setHouses((prev) => prev.map(h => h.id_house === perumahanModal.data.id_house ? { ...h, ...payload } : h))
    } else {
      const response = await createHouse(payload)
      const created = response?.data || response
      setHouses((prev) => [created, ...prev])
    }
  }

  async function handleDelete(id) {
    const approved = await confirm({
      title: 'Konfirmasi Nonaktifkan',
      message: 'Yakin ingin menonaktifkan perumahan ini?',
      confirmLabel: 'Ya, Nonaktifkan',
    })
    if (!approved) return
    try {
      await updateHouse(id, { status_aktif: false })
      setHouses((prev) => prev.map(h => h.id_house === id ? { ...h, status_aktif: false } : h))
      showToast('Data perumahan berhasil dinonaktifkan.')
    } catch (error) {
      showToast(error.message || 'Gagal menonaktifkan data.', 'error')
    }
  }

  function getTipeLabel(tipe) {
    return tipe === 'KOS' ? 'Kos/Kost' : 'Rumah Warga'
  }

  function getTipeBadgeClass(tipe) {
    return tipe === 'KOS' ? 'bg-sky-100 text-sky-900' : 'bg-emerald-100 text-emerald-900'
  }

  function getStatusPajakClass(status) {
    return status === 'LUNAS' ? 'bg-emerald-100 text-emerald-900' : 'bg-amber-100 text-amber-900'
  }

  function getWilayahName(wilayahList, id) {
    return wilayahList?.find(w => w.id_wilayah === id)?.nama_wilayah || '-'
  }

  function getPemilikName(citizenList, id) {
    return citizenList?.find(c => c.id_citizen === id)?.nama_lengkap || '-'
  }

  function getKategoriKosName(masterData, id) {
    return masterData.kategori_kos?.find(k => k.id_master === id)?.nama_master || '-'
  }

  const columns = [
    { key: 'tipe', label: 'Tipe', render: (v) => <span className={`inline-flex px-2 py-1 rounded text-xs font-bold ${getTipeBadgeClass(v)}`}>{getTipeLabel(v)}</span> },
    { key: 'alamat', label: 'Alamat' },
    { key: 'id_wilayah', label: 'RT', render: (v) => getWilayahName(wilayah, v) },
    { key: 'id_pemilik_citizen', label: 'Pemilik', render: (v) => getPemilikName(citizens, v) },
    { key: 'status_kepemilikan', label: 'Kepemilikan', render: (v, row) => row.tipe === 'NON_KOS' ? (v || '-') : '-' },
    { key: 'id_kategori_kos', label: 'Kategori Kos', render: (v, row) => row.tipe === 'KOS' ? getKategoriKosName(masterData, v) : '-' },
    { key: 'jumlah_kamar', label: 'Kamar', render: (v, row) => row.tipe === 'KOS' ? (v || '-') : '-' },
    { key: 'jumlah_penghuni', label: 'Penghuni', render: (v, row) => row.tipe === 'KOS' ? v : '-' },
    { key: 'status_pajak', label: 'Pajak', render: (v) => <span className={`inline-flex px-2 py-1 rounded text-xs font-bold ${getStatusPajakClass(v)}`}>{v}</span> },
    { key: 'status_aktif', label: 'Aktif', render: (v) => v ? 'Ya' : 'Tidak' },
    {
      key: 'actions',
      label: 'Aksi',
      render: (value, row) => (
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => openEditPerumahan(row)}>Edit</Button>
          <Button variant="outline" size="sm" className="text-red-600 border-red-300 hover:bg-red-50" onClick={() => handleDelete(row.id_house)}>Nonaktifkan</Button>
        </div>
      ),
    },
  ]

  return (
    <PageShell
      eyebrow="Perumahan"
      title="Data Rumah & Kos"
      description="Kelola data rumah warga dan kos/kost (CRUD) tingkat RT."
    >
      <section className="mt-8 space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1" />
          <Button size="sm" onClick={openCreatePerumahan}>+ Tambah Perumahan</Button>
        </div>

        <DataTable
          data={houses}
          columns={columns}
          searchKeys={['alamat', 'tipe', 'status_kepemilikan', 'status_pajak', 'jumlah_kamar']}
          searchPlaceholder="Cari alamat, tipe, atau status..."
          filters={[
            { key: 'tipe', label: 'Tipe', options: [{ value: 'KOS', label: 'Kos/Kost' }, { value: 'NON_KOS', label: 'Rumah Warga' }] },
            { key: 'status_kepemilikan', label: 'Kepemilikan', options: [{ value: 'MILIK_SENDIRI', label: 'Milik Sendiri' }, { value: 'KONTRAK', label: 'Kontrak' }] },
            { key: 'status_pajak', label: 'Pajak', options: [{ value: 'LUNAS', label: 'Lunas' }, { value: 'BELUM_LUNAS', label: 'Belum Lunas' }] },
          ]}
          loading={isLoading}
          emptyMessage="Belum ada data perumahan."
          rowKey="id_house"
        />

        <PerumahanFormModal
          open={perumahanModal.open}
          onClose={() => setPerumahanModal({ open: false, mode: 'create', data: null })}
          onSubmit={handlePerumahanSubmit}
          initialData={perumahanModal.data}
          citizens={citizens}
          masterData={masterData}
          mode={perumahanModal.mode}
        />
      </section>
    </PageShell>
  )
}