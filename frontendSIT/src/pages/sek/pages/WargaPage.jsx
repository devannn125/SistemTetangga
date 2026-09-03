import { useEffect, useState } from 'react'
import { getCitizens, createCitizen, updateCitizen, getFamilies, createFamily, updateFamily, getMasterData } from '@/services/api'
import { PageShell } from '@/components/layout/PageShell'
import { DataTable } from '@/components/ui/DataTable'
import { Button } from '@/components/ui/Button'
import { Badge, StatusBadge } from '@/components/ui/Badge'
import { useConfirm } from '@/components/ui/ConfirmContext'
import { useToast } from '@/components/ui/ToastContext'
import WargaFormModal from '@/pages/sek/pages/WargaFormModal'
import KKFormModal from '@/pages/sek/pages/KKFormModal'
import {
  enumLabel,
  formatDateShort,
  toRows,
  yaTidakLabel,
} from '@/pages/sek/pages/utils'

function CellStack({ main, subs = [] }) {
  return (
    <div className="space-y-0.5">
      <div className="font-semibold text-neutral-900">{main}</div>
      {subs.filter(Boolean).map((line, i) => (
        <div key={i} className="text-xs text-neutral-500">{line}</div>
      ))}
    </div>
  )
}

const WARGA_FILTERS = [
  {
    key: 'status_warga',
    label: 'Status Warga',
    options: [
      { value: 'TETAP', label: 'Tetap' },
      { value: 'TIDAK_TETAP', label: 'Tidak Tetap' },
    ],
  },
  {
    key: 'status_aktif',
    label: 'Status Aktif',
    options: [
      { value: 'true', label: 'Aktif' },
      { value: 'false', label: 'Nonaktif' },
    ],
  },
]

const KK_FILTERS = [
  {
    key: 'status',
    label: 'Status KK',
    options: [
      { value: 'ACTIVE', label: 'Aktif' },
      { value: 'PINDAH', label: 'Pindah' },
      { value: 'DIHAPUS', label: 'Dihapus' },
    ],
  },
]

