import { useEffect, useState } from 'react'
import { PageShell } from '@/components/layout/PageShell'
import { getCitizens, getFamilies, updateCitizen } from '@/services/api'
import { useConfirm } from '@/components/ui/ConfirmContext'
import { useToast } from '@/components/ui/ToastContext'
import { getVerificationStatusClass, getVerificationStatusLabel } from './utils'

export default function RwCitizenPage() {
  const [activeTab, setActiveTab] = useState('warga')
  const [citizens, setCitizens] = useState([])
  const [families, setFamilies] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [notice, setNotice] = useState('')
  const [processingId, setProcessingId] = useState('')
  const confirm = useConfirm()
  const { showToast } = useToast()

  async function loadData() {
    setIsLoading(true)
    setNotice('')
    try {
      const [resCit, resFam] = await Promise.all([
        getCitizens({ per_page: 200 }),
        getFamilies({ per_page: 200 })
      ])
      setCitizens(Array.isArray(resCit?.data) ? resCit.data : Array.isArray(resCit) ? resCit : [])
      setFamilies(Array.isArray(resFam?.data) ? resFam.data : Array.isArray(resFam) ? resFam : [])
    } catch (err) {
      setNotice(err.message || 'Gagal memuat data warga.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  async function handleVerify(citizen, status) {
    const actionLabel = status === 'VERIFIED_RW' ? 'memverifikasi' : 'menolak'
    const approved = await confirm({
      title: status === 'VERIFIED_RW' ? 'Konfirmasi Verifikasi' : 'Konfirmasi Tolak',
      message: `Apakah Anda yakin ingin ${actionLabel} data warga atas nama "${citizen.nama_lengkap}"?`,
      confirmLabel: status === 'VERIFIED_RW' ? 'Ya, Verifikasi' : 'Ya, Tolak',
    })
    if (!approved) return
    setProcessingId(citizen.id_citizen)
    try {
      await updateCitizen(citizen.id_citizen, {
        status_verifikasi: status
      })
      showToast(`Data warga berhasil ${status === 'VERIFIED_RW' ? 'diverifikasi' : 'ditolak'}.`)
      loadData()
    } catch (err) {
      showToast(err.message || 'Gagal memperbarui verifikasi.', 'error')
    } finally {
      setProcessingId('')
    }
  }

  return (
    <PageShell
      eyebrow="Kependudukan"
      title="Verifikasi Warga & Kartu Keluarga"
      description="Ketua RW memverifikasi warga baru tingkat RT. Akses bersifat read-only untuk data umum dan hanya dapat memproses pengajuan berstatus Pending."
    >
      <section className="mt-8 space-y-6">
        {notice && (
          <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-semibold text-sky-900">
            {notice}
          </div>
        )}

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

        {isLoading ? (
          <div className="p-8 text-center text-sm text-neutral-500 bg-white rounded-xl border">Memuat data...</div>
        ) : activeTab === 'warga' ? (
          <div className="rounded-xl border bg-white overflow-hidden overflow-x-auto">
            <table className="w-full text-left text-sm min-w-[900px]">
              <thead className="bg-neutral-50 border-b">
                <tr className="text-xs uppercase text-neutral-500">
                  <th className="px-5 py-3 font-semibold">NIK</th>
                  <th className="px-5 py-3 font-semibold">Nama Lengkap</th>
                  <th className="px-5 py-3 font-semibold">Jenis Kelamin</th>
                  <th className="px-5 py-3 font-semibold">Status Warga</th>
                  <th className="px-5 py-3 font-semibold">RT / Wilayah</th>
                  <th className="px-5 py-3 font-semibold">Status Verifikasi</th>
                  <th className="px-5 py-3 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {citizens.length === 0 ? (
                  <tr><td colSpan="7" className="p-5 text-center text-neutral-500">Belum ada data warga</td></tr>
                ) : (
                  citizens.map(c => (
                    <tr key={c.id_citizen} className="hover:bg-neutral-50">
                      <td className="px-5 py-3 font-mono font-medium text-black">{c.nik}</td>
                      <td className="px-5 py-3 font-bold text-black">{c.nama_lengkap}</td>
                      <td className="px-5 py-3">{c.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}</td>
                      <td className="px-5 py-3">{c.status_warga}</td>
                      <td className="px-5 py-3">{c.wilayah?.nama_wilayah || '-'}</td>
                      <td className="px-5 py-3">
                        <span className={"inline-block px-2.5 py-1 text-xs font-bold rounded-full " + getVerificationStatusClass(c.status_verifikasi || 'PENDING')}>
                          {getVerificationStatusLabel(c.status_verifikasi || 'PENDING')}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        {c.status_verifikasi === 'PENDING' || !c.status_verifikasi ? (
                          <div className="flex justify-end gap-2">
                            <button
                              disabled={processingId === c.id_citizen}
                              onClick={() => handleVerify(c, 'VERIFIED_RW')}
                              className="rounded bg-sky-600 px-3 py-1.5 text-xs font-extrabold text-white hover:bg-sky-700 transition"
                            >
                              Verifikasi
                            </button>
                            <button
                              disabled={processingId === c.id_citizen}
                              onClick={() => handleVerify(c, 'REJECTED')}
                              className="rounded border border-red-300 px-3 py-1.5 text-xs font-extrabold text-red-600 hover:bg-red-50 transition"
                            >
                              Tolak
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-neutral-400 font-semibold">Telah Diproses</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-xl border bg-white overflow-hidden overflow-x-auto">
            <table className="w-full text-left text-sm min-w-[600px]">
              <thead className="bg-neutral-50 border-b">
                <tr className="text-xs uppercase text-neutral-500">
                  <th className="px-5 py-3 font-semibold">No. KK</th>
                  <th className="px-5 py-3 font-semibold">Kepala Keluarga</th>
                  <th className="px-5 py-3 font-semibold">RT / Wilayah</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {families.length === 0 ? (
                  <tr><td colSpan="4" className="p-5 text-center text-neutral-500">Belum ada data Kartu Keluarga</td></tr>
                ) : (
                  families.map(f => (
                    <tr key={f.id_family} className="hover:bg-neutral-50">
                      <td className="px-5 py-3 font-mono font-medium text-black">{f.no_kk}</td>
                      <td className="px-5 py-3 font-bold text-black">{f.kepala_keluarga?.nama_lengkap || '-'}</td>
                      <td className="px-5 py-3">{f.wilayah?.nama_wilayah || '-'}</td>
                      <td className="px-5 py-3">
                        <span className={`inline-block px-2.5 py-1 text-xs font-bold rounded-full ${f.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-900' : 'bg-red-100 text-red-900'}`}>
                          {f.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </PageShell>
  )
}
