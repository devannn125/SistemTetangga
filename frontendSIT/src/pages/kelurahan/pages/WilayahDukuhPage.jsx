import { useState, useCallback, useEffect } from 'react'
import { PageShell } from '@/components/layout/PageShell'
import { createWilayah, getWilayah, getCitizenMe } from '@/services/api'
import { useToast } from '@/components/ui/ToastContext'
import { Label } from '@/components/ui/Label'
import { Input } from '@/components/ui/Input'
import { Icon } from '@/components/ui/Icon'

export default function WilayahDukuhPage() {
  const { showToast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [dukuhs, setDukuhs] = useState([])
  const [kelurahanId, setKelurahanId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [nama, setNama] = useState('')

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [resMe, resWil] = await Promise.all([
        getCitizenMe().catch(() => null),
        getWilayah({ per_page: 100, all: 1 }),
      ])
      const myWilayah = resMe?.data?.wilayah
      const arr = Array.isArray(resWil?.data) ? resWil.data : Array.isArray(resWil) ? resWil : []

      // Kelurahan anchor Lurah (dari wilayah akun, atau cari node KELURAHAN di scope).
      let kelId = myWilayah?.tipe === 'KELURAHAN' ? myWilayah.id_wilayah : null
      if (!kelId) kelId = arr.find((w) => w.tipe === 'KELURAHAN')?.id_wilayah || null
      setKelurahanId(kelId)

      setDukuhs(arr.filter((w) => w.tipe === 'DUKUH').sort((a, b) => a.nama_wilayah.localeCompare(b.nama_wilayah)))
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!nama.trim()) {
      showToast('Nama wilayah dukuh wajib diisi.', 'error')
      return
    }
    if (!kelurahanId) {
      showToast('Kelurahan tidak ditemukan.', 'error')
      return
    }
    setIsSubmitting(true)
    try {
      await createWilayah({ nama_wilayah: nama.trim(), tipe: 'DUKUH', parent_id: kelurahanId })
      showToast('Wilayah Dukuh berhasil dibuat.')
      setNama('')
      loadData()
    } catch (err) {
      showToast(err.message || 'Gagal membuat wilayah Dukuh.', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <PageShell
      eyebrow="Wilayah"
      title="Wilayah Dukuh"
      description="Buat wilayah Dukuh baru di bawah Kelurahan. Setelah dibuat, nama dukuh akan muncul sebagai pilihan di menu Data Kepala Dukuh."
    >
      <section className="mx-auto mt-6 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-neutral-300 bg-white p-6 shadow-sm">
          <div className="space-y-2">
            <Label className="text-sm font-bold text-black">Nama Wilayah Dukuh <span className="text-red-500">*</span></Label>
            <Input value={nama} onChange={(e) => setNama(e.target.value)} placeholder="Contoh: Dukuh Barat" required />
            <p className="text-xs text-neutral-500">Kode wilayah dibuat otomatis (DUK01, DUK02, dst).</p>
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-black px-6 py-2.5 text-sm font-bold text-white transition hover:bg-neutral-800 disabled:opacity-50"
          >
            <Icon name="building" className="h-4 w-4" />
            Simpan Wilayah Dukuh
          </button>
        </form>

        <div className="mt-8">
          <h2 className="text-lg font-bold text-black">Daftar Wilayah Dukuh</h2>
          <div className="mt-3 overflow-hidden overflow-x-auto rounded-xl border border-neutral-300 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="bg-neutral-50 border-b">
                <tr className="text-xs uppercase text-neutral-500">
                  <th className="px-5 py-3 font-semibold">Kode</th>
                  <th className="px-5 py-3 font-semibold">Nama Wilayah</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {loading ? (
                  <tr><td colSpan="2" className="p-5 text-center text-neutral-500">Memuat data...</td></tr>
                ) : dukuhs.length === 0 ? (
                  <tr><td colSpan="2" className="p-5 text-center text-neutral-500">Belum ada wilayah Dukuh.</td></tr>
                ) : dukuhs.map((d) => (
                  <tr key={d.id_wilayah} className="hover:bg-neutral-50">
                    <td className="px-5 py-3 font-mono font-medium text-black">{d.kode_wilayah}</td>
                    <td className="px-5 py-3 font-bold text-black">{d.nama_wilayah}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </PageShell>
  )
}
