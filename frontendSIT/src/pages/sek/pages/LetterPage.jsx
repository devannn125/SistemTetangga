import { useEffect, useState } from 'react'
import { getLetterRequests, updateLetterRequest } from '../../../services/api'
import { PageShell } from '../../../components/layout/PageShell'
import {
  formatDate,
  getStatusClass,
  toRows,
} from './utils'

const statusTabs = [
  { id: 'DIAJUKAN', label: 'Perlu Verifikasi' },
  { id: 'all', label: 'Semua' },
  { id: 'DIVERIFIKASI', label: 'Diverifikasi' },
  { id: 'DISETUJUI', label: 'Disetujui' },
  { id: 'DITOLAK', label: 'Ditolak' },
]

export default function LetterPage() {
  const [activeStatus, setActiveStatus] = useState('DIAJUKAN')
  const [letters, setLetters] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [processingId, setProcessingId] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    let alive = true

    async function loadLetters() {
      setIsLoading(true)
      try {
        const response = await getLetterRequests({ per_page: 100 })
        const rows = toRows(response)
        if (alive) setLetters(rows)
      } catch (error) {
        if (alive) setNotice(error.message || 'Backend belum dapat dihubungi.')
      } finally {
        if (alive) setIsLoading(false)
      }
    }

    loadLetters()

    return () => {
      alive = false
    }
  }, [])

  const filteredLetters = letters.filter((letter) => activeStatus === 'all' || letter.status === activeStatus)

  async function handleDecision(id, status) {
    setNotice('')
    setProcessingId(id)
    try {
      await updateLetterRequest(id, { status })
      setLetters((current) => current.map((letter) => (letter.id_letter_request === id ? { ...letter, status } : letter)))
      setNotice(`Permohonan surat berhasil ${status === 'DIVERIFIKASI' ? 'diverifikasi' : 'ditolak'}.`)
    } catch (error) {
      setNotice(error.message || 'Gagal memperbarui status surat.')
    } finally {
      setProcessingId('')
    }
  }

  return (
    <PageShell
      description="Verifikasi kelengkapan permohonan surat warga sebelum diteruskan ke Ketua RT untuk persetujuan final."
      eyebrow="Surat Keterangan"
      title="Verifikasi Permohonan Surat"
    >
      <section className="mt-8 space-y-6">
        {notice ? (
          <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-semibold text-sky-900">
            {notice}
          </div>
        ) : null}

        <div className="flex flex-wrap gap-3">
          {statusTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`rounded-full border px-4 py-2 text-xs font-extrabold transition ${
                activeStatus === tab.id
                  ? 'border-black bg-black text-white'
                  : 'border-neutral-300 bg-white text-neutral-700 hover:border-black hover:bg-neutral-100'
              }`}
              onClick={() => setActiveStatus(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="rounded-xl border border-neutral-300 bg-white p-8 text-center text-sm font-semibold text-neutral-600">
            Memuat data surat...
          </div>
        ) : filteredLetters.length === 0 ? (
          <div className="rounded-xl border border-neutral-300 bg-white p-8 text-center text-sm font-semibold text-neutral-600">
            Tidak ada permohonan surat pada status ini.
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredLetters.map((letter) => (
              <article key={letter.id_letter_request} className="border border-neutral-300 bg-white p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-extrabold text-black">
                      {letter.jenis_surat === 'DOMISILI' ? 'Surat Keterangan Domisili' : 'Surat Keterangan Usaha'}
                    </h2>
                    <p className="mt-1 text-sm text-neutral-600">
                      Pemohon: {letter.pemohon?.nama_lengkap || '-'} · {letter.jenis_surat === 'DOMISILI' ? letter.keperluan : letter.nama_usaha || '-'}
                    </p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${getStatusClass(letter.status)}`}>{letter.status}</span>
                </div>

                <div className="mt-4 grid gap-2 text-sm text-neutral-500 sm:grid-cols-2 lg:grid-cols-3">
                  <p><span className="font-bold text-neutral-900">Diajukan:</span> {formatDate(letter.created_at)}</p>
                  {letter.verified_at ? <p><span className="font-bold text-neutral-900">Diverifikasi:</span> {formatDate(letter.verified_at)}</p> : null}
                  {letter.approved_at ? <p><span className="font-bold text-neutral-900">Disetujui:</span> {formatDate(letter.approved_at)}</p> : null}
                  {letter.jenis_surat === 'USAHA' ? <p><span className="font-bold text-neutral-900">Usaha:</span> {letter.nama_usaha} ({letter.jenis_usaha})</p> : null}
                </div>

                {letter.status === 'DIAJUKAN' ? (
                  <div className="mt-5 flex flex-wrap gap-3">
                    <button
                      className="rounded-full bg-black px-5 py-2 text-xs font-extrabold uppercase text-white transition hover:bg-neutral-900 disabled:cursor-not-allowed disabled:opacity-50"
                      onClick={() => handleDecision(letter.id_letter_request, 'DIVERIFIKASI')}
                      disabled={processingId === letter.id_letter_request}
                      type="button"
                    >
                      Verifikasi
                    </button>
                    <button
                      className="rounded-full border border-black px-5 py-2 text-xs font-extrabold uppercase text-black transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50"
                      onClick={() => handleDecision(letter.id_letter_request, 'DITOLAK')}
                      disabled={processingId === letter.id_letter_request}
                      type="button"
                    >
                      Tolak
                    </button>
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        )}
      </section>
    </PageShell>
  )
}