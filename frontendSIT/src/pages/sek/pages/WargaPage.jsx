import { useEffect, useState } from 'react'
import { getCitizens, createCitizen, updateCitizen, getFamilies, createFamily, updateFamily, getMasterData } from '../../../services/api'
import { PageShell } from '../../../components/layout/PageShell'
import { useConfirm } from '../../../components/ui/ConfirmContext'
import { useToast } from '../../../components/ui/ToastContext'
import WargaFormModal from './WargaFormModal'
import KKFormModal from './KKFormModal'
import {
  formatDate,
  getFamilyName,
  getKepalaName,
  toRows,
} from './utils'

export default function WargaPage() {
  const [activeTab, setActiveTab] = useState('warga')
  const [citizens, setCitizens] = useState([])
  const [families, setFamilies] = useState([])
  const [masterData, setMasterData] = useState({ agama: [], pendidikan: [], profesi: [] })
  const [isLoading, setIsLoading] = useState(true)
  const [notice, setNotice] = useState('')

  // Modals
  const [wargaModal, setWargaModal] = useState({ open: false, mode: 'create', data: null })
  const [kkModal, setKKModal] = useState({ open: false, mode: 'create', data: null })
  const confirm = useConfirm()
  const { showToast } = useToast()

  // Load master data for dropdowns
  useEffect(() => {
    async function loadMasterData() {
      try {
        const [agamaRes, pendidikanRes, profesiRes] = await Promise.all([
          getMasterData({ tipe: 'AGAMA', per_page: 100 }),
          getMasterData({ tipe: 'PENDIDIKAN', per_page: 100 }),
          getMasterData({ tipe: 'PROFESI', per_page: 100 }),
        ])
        setMasterData({
          agama: toRows(agamaRes),
          pendidikan: toRows(pendidikanRes),
          profesi: toRows(profesiRes),
        })
      } catch (error) {
        console.error('Failed to load master data:', error)
      }
    }
    loadMasterData()
  }, [])

  // Load citizens or families based on active tab
  useEffect(() => {
    let alive = true
    async function loadData() {
      setIsLoading(true)
      setNotice('')
      try {
        if (activeTab === 'warga') {
          const response = await getCitizens({ per_page: 200 })
          const rows = toRows(response)
          if (alive) setCitizens(rows)
        } else {
          const response = await getFamilies({ per_page: 200 })
          const rows = toRows(response)
          if (alive) setFamilies(rows)
        }
      } catch (error) {
        if (alive) setNotice(error.message || 'Gagal memuat data.')
      } finally {
        if (alive) setIsLoading(false)
      }
    }
    loadData()
    return () => { alive = false }
  }, [activeTab])

  function openCreateWarga() {
    setWargaModal({ open: true, mode: 'create', data: null })
  }

  function openEditWarga(warga) {
    setWargaModal({ open: true, mode: 'edit', data: warga })
  }

  function openCreateKK() {
    setKKModal({ open: true, mode: 'create', data: null })
  }

  function openEditKK(kk) {
    setKKModal({ open: true, mode: 'edit', data: kk })
  }

  async function handleWargaSubmit(payload) {
    if (wargaModal.mode === 'edit') {
      await updateCitizen(wargaModal.data.id_citizen, payload)
      setCitizens((prev) => prev.map(c => c.id_citizen === wargaModal.data.id_citizen ? { ...c, ...payload } : c))
    } else {
      const response = await createCitizen(payload)
      const created = response?.data || response
      setCitizens((prev) => [created, ...prev])
    }
  }

  async function handleKKSubmit(payload) {
    if (kkModal.mode === 'edit') {
      await updateFamily(kkModal.data.id_family, payload)
      setFamilies((prev) => prev.map(f => f.id_family === kkModal.data.id_family ? { ...f, ...payload } : f))
    } else {
      const response = await createFamily(payload)
      const created = response?.data || response
      setFamilies((prev) => [created, ...prev])
    }
  }

  async function handleDelete(id, type) {
    const approved = await confirm({
      title: 'Konfirmasi Hapus',
      message: `Yakin ingin menonaktifkan ${type === 'warga' ? 'warga' : 'KK'} ini?`,
      confirmLabel: 'Ya, Hapus',
    })
    if (!approved) return
    try {
      if (type === 'warga') {
        await updateCitizen(id, { status_aktif: false })
        setCitizens((prev) => prev.map(c => c.id_citizen === id ? { ...c, status_aktif: false } : c))
        showToast('Data warga berhasil dinonaktifkan.')
      } else {
        await updateFamily(id, { status: 'DIHAPUS' })
        setFamilies((prev) => prev.map(f => f.id_family === id ? { ...f, status: 'DIHAPUS' } : f))
        showToast('Data KK berhasil dinonaktifkan.')
      }
    } catch (error) {
      showToast(error.message || 'Gagal menghapus data.', 'error')
    }
  }

  const wargaColumns = [
    { key: 'nik', label: 'NIK' },
    { key: 'nama_lengkap', label: 'Nama Lengkap' },
    { key: 'jenis_kelamin', label: 'JK' },
    { key: 'tanggal_lahir', label: 'Tgl Lahir', render: (v) => formatDate(v) },
    { key: 'status_warga', label: 'Status' },
    { key: 'id_family', label: 'KK', render: (v) => getFamilyName(families, v) },
    { key: 'hubungan_keluarga', label: 'Hubungan' },
    { key: 'status_aktif', label: 'Aktif', render: (v) => v ? 'Ya' : 'Tidak' },
  ]

  const kkColumns = [
    { key: 'no_kk', label: 'No. KK' },
    { key: 'id_kepala_keluarga', label: 'Kepala KK', render: (v) => getKepalaName(citizens, v) },
    { key: 'status', label: 'Status' },
  ]

  const columns = activeTab === 'warga' ? wargaColumns : kkColumns
  const data = activeTab === 'warga' ? citizens : families
  const idKey = activeTab === 'warga' ? 'id_citizen' : 'id_family'

  return (
    <PageShell
      eyebrow="Kependudukan"
      title="Data Warga & KK"
      description="Kelola data warga (CRUD) dan Kartu Keluarga (CRUD) tingkat RT."
    >
      <section className="mt-8 space-y-6">
        {notice ? (
          <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-semibold text-sky-900">
            {notice}
          </div>
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={`rounded-full border px-4 py-2 text-xs font-extrabold transition ${
                activeTab === 'warga'
                  ? 'border-black bg-black text-white'
                  : 'border-neutral-300 bg-white text-neutral-700 hover:border-black hover:bg-neutral-100'
              }`}
              onClick={() => setActiveTab('warga')}
            >
              Data Warga
            </button>
            <button
              type="button"
              className={`rounded-full border px-4 py-2 text-xs font-extrabold transition ${
                activeTab === 'kk'
                  ? 'border-black bg-black text-white'
                  : 'border-neutral-300 bg-white text-neutral-700 hover:border-black hover:bg-neutral-100'
              }`}
              onClick={() => setActiveTab('kk')}
            >
              Kartu Keluarga (KK)
            </button>
          </div>
          <button
            className="rounded-full bg-black px-5 py-2 text-xs font-extrabold uppercase text-white transition hover:bg-neutral-900"
            onClick={activeTab === 'warga' ? openCreateWarga : openCreateKK}
            type="button"
          >
            + Tambah {activeTab === 'warga' ? 'Warga' : 'KK'}
          </button>
        </div>

        {isLoading ? (
          <div className="rounded-xl border border-neutral-300 bg-white p-8 text-center text-sm font-semibold text-neutral-600">
            Memuat data...
          </div>
        ) : data.length === 0 ? (
          <div className="rounded-xl border border-neutral-300 bg-white p-8 text-center text-sm font-semibold text-neutral-600">
            Belum ada data {activeTab === 'warga' ? 'warga' : 'KK'}.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-neutral-300 bg-white">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead>
                <tr className="border-b border-neutral-300 text-xs uppercase text-neutral-500">
                  {columns.map((col) => (
                    <th key={col.key} className="px-5 py-3">{col.label}</th>
                  ))}
                  <th className="px-5 py-3">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item) => (
                  <tr key={item[idKey]} className="border-b border-neutral-100 last:border-0">
                    {columns.map((col) => (
                      <td key={col.key} className="px-5 py-3">
                        {col.render ? col.render(item[col.key]) : item[col.key] || '-'}
                      </td>
                    ))}
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          className="rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-bold text-neutral-700 hover:bg-neutral-100 transition"
                          onClick={() => activeTab === 'warga' ? openEditWarga(item) : openEditKK(item)}
                          type="button"
                        >
                          Edit
                        </button>
                        <button
                          className="rounded-lg border border-red-300 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 transition"
                          onClick={() => handleDelete(item[idKey], activeTab)}
                          type="button"
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <WargaFormModal
          open={wargaModal.open}
          onClose={() => setWargaModal({ open: false, mode: 'create', data: null })}
          onSubmit={handleWargaSubmit}
          initialData={wargaModal.data}
          families={families}
          masterData={masterData}
          mode={wargaModal.mode}
        />

        <KKFormModal
          open={kkModal.open}
          onClose={() => setKKModal({ open: false, mode: 'create', data: null })}
          onSubmit={handleKKSubmit}
          initialData={kkModal.data}
          citizens={citizens}
          loading={isLoading}
          mode={kkModal.mode}
        />
      </section>
    </PageShell>
  )
}