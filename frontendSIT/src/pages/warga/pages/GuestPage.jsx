import { useEffect, useState } from 'react'
import { createGuest, getGuests, getMyHouses } from '../../../services/api'
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
  { id: 'menunggu', label: 'Menunggu' },
  { id: 'disetujui', label: 'Disetujui' },
  { id: 'ditolak', label: 'Ditolak' },
  { id: 'check_out', label: 'Check Out' },
]

const initialForm = {
  nama: '',
  nik: '',
  asal: '',
  id_house: '',
  jam_masuk: '',
  jam_keluar: '',
}

function formatLabel(value) {
  if (!value) return '-'
  return value
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function formatDateTime(value) {
  if (!value) return '-'
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(value))
}

function getStatusClass(status) {
  return {
    menunggu: 'bg-amber-100 text-amber-900',
    disetujui: 'bg-emerald-100 text-emerald-900',
    ditolak: 'bg-red-100 text-red-900',
    check_out: 'bg-neutral-100 text-neutral-900',
  }[String(status || '').toLowerCase()] || 'bg-neutral-100 text-neutral-900'
}

function toRows(response) {
  return Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : []
}

export default function GuestPage() {
  const [activeStatus, setActiveStatus] = useState('all')
  const [guests, setGuests] = useState([])
  const [houses, setHouses] = useState([])
  const [form, setForm] = useState(initialForm)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [notice, setNotice] = useState('')
  const confirm = useConfirm()
  const { showToast } = useToast()

  useEffect(() => {
    let alive = true

    async function loadAll() {
      setIsLoading(true)
      try {
        const [guestResponse, houseResponse] = await Promise.all([getGuests({ per_page: 50 }), getMyHouses()])
        if (!alive) return
        setGuests(toRows(guestResponse))
        const houseRows = toRows(houseResponse)
        if (houseRows?.length) {
          setHouses(houseRows)
          setForm((current) => ({ ...current, id_house: houseRows[0].id_house }))
        }
      } catch (error) {
        if (alive) setNotice(error.message || 'Backend belum dapat dihubungi.')
      } finally {
        if (alive) setIsLoading(false)
      }
    }

    loadAll()

    return () => {
      alive = false
    }
  }, [])

  const filteredGuests = guests.filter((guest) => {
    const status = String(guest.status || '').toLowerCase()
    return activeStatus === 'all' || status.replace('_', '') === activeStatus.replace('_', '')
  })

  const hasOwnHouse = houses.length > 0

  function updateForm(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const approved = await confirm({
      title: 'Konfirmasi Daftarkan Tamu',
      message: `Daftarkan tamu atas nama "${form.nama}"? Tamu akan menunggu persetujuan Ketua RT.`,
      confirmLabel: 'Ya, Daftarkan',
    })
    if (!approved) return
    setIsSubmitting(true)

    try {
      const response = await createGuest({
        nama: form.nama.trim(),
        nik: form.nik.trim() || null,
        asal: form.asal.trim() || null,
        id_house: form.id_house,
        jam_masuk: form.jam_masuk,
        jam_keluar: form.jam_keluar || null,
        status: 'MENUNGGU',
      })
      const created = response?.data || response
      setGuests((current) => [created, ...current])
      setForm({ ...initialForm, id_house: houses[0]?.id_house || '' })
      showToast('Tamu berhasil didaftarkan dan menunggu persetujuan Ketua RT.')
    } catch (error) {
      showToast(error.message || 'Tamu belum berhasil didaftarkan. Periksa data input.', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <PageShell
      description="Daftarkan tamu yang menginap di rumah keluarga Anda (atau kos tempat Anda tinggal). Tamu menunggu persetujuan Ketua RT."
      eyebrow="Tamu"
      title="Pendataan Tamu"
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
              <div className="rounded-3xl border border-neutral-300 bg-white p-8 text-center text-sm font-semibold text-neutral-600">
                Memuat data tamu...
              </div>
            ) : filteredGuests.length === 0 ? (
              <div className="rounded-3xl border border-neutral-300 bg-white p-8 text-center text-sm font-semibold text-neutral-600">
                Belum ada tamu.
              </div>
            ) : (
              filteredGuests.map((guest) => (
                <article key={guest.id_guest} className="rounded-3xl border border-neutral-300 bg-white p-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-extrabold text-black">{guest.nama}</h2>
                      <p className="mt-1 text-sm text-neutral-600">{guest.asal || '-'}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${getStatusClass(guest.status)}`}>
                      {formatLabel(guest.status)}
                    </span>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1 text-sm text-neutral-500">
                      <p><span className="font-bold text-neutral-900">NIK:</span> {guest.nik || '-'}</p>
                      <p><span className="font-bold text-neutral-900">Rumah tujuan:</span> {guest.house?.alamat || '-'}</p>
                    </div>
                    <div className="space-y-1 text-sm text-neutral-500">
                      <p><span className="font-bold text-neutral-900">Masuk:</span> {formatDateTime(guest.jam_masuk)}</p>
                      <p><span className="font-bold text-neutral-900">Keluar:</span> {formatDateTime(guest.jam_keluar)}</p>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>

          <aside className="h-fit space-y-4 rounded-3xl border border-neutral-300 bg-white p-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">Daftarkan tamu</p>
              <h2 className="mt-3 text-2xl font-extrabold text-black">Tamu Baru</h2>
              <p className="mt-2 text-sm leading-6 text-neutral-600">Tamu yang tinggal lebih dari sehari akan diteruskan ke Ketua RT untuk persetujuan.</p>
            </div>

            {!hasOwnHouse ? (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900">
                Anda belum terdaftar sebagai pemilik/penghuni rumah manapun. Hubungi pengurus untuk mengaktifkan pendataan tamu.
              </div>
            ) : (
              <form className="space-y-4" onSubmit={handleSubmit}>
                <label className="grid gap-2 text-sm font-bold text-black">
                  Rumah Tujuan
                  <select
                    value={form.id_house}
                    onChange={(event) => updateForm('id_house', event.target.value)}
                    className="h-11 w-full rounded-xl border border-neutral-300 bg-white px-4 text-sm outline-none focus:border-sky-600"
                  >
                    {houses.map((house) => (
                      <option key={house.id_house} value={house.id_house}>{house.alamat}</option>
                    ))}
                  </select>
                </label>
                <label className="grid gap-2 text-sm font-bold text-black">
                  Nama Tamu
                  <input
                    value={form.nama}
                    onChange={(event) => updateForm('nama', event.target.value)}
                    className="h-11 w-full rounded-xl border border-neutral-300 px-4 text-sm outline-none focus:border-sky-600"
                    placeholder="Nama lengkap tamu"
                  />
                </label>
                <label className="grid gap-2 text-sm font-bold text-black">
                  NIK (opsional)
                  <input
                    value={form.nik}
                    onChange={(event) => updateForm('nik', event.target.value)}
                    className="h-11 w-full rounded-xl border border-neutral-300 px-4 text-sm outline-none focus:border-sky-600"
                    placeholder="16 digit NIK"
                  />
                </label>
                <label className="grid gap-2 text-sm font-bold text-black">
                  Asal (opsional)
                  <input
                    value={form.asal}
                    onChange={(event) => updateForm('asal', event.target.value)}
                    className="h-11 w-full rounded-xl border border-neutral-300 px-4 text-sm outline-none focus:border-sky-600"
                    placeholder="Kota / alamat asal"
                  />
                </label>
                <label className="grid gap-2 text-sm font-bold text-black">
                  Jam Masuk
                  <input
                    type="datetime-local"
                    value={form.jam_masuk}
                    onChange={(event) => updateForm('jam_masuk', event.target.value)}
                    className="h-11 w-full rounded-xl border border-neutral-300 px-4 text-sm outline-none focus:border-sky-600"
                  />
                </label>
                <label className="grid gap-2 text-sm font-bold text-black">
                  Jam Keluar (opsional)
                  <input
                    type="datetime-local"
                    value={form.jam_keluar}
                    onChange={(event) => updateForm('jam_keluar', event.target.value)}
                    className="h-11 w-full rounded-xl border border-neutral-300 px-4 text-sm outline-none focus:border-sky-600"
                  />
                </label>
                <button
                  className="w-full rounded-full bg-black px-5 py-3 text-sm font-extrabold uppercase text-white transition hover:bg-neutral-900 disabled:cursor-not-allowed disabled:bg-neutral-400"
                  disabled={isSubmitting}
                  type="submit"
                >
                  {isSubmitting ? 'Mendaftarkan...' : 'Daftarkan Tamu'}
                </button>
              </form>
            )}
          </aside>
        </div>
      </section>
    </PageShell>
  )
}