import { useEffect, useState } from 'react'
import { PageShell } from '@/components/layout/PageShell'
import { getFeeBills, getFamilies, createFeeBill, updateFeeBill, deleteFeeBill } from '@/services/api'
import { useConfirm } from '@/components/ui/ConfirmContext'
import { useToast } from '@/components/ui/ToastContext'
import { toRows, formatCurrency, formatDate, formatPeriod, getStatusClass } from './utils'

const initialBill = { id_family: '', periode: '', jumlah_tagihan: '', jatuh_tempo: '' }

export default function IuranPage() {
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
