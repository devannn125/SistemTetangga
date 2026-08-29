import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { cn } from '../../lib/utils'
import { Input } from './Input'
import { Select } from './Select'
import { Button } from './Button'
import { Table, THead, TBody, Tr, Th, Td } from './Table'
import { SkeletonTable } from './Skeleton'
import { Alert } from './Alert'

const DEFAULT_PER_PAGE = 10

/**
 * DataTable — tabel data universal reusable dengan:
 *   - Search bar (filter berdasarkan teks di kolom tertentu)
 *   - Filter dropdown (filter berdasarkan nilai field tertentu)
 *   - Pagination
 *   - Loading skeleton
 *   - Empty state
 *   - Error state
 *
 * Props:
 *   data              — array data yang akan ditampilkan
 *   columns           — array kolom: { key, label, render?, className? }
 *                       render(row, value) → ReactNode (opsional, untuk cell custom)
 *   searchKeys        — array key field untuk dicari (default: semua kolom)
 *   searchPlaceholder — placeholder input search
 *   filters           — array filter: { key, label, options: [{ value, label }] }
 *   loading           — boolean loading state
 *   error             — string | Error | null — pesan error
 *   emptyMessage      — pesan saat data kosong
 *   emptyTitle        — judul saat data kosong
 *   perPage           — jumlah baris per halaman (default: 10)
 *   className         — class tambahan container
 *   headerActions     — ReactNode — tombol/aksi di pojok kanan header
 *   onRowClick        — callback (row) => void (opsional)
 *   rowKey            — nama field sebagai key unik (default: 'id')
 *   getRowKey         — fungsi alternatif untuk key: (row, index) => string
 *   skeletonCols      — jumlah kolom skeleton (default: panjang columns)
 *
 * Contoh penggunaan:
 * ```jsx
 * <DataTable
 *   data={bills}
 *   columns={[
 *     { key: 'periode', label: 'Periode' },
 *     { key: 'jumlah_tagihan', label: 'Jumlah', render: (row, val) => formatCurrency(val) },
 *     { key: 'status', label: 'Status', render: (row, val) => <StatusBadge status={val} /> },
 *   ]}
 *   searchKeys={['periode', 'jumlah_tagihan']}
 *   searchPlaceholder="Cari tagihan..."
 *   filters={[
 *     {
 *       key: 'status',
 *       label: 'Status',
 *       options: [
 *         { value: 'LUNAS', label: 'Lunas' },
 *         { value: 'BELUM_BAYAR', label: 'Belum Bayar' },
 *       ],
 *     },
 *   ]}
 *   loading={isLoading}
 *   emptyMessage="Belum ada tagihan iuran."
 * />
 * ```
 */
