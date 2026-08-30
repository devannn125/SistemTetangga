import { useEffect, useState } from 'react'
import { createLetterRequest, getLetterRequests } from '../../../services/api'
import { useConfirm } from '../../../components/ui/ConfirmContext'
import { useToast } from '../../../components/ui/ToastContext'

function PageShell({ children, eyebrow, title, description }) {
  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <section className="border-2 border-neutral-900 bg-white p-8 max-sm:p-5">
        <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-neutral-500">{eyebrow}</p>
        <h1 className="mt-3 text-3xl font-extrabold leading-tight text-black max-sm:text-2xl">{title}</h1>
        {description ? <p className="mt-4 max-w-2xl text-sm leading-6 text-neutral-600">{description}</p> : null}
      </section>
      {children}
    </div>
  )
}

const statusTabs = [
  { id: 'all', label: 'Semua' },
  { id: 'DIAJUKAN', label: 'Diajukan' },
  { id: 'DIVERIFIKASI', label: 'Diverifikasi' },
  { id: 'DISETUJUI', label: 'Disetujui' },
  { id: 'DITOLAK', label: 'Ditolak' },
]

const initialForm = {
  jenis_surat: 'DOMISILI',
  keperluan: '',
  nama_usaha: '',
  jenis_usaha: '',
  alamat_usaha: '',
  lama_usaha_tahun: '',
}

function formatDate(value) {
  if (!value) return '-'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '-'
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(d)
}

function getStatusClass(status) {
  return {
    DIAJUKAN: 'bg-amber-100 text-amber-900',
    DIVERIFIKASI: 'bg-sky-100 text-sky-900',
    DISETUJUI: 'bg-emerald-100 text-emerald-900',
    DITOLAK: 'bg-red-100 text-red-900',
    DITANDATANGANI: 'bg-violet-100 text-violet-900',
    TERBIT: 'bg-neutral-100 text-neutral-900',
  }[status] || 'bg-neutral-100 text-neutral-900'
}

function getStatusSteps(status) {
  const steps = ['DIAJUKAN', 'DIVERIFIKASI', 'DISETUJUI']
  if (status === 'DITOLAK') return ['DIAJUKAN', 'DITOLAK']
  const index = steps.indexOf(status)
  return index >= 0 ? steps.slice(0, index + 1) : steps
}

function toRows(response) {
  return Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : []
}

