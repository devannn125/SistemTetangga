import { useEffect, useState } from 'react'
import { getCitizens, createCitizen, updateCitizen, getFamilies, createFamily, updateFamily, getMasterData } from '@/services/api'
import { PageShell } from '@/components/layout/PageShell'
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

// Sel tabel bertumpuk: baris utama tebal + sub-teks kecil di bawahnya.
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

  // Load citizens AND families together — kedua list dibutuhkan lintas tab:
  // kolom/dropdown KK butuh daftar warga, dropdown KK pada WargaFormModal
  // dan filter kepala keluarga pada KKFormModal butuh daftar KK.
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
      // Pakai respons server (resource fresh + relasi ter-load) agar state
      // tabel selalu sinkron — buka Edit berikutnya menampilkan nilai terbaru.
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

  // Tabel ringkas: field pendukung menjadi sub-teks kecil di bawah nilai
  // utama kolomnya (tanpa kolom terpisah). Sub-line yang datanya kosong atau
  // tak berhak dilihat role (field sensitif difilter backend) dilewati.
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
        <CellStack main={v || '-'} subs={[item.email]} />
      ),
    },
    {
      key: 'pendidikan',
      label: 'Pendidikan & Profesi',
      render: (v, item) => (
        <CellStack main={v?.nama_master || '-'} subs={[item.profesi?.nama_master]} />
      ),
    },
    {
      key: 'agama',
      label: 'Agama & Nikah',
      render: (v, item) => (
        <CellStack
          main={v?.nama_master || '-'}
          subs={[item.status_nikah ? enumLabel(item.status_nikah) : null]}
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
      key: 'family',
      label: 'KK & Hubungan',
      // API mengirim relasi nested `family` (bukan id_family top-level).
      render: (v, item) => (
        <CellStack
          main={v?.no_kk || '-'}
          subs={[item.hubungan_keluarga ? enumLabel(item.hubungan_keluarga) : null]}
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
            `KK Luar RT: ${yaTidakLabel(item.alamat_kk_luar_rt)}`,
            `Domisili Luar: ${yaTidakLabel(item.berdomisili_luar_rt)}`,
            item.status_hidup ? enumLabel(item.status_hidup) : null,
            `Aktif: ${yaTidakLabel(item.status_aktif)}`,
          ]}
        />
      ),
    },
  ]

  const kkColumns = [
    { key: 'no_kk', label: 'No. KK' },
    // API mengirim relasi nested `kepala_keluarga`.
    { key: 'kepala_keluarga', label: 'Kepala KK', render: (v) => v?.nama_lengkap || '-' },
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
            <table className="w-full min-w-[1280px] text-left text-sm">
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
                      <td key={col.key} className="px-5 py-3 align-top">
                        {col.render ? col.render(item[col.key], item) : item[col.key] || '-'}
                      </td>
                    ))}
                    <td className="px-5 py-3 align-top">
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
          families={families}
          loading={isLoading}
          mode={kkModal.mode}
        />
      </section>
    </PageShell>
  )
}