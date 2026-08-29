import { useEffect, useState } from 'react'
import { Icon } from '@/components/ui/Icon'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { getCitizens, getGuests, getHouses } from '@/services/api'
import { navigate } from '@/services/router'

const ALL_COLUMNS = [
  { key: 'nama_lengkap', label: 'Nama' },
  { key: 'nik', label: 'NIK' },
  { key: 'jenis_kelamin', label: 'JK' },
  { key: 'status_warga', label: 'Status Warga' },
  { key: 'status_aktif', label: 'Status Aktif' },
  { key: 'no_hp', label: 'No. HP' },
  { key: 'email', label: 'Email' },
  { key: 'status_nikah', label: 'Status Nikah' },
  { key: 'agama', label: 'Agama' },
  { key: 'alamat', label: 'Alamat' },
]

const HOUSE_COLUMNS = [
  { key: 'tipe', label: 'Tipe' },
  { key: 'alamat', label: 'Alamat' },
  { key: 'status_kepemilikan', label: 'Kepemilikan' },
  { key: 'jumlah_kamar', label: 'Kamar' },
  { key: 'jumlah_penghuni', label: 'Penghuni' },
  { key: 'status_pajak', label: 'Pajak' },
]

const GUEST_COLUMNS = [
  { key: 'nama', label: 'Nama' },
  { key: 'nik', label: 'NIK' },
  { key: 'asal', label: 'Asal' },
  { key: 'id_house', label: 'Rumah Tujuan' },
  { key: 'jam_masuk', label: 'Jam Masuk' },
  { key: 'status', label: 'Status' },
]

const TABS = [
  { id: 'semua', label: 'Semua Warga', path: '/dashboard/warga' },
  { id: 'nonWarga', label: 'Non Warga', path: '/dashboard/warga/non-warga' },
  { id: 'tamu', label: 'Tamu', path: '/dashboard/warga/tamu' },
  { id: 'rumah', label: 'Data Rumah', path: '/dashboard/warga/rumah' },
]

const PER_PAGE = 10

const EMPTY_MESSAGES = {
  semua: 'Belum ada data warga di database.',
  nonWarga: 'Belum ada warga tidak tetap di database.',
  tamu: 'Belum ada data tamu di database.',
  rumah: 'Belum ada data rumah di database.',
}

function StatusBadge({ active }) {
  return active ? (
    <Badge variant="success">Aktif</Badge>
  ) : (
    <Badge variant="secondary">Nonaktif</Badge>
  )
}

function GuestStatusBadge({ status }) {
  const variants = {
    MENUNGGU: 'warning',
    DISETUJUI: 'success',
    DITOLAK: 'destructive',
    CHECK_OUT: 'secondary',
  }
  return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>
}

