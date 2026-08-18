import { useState } from 'react'
import { Icon } from '../../components/ui/Icon'
import { StatCard } from '../../components/dashboard/StatCard'
import { citizens, houses, guestCount } from '../../data/wargaData'
import { navigate } from '../../services/router'

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

const TABS = [
  { id: 'semua', label: 'Semua Warga', path: '/dashboard/warga' },
  { id: 'nonWarga', label: 'Non Warga', path: '/dashboard/warga/non-warga' },
  { id: 'tamu', label: 'Tamu', path: '/dashboard/warga/tamu' },
  { id: 'rumah', label: 'Data Rumah', path: '/dashboard/warga/rumah' },
]

const PER_PAGE = 10

function getTabRows(tab) {
  if (tab === 'nonWarga') return citizens.filter((c) => c.status_warga === 'TIDAK_TETAP')
  if (tab === 'tamu') return []
  if (tab === 'rumah') return houses
  return citizens
}

function StatusBadge({ active }) {
  return active ? (
    <span className="inline-block rounded-full bg-green-50 px-2 py-0.5 text-xs font-semibold text-green-700">Aktif</span>
  ) : (
    <span className="inline-block rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-semibold text-neutral-500">Nonaktif</span>
  )
}

export function WargaDataPage({ activeTab = 'semua' }) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [openDropdown, setOpenDropdown] = useState(null)
  const [visibleColumns, setVisibleColumns] = useState(ALL_COLUMNS.map((c) => c.key))
  const [page, setPage] = useState(1)

  const isHouseTab = activeTab === 'rumah'
  const columns = isHouseTab ? HOUSE_COLUMNS : ALL_COLUMNS

  const stats = [
    {
      title: 'Total Warga',
      value: citizens.length,
      accent: 'blue',
      icon: 'users',
      note: `${citizens.filter((c) => c.jenis_kelamin === 'L').length} laki-laki, ${citizens.filter((c) => c.jenis_kelamin === 'P').length} perempuan`,
    },
    {
      title: 'Terverifikasi',
      value: citizens.filter((c) => c.status_aktif).length,
      accent: 'green',
      icon: 'check',
      note: 'Warga status aktif',
    },
    {
      title: 'Pending',
      value: 0,
      accent: 'amber',
      icon: 'clock',
      note: 'Menunggu verifikasi',
    },
    {
      title: 'Perbandingan L : P',
      value: `${citizens.filter((c) => c.jenis_kelamin === 'L').length} : ${citizens.filter((c) => c.jenis_kelamin === 'P').length}`,
      accent: 'blue',
      icon: 'users',
      note: 'Laki-laki : Perempuan',
    },
  ]

  const tabRows = getTabRows(activeTab)
  const filteredRows = tabRows.filter((row) => {
    const matchesSearch = String(row.nama_lengkap || row.alamat || '')
      .toLowerCase()
      .includes(search.toLowerCase())
    const matchesStatus = !statusFilter || row.status_warga === statusFilter
    return matchesSearch && matchesStatus
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

  function exportCsv() {
    const header = columns.filter((c) => visibleColumns.includes(c.key)).map((c) => c.label)
    const lines = filteredRows.map((row) =>
      header
        .map((label) => {
          const col = columns.find((c) => c.label === label)
          return row[col.key] ?? ''
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

  function renderCell(column, row) {
    const value = row[column.key]
    if (column.key === 'status_aktif') return <StatusBadge active={value} />
    return <span className="text-sm text-neutral-700">{value ?? '—'}</span>
  }

  const toolButtonClass =
    'flex h-9 items-center gap-2 rounded-lg border border-neutral-300 bg-white px-3.5 text-sm font-semibold text-neutral-700 transition hover:border-sky-500 hover:text-sky-700'
  const toolButtonDisabledClass =
    'flex h-9 cursor-not-allowed items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-100 px-3.5 text-sm font-semibold text-neutral-400'

  return (
    <div className="min-w-0 px-6 py-6 max-md:px-4 max-md:py-5">
      {/* Header */}
      <section className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold leading-tight text-black">Data Warga</h2>
          <p className="mt-1 text-sm text-neutral-700">Kelola data warga dan kependudukan</p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <button className={toolButtonClass} onClick={exportCsv} type="button">
            <Icon name="download" className="h-4 w-4" />
            Export
          </button>
          <button className={toolButtonDisabledClass} disabled title="Hanya pengurus RT" type="button">
            <Icon name="upload" className="h-4 w-4" />
            Import
          </button>
          <button className={toolButtonDisabledClass} disabled title="Hanya pengurus RT" type="button">
            <Icon name="userPlus" className="h-4 w-4" />
            Tambah Warga
          </button>
        </div>
      </section>

      {/* Tabs */}
      <div className="mb-5 flex flex-wrap gap-1.5">
        {TABS.map((tab) => (
          <button
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
              activeTab === tab.id
                ? 'bg-sky-600 text-white'
                : 'text-neutral-600 hover:bg-sky-50 hover:text-sky-700'
            }`}
            key={tab.id}
            onClick={() => switchTab(tab)}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Stats */}
      {isHouseTab ? null : (
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
            <input
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
            <button
              className="flex h-9 items-center gap-2 rounded-lg border border-neutral-300 bg-white px-3 text-sm font-semibold text-neutral-700 transition hover:border-sky-500 hover:text-sky-700"
              onClick={() => setOpenDropdown(openDropdown === 'filter' ? null : 'filter')}
              type="button"
            >
              <Icon name="filter" className="h-4 w-4" />
              Filter
            </button>
            {openDropdown === 'filter' && !isHouseTab ? (
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
                  <button
                    className="mt-3 h-8 rounded-lg border border-neutral-300 px-3 text-xs font-semibold text-neutral-700 transition hover:bg-neutral-50"
                    onClick={() => {
                      setStatusFilter('')
                      setOpenDropdown(null)
                      setPage(1)
                    }}
                    type="button"
                  >
                    Reset
                  </button>
                ) : null}
              </div>
            ) : null}
          </div>

          <div className="relative">
            <button
              className="flex h-9 items-center gap-2 rounded-lg border border-neutral-300 bg-white px-3 text-sm font-semibold text-neutral-700 transition hover:border-sky-500 hover:text-sky-700"
              onClick={() => setOpenDropdown(openDropdown === 'columns' ? null : 'columns')}
              type="button"
            >
              <Icon name="settings" className="h-4 w-4" />
              Columns
            </button>
            {openDropdown === 'columns' ? (
              <div className="absolute right-0 top-11 z-10 w-56 rounded-lg border border-neutral-200 bg-white p-3 shadow-lg">
                <p className="text-xs font-semibold uppercase text-neutral-500">Tampilkan Kolom</p>
                {columns.map((column) => (
                  <label className="mt-2 flex items-center gap-2 text-sm text-neutral-700" key={column.key}>
                    <input
                      checked={visibleColumns.includes(column.key)}
                      className="accent-sky-600"
                      onChange={() => toggleColumn(column.key)}
                      type="checkbox"
                    />
                    {column.label}
                  </label>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        <span className="text-xs font-medium text-neutral-500">
          {filteredRows.length} data
          {!isHouseTab ? ` · Tamu ${guestCount}` : ''}
        </span>
      </section>

      {/* Table */}
      <div className="mt-4 overflow-x-auto rounded-xl border border-neutral-300 bg-white">
        <table className="w-full min-w-[760px] border-collapse">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
              <th className="px-4 py-3">No</th>
              {columns
                .filter((c) => visibleColumns.includes(c.key))
                .map((column) => (
                  <th className="px-4 py-3" key={column.key}>
                    {column.label}
                  </th>
                ))}
            </tr>
          </thead>
          <tbody>
            {pageRows.length === 0 ? (
              <tr>
                <td className="px-4 py-10 text-center text-sm text-neutral-500" colSpan={columns.length + 1}>
                  Belum ada data.
                </td>
              </tr>
            ) : (
              pageRows.map((row, index) => (
                <tr className="border-b border-neutral-100 last:border-b-0 hover:bg-sky-50/50" key={row.id}>
                  <td className="px-4 py-3 text-sm text-neutral-500">{(safePage - 1) * PER_PAGE + index + 1}</td>
                  {columns
                    .filter((c) => visibleColumns.includes(c.key))
                    .map((column) => (
                      <td className="px-4 py-3" key={column.key}>
                        {renderCell(column, row)}
                      </td>
                    ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!isHouseTab && (
        <div className="mt-4 flex items-center justify-between gap-3">
          <span className="text-xs font-medium text-neutral-500">
            Hal {safePage} dari {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              className="h-9 rounded-lg border border-neutral-300 bg-white px-3 text-sm font-semibold text-neutral-700 transition hover:border-sky-500 hover:text-sky-700 disabled:cursor-not-allowed disabled:border-neutral-200 disabled:text-neutral-400"
              disabled={safePage <= 1}
              onClick={() => setPage(safePage - 1)}
              type="button"
            >
              Sebelumnya
            </button>
            <button
              className="h-9 rounded-lg border border-neutral-300 bg-white px-3 text-sm font-semibold text-neutral-700 transition hover:border-sky-500 hover:text-sky-700 disabled:cursor-not-allowed disabled:border-neutral-200 disabled:text-neutral-400"
              disabled={safePage >= totalPages}
              onClick={() => setPage(safePage + 1)}
              type="button"
            >
              Berikutnya
            </button>
          </div>
        </div>
      )}
    </div>
  )
}