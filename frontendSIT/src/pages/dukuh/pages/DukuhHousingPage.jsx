import { useEffect, useState } from 'react'
import { PageShell } from '@/components/layout/PageShell'
import { DataTable } from '@/components/ui/DataTable'
import { getHouses } from '@/services/api'

export function DukuhHousingPage() {
  const [houses, setHouses] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    getHouses({ per_page: 100 }).then(res => {
      setHouses(Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [])
      setIsLoading(false)
    }).catch(err => {
      console.error(err)
      setIsLoading(false)
    })
  }, [])

  const columns = [
    {
      key: 'tipe',
      label: 'Tipe',
      render: (value) => (
        <span className={`inline-flex px-2 py-1 rounded text-xs font-bold ${value === 'KOS' ? 'bg-sky-100 text-sky-900' : 'bg-emerald-100 text-emerald-900'}`}>
          {value === 'KOS' ? 'Kos' : 'Rumah Tinggal'}
        </span>
      ),
    },
    { key: 'alamat', label: 'Alamat', render: (value) => <span className="font-bold text-black">{value}</span> },
    { key: 'wilayah', label: 'RT / Wilayah', render: (value) => value?.nama_wilayah || '-' },
    { key: 'pemilik', label: 'Pemilik', render: (value) => value?.nama_lengkap || '-' },
    { key: 'kategoriKos', label: 'Kategori Kos', render: (value, row) => row.tipe === 'KOS' ? (value?.nama_master || '-') : '-' },
    { key: 'jumlah_kamar', label: 'Kamar / Penghuni', render: (value, row) => row.tipe === 'KOS' ? `${row.jumlah_kamar || 0} Kamar / ${row.jumlah_penghuni || 0} Orang` : '-' },
    {
      key: 'status_pajak',
      label: 'Pajak',
      render: (value) => (
        <span className={`inline-flex px-2 py-1 rounded text-xs font-bold ${value === 'LUNAS' ? 'bg-emerald-100 text-emerald-900' : 'bg-amber-100 text-amber-900'}`}>
          {value || '-'}
        </span>
      ),
    },
  ]

  return (
    <PageShell
      eyebrow="Perumahan"
      title="Monitoring Rumah & Kos"
      description="Tinjau daftar rumah tinggal dan kamar kos warga tingkat Dukuh secara read-only."
    >
      <section className="mt-8">
        <DataTable
          data={houses}
          columns={columns}
          searchKeys={['alamat', 'tipe', 'status_pajak']}
          searchPlaceholder="Cari alamat, tipe, atau status..."
          filters={[
            { key: 'tipe', label: 'Tipe', options: [{ value: 'KOS', label: 'Kos' }, { value: 'NON_KOS', label: 'Rumah Tinggal' }] },
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
