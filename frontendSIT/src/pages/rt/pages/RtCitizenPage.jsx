import { useEffect, useState } from 'react'
import { PageShell } from '../../../components/layout/PageShell'
import { getCitizens, updateCitizen, createCitizen, getWilayah } from '../../../services/api'
import { useConfirm } from '../../../components/ui/ConfirmContext'
import { useToast } from '../../../components/ui/ToastContext'

function getVerificationStatusClass(status) {
  return {
    PENDING: 'bg-amber-100 text-amber-900',
    VERIFIED_RW: 'bg-sky-100 text-sky-900',
    APPROVED_DUKUH: 'bg-emerald-100 text-emerald-900',
    REJECTED: 'bg-red-100 text-red-900',
  }[status] || 'bg-neutral-100 text-neutral-900'
}

function getVerificationStatusLabel(status) {
  return {
    PENDING: 'Pending',
    VERIFIED_RW: 'Terverifikasi RW',
    APPROVED_DUKUH: 'Disetujui',
    REJECTED: 'Ditolak',
  }[status] || status || 'Pending'
}

export default function RtCitizenPage() {
  const [citizens, setCitizens] = useState([])
  const [wilayahOptions, setWilayahOptions] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [notice, setNotice] = useState('')
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
    try {
      const [resCit, resWil] = await Promise.all([
        getCitizens({ per_page: 100 }),
        getWilayah({ per_page: 100 })
      ])
      
      const citData = Array.isArray(resCit?.data) ? resCit.data : Array.isArray(resCit) ? resCit : []
      const wilData = Array.isArray(resWil?.data) ? resWil.data : Array.isArray(resWil) ? resWil : []
      
      setCitizens(citData)
      setWilayahOptions(wilData)
      
      if (wilData.length > 0) {
        setFormData(f => ({ ...f, id_wilayah: wilData[0].id_wilayah }))
      }
    } catch (err) {
      setNotice(err.message || 'Gagal memuat data warga')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

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

  return (
    <PageShell
      eyebrow="Kependudukan"
      title="Data Warga RT"
      description="Kelola data warga di RT Anda. Tambahkan warga baru atau perbarui data. Data yang baru dimasukkan akan otomatis berstatus Pending dan memerlukan Verifikasi dari RW."
    >
      <section className="mt-8 space-y-6">
        {notice && (
          <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-semibold text-sky-900">
            {notice}
          </div>
        )}

        <div className="flex justify-between items-center">
          <button 
            type="button"
            onClick={() => handleOpenModal()} 
            className="rounded-full bg-black px-5 py-2 text-xs font-extrabold uppercase text-white hover:bg-neutral-900"
          >
            + Tambah Warga
          </button>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-sm text-neutral-500 bg-white rounded-xl border">Memuat...</div>
        ) : (
          <div className="rounded-xl border bg-white overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-neutral-50 border-b">
                <tr>
                  <th className="px-4 py-3 font-semibold text-neutral-600">NIK</th>
                  <th className="px-4 py-3 font-semibold text-neutral-600">Nama Lengkap</th>
                  <th className="px-4 py-3 font-semibold text-neutral-600">Status Warga</th>
                  <th className="px-4 py-3 font-semibold text-neutral-600">Status Verifikasi</th>
                  <th className="px-4 py-3 font-semibold text-neutral-600 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {citizens.length === 0 ? (
                  <tr><td colSpan="5" className="p-4 text-center text-neutral-500">Belum ada data warga</td></tr>
                ) : (
                  citizens.map(c => (
                    <tr key={c.id_citizen} className="hover:bg-neutral-50">
                      <td className="px-4 py-3 font-medium text-black">{c.nik}</td>
                      <td className="px-4 py-3">{c.nama_lengkap}</td>
                      <td className="px-4 py-3">{c.status_warga}</td>
                      <td className="px-4 py-3">
                        <span className={"inline-block px-2 py-1 text-xs font-bold rounded-full " + getVerificationStatusClass(c.status_verifikasi || 'PENDING')}>
                          {getVerificationStatusLabel(c.status_verifikasi || 'PENDING')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button 
                          onClick={() => handleOpenModal(c)}
                          className="text-sky-600 hover:text-sky-800 text-xs font-bold uppercase"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-black mb-4">
              {editingData ? 'Edit Data Warga' : 'Tambah Warga Baru'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">NIK</label>
                <input required value={formData.nik} onChange={e => setFormData({...formData, nik: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Nama Lengkap</label>
                <input required value={formData.nama_lengkap} onChange={e => setFormData({...formData, nama_lengkap: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Wilayah RT</label>
                <select required value={formData.id_wilayah} onChange={e => setFormData({...formData, id_wilayah: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm bg-white">
                  <option value="">-- Pilih Wilayah --</option>
                  {wilayahOptions.map(w => (
                    <option key={w.id_wilayah} value={w.id_wilayah}>{w.nama_wilayah}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Jenis Kelamin</label>
                  <select value={formData.jenis_kelamin} onChange={e => setFormData({...formData, jenis_kelamin: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm bg-white">
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Status Warga</label>
                  <select value={formData.status_warga} onChange={e => setFormData({...formData, status_warga: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm bg-white">
                    <option value="TETAP">Tetap</option>
                    <option value="TIDAK_TETAP">Tidak Tetap</option>
                  </select>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end gap-3 pt-4 border-t">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-xs font-bold text-neutral-600 hover:text-black">BATAL</button>
                <button type="submit" className="rounded-full bg-black px-5 py-2 text-xs font-extrabold uppercase text-white hover:bg-neutral-900">
                  Ajukan Verifikasi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageShell>
  )
}
