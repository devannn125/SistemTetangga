import { useEffect, useState } from 'react'
import { PortalLayout } from '../../components/layout/PortalLayout'
import { PageShell } from '../../components/layout/PageShell'
import { getAuthData } from '../../services/authService'
import { getLetterRequests, updateLetterRequest, getInventoryPurchases, createInventoryPurchase } from '../../services/api'

const sekMenus = [
  { label: 'Beranda', path: '/sek', icon: 'home' },
  { label: 'Surat Keterangan', path: '/sek/surat', icon: 'file' },
  { label: 'Inventaris', path: '/sek/inventaris', icon: 'box' },
]

function getCurrentMenu() {
  const pathname = window.location.pathname
  return sekMenus.find((item) => item.path === pathname) || sekMenus[0]
}

function HomePage() {
  const authUser = getAuthData()

  return (
    <PageShell
      eyebrow="Portal Sekretaris RT"
      title={`Selamat datang, ${authUser?.nama_users || 'Sekretaris'}`}
      description="Verifikasi permohonan surat, kelola data warga, dan administrasi lingkungan."
    >
      <section className="mt-8 grid gap-5 md:grid-cols-3">
        <article className="border border-neutral-900 bg-white p-6">
          <h2 className="text-lg font-extrabold text-black">Surat Perlu Verifikasi</h2>
          <p className="mt-3 text-sm leading-6 text-neutral-600">Permohonan warga masuk di sini untuk diverifikasi sebelum disetujui Ketua RT.</p>
          <a className="mt-4 inline-flex text-xs font-extrabold uppercase text-black no-underline hover:text-sky-700" href="/sek/surat">
            Buka daftar surat
          </a>
        </article>
        <article className="border border-neutral-900 bg-white p-6">
          <h2 className="text-lg font-extrabold text-black">Data Warga</h2>
          <p className="mt-3 text-sm leading-6 text-neutral-600">Pengelolaan data kependudukan tingkat RT.</p>
        </article>
        <article className="border border-neutral-900 bg-white p-6">
          <h2 className="text-lg font-extrabold text-black">Pesan & Kesan</h2>
          <p className="mt-3 text-sm leading-6 text-neutral-600">Tinjau pesan warga yang masuk.</p>
        </article>
      </section>
    </PageShell>
  )
}

const statusTabs = [
  { id: 'DIAJUKAN', label: 'Perlu Verifikasi' },
  { id: 'all', label: 'Semua' },
  { id: 'DIVERIFIKASI', label: 'Diverifikasi' },
  { id: 'DISETUJUI', label: 'Disetujui' },
  { id: 'DITOLAK', label: 'Ditolak' },
]

function formatDate(value) {
  if (!value) return '-'
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(value))
}

function getStatusClass(status) {
  return {
    DIAJUKAN: 'bg-amber-100 text-amber-900',
    DIVERIFIKASI: 'bg-sky-100 text-sky-900',
    DISETUJUI: 'bg-emerald-100 text-emerald-900',
    DITOLAK: 'bg-red-100 text-red-900',
  }[status] || 'bg-neutral-100 text-neutral-900'
}

