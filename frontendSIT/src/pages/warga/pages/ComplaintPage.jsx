import { useState } from 'react'
import { Icon } from '../../../components/ui/Icon'

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

const pengaduanTabs = [
  { id: 'all', label: 'Semua', count: 21 },
  { id: 'draft', label: 'Draft', count: 3 },
  { id: 'pending', label: 'Pending', count: 7 },
  { id: 'diproses', label: 'Diproses', count: 7 },
  { id: 'selesai', label: 'Selesai', count: 6 },
]

const complaintReports = [
  {
    ticket: '#ADU-2025-001',
    category: 'Infrastruktur',
    status: 'selesai',
    statusLabel: 'Selesai',
    title: 'Jalan Berlubang di Depan Masjid',
    description: 'Terdapat lubang besar di jalan depan masjid yang membahayakan pengendara motor.',
    location: 'Jl. Melati No. 15',
    reporter: 'Ahmad Fauzi',
    date: '15 Jan 2024',
    comments: 1,
    steps: ['Draft', 'Pending', 'Diproses', 'Selesai'],
  },
  {
    ticket: '#ADU-2025-002',
    category: 'Penerangan',
    status: 'diproses',
    statusLabel: 'Diproses',
    title: 'Lampu Jalan Mati',
    description: 'Lampu jalan di gang 3 sudah mati selama seminggu.',
    location: 'Gang 3, Jl. Mawar',
    reporter: 'Rizki Ramadan',
    date: '1 Feb 2024',
    comments: 0,
    steps: ['Draft', 'Pending', 'Diproses'],
  },
  {
    ticket: '#ADU-2025-003',
    category: 'Kebersihan',
    status: 'pending',
    statusLabel: 'Pending',
    title: 'Sampah Menumpuk',
    description: 'Tempat sampah di pojok jalan sudah penuh dan berbau tidak sedap.',
    location: 'Jl. Melati',
    reporter: 'Siti Nurhaliza',
    date: '7 Feb 2024',
    comments: 2,
    steps: ['Draft', 'Pending'],
  },
  {
    ticket: '#ADU-2025-004',
    category: 'Drainase',
    status: 'draft',
    statusLabel: 'Draft',
    title: 'Saluran Air Tersumbat',
    description: 'Saluran air di depan rumah tersumbat menyebabkan genangan saat hujan.',
    location: 'Jl. Cempaka',
    reporter: 'Rina Sari',
    date: '10 Feb 2024',
    comments: 0,
    steps: ['Draft'],
  },
]

