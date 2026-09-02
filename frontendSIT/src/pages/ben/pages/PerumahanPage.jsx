import { useEffect, useState } from 'react'
import { PageShell } from '@/components/layout/PageShell'
import { DataTable } from '@/components/ui/DataTable'
import { getHouses, updateHouse } from '@/services/api'
import { useConfirm } from '@/components/ui/ConfirmContext'
import { useToast } from '@/components/ui/ToastContext'
import { toRows } from './utils'

export default function PerumahanPage() {
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

  const columns = [
    { key: 'alamat', label: 'Alamat', render: (value) => <span className="font-semibold text-neutral-900">{value}</span> },
    { key: 'tipe', label: 'Tipe', render: (value) => value === 'KOS' ? 'Kos' : 'Rumah' },
    { key: 'pemilik', label: 'Pemilik', render: (value) => value?.nama_lengkap || '-' },
    {
      key: 'status_pajak',
      label: 'Status Pajak',
      render: (value, row) => (
        <select
          value={value || ''}
          disabled={savingId === row.id_house}
          onChange={(e) => handlePajak(row.id_house, e.target.value)}
          className="h-9 rounded-lg border border-neutral-300 bg-white px-3 text-xs outline-none focus:border-sky-600 disabled:opacity-50"
        >
          <option value="">-</option>
          <option value="LUNAS">Lunas</option>
          <option value="BELUM_LUNAS">Belum Lunas</option>
        </select>
      ),
    },
  ]

  return (
    <PageShell eyebrow="Perumahan" title="Data Rumah" description="Pemantauan rumah warga dan kos; input status pajak (read-only lainnya).">
      <section className="mt-8 space-y-4">
        {notice ? <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-semibold text-sky-900">{notice}</div> : null}
        <DataTable
          data={houses}
          columns={columns}
          searchKeys={['alamat', 'tipe', 'status_pajak']}
          searchPlaceholder="Cari alamat, tipe, atau status..."
          filters={[
            { key: 'status_pajak', label: 'Pajak', options: [{ value: 'LUNAS', label: 'Lunas' }, { value: 'BELUM_LUNAS', label: 'Belum Lunas' }] },
          ]}
          loading={isLoading}
          emptyMessage="Belum ada data perumahan."
          rowKey="id_house"
        />
      </section>
    </PageShell>
  )
}
