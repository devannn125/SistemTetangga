import { useEffect, useState } from 'react'
import { getHouses, createHouse, updateHouse, getCitizens, getMasterData, getWilayah } from '../../../services/api'
import { PageShell } from '../../../components/layout/PageShell'
import { useConfirm } from '../../../components/ui/ConfirmContext'
import { useToast } from '../../../components/ui/ToastContext'
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
  ]

  return (
    <PageShell
      eyebrow="Perumahan"
      title="Data Rumah & Kos"
      description="Kelola data rumah warga dan kos/kost (CRUD) tingkat RT."
    >
      <section className="mt-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            className="rounded-full bg-black px-5 py-2 text-xs font-extrabold uppercase text-white transition hover:bg-neutral-900"
            onClick={openCreatePerumahan}
            type="button"
          >
            + Tambah Perumahan
          </button>
        </div>

        {isLoading ? (
          <div className="rounded-xl border border-neutral-300 bg-white p-8 text-center text-sm font-semibold text-neutral-600">
            Memuat data...
          </div>
        ) : houses.length === 0 ? (
          <div className="rounded-xl border border-neutral-300 bg-white p-8 text-center text-sm font-semibold text-neutral-600">
            Belum ada data perumahan.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-neutral-300 bg-white">
            <table className="w-full min-w-[1100px] text-left text-sm">
              <thead>
                <tr className="border-b border-neutral-300 text-xs uppercase text-neutral-500">
                  {columns.map((col) => (
                    <th key={col.key} className="px-5 py-3">{col.label}</th>
                  ))}
                  <th className="px-5 py-3">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {houses.map((item) => (
                  <tr key={item.id_house} className="border-b border-neutral-100 last:border-0">
                    {columns.map((col) => (
                      <td key={col.key} className="px-5 py-3">
                        {col.render ? col.render(item[col.key], item) : item[col.key] || '-'}
                      </td>
                    ))}
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          className="rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-bold text-neutral-700 hover:bg-neutral-100 transition"
                          onClick={() => openEditPerumahan(item)}
                          type="button"
                        >
                          Edit
                        </button>
                        <button
                          className="rounded-lg border border-red-300 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 transition"
                          onClick={() => handleDelete(item.id_house)}
                          type="button"
                        >
                          Nonaktifkan
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

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