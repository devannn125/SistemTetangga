import { useEffect, useState } from 'react'
import { PageShell } from '@/components/layout/PageShell'
import { getLetterRequests } from '@/services/api'
import { formatDate } from './utils'

export default function RwLetterPage() {
  const [letters, setLetters] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    getLetterRequests({ per_page: 100 }).then(res => {
      setLetters(Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [])
      setIsLoading(false)
    }).catch(err => {
      console.error(err)
      setIsLoading(false)
    })
  }, [])

  return (
    <PageShell
      eyebrow="Surat Keterangan"
      title="Arsip & Monitor Surat Pengantar"
      description="Monitor daftar pengajuan surat keterangan warga di lingkungan RW."
    >
      <section className="mt-8">
        {isLoading ? (
          <div className="p-8 text-center text-sm text-neutral-500 bg-white border rounded-xl">Memuat data surat...</div>
        ) : (
          <div className="rounded-xl border bg-white overflow-hidden overflow-x-auto">
            <table className="w-full text-left text-sm min-w-[800px]">
              <thead className="bg-neutral-50 border-b">
                <tr className="text-xs uppercase text-neutral-500">
                  <th className="px-5 py-3 font-semibold">Nomor Surat</th>
                  <th className="px-5 py-3 font-semibold">Pemohon</th>
                  <th className="px-5 py-3 font-semibold">Jenis Surat</th>
                  <th className="px-5 py-3 font-semibold">Keperluan / Keterangan</th>
                  <th className="px-5 py-3 font-semibold">RT / Wilayah</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold">Tanggal Terbit</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {letters.length === 0 ? (
                  <tr><td colSpan="7" className="p-5 text-center text-neutral-500">Belum ada pengajuan surat keterangan</td></tr>
                ) : (
                  letters.map(l => (
                    <tr key={l.id_letter_request} className="hover:bg-neutral-50">
                      <td className="px-5 py-3 font-mono text-black">{l.nomor_surat || '-'}</td>
                      <td className="px-5 py-3 font-bold text-black">{l.pemohon?.nama_lengkap || '-'}</td>
                      <td className="px-5 py-3">
                        <span className="inline-flex px-2 py-0.5 rounded text-xs font-bold bg-neutral-100 text-neutral-800">
                          {l.jenis_surat}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        {l.jenis_surat === 'USAHA' ? `${l.nama_usaha || ''} (${l.jenis_usaha || ''})` : (l.keperluan || '-')}
                      </td>
                      <td className="px-5 py-3">{l.wilayah?.nama_wilayah || '-'}</td>
                      <td className="px-5 py-3">
                        <span className="inline-flex px-2.5 py-1 text-xs font-bold rounded-full bg-blue-50 text-blue-800">
                          {l.status}
                        </span>
                      </td>
                      <td className="px-5 py-3">{l.tanggal_terbit ? formatDate(l.tanggal_terbit) : '-'}</td>
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
