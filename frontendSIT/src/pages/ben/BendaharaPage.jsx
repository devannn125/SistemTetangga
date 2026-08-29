import { useEffect, useState } from 'react'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { PageShell } from '@/components/layout/PageShell'
import { getAuthData } from '@/services/authService'
import { useConfirm } from '@/components/ui/ConfirmContext'
import { useToast } from '@/components/ui/ToastContext'
import {
  createFeeBill,
  createFinanceTransaction,
  deleteFeeBill,
  deleteFinanceTransaction,
  getCitizens,
  getFamilies,
  getFeeBills,
  getFinanceTransactions,
  getHouses,
  getInventoryPurchases,
  updateFeeBill,
  updateHouse,
} from '@/services/api'

const benMenus = [
  { label: 'Beranda', path: '/ben', icon: 'home' },
  { label: 'Keuangan', path: '/ben/keuangan', icon: 'wallet' },
  { label: 'Iuran', path: '/ben/iuran', icon: 'receipt' },
  { label: 'Data Warga', path: '/ben/warga', icon: 'users' },
  { label: 'Perumahan', path: '/ben/perumahan', icon: 'box' },
  { label: 'Inventaris', path: '/ben/inventaris', icon: 'box' },
]

function getCurrentMenu() {
  const pathname = window.location.pathname
  return benMenus.find((item) => item.path === pathname) || benMenus[0]
}

function toRows(response) {
  return Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : []
}

function formatCurrency(value) {
  return `Rp ${Number(value || 0).toLocaleString('id-ID')}`
}

function getPurchaseStatusClass(status) {
  return {
    DIAJUKAN: 'bg-amber-100 text-amber-900',
    DISETUJUI: 'bg-emerald-100 text-emerald-900',
    DITOLAK: 'bg-red-100 text-red-900',
  }[status] || 'bg-neutral-100 text-neutral-900'
}

function formatDate(value) {
  if (!value) return '-'
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value))
}

function formatPeriod(value) {
  if (!value) return '-'
  const [year, month] = String(value).split('-')
  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
  return `${months[Number(month) - 1] || month} ${year}`
}

function getStatusClass(status) {
  return {
    LUNAS: 'bg-emerald-100 text-emerald-900',
    BELUM_BAYAR: 'bg-amber-100 text-amber-900',
    SEBAGIAN: 'bg-sky-100 text-sky-900',
  }[status] || 'bg-neutral-100 text-neutral-900'
}

function HomePage() {
  const authUser = getAuthData()

  return (
    <PageShell
      eyebrow="Portal Bendahara RT"
      title={`Selamat datang, ${authUser?.nama_users || 'Bendahara'}`}
      description="Kelola pemasukan & pengeluaran kas RT, tagihan iuran, serta pemantauan data warga dan perumahan."
    >
      <section className="mt-8 grid gap-5 md:grid-cols-3">
        <article className="border border-neutral-900 bg-white p-6">
          <h2 className="text-lg font-extrabold text-black">Keuangan</h2>
          <p className="mt-3 text-sm leading-6 text-neutral-600">Input pemasukan/pengeluaran kas RT, lengkap dengan kategori dan bukti.</p>
          <a className="mt-4 inline-flex text-xs font-extrabold uppercase text-black no-underline hover:text-sky-700" href="/ben/keuangan">
            Buka Keuangan
          </a>
        </article>
        <article className="border border-neutral-900 bg-white p-6">
          <h2 className="text-lg font-extrabold text-black">Iuran Warga</h2>
          <p className="mt-3 text-sm leading-6 text-neutral-600">Buat tagihan per KK, konfirmasi pembayaran (lunas/sebagian).</p>
          <a className="mt-4 inline-flex text-xs font-extrabold uppercase text-black no-underline hover:text-sky-700" href="/ben/iuran">
            Buka Iuran
          </a>
        </article>
        <article className="border border-neutral-900 bg-white p-6">
          <h2 className="text-lg font-extrabold text-black">Perumahan</h2>
          <p className="mt-3 text-sm leading-6 text-neutral-600">Pantau status pajak rumah warga dan kos.</p>
          <a className="mt-4 inline-flex text-xs font-extrabold uppercase text-black no-underline hover:text-sky-700" href="/ben/perumahan">
            Buka Perumahan
          </a>
        </article>
      </section>
    </PageShell>
  )
}