export default function ComplaintPage() {
  const [activeStatus, setActiveStatus] = useState('all')
  const [searchText, setSearchText] = useState('')
  const [proofFile, setProofFile] = useState(null)

  const filteredReports = complaintReports.filter((report) => {
    const matchesStatus = activeStatus === 'all' || report.status === activeStatus
    const matchesSearch = [report.ticket, report.title, report.description, report.category, report.location]
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
      selesai: 'bg-emerald-100 text-emerald-900',
    }[status]
  }

  return (
    <PageShell
      description="Kelola laporan dan pengaduan warga RT 005 / RW 012 dengan status Draft, Pending, Diproses, dan Selesai."
      eyebrow="Pengaduan"
      title="Sistem Pengaduan"
    >
      <section className="mt-8 space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-3">
            {pengaduanTabs.map((tab) => (
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
                {tab.label} <span className="ml-2 rounded-full bg-neutral-200 px-2 py-0.5 text-[10px] font-bold text-neutral-700">{tab.count}</span>
              </button>
            ))}
          </div>
          <button
            type="button"
            className="inline-flex h-11 items-center justify-center rounded-full bg-sky-600 px-5 text-xs font-extrabold uppercase text-white transition hover:bg-sky-700"
          >
            Buat Laporan
          </button>
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
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
              {filteredReports.length === 0 ? (
                <div className="rounded-3xl border border-neutral-300 bg-white p-8 text-center text-sm font-semibold text-neutral-600">
                  Tidak ada laporan sesuai kriteria.
                </div>
              ) : (
                filteredReports.map((report) => (
                  <article key={report.ticket} className="rounded-3xl border border-neutral-300 bg-white p-6">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-neutral-500">
                          <span>{report.ticket}</span>
                          <span className="rounded-full border border-neutral-300 bg-neutral-100 px-2 py-1 text-neutral-700">{report.category}</span>
                        </div>
                        <h2 className="text-xl font-extrabold text-black">{report.title}</h2>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs font-bold ${getStatusClass(report.status)}`}>{report.statusLabel}</span>
                    </div>

                    <p className="mt-4 text-sm leading-6 text-neutral-600">{report.description}</p>

                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      <div className="space-y-1 text-sm text-neutral-500">
                        <p><span className="font-bold text-neutral-900">Lokasi:</span> {report.location}</p>
                        <p><span className="font-bold text-neutral-900">Pelapor:</span> {report.reporter}</p>
                      </div>
                      <div className="space-y-1 text-sm text-neutral-500">
                        <p><span className="font-bold text-neutral-900">Tanggal:</span> {report.date}</p>
                        <p><span className="font-bold text-neutral-900">Komentar:</span> {report.comments}</p>
                      </div>
                    </div>

                    <div className="mt-6 flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-neutral-500">
                      {report.steps.map((step) => (
                        <span key={step} className="rounded-full border border-neutral-300 bg-neutral-100 px-2 py-1">{step}</span>
                      ))}
                    </div>
                  </article>
                ))
              )}
            </div>
          </div>

          <aside className="space-y-4 rounded-3xl border border-neutral-300 bg-white p-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">Tambah laporan</p>
              <h2 className="mt-3 text-2xl font-extrabold text-black">Unggah Bukti & Detail</h2>
              <p className="mt-2 text-sm leading-6 text-neutral-600">Isi formulir di bawah ini untuk membuat laporan baru dengan foto bukti.</p>
            </div>

            <form className="space-y-4">
              <label className="grid gap-2 text-sm font-bold text-black">
                Judul Pengaduan
                <input className="h-11 rounded-xl border border-neutral-300 px-4 text-sm outline-none focus:border-sky-600" placeholder="Contoh: Jalan rusak" />
              </label>
              <label className="grid gap-2 text-sm font-bold text-black">
                Kategori
                <select className="h-11 rounded-xl border border-neutral-300 bg-white px-4 text-sm outline-none focus:border-sky-600">
                  <option>Infrastruktur</option>
                  <option>Penerangan</option>
                  <option>Kebersihan</option>
                  <option>Drainase</option>
                </select>
              </label>
              <label className="grid gap-2 text-sm font-bold text-black">
                Lokasi
                <input className="h-11 rounded-xl border border-neutral-300 px-4 text-sm outline-none focus:border-sky-600" placeholder="Contoh: Gang 3" />
              </label>
              <label className="grid gap-2 text-sm font-bold text-black">
                Deskripsi Singkat
                <textarea className="min-h-[120px] resize-none rounded-2xl border border-neutral-300 px-4 py-3 text-sm outline-none focus:border-sky-600" placeholder="Jelaskan detail masalah..." />
              </label>
              <label className="grid gap-2 text-sm font-bold text-black">
                Unggah Bukti Foto
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => setProofFile(event.target.files?.[0] || null)}
                  className="rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm outline-none"
                />
              </label>
              {proofFile ? (
                <div className="rounded-2xl border border-neutral-300 bg-neutral-100 px-4 py-3 text-sm text-neutral-700">
                  <p className="font-semibold text-neutral-900">Bukti terpilih</p>
                  <p className="mt-1">{proofFile.name}</p>
                </div>
              ) : null}
              <button className="w-full rounded-full bg-black px-5 py-3 text-sm font-extrabold uppercase text-white transition hover:bg-neutral-900" type="button">
                Kirim Laporan
              </button>
            </form>
          </aside>
        </div>
      </section>
    </PageShell>
  )
}