function formatDate(value) {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function WargaDataPage({ activeTab = 'semua' }) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [openDropdown, setOpenDropdown] = useState(null)
  const [visibleColumns, setVisibleColumns] = useState(ALL_COLUMNS.map((c) => c.key))
  const [page, setPage] = useState(1)

  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [guestCount, setGuestCount] = useState(null)

  const isHouseTab = activeTab === 'rumah'
  const isGuestTab = activeTab === 'tamu'
  const columns = isHouseTab ? HOUSE_COLUMNS : isGuestTab ? GUEST_COLUMNS : ALL_COLUMNS

  useEffect(() => {
    let isMounted = true

    async function load() {
      setLoading(true)
      setError(null)
      setRows([])

      try {
        if (!isGuestTab) {
          try {
            const guests = await getGuests({ per_page: 1 })
            if (isMounted) setGuestCount(guests.meta?.total ?? 0)
          } catch {
            if (isMounted) setGuestCount(null)
          }
        }

        let result
        if (isGuestTab) {
          result = await getGuests({ per_page: 100 })
        } else if (isHouseTab) {
          result = await getHouses({ per_page: 100 })
        } else if (activeTab === 'nonWarga') {
          result = await getCitizens({ per_page: 100, status_warga: 'TIDAK_TETAP' })
        } else {
          result = await getCitizens({ per_page: 100 })
        }

        if (isMounted) setRows(result.data || [])
      } catch (loadError) {
        if (isMounted) setError(loadError)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    load()

    return () => {
      isMounted = false
    }
  }, [activeTab, isGuestTab, isHouseTab])

  const citizenRows = rows
  const stats = isHouseTab || isGuestTab ? [] : [
    {
      title: 'Total Warga',
      value: citizenRows.length,
      accent: 'blue',
      icon: 'users',
      note: `${citizenRows.filter((c) => c.jenis_kelamin === 'L').length} laki-laki, ${citizenRows.filter((c) => c.jenis_kelamin === 'P').length} perempuan`,
    },
    {
      title: 'Terverifikasi',
      value: citizenRows.filter((c) => c.status_aktif).length,
      accent: 'green',
      icon: 'check',
      note: 'Warga status aktif',
    },
    {
      title: 'Nonaktif',
      value: citizenRows.filter((c) => !c.status_aktif).length,
      accent: 'amber',
      icon: 'clock',
      note: 'Warga status nonaktif',
    },
    {
      title: 'Perbandingan L : P',
      value: `${citizenRows.filter((c) => c.jenis_kelamin === 'L').length} : ${citizenRows.filter((c) => c.jenis_kelamin === 'P').length}`,
      accent: 'blue',
      icon: 'users',
      note: 'Laki-laki : Perempuan',
    },
  ]

  const filteredRows = rows.filter((row) => {
    const haystack = String(row.nama_lengkap || row.nama || row.alamat || row.asal || '')
      .toLowerCase()
      .includes(search.toLowerCase())
    const matchesStatus = !statusFilter || row.status_warga === statusFilter
    return haystack && matchesStatus
  })

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PER_PAGE))
  const safePage = Math.min(page, totalPages)
  const pageRows = filteredRows.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE)

  function toggleColumn(key) {
    setVisibleColumns((current) =>
      current.includes(key) ? current.filter((k) => k !== key) : [...current, key],
    )
  }

  function switchTab(tab) {
    setSearch('')
    setStatusFilter('')
    setOpenDropdown(null)
    setPage(1)
    navigate(tab.path)
  }

  function getCellValue(column, row) {
    if (column.key === 'agama') return row.agama?.nama_master ?? '—'
    if (column.key === 'alamat') return row.alamat ?? row.wilayah?.nama_wilayah ?? '—'
    if (column.key === 'jam_masuk') return formatDate(row.jam_masuk)
    return row[column.key] ?? '—'
  }

  function renderCell(column, row) {
    if (column.key === 'status_aktif') return <StatusBadge active={row.status_aktif} />
    if (column.key === 'status' && isGuestTab) return <GuestStatusBadge status={row.status} />
    return <span className="text-sm text-neutral-700">{getCellValue(column, row)}</span>
  }

  function exportCsv() {
    const header = columns.filter((c) => visibleColumns.includes(c.key)).map((c) => c.label)
    const lines = filteredRows.map((row) =>
      header
        .map((label) => {
          const col = columns.find((c) => c.label === label)
          return getCellValue(col, row)
        })
        .join(','),
    )
    const csv = [header.join(','), ...lines].join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `data-kependudukan-${activeTab}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const toolButtonClass =
    'flex h-9 items-center gap-2 rounded-lg border border-neutral-300 bg-white px-3.5 text-sm font-semibold text-neutral-700 transition hover:border-sky-500 hover:text-sky-700'
  const toolButtonDisabledClass =
    'flex h-9 cursor-not-allowed items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-100 px-3.5 text-sm font-semibold text-neutral-400'

  let emptyStateMessage = null
  if (!loading && !error && pageRows.length === 0) {
    emptyStateMessage = isGuestTab && error
      ? null
      : EMPTY_MESSAGES[activeTab] || 'Belum ada data.'
  }

  return (
    <div className="min-w-0 px-6 py-6 max-md:px-4 max-md:py-5">
      {/* Header */}
      <section className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold leading-tight text-black">Data Warga</h2>
          <p className="mt-1 text-sm text-neutral-700">Kelola data warga dan kependudukan</p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <Button variant="outline" size="sm" onClick={exportCsv}>
            <Icon name="download" className="h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" size="sm" disabled title="Hanya pengurus RT">
            <Icon name="upload" className="h-4 w-4" />
            Import
          </Button>
          <Button variant="outline" size="sm" disabled title="Hanya pengurus RT">
            <Icon name="userPlus" className="h-4 w-4" />
            Tambah Warga
          </Button>
        </div>
      </section>

      {/* Tabs */}
      <div className="mb-5 flex flex-wrap gap-1.5">
        {TABS.map((tab) => (
          <Button
            variant={activeTab === tab.id ? 'default' : 'outline'}
            size="sm"
            key={tab.id}
            onClick={() => switchTab(tab)}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Stats */}
      {(!isHouseTab && !isGuestTab && stats.length > 0) && (
        <section className="grid grid-cols-4 gap-4 max-xl:grid-cols-2 max-md:grid-cols-1" aria-label="Ringkasan kependudukan">
          {stats.map((item) => (
            <StatCard item={item} key={item.title} />
          ))}
        </section>
      )}

      {/* Toolbar */}
      <section className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-2.5 max-sm:w-full">
          <div className="relative flex-1 max-w-md">
            <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <Input
              className="h-9 w-full rounded-lg border border-neutral-300 pl-9 pr-3 text-sm text-neutral-800 outline-0 transition placeholder:text-neutral-400 focus:border-sky-500"
              placeholder="Cari nama, NIK, atau alamat..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
            />
          </div>

          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => setOpenDropdown(openDropdown === 'filter' ? null : 'filter')}
            >
              <Icon name="filter" className="h-4 w-4" />
              Filter
            </Button>
            {openDropdown === 'filter' && !isHouseTab && !isGuestTab ? (
              <div className="absolute left-0 top-11 z-10 w-48 rounded-lg border border-neutral-200 bg-white p-3 shadow-lg">
                <p className="text-xs font-semibold uppercase text-neutral-500">Status Warga</p>
                {['TETAP', 'TIDAK_TETAP', 'TAMU'].map((option) => (
                  <label className="mt-2 flex items-center gap-2 text-sm text-neutral-700" key={option}>
                    <input
                      checked={statusFilter === option}
                      className="accent-sky-600"
                      name="statusFilter"
                      onChange={() => {
                        setStatusFilter(option)
                        setOpenDropdown(null)
                        setPage(1)
                      }}
                      type="radio"
                    />
                    {option}
                  </label>
                ))}
                {statusFilter ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3 w-full"
                    onClick={() => {
                      setStatusFilter('')
                      setOpenDropdown(null)
                      setPage(1)
                    }}
                  >
                    Reset
                  </Button>
                ) : null}
              </div>
            ) : null}
          </div>

          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => setOpenDropdown(openDropdown === 'columns' ? null : 'columns')}
            >
              <Icon name="settings" className="h-4 w-4" />
              Columns
            </Button>
            {openDropdown === 'columns' ? (
              <div className="absolute right-0 top-11 z-10 w-56 rounded-lg border border-neutral-200 bg-white p-3 shadow-lg">
                <p className="text-xs font-semibold uppercase text-neutral-500">Tampilkan Kolom</p>
                {columns.map((column) => (
                  <label className="mt-2 flex items-center gap-2 text-sm text-neutral-700" key={column.key}>
                    <Checkbox
                      checked={visibleColumns.includes(column.key)}
                      onCheckedChange={() => toggleColumn(column.key)}
                    />
                    {column.label}
                  </label>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        <span className="text-xs font-medium text-neutral-500">
          {loading ? 'Memuat...' : `${filteredRows.length} data`}
          {!isHouseTab && !isGuestTab ? ` · Tamu ${guestCount ?? '-'}` : ''}
        </span>
      </section>

      {/* Body: loading / error / empty / table */}
      {loading ? (
        <div className="mt-4 rounded-xl border border-neutral-300 bg-white p-8 text-center text-sm font-semibold text-neutral-600">
          Memuat data...
        </div>
      ) : error ? (
        <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-8 text-center">
          <p className="text-sm font-bold text-amber-900">Data tidak dapat ditampilkan</p>
          <p className="mt-1 text-sm text-amber-800">
            {error.status === 403
              ? 'Role Anda tidak memiliki akses ke data ini.'
              : error.message || 'Gagal memuat data dari server. Silakan coba lagi.'}
          </p>
        </div>
      ) : emptyStateMessage ? (
        <div className="mt-4 rounded-xl border border-neutral-300 bg-white p-8 text-center">
          <p className="text-xs font-extrabold uppercase tracking-widest text-neutral-400">Belum ada data</p>
          <p className="mt-2 text-sm font-semibold text-neutral-600">{emptyStateMessage}</p>
        </div>
      ) : (
        <Table>
          <TableCaption>Data kependudukan</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>No</TableHead>
              {columns
                .filter((c) => visibleColumns.includes(c.key))
                .map((column) => (
                  <TableHead key={column.key}>{column.label}</TableHead>
                ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageRows.map((row, index) => (
              <TableRow key={row.id_citizen || row.id_house || row.id_guest || index}>
                <TableCell className="text-sm text-neutral-500">
                  {(safePage - 1) * PER_PAGE + index + 1}
                </TableCell>
                {columns
                  .filter((c) => visibleColumns.includes(c.key))
                  .map((column) => (
                    <TableCell key={column.key}>{renderCell(column, row)}</TableCell>
                  ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Pagination */}
      {!loading && !error && !emptyStateMessage && (
        <div className="mt-4 flex items-center justify-between gap-3">
          <span className="text-xs font-medium text-neutral-500">
            Hal {safePage} dari {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={safePage <= 1}
              onClick={() => setPage(safePage - 1)}
            >
              Sebelumnya
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={safePage >= totalPages}
              onClick={() => setPage(safePage + 1)}
            >
              Berikutnya
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}