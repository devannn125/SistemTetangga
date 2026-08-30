import { useEffect, useMemo, useState } from 'react'
import { Icon } from '../../../components/ui/Icon'
import { createComplaint, getComplaints } from '../../../services/api'
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

const fallbackReports = [
  {
    id_complaint: 'CMP-DEMO-001',
    nomor_tiket: '#ADU-2025-001',
    kategori: 'INFRASTRUKTUR',
    status: 'SELESAI',
    judul: 'Jalan Berlubang di Depan Masjid',
    deskripsi: 'Terdapat lubang besar di jalan depan masjid yang membahayakan pengendara motor.',
    lokasi: 'Jl. Melati No. 15',
    urgensi: 'TINGGI',
    created_at: '2024-01-15T00:00:00.000000Z',
    pengirim: { nama: 'Ahmad Fauzi' },
  },
  {
    id_complaint: 'CMP-DEMO-002',
    nomor_tiket: '#ADU-2025-002',
    kategori: 'KEAMANAN',
    status: 'DIPROSES',
    judul: 'Lampu Jalan Mati',
    deskripsi: 'Lampu jalan di gang 3 sudah mati selama seminggu.',
    lokasi: 'Gang 3, Jl. Mawar',
    urgensi: 'SEDANG',
    created_at: '2024-02-01T00:00:00.000000Z',
    pengirim: { nama: 'Rizki Ramadan' },
  },
  {
    id_complaint: 'CMP-DEMO-003',
    nomor_tiket: '#ADU-2025-003',
    kategori: 'KEBERSIHAN',
    status: 'PENDING',
    judul: 'Sampah Menumpuk',
    deskripsi: 'Tempat sampah di pojok jalan sudah penuh dan berbau tidak sedap.',
    lokasi: 'Jl. Melati',
    urgensi: 'SEDANG',
    created_at: '2024-02-07T00:00:00.000000Z',
    pengirim: { nama: 'Siti Nurhaliza' },
  },
]

const statusTabs = [
  { id: 'all', label: 'Semua' },
  { id: 'draft', label: 'Draft' },
  { id: 'pending', label: 'Pending' },
  { id: 'diproses', label: 'Diproses' },
  { id: 'selesai', label: 'Selesai' },
]

const categoryOptions = [
  { label: 'Infrastruktur', value: 'INFRASTRUKTUR' },
  { label: 'Keamanan', value: 'KEAMANAN' },
  { label: 'Kebersihan', value: 'KEBERSIHAN' },
  { label: 'Sosial', value: 'SOSIAL' },
  { label: 'Lainnya', value: 'LAINNYA' },
]

const urgencyOptions = [
  { label: 'Rendah', value: 'RENDAH' },
  { label: 'Sedang', value: 'SEDANG' },
  { label: 'Tinggi', value: 'TINGGI' },
  { label: 'Darurat', value: 'DARURAT' },
]

const initialForm = {
  judul: '',
  kategori: 'INFRASTRUKTUR',
  lokasi: '',
  urgensi: 'SEDANG',
  deskripsi: '',
}