const initialTransaction = { tipe: 'PEMASUKAN', kategori: '', jumlah: '', tanggal: '', deskripsi: '' }

function KeuanganPage() {
  const [transactions, setTransactions] = useState([])
  const [form, setForm] = useState(initialTransaction)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [notice, setNotice] = useState('')
  const confirm = useConfirm()
  const { showToast } = useToast()

  useEffect(() => {
    let alive = true

    async function load() {
      setIsLoading(true)
      try {
        const response = await getFinanceTransactions({ per_page: 100 })
        if (alive) setTransactions(toRows(response))
      } catch (error) {
        if (alive) setNotice(error.message || 'Backend belum dapat dihubungi.')
      } finally {
        if (alive) setIsLoading(false)
      }
    }

    load()

    return () => {
      alive = false
    }
  }, [])

  const income = transactions.filter((t) => t.tipe === 'PEMASUKAN').reduce((s, t) => s + Number(t.jumlah || 0), 0)
  const expense = transactions.filter((t) => t.tipe === 'PENGELUARAN').reduce((s, t) => s + Number(t.jumlah || 0), 0)

  function updateForm(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  async function handleCreate(event) {
    event.preventDefault()
    const approved = await confirm({
      title: 'Konfirmasi Simpan',
      message: `Catat ${form.tipe === 'PEMASUKAN' ? 'pemasukan' : 'pengeluaran'} sebesar ${formatCurrency(form.jumlah)}${form.kategori ? ` (${form.kategori})` : ''}?`,
      confirmLabel: 'Ya, Simpan',
    })
    if (!approved) return
    setIsSubmitting(true)
    try {
      const response = await createFinanceTransaction({
        tipe: form.tipe,
        kategori: form.kategori.trim() || null,
        jumlah: Number(form.jumlah),
        tanggal: form.tanggal,
        deskripsi: form.deskripsi.trim() || null,
      })
      const created = response?.data || response
      setTransactions((current) => [created, ...current])
      setForm(initialTransaction)
      showToast('Transaksi berhasil dicatat.')
    } catch (error) {
      showToast(error.message || 'Gagal menyimpan transaksi.', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDelete(id) {
    const approved = await confirm({
      title: 'Konfirmasi Hapus',
      message: 'Yakin ingin menghapus transaksi ini?',
      confirmLabel: 'Ya, Hapus',
    })
    if (!approved) return
    try {
      await deleteFinanceTransaction(id)
      setTransactions((current) => current.filter((t) => t.id_keuangan_transaksi !== id))
      showToast('Transaksi berhasil dihapus.')
    } catch (error) {
      showToast(error.message || 'Gagal menghapus transaksi.', 'error')
    }
  }

  return (
    <PageShell eyebrow="Keuangan" title="Kas RT" description="Catat pemasukan & pengeluaran kas RT.">
      <section className="mt-8 space-y-6">
        {notice ? (
          <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-semibold text-sky-900">{notice}</div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-3">
          <article className="rounded-2xl border border-neutral-300 bg-white p-6">
            <p className="text-xs font-bold text-neutral-500">Pemasukan</p>
            <div className="mt-3 text-2xl font-extrabold text-emerald-700">{formatCurrency(income)}</div>
          </article>
          <article className="rounded-2xl border border-neutral-300 bg-white p-6">
            <p className="text-xs font-bold text-neutral-500">Pengeluaran</p>
            <div className="mt-3 text-2xl font-extrabold text-red-600">{formatCurrency(expense)}</div>
          </article>
          <article className="rounded-2xl border border-neutral-300 bg-white p-6">
            <p className="text-xs font-bold text-neutral-500">Saldo</p>
            <div className="mt-3 text-2xl font-extrabold text-black">{formatCurrency(income - expense)}</div>
          </article>
        </div>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-3">
            {isLoading ? (
              <div className="rounded-2xl border border-neutral-300 bg-white p-8 text-center text-sm font-semibold text-neutral-600">Memuat transaksi...</div>
            ) : transactions.length === 0 ? (
              <div className="rounded-2xl border border-neutral-300 bg-white p-8 text-center text-sm font-semibold text-neutral-600">Belum ada transaksi.</div>
            ) : (
              transactions.map((t) => (
                <article key={t.id_keuangan_transaksi} className="flex items-center justify-between gap-4 rounded-2xl border border-neutral-300 bg-white p-5">
                  <div>
                    <div className="text-sm font-bold text-black">{t.deskripsi || t.kategori || 'Transaksi'}</div>
                    <div className="text-xs text-neutral-500">{formatDate(t.tanggal)}{t.kategori ? ` · ${t.kategori}` : ''}</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className={`text-right text-sm font-extrabold ${t.tipe === 'PEMASUKAN' ? 'text-emerald-700' : 'text-red-600'}`}>
                      {t.tipe === 'PEMASUKAN' ? '+' : '-'}{formatCurrency(t.jumlah)}
                    </div>
                    <button className="text-xs font-bold text-red-600 hover:underline" onClick={() => handleDelete(t.id_keuangan_transaksi)} type="button">Hapus</button>
                  </div>
                </article>
              ))
            )}
          </div>

          <aside className="h-fit rounded-2xl border border-neutral-300 bg-white p-6">
            <h2 className="text-lg font-extrabold text-black">Catat Transaksi</h2>
            <form className="mt-4 space-y-4" onSubmit={handleCreate}>
              <label className="grid gap-2 text-sm font-bold text-black">
                Tipe
                <select value={form.tipe} onChange={(e) => updateForm('tipe', e.target.value)} className="h-11 w-full rounded-xl border border-neutral-300 bg-white px-4 text-sm outline-none focus:border-sky-600">
                  <option value="PEMASUKAN">Pemasukan</option>
                  <option value="PENGELUARAN">Pengeluaran</option>
                </select>
              </label>
              <label className="grid gap-2 text-sm font-bold text-black">
                Kategori
                <input value={form.kategori} onChange={(e) => updateForm('kategori', e.target.value)} className="h-11 w-full rounded-xl border border-neutral-300 px-4 text-sm outline-none focus:border-sky-600" placeholder="Contoh: Iuran warga" />
              </label>
              <label className="grid gap-2 text-sm font-bold text-black">
                Jumlah
                <input type="number" min="0" step="500" value={form.jumlah} onChange={(e) => updateForm('jumlah', e.target.value)} className="h-11 w-full rounded-xl border border-neutral-300 px-4 text-sm outline-none focus:border-sky-600" placeholder="0" />
              </label>
              <label className="grid gap-2 text-sm font-bold text-black">
                Tanggal
                <input type="date" value={form.tanggal} onChange={(e) => updateForm('tanggal', e.target.value)} className="h-11 w-full rounded-xl border border-neutral-300 px-4 text-sm outline-none focus:border-sky-600" />
              </label>
              <label className="grid gap-2 text-sm font-bold text-black">
                Deskripsi
                <input value={form.deskripsi} onChange={(e) => updateForm('deskripsi', e.target.value)} className="h-11 w-full rounded-xl border border-neutral-300 px-4 text-sm outline-none focus:border-sky-600" placeholder="Keterangan" />
              </label>
              <button className="w-full rounded-full bg-black px-5 py-3 text-sm font-extrabold uppercase text-white transition hover:bg-neutral-900 disabled:cursor-not-allowed disabled:bg-neutral-400" disabled={isSubmitting} type="submit">
                {isSubmitting ? 'Menyimpan...' : 'Simpan'}
              </button>
            </form>
          </aside>
        </div>
      </section>
    </PageShell>
  )
}

const initialBill = { id_family: '', periode: '', jumlah_tagihan: '', jatuh_tempo: '' }

function IuranPage() {
  const [bills, setBills] = useState([])
  const [families, setFamilies] = useState([])
  const [form, setForm] = useState(initialBill)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [processingId, setProcessingId] = useState('')
  const [notice, setNotice] = useState('')
  const confirm = useConfirm()
  const { showToast } = useToast()

  useEffect(() => {
    let alive = true

    async function load() {
      setIsLoading(true)
      try {
        const [billResponse, familyResponse] = await Promise.all([getFeeBills({ per_page: 100 }), getFamilies({ per_page: 100 })])
        if (!alive) return
        setBills(toRows(billResponse))
        const familyRows = toRows(familyResponse)
        setFamilies(familyRows)
        if (familyRows.length) setForm((current) => ({ ...current, id_family: familyRows[0].id_family }))
      } catch (error) {
        if (alive) setNotice(error.message || 'Backend belum dapat dihubungi.')
      } finally {
        if (alive) setIsLoading(false)
      }
    }

    load()

    return () => {
      alive = false
    }
  }, [])

  function familyLabel(id) {
    const f = families.find((x) => x.id_family === id)
    if (!f) return id
    return `${f.no_kk}${f.kepala_keluarga?.nama_lengkap ? ` · ${f.kepala_keluarga.nama_lengkap}` : ''}`
  }

  function updateForm(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  async function handleCreate(event) {
    event.preventDefault()
    const approved = await confirm({
      title: 'Konfirmasi Tagihan',
      message: `Buat tagihan iuran ${formatPeriod(form.periode)} sebesar ${formatCurrency(form.jumlah_tagihan)} untuk ${familyLabel(form.id_family)}?`,
      confirmLabel: 'Ya, Buat',
    })
    if (!approved) return
    setIsSubmitting(true)
    try {
      const response = await createFeeBill({
        id_family: form.id_family,
        periode: form.periode,
        jumlah_tagihan: Number(form.jumlah_tagihan),
        jatuh_tempo: form.jatuh_tempo,
        status: 'BELUM_BAYAR',
      })
      const created = response?.data || response
      setBills((current) => [created, ...current])
      setForm({ ...initialBill, id_family: form.id_family })
      showToast('Tagihan berhasil dibuat.')
    } catch (error) {
      showToast(error.message || 'Gagal membuat tagihan.', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleStatus(id, status) {
    const approved = await confirm({
      title: 'Konfirmasi Status Pembayaran',
      message: `Ubah status tagihan ini menjadi "${status === 'LUNAS' ? 'Lunas' : 'Sebagian'}"?`,
      confirmLabel: 'Ya, Ubah',
    })
    if (!approved) return
    setProcessingId(id)
    try {
      await updateFeeBill(id, { status })
      setBills((current) => current.map((b) => (b.id_iuran_tagihan === id ? { ...b, status } : b)))
      showToast('Status tagihan berhasil diperbarui.')
    } catch (error) {
      showToast(error.message || 'Gagal memperbarui tagihan.', 'error')
    } finally {
      setProcessingId('')
    }
  }

  async function handleDelete(id) {
    const approved = await confirm({
      title: 'Konfirmasi Hapus',
      message: 'Yakin ingin menghapus tagihan ini?',
      confirmLabel: 'Ya, Hapus',
    })
    if (!approved) return
    try {
      await deleteFeeBill(id)
      setBills((current) => current.filter((b) => b.id_iuran_tagihan !== id))
      showToast('Tagihan berhasil dihapus.')
    } catch (error) {
      showToast(error.message || 'Gagal menghapus tagihan.', 'error')
    }
  }

  return (
    <PageShell eyebrow="Iuran" title="Tagihan Iuran Warga" description="Kelola tagihan per KK dan konfirmasi pembayaran.">
      <section className="mt-8 space-y-6">
        {notice ? (
          <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-semibold text-sky-900">{notice}</div>
        ) : null}

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-3">
            {isLoading ? (
              <div className="rounded-2xl border border-neutral-300 bg-white p-8 text-center text-sm font-semibold text-neutral-600">Memuat tagihan...</div>
            ) : bills.length === 0 ? (
              <div className="rounded-2xl border border-neutral-300 bg-white p-8 text-center text-sm font-semibold text-neutral-600">Belum ada tagihan.</div>
            ) : (
              bills.map((bill) => (
                <article key={bill.id_iuran_tagihan} className="rounded-2xl border border-neutral-300 bg-white p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="text-base font-extrabold text-black">{formatPeriod(bill.periode)}</h3>
                      <p className="text-xs text-neutral-500">{familyLabel(bill.id_family)} · Jatuh tempo {formatDate(bill.jatuh_tempo)}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${getStatusClass(bill.status)}`}>
                      {bill.status === 'BELUM_BAYAR' ? 'Belum Bayar' : bill.status === 'SEBAGIAN' ? 'Sebagian' : 'Lunas'}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                    <div className="text-lg font-extrabold text-black">{formatCurrency(bill.jumlah_tagihan)}</div>
                    <div className="flex flex-wrap items-center gap-2">
                      {bill.status !== 'LUNAS' ? (
                        <button className="rounded-full bg-black px-4 py-1.5 text-xs font-extrabold uppercase text-white hover:bg-neutral-900 disabled:opacity-50" disabled={processingId === bill.id_iuran_tagihan} onClick={() => handleStatus(bill.id_iuran_tagihan, 'LUNAS')} type="button">
                          Konfirmasi Lunas
                        </button>
                      ) : null}
                      {bill.status === 'BELUM_BAYAR' ? (
                        <button className="rounded-full border border-sky-600 px-4 py-1.5 text-xs font-extrabold uppercase text-sky-700 hover:bg-sky-50 disabled:opacity-50" disabled={processingId === bill.id_iuran_tagihan} onClick={() => handleStatus(bill.id_iuran_tagihan, 'SEBAGIAN')} type="button">
                          Sebagian
                        </button>
                      ) : null}
                      <button className="text-xs font-bold text-red-600 hover:underline" onClick={() => handleDelete(bill.id_iuran_tagihan)} type="button">Hapus</button>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>

          <aside className="h-fit rounded-2xl border border-neutral-300 bg-white p-6">
            <h2 className="text-lg font-extrabold text-black">Buat Tagihan</h2>
            <form className="mt-4 space-y-4" onSubmit={handleCreate}>
              <label className="grid gap-2 text-sm font-bold text-black">
                Keluarga (KK)
                <select value={form.id_family} onChange={(e) => updateForm('id_family', e.target.value)} className="h-11 w-full rounded-xl border border-neutral-300 bg-white px-4 text-sm outline-none focus:border-sky-600">
                  {families.map((f) => (
                    <option key={f.id_family} value={f.id_family}>{f.no_kk}{f.kepala_keluarga?.nama_lengkap ? ` · ${f.kepala_keluarga.nama_lengkap}` : ''}</option>
                  ))}
                </select>
              </label>
              <label className="grid gap-2 text-sm font-bold text-black">
                Periode (YYYY-MM)
                <input value={form.periode} onChange={(e) => updateForm('periode', e.target.value)} className="h-11 w-full rounded-xl border border-neutral-300 px-4 text-sm outline-none focus:border-sky-600" placeholder="2026-09" />
              </label>
              <label className="grid gap-2 text-sm font-bold text-black">
                Jumlah
                <input type="number" min="0" step="500" value={form.jumlah_tagihan} onChange={(e) => updateForm('jumlah_tagihan', e.target.value)} className="h-11 w-full rounded-xl border border-neutral-300 px-4 text-sm outline-none focus:border-sky-600" placeholder="25000" />
              </label>
              <label className="grid gap-2 text-sm font-bold text-black">
                Jatuh Tempo
                <input type="date" value={form.jatuh_tempo} onChange={(e) => updateForm('jatuh_tempo', e.target.value)} className="h-11 w-full rounded-xl border border-neutral-300 px-4 text-sm outline-none focus:border-sky-600" />
              </label>
              <button className="w-full rounded-full bg-black px-5 py-3 text-sm font-extrabold uppercase text-white transition hover:bg-neutral-900 disabled:cursor-not-allowed disabled:bg-neutral-400" disabled={isSubmitting} type="submit">
                {isSubmitting ? 'Menyimpan...' : 'Buat Tagihan'}
              </button>
            </form>
          </aside>
        </div>
      </section>
    </PageShell>
  )
}

function WargaReadPage() {
  const [citizens, setCitizens] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [notice, setNotice] = useState('')

  useEffect(() => {
    let alive = true

    async function load() {
      setIsLoading(true)
      try {
        const response = await getCitizens({ per_page: 100 })
        if (alive) setCitizens(toRows(response))
      } catch (error) {
        if (alive) setNotice(error.message || 'Backend belum dapat dihubungi.')
      } finally {
        if (alive) setIsLoading(false)
      }
    }

    load()

    return () => {
      alive = false
    }
  }, [])

  return (
    <PageShell eyebrow="Kependudukan" title="Data Warga" description="Pemantauan data warga untuk kebutuhan iuran dan bantuan sosial (read-only).">
      <section className="mt-8 space-y-4">
        {notice ? <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-semibold text-sky-900">{notice}</div> : null}
        {isLoading ? (
          <div className="rounded-2xl border border-neutral-300 bg-white p-8 text-center text-sm font-semibold text-neutral-600">Memuat data warga...</div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-neutral-300 bg-white">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-neutral-300 text-xs uppercase text-neutral-500">
                  <th className="px-5 py-3">Nama</th>
                  <th className="px-5 py-3">NIK</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">No. HP</th>
                </tr>
              </thead>
              <tbody>
                {citizens.map((c) => (
                  <tr key={c.id_citizen} className="border-b border-neutral-100 last:border-0">
                    <td className="px-5 py-3 font-bold text-black">{c.nama_lengkap}</td>
                    <td className="px-5 py-3 text-neutral-600">{c.nik}</td>
                    <td className="px-5 py-3 text-neutral-600">{c.status_warga}</td>
                    <td className="px-5 py-3 text-neutral-600">{c.no_hp || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </PageShell>
  )
}

function PerumahanPage() {
  const [houses, setHouses] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [savingId, setSavingId] = useState('')
  const [notice, setNotice] = useState('')
  const confirm = useConfirm()
  const { showToast } = useToast()

  useEffect(() => {
    let alive = true

    async function load() {
      setIsLoading(true)
      try {
        const response = await getHouses({ per_page: 100 })
        if (alive) setHouses(toRows(response))
      } catch (error) {
        if (alive) setNotice(error.message || 'Backend belum dapat dihubungi.')
      } finally {
        if (alive) setIsLoading(false)
      }
    }

    load()

    return () => {
      alive = false
    }
  }, [])

  async function handlePajak(id, status_pajak) {
    if (!status_pajak) return
    const approved = await confirm({
      title: 'Konfirmasi Status Pajak',
      message: `Ubah status pajak rumah ini menjadi "${status_pajak === 'LUNAS' ? 'Lunas' : 'Belum Lunas'}"?`,
      confirmLabel: 'Ya, Ubah',
    })
    if (!approved) return
    setSavingId(id)
    try {
      await updateHouse(id, { status_pajak })
      setHouses((current) => current.map((h) => (h.id_house === id ? { ...h, status_pajak } : h)))
      showToast('Status pajak berhasil diperbarui.')
    } catch (error) {
      showToast(error.message || 'Gagal memperbarui status pajak.', 'error')
    } finally {
      setSavingId('')
    }
  }

  return (
    <PageShell eyebrow="Perumahan" title="Data Rumah" description="Pemantauan rumah warga dan kos; input status pajak (read-only lainnya).">
      <section className="mt-8 space-y-4">
        {notice ? <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-semibold text-sky-900">{notice}</div> : null}
        {isLoading ? (
          <div className="rounded-2xl border border-neutral-300 bg-white p-8 text-center text-sm font-semibold text-neutral-600">Memuat data rumah...</div>
        ) : (
          <div className="grid gap-4">
            {houses.map((house) => (
              <article key={house.id_house} className="rounded-2xl border border-neutral-300 bg-white p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-extrabold text-black">{house.alamat}</h3>
                    <p className="text-xs text-neutral-500">{house.tipe === 'KOS' ? 'Kos' : 'Rumah'}{house.pemilik?.nama_lengkap ? ` · Pemilik: ${house.pemilik.nama_lengkap}` : ''}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="grid gap-1 text-xs font-bold text-black">
                      Status Pajak
                      <select
                        value={house.status_pajak || ''}
                        disabled={savingId === house.id_house}
                        onChange={(e) => handlePajak(house.id_house, e.target.value)}
                        className="h-9 rounded-lg border border-neutral-300 bg-white px-3 text-xs outline-none focus:border-sky-600 disabled:opacity-50"
                      >
                        <option value="">-</option>
                        <option value="LUNAS">Lunas</option>
                        <option value="BELUM_LUNAS">Belum Lunas</option>
                      </select>
                    </label>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </PageShell>
  )
}

function InventoryPage() {
  const [purchases, setPurchases] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [notice, setNotice] = useState('')

  useEffect(() => {
    let alive = true

    async function load() {
      setIsLoading(true)
      try {
        const response = await getInventoryPurchases({ per_page: 100, status: 'DISETUJUI' })
        const rows = Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : []
        if (alive) setPurchases(rows.filter((p) => p.status === 'DISETUJUI'))
      } catch (error) {
        if (alive) setNotice(error.message || 'Backend belum dapat dihubungi.')
      } finally {
        if (alive) setIsLoading(false)
      }
    }

    load()

    return () => {
      alive = false
    }
  }, [])

  return (
    <PageShell eyebrow="Inventaris" title="Pengajuan Pembelian Disetujui" description="Daftar pengajuan pembelian barang yang telah disetujui Ketua RT, siap untuk dibeli dan dicatat ke inventaris.">
      <section className="mt-8 space-y-4">
        {notice ? <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-semibold text-sky-900">{notice}</div> : null}
        {isLoading ? (
          <div className="rounded-2xl border border-neutral-300 bg-white p-8 text-center text-sm font-semibold text-neutral-600">Memuat data pengajuan...</div>
        ) : purchases.length === 0 ? (
          <div className="rounded-2xl border border-neutral-300 bg-white p-8 text-center text-sm font-semibold text-neutral-600">Belum ada pengajuan yang disetujui.</div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-neutral-300 bg-white">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead>
                <tr className="border-b border-neutral-300 text-xs uppercase text-neutral-500">
                  <th className="px-5 py-3">Nama Barang</th>
                  <th className="px-5 py-3">Jumlah</th>
                  <th className="px-5 py-3">Satuan</th>
                  <th className="px-5 py-3">Perkiraan Biaya</th>
                  <th className="px-5 py-3">Diajukan Oleh</th>
                  <th className="px-5 py-3">Disetujui Oleh</th>
                  <th className="px-5 py-3">Tanggal Approval</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {purchases.map((p) => (
                  <tr key={p.id_inventory_purchase} className="border-b border-neutral-100 last:border-0">
                    <td className="px-5 py-3 font-bold text-black">{p.nama_barang}</td>
                    <td className="px-5 py-3 text-neutral-600">{p.jumlah}</td>
                    <td className="px-5 py-3 text-neutral-600">{p.satuan || '-'}</td>
                    <td className="px-5 py-3 text-neutral-600">{formatCurrency(p.perkiraan_biaya)}</td>
                    <td className="px-5 py-3 text-neutral-600">{p.diajukanOleh?.nama_users || '-'}</td>
                    <td className="px-5 py-3 text-neutral-600">{p.disetujuiOleh?.nama_users || '-'}</td>
                    <td className="px-5 py-3 text-neutral-600">{formatDate(p.disetujui_at)}</td>
                    <td className="px-5 py-3"><span className={`rounded-full px-2 py-1 text-xs font-bold ${getPurchaseStatusClass(p.status)}`}>{p.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </PageShell>
  )
}

function renderPage(activePath) {
  if (activePath === '/ben/keuangan') return <KeuanganPage />
  if (activePath === '/ben/iuran') return <IuranPage />
  if (activePath === '/ben/warga') return <WargaReadPage />
  if (activePath === '/ben/perumahan') return <PerumahanPage />
  if (activePath === '/ben/inventaris') return <InventoryPage />
  return <HomePage />
}

export function BendaharaPage() {
  const activeMenu = getCurrentMenu()

  return (
    <PortalLayout
      menuItems={benMenus}
      activePath={activeMenu.path}
      homePath="/ben"
      brandTitle="Portal Bendahara"
      brandSubtitle="Panel Keuangan RT"
      footerLabel="Panel Bendahara"
    >
      {renderPage(activeMenu.path)}
    </PortalLayout>
  )
}