export default function LetterPage() {
  const [activeStatus, setActiveStatus] = useState('all')
  const [letters, setLetters] = useState([])
  const [form, setForm] = useState(initialForm)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [notice, setNotice] = useState('')
  const confirm = useConfirm()
  const { showToast } = useToast()

  useEffect(() => {
    let alive = true

    async function loadLetters() {
      setIsLoading(true)
      try {
        const response = await getLetterRequests({ per_page: 50 })
        if (alive) setLetters(toRows(response))
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
  const isUsaha = form.jenis_surat === 'USAHA'

  function updateForm(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const approved = await confirm({
      title: 'Konfirmasi Pengajuan',
      message: `Ajukan permohonan Surat Keterangan ${form.jenis_surat === 'USAHA' ? 'Usaha' : 'Domisili'}?`,
      confirmLabel: 'Ya, Ajukan',
    })
    if (!approved) return
    setIsSubmitting(true)

    try {
      const payload = {
        jenis_surat: form.jenis_surat,
        ...(isUsaha
          ? { nama_usaha: form.nama_usaha.trim(), jenis_usaha: form.jenis_usaha.trim(), alamat_usaha: form.alamat_usaha.trim(), lama_usaha_tahun: form.lama_usaha_tahun ? Number(form.lama_usaha_tahun) : null }
          : { keperluan: form.keperluan.trim() }),
      }
      const response = await createLetterRequest(payload)
      const created = response?.data || response
      setLetters((current) => [created, ...current])
      setForm(initialForm)
      showToast('Permohonan surat berhasil diajukan dan menunggu verifikasi Sekretaris.')
    } catch (error) {
      showToast(error.message || 'Surat belum berhasil diajukan. Periksa data input.', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <PageShell
      description="Ajukan surat keterangan (Domisili / Usaha). Sekretaris RT akan memverifikasi, lalu Ketua RT memberikan persetujuan final."
      eyebrow="Surat Resmi"
      title="Pengajuan Surat Keterangan"
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

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(320px,400px)]">
          <div className="space-y-4">
            {isLoading ? (
              <div className="rounded-2xl border border-neutral-300 bg-white p-8 text-center text-sm font-semibold text-neutral-600">
                Memuat data surat...
              </div>
            ) : filteredLetters.length === 0 ? (
              <div className="rounded-2xl border border-neutral-300 bg-white p-8 text-center text-sm font-semibold text-neutral-600">
                Belum ada pengajuan surat.
              </div>
            ) : (
              filteredLetters.map((letter) => (
                <article key={letter.id_letter_request} className="rounded-2xl border border-neutral-300 bg-white p-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-extrabold text-black">
                        Surat Keterangan {letter.jenis_surat === 'DOMISILI' ? 'Domisili' : 'Usaha'}
                      </h2>
                      <p className="mt-1 text-sm text-neutral-600">
                        {letter.jenis_surat === 'DOMISILI' ? letter.keperluan : letter.nama_usaha || '-'}
                      </p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${getStatusClass(letter.status)}`}>
                      {getStatusSteps(letter.status)[getStatusSteps(letter.status).length - 1]}
                    </span>
                  </div>

                  <div className="mt-4 grid gap-2 text-sm text-neutral-500 sm:grid-cols-2">
                    <p><span className="font-bold text-neutral-900">Diajukan:</span> {formatDate(letter.created_at)}</p>
                    <p><span className="font-bold text-neutral-900">Nomor surat:</span> {letter.nomor_surat || 'Belum diterbitkan'}</p>
                    {letter.verified_at ? <p><span className="font-bold text-neutral-900">Diverifikasi:</span> {formatDate(letter.verified_at)}</p> : null}
                    {letter.approved_at ? <p><span className="font-bold text-neutral-900">Disetujui:</span> {formatDate(letter.approved_at)}</p> : null}
                  </div>

                  <div className="mt-5 flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-neutral-500">
                    {getStatusSteps(letter.status).map((step) => (
                      <span key={step} className="rounded-full border border-neutral-300 bg-neutral-100 px-2 py-1">{step}</span>
                    ))}
                  </div>
                </article>
              ))
            )}
          </div>

          <aside className="h-fit space-y-4 rounded-2xl border border-neutral-300 bg-white p-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">Ajukan surat</p>
              <h2 className="mt-3 text-2xl font-extrabold text-black">Permohonan Baru</h2>
              <p className="mt-2 text-sm leading-6 text-neutral-600">Pilih jenis surat dan lengkapi data. Alur: diajukan → diverifikasi Sekretaris → disetujui Ketua RT.</p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <label className="grid gap-2 text-sm font-bold text-black">
                Jenis Surat
                <select
                  value={form.jenis_surat}
                  onChange={(event) => updateForm('jenis_surat', event.target.value)}
                  className="h-11 w-full rounded-xl border border-neutral-300 bg-white px-4 text-sm outline-none focus:border-sky-600"
                >
                  <option value="DOMISILI">Surat Keterangan Domisili</option>
                  <option value="USAHA">Surat Keterangan Usaha</option>
                </select>
              </label>

              {isUsaha ? (
                <>
                  <label className="grid gap-2 text-sm font-bold text-black">
                    Nama Usaha
                    <input
                      value={form.nama_usaha}
                      onChange={(event) => updateForm('nama_usaha', event.target.value)}
                      className="h-11 w-full rounded-xl border border-neutral-300 px-4 text-sm outline-none focus:border-sky-600"
                      placeholder="Nama usaha"
                    />
                  </label>
                  <label className="grid gap-2 text-sm font-bold text-black">
                    Jenis / Bidang Usaha
                    <input
                      value={form.jenis_usaha}
                      onChange={(event) => updateForm('jenis_usaha', event.target.value)}
                      className="h-11 w-full rounded-xl border border-neutral-300 px-4 text-sm outline-none focus:border-sky-600"
                      placeholder="Contoh: Kuliner"
                    />
                  </label>
                  <label className="grid gap-2 text-sm font-bold text-black">
                    Alamat Usaha
                    <input
                      value={form.alamat_usaha}
                      onChange={(event) => updateForm('alamat_usaha', event.target.value)}
                      className="h-11 w-full rounded-xl border border-neutral-300 px-4 text-sm outline-none focus:border-sky-600"
                      placeholder="Alamat usaha"
                    />
                  </label>
                  <label className="grid gap-2 text-sm font-bold text-black">
                    Lama Usaha (tahun)
                    <input
                      type="number"
                      min="0"
                      max="99"
                      step="0.5"
                      value={form.lama_usaha_tahun}
                      onChange={(event) => updateForm('lama_usaha_tahun', event.target.value)}
                      className="h-11 w-full rounded-xl border border-neutral-300 px-4 text-sm outline-none focus:border-sky-600"
                      placeholder="Contoh: 3"
                    />
                  </label>
                </>
              ) : (
                <label className="grid gap-2 text-sm font-bold text-black">
                  Keperluan
                  <input
                    value={form.keperluan}
                    onChange={(event) => updateForm('keperluan', event.target.value)}
                    className="h-11 w-full rounded-xl border border-neutral-300 px-4 text-sm outline-none focus:border-sky-600"
                    placeholder="Contoh: Keperluan administrasi"
                  />
                </label>
              )}

              <button
                className="w-full rounded-full bg-black px-5 py-3 text-sm font-extrabold uppercase text-white transition hover:bg-neutral-900 disabled:cursor-not-allowed disabled:bg-neutral-400"
                disabled={isSubmitting}
                type="submit"
              >
                {isSubmitting ? 'Mengajukan...' : 'Ajukan Surat'}
              </button>
            </form>
          </aside>
        </div>
      </section>
    </PageShell>
  )
}