function LetterApprovalPage() {
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
        const rows = Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : []
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

const purchaseStatusTabs = [
  { id: 'DIAJUKAN', label: 'Diajukan' },
  { id: 'DISETUJUI', label: 'Disetujui' },
  { id: 'DITOLAK', label: 'Ditolak' },
  { id: 'all', label: 'Semua' },
]

function getPurchaseStatusClass(status) {
  return {
    DIAJUKAN: 'bg-amber-100 text-amber-900',
    DISETUJUI: 'bg-emerald-100 text-emerald-900',
    DITOLAK: 'bg-red-100 text-red-900',
  }[status] || 'bg-neutral-100 text-neutral-900'
}

function formatCurrency(value) {
  return `Rp ${Number(value || 0).toLocaleString('id-ID')}`
}

function InventoryPurchasePage() {
  const [activeStatus, setActiveStatus] = useState('DIAJUKAN')
  const [purchases, setPurchases] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [notice, setNotice] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ nama_barang: '', jumlah: '', satuan: '', perkiraan_biaya: '', alasan: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    let alive = true

    async function loadPurchases() {
      setIsLoading(true)
      try {
        const response = await getInventoryPurchases({ per_page: 100 })
        const rows = Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : []
        if (alive) setPurchases(rows)
      } catch (error) {
        if (alive) setNotice(error.message || 'Backend belum dapat dihubungi.')
      } finally {
        if (alive) setIsLoading(false)
      }
    }

    loadPurchases()

    return () => {
      alive = false
    }
  }, [])

  const filteredPurchases = purchases.filter((p) => activeStatus === 'all' || p.status === activeStatus)

  function updateForm(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  async function handleCreate(event) {
    event.preventDefault()
    setNotice('')
    setIsSubmitting(true)
    try {
      const response = await createInventoryPurchase({
        nama_barang: form.nama_barang.trim(),
        jumlah: Number(form.jumlah),
        satuan: form.satuan.trim() || null,
        perkiraan_biaya: form.perkiraan_biaya ? Number(form.perkiraan_biaya) : null,
        alasan: form.alasan.trim() || null,
      })
      const created = response?.data || response
      setPurchases((current) => [created, ...current])
      setForm({ nama_barang: '', jumlah: '', satuan: '', perkiraan_biaya: '', alasan: '' })
      setShowForm(false)
      setNotice('Pengajuan pembelian berhasil dikirim.')
    } catch (error) {
      setNotice(error.message || 'Gagal mengirim pengajuan.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <PageShell
      description="Ajukan pembelian barang inventaris RT. Pengajuan akan diverifikasi Ketua RT sebelum dibeli."
      eyebrow="Inventaris"
      title="Pengajuan Pembelian Barang"
    >
      <section className="mt-8 space-y-6">
        {notice ? (
          <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-semibold text-sky-900">
            {notice}
          </div>
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-3">
            {purchaseStatusTabs.map((tab) => (
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
          <button
            className="rounded-full bg-black px-5 py-2 text-xs font-extrabold uppercase text-white transition hover:bg-neutral-900"
            onClick={() => setShowForm(true)}
            type="button"
          >
            + Ajukan Pembelian
          </button>
        </div>

        {showForm && (
          <div className="rounded-2xl border border-neutral-300 bg-white p-6">
            <h3 className="text-lg font-extrabold text-black">Form Pengajuan Pembelian</h3>
            <form className="mt-4 space-y-4" onSubmit={handleCreate}>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2 text-sm font-bold text-black">
                  Nama Barang
                  <input value={form.nama_barang} onChange={(e) => updateForm('nama_barang', e.target.value)} className="h-11 w-full rounded-xl border border-neutral-300 px-4 text-sm outline-none focus:border-sky-600" placeholder="Contoh: Tenda Pesta 6x6" required />
                </label>
                <label className="grid gap-2 text-sm font-bold text-black">
                  Jumlah
                  <input type="number" min="1" value={form.jumlah} onChange={(e) => updateForm('jumlah', e.target.value)} className="h-11 w-full rounded-xl border border-neutral-300 px-4 text-sm outline-none focus:border-sky-600" placeholder="1" required />
                </label>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2 text-sm font-bold text-black">
                  Satuan
                  <input value={form.satuan} onChange={(e) => updateForm('satuan', e.target.value)} className="h-11 w-full rounded-xl border border-neutral-300 px-4 text-sm outline-none focus:border-sky-600" placeholder="Contoh: Unit, Buah, Paket" />
                </label>
                <label className="grid gap-2 text-sm font-bold text-black">
                  Perkiraan Biaya
                  <input type="number" min="0" step="1000" value={form.perkiraan_biaya} onChange={(e) => updateForm('perkiraan_biaya', e.target.value)} className="h-11 w-full rounded-xl border border-neutral-300 px-4 text-sm outline-none focus:border-sky-600" placeholder="500000" />
                </label>
              </div>
              <label className="grid gap-2 text-sm font-bold text-black">
                Alasan / Keperluan
                <textarea value={form.alasan} onChange={(e) => updateForm('alasan', e.target.value)} rows={3} className="w-full rounded-xl border border-neutral-300 px-4 text-sm outline-none focus:border-sky-600" placeholder="Jelaskan kebutuhan dan prioritas pengajuan ini..." />
              </label>
              <div className="flex flex-wrap gap-3">
                <button className="rounded-full bg-black px-5 py-2 text-xs font-extrabold uppercase text-white transition hover:bg-neutral-900 disabled:cursor-not-allowed disabled:bg-neutral-400" disabled={isSubmitting} type="submit">
                  {isSubmitting ? 'Mengirim...' : 'Kirim Pengajuan'}
                </button>
                <button className="rounded-full border border-neutral-300 px-5 py-2 text-xs font-extrabold uppercase text-neutral-700 transition hover:bg-neutral-100" type="button" onClick={() => { setShowForm(false); setForm({ nama_barang: '', jumlah: '', satuan: '', perkiraan_biaya: '', alasan: '' }); }}>
                  Batal
                </button>
              </div>
            </form>
          </div>
        )}

        {isLoading ? (
          <div className="rounded-xl border border-neutral-300 bg-white p-8 text-center text-sm font-semibold text-neutral-600">
            Memuat data pengajuan...
          </div>
        ) : filteredPurchases.length === 0 ? (
          <div className="rounded-xl border border-neutral-300 bg-white p-8 text-center text-sm font-semibold text-neutral-600">
            Tidak ada pengajuan pembelian pada status ini.
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredPurchases.map((purchase) => (
              <article key={purchase.id_inventory_purchase} className="border border-neutral-300 bg-white p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-extrabold text-black">{purchase.nama_barang}</h2>
                    <p className="mt-1 text-sm text-neutral-600">
                      Jumlah: {purchase.jumlah} {purchase.satuan || ''} · Perkiraan: {formatCurrency(purchase.perkiraan_biaya)}
                    </p>
                    {purchase.alasan && <p className="mt-1 text-sm text-neutral-500">{purchase.alasan}</p>}
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${getPurchaseStatusClass(purchase.status)}`}>{purchase.status}</span>
                </div>

                <div className="mt-4 grid gap-2 text-sm text-neutral-500 sm:grid-cols-2 lg:grid-cols-3">
                  <p><span className="font-bold text-neutral-900">Diajukan:</span> {formatDate(purchase.created_at)}</p>
                  <p><span className="font-bold text-neutral-900">Oleh:</span> {purchase.diajukanOleh?.nama_users || '-'}</p>
                  {purchase.disetujui_at ? <p><span className="font-bold text-neutral-900">Disetujui:</span> {formatDate(purchase.disetujui_at)}</p> : null}
                  {purchase.disetujuiOleh ? <p><span className="font-bold text-neutral-900">Oleh:</span> {purchase.disetujuiOleh.nama_users}</p> : null}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </PageShell>
  )
}

function renderPage(activePath) {
  if (activePath === '/sek/surat') return <LetterApprovalPage />
  if (activePath === '/sek/inventaris') return <InventoryPurchasePage />
  return <HomePage />
}

export function SekretarisPage() {
  const activeMenu = getCurrentMenu()

  return (
    <PortalLayout
      menuItems={sekMenus}
      activePath={activeMenu.path}
      homePath="/sek"
      brandTitle="Portal Sekretaris"
      brandSubtitle="Panel Administrasi RT"
      footerLabel="Panel Sekretaris"
    >
      {renderPage(activeMenu.path)}
    </PortalLayout>
  )
}