export function DataTable({
  data = [],
  columns = [],
  searchKeys,
  searchPlaceholder = 'Cari...',
  filters = [],
  loading = false,
  error = null,
  emptyMessage = 'Tidak ada data untuk ditampilkan.',
  emptyTitle = 'Belum ada data',
  perPage = DEFAULT_PER_PAGE,
  className,
  headerActions,
  onRowClick,
  rowKey = 'id',
  getRowKey,
  skeletonCols,
}) {
  const [search, setSearch] = useState('')
  const [filterValues, setFilterValues] = useState({})
  const [page, setPage] = useState(1)

  // Kolom yang dipakai untuk search (semua jika tidak ditentukan)
  const effectiveSearchKeys = searchKeys ?? columns.map((c) => c.key)

  // Filter data
  const filtered = useMemo(() => {
    let result = data

    // Search
    if (search.trim()) {
      const query = search.toLowerCase()
      result = result.filter((row) =>
        effectiveSearchKeys.some((key) => {
          const value = String(row[key] ?? '').toLowerCase()
          return value.includes(query)
        }),
      )
    }

    // Dropdown filters
    Object.entries(filterValues).forEach(([key, value]) => {
      if (value) {
        result = result.filter((row) => String(row[key]) === String(value))
      }
    })

    return result
  }, [data, search, filterValues, effectiveSearchKeys])

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage))
  const safePage = Math.min(page, totalPages)
  const pageData = filtered.slice((safePage - 1) * perPage, safePage * perPage)

  function handleSearch(value) {
    setSearch(value)
    setPage(1)
  }

  function handleFilter(key, value) {
    setFilterValues((prev) => ({ ...prev, [key]: value }))
    setPage(1)
  }

  function getKey(row, index) {
    if (getRowKey) return getRowKey(row, index)
    return row[rowKey] ?? index
  }

  const hasActiveFilter = search.trim() || Object.values(filterValues).some(Boolean)
  const numCols = skeletonCols ?? columns.length

  return (
    <div className={cn('flex flex-col gap-4', className)}>

      {/* Toolbar: search + filters + header actions */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search Bar */}
        <div className="flex-1 min-w-[180px] max-w-sm">
          <Input
            type="search"
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            prefixIcon={<Search className="h-4 w-4" />}
          />
        </div>

        {/* Filter Dropdowns */}
        {filters.map((filter) => (
          <div key={filter.key} className="min-w-[140px]">
            <Select
              placeholder={`Filter ${filter.label}`}
              value={filterValues[filter.key] ?? ''}
              onChange={(e) => handleFilter(filter.key, e.target.value)}
              options={filter.options}
            />
          </div>
        ))}

        {/* Reset filter */}
        {hasActiveFilter && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearch('')
              setFilterValues({})
              setPage(1)
            }}
          >
            Reset
          </Button>
        )}

        {/* Header Actions (tombol tambah, export, dll) */}
        {headerActions && (
          <div className="flex items-center gap-2 ml-auto">
            {headerActions}
          </div>
        )}

        {/* Info jumlah data */}
        <span className="ml-auto text-xs text-neutral-500 whitespace-nowrap">
          {loading ? 'Memuat...' : `${filtered.length} data`}
        </span>
      </div>

      {/* Error state */}
      {error && !loading && (
        <Alert variant="warning" title="Gagal memuat data">
          {typeof error === 'string'
            ? error
            : error?.message || 'Terjadi kesalahan. Silakan coba lagi.'}
        </Alert>
      )}

      {/* Loading state — skeleton */}
      {loading ? (
        <SkeletonTable rows={perPage} cols={numCols} />
      ) : !error && pageData.length === 0 ? (
        /* Empty state */
        <div className="rounded-xl border border-neutral-200 bg-white p-10 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-neutral-400">
            {emptyTitle}
          </p>
          <p className="mt-2 text-sm text-neutral-500">{emptyMessage}</p>
          {hasActiveFilter && (
            <p className="mt-1 text-xs text-neutral-400">
              Coba ubah kata kunci atau reset filter.
            </p>
          )}
        </div>
      ) : !error ? (
        /* Table */
        <Table>
          <THead>
            <Tr>
              <Th className="w-10 text-center">#</Th>
              {columns.map((col) => (
                <Th key={col.key} className={col.className}>
                  {col.label}
                </Th>
              ))}
            </Tr>
          </THead>
          <TBody>
            {pageData.map((row, index) => (
              <Tr
                key={getKey(row, (safePage - 1) * perPage + index)}
                className={onRowClick ? 'cursor-pointer' : ''}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
              >
                <Td className="text-center text-neutral-400">
                  {(safePage - 1) * perPage + index + 1}
                </Td>
                {columns.map((col) => (
                  <Td key={col.key} className={col.className}>
                    {col.render
                      ? col.render(row, row[col.key])
                      : (row[col.key] ?? '—')}
                  </Td>
                ))}
              </Tr>
            ))}
          </TBody>
        </Table>
      ) : null}

      {/* Pagination */}
      {!loading && !error && filtered.length > 0 && (
        <div className="flex items-center justify-between gap-4">
          <span className="text-xs text-neutral-500">
            Halaman {safePage} dari {totalPages} · {filtered.length} data
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={safePage <= 1}
              onClick={() => setPage(safePage - 1)}
            >
              ← Sebelumnya
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={safePage >= totalPages}
              onClick={() => setPage(safePage + 1)}
            >
              Berikutnya →
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