export default function WargaPage() {
  const [activeTab, setActiveTab] = useState('warga')
  const [citizens, setCitizens] = useState([])
  const [families, setFamilies] = useState([])
  const [masterData, setMasterData] = useState({ agama: [], pendidikan: [], profesi: [] })
  const [isLoading, setIsLoading] = useState(true)
  const [notice, setNotice] = useState('')

  const [wargaModal, setWargaModal] = useState({ open: false, mode: 'create', data: null })
  const [kkModal, setKKModal] = useState({ open: false, mode: 'create', data: null })
  const confirm = useConfirm()
  const { showToast } = useToast()

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

  useEffect(() => {
    let alive = true
    async function loadData() {
      setIsLoading(true)
      setNotice('')
      try {
        const [citizensRes, familiesRes] = await Promise.all([
          getCitizens({ per_page: 200 }),
          getFamilies({ per_page: 200 }),
        ])
        if (alive) {
          setCitizens(toRows(citizensRes))
          setFamilies(toRows(familiesRes))
        }
      } catch (error) {
        if (alive) setNotice(error.message || 'Gagal memuat data.')
      } finally {
        if (alive) setIsLoading(false)
      }
    }
    loadData()
    return () => { alive = false }
  }, [])

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
      const response = await updateCitizen(wargaModal.data.id_citizen, payload)
      const updated = response?.data || response
      setCitizens((prev) => prev.map(c => c.id_citizen === wargaModal.data.id_citizen ? updated : c))
    } else {
      const response = await createCitizen(payload)
      const created = response?.data || response
      setCitizens((prev) => [created, ...prev])
    }
  }

  async function handleKKSubmit(payload) {
    if (kkModal.mode === 'edit') {
      const response = await updateFamily(kkModal.data.id_family, payload)
      const updated = response?.data || response
      setFamilies((prev) => prev.map(f => f.id_family === kkModal.data.id_family ? { ...updated, members_count: f.members_count } : f))
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
    {
      key: 'nama_lengkap',
      label: 'Warga',
      render: (_, item) => (
        <CellStack main={item.nama_lengkap || '-'} subs={[item.nik ? `NIK: ${item.nik}` : null]} />
      ),
    },
    {
      key: 'jenis_kelamin',
      label: 'JK & Lahir',
      render: (v, item) => (
        <CellStack
          main={enumLabel(v)}
          subs={[item.tempat_lahir, formatDateShort(item.tanggal_lahir)]}
        />
      ),
    },
    {
      key: 'no_hp',
      label: 'Kontak',
      render: (v, item) => (
        <CellStack main={v || '-'} subs={[item?.email]} />
      ),
    },
    {
      key: 'pendidikan',
      label: 'Pendidikan & Profesi',
      render: (v, item) => (
        <CellStack main={v?.nama_master || '-'} subs={[item?.profesi?.nama_master]} />
      ),
    },
    {
      key: 'agama',
      label: 'Agama & Nikah',
      render: (v, item) => (
        <CellStack
          main={v?.nama_master || '-'}
          subs={[item?.status_nikah ? enumLabel(item.status_nikah) : null]}
        />
      ),
    },
    {
      key: 'status_warga',
      label: 'Status & Sosial',
      render: (v, item) => (
        <CellStack
          main={enumLabel(v)}
          subs={[
            item.kewarganegaraan ? enumLabel(item.kewarganegaraan) : null,
            item.status_ekonomi ? enumLabel(item.status_ekonomi) : null,
            item.penerima_bansos === undefined || item.penerima_bansos === null
              ? null
              : `Bansos: ${yaTidakLabel(item.penerima_bansos)}`,
          ]}
        />
      ),
    },
    {
      key: 'status_verifikasi',
      label: 'Verifikasi',
      render: (v) => <StatusBadge status={v || 'PENDING'} />,
    },
    {
      key: 'family',
      label: 'KK & Hubungan',
      render: (v, item) => (
        <CellStack
          main={v?.no_kk || '-'}
          subs={[item?.hubungan_keluarga ? enumLabel(item?.hubungan_keluarga) : null]}
        />
      ),
    },
    {
      key: 'tanggal_masuk_rt',
      label: 'Domisili & Status',
      render: (v, item) => (
        <CellStack
          main={v ? `Masuk RT: ${formatDateShort(v)}` : '-'}
          subs={[
            `KK Luar RT: ${yaTidakLabel(item?.alamat_kk_luar_rt)}`,
            `Domisili Luar: ${yaTidakLabel(item?.berdomisili_luar_rt)}`,
            item?.status_hidup ? enumLabel(item.status_hidup) : null,
            `Aktif: ${yaTidakLabel(item?.status_aktif)}`,
          ]}
        />
      ),
    },
    {
      key: 'actions',
      label: 'Aksi',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => openEditWarga(row)}
            type="button"
          >
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-red-600 border-red-300 hover:bg-red-50"
            onClick={() => handleDelete(row.id_citizen, 'warga')}
            type="button"
          >
            Hapus
          </Button>
        </div>
      ),
    },
  ]

  const kkColumns = [
    { key: 'no_kk', label: 'No. KK' },
    { key: 'kepala_keluarga', label: 'Kepala KK', render: (v) => v?.nama_lengkap || '-' },
    { key: 'status', label: 'Status', render: (v) => (
      <Badge variant={
        v === 'ACTIVE' ? 'success' : v === 'PINDAH' ? 'warning' : 'destructive'
      }>{v}</Badge>
    ) },
    {
      key: 'actions',
      label: 'Aksi',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => openEditKK(row)}
            type="button"
          >
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-red-600 border-red-300 hover:bg-red-50"
            onClick={() => handleDelete(row.id_family, 'kk')}
            type="button"
          >
            Hapus
          </Button>
        </div>
      ),
    },
  ]

  const columns = activeTab === 'warga' ? wargaColumns : kkColumns
  const data = activeTab === 'warga' ? citizens : families
  const filters = activeTab === 'warga' ? WARGA_FILTERS : KK_FILTERS
  const searchKeys = activeTab === 'warga'
    ? ['nama_lengkap', 'nik', 'no_hp', 'email']
    : ['no_kk']
  const rowKey = activeTab === 'warga' ? 'id_citizen' : 'id_family'

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
          <Button
            className="rounded-full bg-black px-5 py-2 text-xs font-extrabold uppercase text-white transition hover:bg-neutral-900"
            onClick={activeTab === 'warga' ? openCreateWarga : openCreateKK}
            type="button"
          >
            + Tambah {activeTab === 'warga' ? 'Warga' : 'KK'}
          </Button>
        </div>

        <DataTable
          data={data}
          columns={columns}
          searchKeys={searchKeys}
          searchPlaceholder={activeTab === 'warga' ? 'Cari nama, NIK, HP, email...' : 'Cari No. KK...'}
          filters={filters}
          loading={isLoading}
          emptyMessage={activeTab === 'warga' ? 'Belum ada data warga.' : 'Belum ada data KK.'}
          rowKey={rowKey}
        />

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
          families={families}
          loading={isLoading}
          mode={kkModal.mode}
        />
      </section>
    </PageShell>
  )
}