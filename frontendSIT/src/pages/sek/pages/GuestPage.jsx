import { useEffect, useState } from 'react'
import { PageShell } from '../../../components/layout/PageShell'
import { getGuests } from '../../../services/api'

const statusTabs = [
  { id: 'all', label: 'Semua' },
  { id: 'MENUNGGU', label: 'Menunggu' },
  { id: 'DISETUJUI', label: 'Disetujui' },
  { id: 'DITOLAK', label: 'Ditolak' },
  { id: 'CHECK_OUT', label: 'Check Out' },
]

function formatDate(value) {
  if (!value) return '-'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '-'
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(d)
}

function getStatusClass(status) {
  return {
    MENUNGGU: 'bg-amber-100 text-amber-900',
    DISETUJUI: 'bg-emerald-100 text-emerald-900',
    DITOLAK: 'bg-red-100 text-red-900',
    CHECK_OUT: 'bg-neutral-100 text-neutral-900',
  }[status] || 'bg-neutral-100 text-neutral-900'
}

export default function GuestPage() {
  const [activeStatus, setActiveStatus] = useState('all')
  const [guests, setGuests] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [notice, setNotice] = useState('')

  useEffect(() => {
    let alive = true

    async function loadGuests() {
      setIsLoading(true)
      try {
        const response = await getGuests({ per_page: 100 })
        const rows = Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : []
        if (alive) setGuests(rows)
      } catch (error) {
        if (alive) setNotice(error.message || 'Backend belum dapat dihubungi.')
      } finally {
        if (alive) setIsLoading(false)
      }
    }

    loadGuests()

    return () => {
      alive = false
    }
  }, [])

  const filteredGuests = guests.filter((guest) => activeStatus === 'all' || guest.status === activeStatus)

  return (
    <PageShell
      description="Daftar tamu warga (Read-only). Approval tamu dilakukan oleh Ketua RT."
      eyebrow="Tamu"
      title="Daftar Tamu Warga"
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
            Memuat data tamu...
          </div>
        ) : filteredGuests.length === 0 ? (
          <div className="rounded-xl border border-neutral-300 bg-white p-8 text-center text-sm font-semibold text-neutral-600">
            Tidak ada tamu pada status ini.
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredGuests.map((guest) => (
              <article key={guest.id_guest} className="border border-neutral-300 bg-white p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-extrabold text-black">{guest.nama}</h2>
                    <p className="mt-1 text-sm text-neutral-600">{guest.asal || '-'}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${getStatusClass(guest.status)}`}>
                    {guest.status}
                  </span>
                </div>

                <div className="mt-5 grid gap-2 text-sm text-neutral-500 sm:grid-cols-2 lg:grid-cols-3">
                  <p><span className="font-bold text-neutral-900">NIK:</span> {guest.nik || '-'}</p>
                  <p><span className="font-bold text-neutral-900">Rumah:</span> {guest.house?.alamat || '-'}</p>
                  <p><span className="font-bold text-neutral-900">Masuk:</span> {formatDate(guest.jam_masuk)}</p>
                  <p><span className="font-bold text-neutral-900">Keluar:</span> {formatDate(guest.jam_keluar)}</p>
                  <p><span className="font-bold text-neutral-900">Diajukan:</span> {formatDate(guest.created_at)}</p>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </PageShell>
  )
}