function formatLabel(value) {
  if (!value) return '-'
  return value
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function formatDate(value) {
  if (!value) return '-'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '-'
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(d)
}

function getReporterName(report) {
  return report.pengirim?.nama || report.pengirim?.name || report.pengirim?.username || 'Saya'
}

function getStatusSteps(status) {
  const normalized = String(status || 'PENDING').toUpperCase()
  const steps = ['DRAFT', 'PENDING', 'DIPROSES', 'SELESAI']
  if (normalized === 'DITOLAK') return ['DRAFT', 'PENDING', 'DITOLAK']
  if (normalized === 'ESKALASI') return ['DRAFT', 'PENDING', 'DIPROSES', 'ESKALASI']

  const index = steps.indexOf(normalized)
  return index >= 0 ? steps.slice(0, index + 1) : ['DRAFT', 'PENDING']
}

function normalizeReports(response) {
  const rows = Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : []
  return rows.length ? rows : fallbackReports
}

export default function ComplaintPage() {
  const [activeStatus, setActiveStatus] = useState('all')
  const [searchText, setSearchText] = useState('')
  const [proofFile, setProofFile] = useState(null)
  const [reports, setReports] = useState(fallbackReports)
  const [form, setForm] = useState(initialForm)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [notice, setNotice] = useState('')
  const confirm = useConfirm()
  const { showToast } = useToast()

  useEffect(() => {
    let alive = true

    async function loadComplaints() {
      setIsLoading(true)
      try {
        const response = await getComplaints({ per_page: 50 })
        if (alive) setReports(normalizeReports(response))
      } catch (error) {
        if (alive) setNotice(error.message || 'Backend belum dapat dihubungi. Menampilkan data contoh.')
      } finally {
        if (alive) setIsLoading(false)
      }
    }

    loadComplaints()

    return () => {
      alive = false
    }
  }, [])

  const tabCounts = useMemo(() => {
    const counts = { all: reports.length, draft: 0, pending: 0, diproses: 0, selesai: 0 }
    reports.forEach((report) => {
      const status = String(report.status || '').toLowerCase()
      if (status in counts) counts[status] += 1
    })
    return counts
  }, [reports])

  const filteredReports = reports.filter((report) => {
    const status = String(report.status || '').toLowerCase()
    const matchesStatus = activeStatus === 'all' || status === activeStatus
    const matchesSearch = [report.nomor_tiket, report.judul, report.deskripsi, report.kategori, report.lokasi]
      .join(' ')
      .toLowerCase()
      .includes(searchText.toLowerCase())

    return matchesStatus && matchesSearch
  })

  function getStatusClass(status) {
    return {
      draft: 'bg-neutral-100 text-neutral-900',
      pending: 'bg-amber-100 text-amber-900',
      diproses: 'bg-sky-100 text-sky-900',
      eskalasi: 'bg-orange-100 text-orange-900',
      selesai: 'bg-emerald-100 text-emerald-900',
      ditolak: 'bg-red-100 text-red-900',
    }[String(status || '').toLowerCase()] || 'bg-neutral-100 text-neutral-900'
  }

  function updateForm(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const approved = await confirm({
      title: 'Konfirmasi Kirim Laporan',
      message: `Kirim pengaduan "${form.judul}" dengan tingkat urgensi ${form.urgensi}?`,
      confirmLabel: 'Ya, Kirim',
    })
    if (!approved) return
    setIsSubmitting(true)

    try {
      const response = await createComplaint({
        judul: form.judul.trim(),
        kategori: form.kategori,
        lokasi: form.lokasi.trim() || null,
        urgensi: form.urgensi,
        deskripsi: form.deskripsi.trim(),
      })
      const created = response?.data || response
      setReports((current) => [created, ...current])
      setForm(initialForm)
      setProofFile(null)
      showToast('Laporan berhasil dikirim dan masuk ke database.')
    } catch (error) {
      showToast(error.message || 'Laporan belum berhasil dikirim. Periksa koneksi dan data input.', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <PageShell
      description="Kelola laporan dan pengaduan warga RT 005 / RW 012 dengan status Draft, Pending, Diproses, dan Selesai."
      eyebrow="Pengaduan"
      title="Sistem Pengaduan"
    >
      <section className="mt-8 space-y-6">
        {notice ? (
          <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-semibold text-sky-900">
            {notice}
          </div>
        ) : null}

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
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
                {tab.label} <span className="ml-2 rounded-full bg-neutral-200 px-2 py-0.5 text-[10px] font-bold text-neutral-700">{tabCounts[tab.id] || 0}</span>
              </button>
            ))}
          </div>
          <a
            href="#form-pengaduan"
            className="inline-flex h-11 items-center justify-center rounded-full bg-sky-600 px-5 text-xs font-extrabold uppercase text-white no-underline transition hover:bg-sky-700"
          >
            Buat Laporan
          </a>
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(320px,420px)]">
          <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-1 items-center gap-3 rounded-full border border-neutral-300 bg-white px-4 py-2">
                <Icon name="search" className="h-4 w-4 text-neutral-500" />
                <input
                  value={searchText}
                  onChange={(event) => setSearchText(event.target.value)}
                  className="w-full bg-transparent text-sm text-neutral-900 outline-none"
                  placeholder="Cari nomor tiket atau judul laporan..."
                />
              </div>
              <button className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-neutral-900 bg-white px-5 text-xs font-extrabold uppercase text-black transition hover:bg-neutral-100" type="button">
                <Icon name="filter" className="h-4 w-4" />
                Filter
              </button>
            </div>

            <div className="grid gap-4">
              {isLoading ? (
                <div className="rounded-3xl border border-neutral-300 bg-white p-8 text-center text-sm font-semibold text-neutral-600">
                  Memuat data pengaduan...
                </div>
              ) : filteredReports.length === 0 ? (
                <div className="rounded-3xl border border-neutral-300 bg-white p-8 text-center text-sm font-semibold text-neutral-600">
                  Tidak ada laporan sesuai kriteria.
                </div>
              ) : (
                filteredReports.map((report) => (
                  <article key={report.id_complaint || report.nomor_tiket} className="rounded-3xl border border-neutral-300 bg-white p-6">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-neutral-500">
                          <span>{report.nomor_tiket}</span>
                          <span className="rounded-full border border-neutral-300 bg-neutral-100 px-2 py-1 text-neutral-700">{formatLabel(report.kategori)}</span>
                        </div>
                        <h2 className="text-xl font-extrabold text-black">{report.judul}</h2>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs font-bold ${getStatusClass(report.status)}`}>{formatLabel(report.status)}</span>
                    </div>

                    <p className="mt-4 text-sm leading-6 text-neutral-600">{report.deskripsi}</p>

                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      <div className="space-y-1 text-sm text-neutral-500">
                        <p><span className="font-bold text-neutral-900">Lokasi:</span> {report.lokasi || '-'}</p>
                        <p><span className="font-bold text-neutral-900">Pelapor:</span> {getReporterName(report)}</p>
                      </div>
                      <div className="space-y-1 text-sm text-neutral-500">
                        <p><span className="font-bold text-neutral-900">Tanggal:</span> {formatDate(report.created_at)}</p>
                        <p><span className="font-bold text-neutral-900">Urgensi:</span> {formatLabel(report.urgensi)}</p>
                      </div>
                    </div>

                    <div className="mt-6 flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-neutral-500">
                      {getStatusSteps(report.status).map((step) => (
                        <span key={step} className="rounded-full border border-neutral-300 bg-neutral-100 px-2 py-1">{formatLabel(step)}</span>
                      ))}
                    </div>
                  </article>
                ))
              )}
            </div>
          </div>

          <aside id="form-pengaduan" className="space-y-4 rounded-3xl border border-neutral-300 bg-white p-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">Tambah laporan</p>
              <h2 className="mt-3 text-2xl font-extrabold text-black">Unggah Bukti & Detail</h2>
              <p className="mt-2 text-sm leading-6 text-neutral-600">Isi formulir di bawah ini untuk membuat laporan baru. Foto bukti akan siap dipakai setelah kolom lampiran tersedia di backend.</p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <label className="grid gap-2 text-sm font-bold text-black">
                Judul Pengaduan
                <input
                  value={form.judul}
                  onChange={(event) => updateForm('judul', event.target.value)}
                  className="h-11 w-full rounded-xl border border-neutral-300 px-4 text-sm outline-none focus:border-sky-600"
                  placeholder="Contoh: Jalan rusak depan pos"
                />
              </label>
              <label className="grid gap-2 text-sm font-bold text-black">
                Kategori
                <select
                  value={form.kategori}
                  onChange={(event) => updateForm('kategori', event.target.value)}
                  className="h-11 w-full rounded-xl border border-neutral-300 bg-white px-4 text-sm outline-none focus:border-sky-600"
                >
                  {categoryOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </label>
              <label className="grid gap-2 text-sm font-bold text-black">
                Lokasi
                <input
                  value={form.lokasi}
                  onChange={(event) => updateForm('lokasi', event.target.value)}
                  className="h-11 w-full rounded-xl border border-neutral-300 px-4 text-sm outline-none focus:border-sky-600"
                  placeholder="Contoh: Gang 3"
                />
              </label>
              <label className="grid gap-2 text-sm font-bold text-black">
                Urgensi
                <select
                  value={form.urgensi}
                  onChange={(event) => updateForm('urgensi', event.target.value)}
                  className="h-11 w-full rounded-xl border border-neutral-300 bg-white px-4 text-sm outline-none focus:border-sky-600"
                >
                  {urgencyOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </label>
              <label className="grid gap-2 text-sm font-bold text-black">
                Deskripsi Singkat
                <textarea
                  value={form.deskripsi}
                  onChange={(event) => updateForm('deskripsi', event.target.value)}
                  className="min-h-[120px] w-full resize-none rounded-2xl border border-neutral-300 px-4 py-3 text-sm outline-none focus:border-sky-600"
                  placeholder="Jelaskan detail masalah minimal 30 karakter..."
                />
              </label>
              <label className="grid gap-2 text-sm font-bold text-black">
                Unggah Bukti Foto
                <span className="flex min-h-[120px] w-full cursor-pointer flex-col justify-center rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 px-4 py-3 text-sm font-semibold text-neutral-600 transition hover:border-sky-600 hover:bg-sky-50">
                  <span>{proofFile ? proofFile.name : 'Pilih file foto bukti'}</span>
                  <span className="mt-1 text-xs font-medium text-neutral-500">Format gambar. Tampilan disamakan dengan card deskripsi.</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) => setProofFile(event.target.files?.[0] || null)}
                    className="sr-only"
                  />
                </span>
              </label>
              <button
                className="w-full rounded-full bg-black px-5 py-3 text-sm font-extrabold uppercase text-white transition hover:bg-neutral-900 disabled:cursor-not-allowed disabled:bg-neutral-400"
                disabled={isSubmitting}
                type="submit"
              >
                {isSubmitting ? 'Mengirim...' : 'Kirim Laporan'}
              </button>
            </form>
          </aside>
        </div>
      </section>
    </PageShell>
  )
}
