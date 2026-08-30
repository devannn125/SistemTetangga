import { useState, useEffect, useMemo } from 'react'
import { PageShell } from '../../../components/layout/PageShell'
import { Card, CardContent, CardHeader, CardTitle, CardDesc } from '../../../components/ui/Card'
import { Badge } from '../../../components/ui/Badge'
import { Input } from '../../../components/ui/Input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/Select'
import { Button } from '../../../components/ui/Button'
import { SkeletonCard } from '../../../components/ui/Skeleton'
import { Search } from 'lucide-react'
import { getFeedback } from '../../../services/api'

const KATEGORI_OPTIONS = [
  { value: 'MASUKAN', label: 'Masukan' },
  { value: 'KELUHAN', label: 'Keluhan' },
  { value: 'APRESIASI', label: 'Apresiasi' },
  { value: 'LAINNYA', label: 'Lainnya' },
]

export default function RtMessagePage() {
  const [feedbacks, setFeedbacks] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [kategoriFilter, setKategoriFilter] = useState('')

  useEffect(() => {
    getFeedback({ per_page: 100 })
      .then((res) => {
        const arr = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []
        setFeedbacks(arr)
        setLoading(false)
      })
      .catch((err) => {
        console.error(err)
        setLoading(false)
      })
  }, [])

  const filteredFeedbacks = useMemo(() => {
    return feedbacks.filter((item) => {
      const textMatches = [item.judul, item.isi_pesan, item.deskripsi, item.isi_feedback]
        .join(' ')
        .toLowerCase()
        .includes(search.toLowerCase())
      
      const categoryMatches = !kategoriFilter || String(item.kategori || 'UMUM').toUpperCase() === kategoriFilter.toUpperCase()
      return textMatches && categoryMatches
    })
  }, [feedbacks, search, kategoriFilter])

  return (
    <PageShell
      eyebrow="Komunikasi"
      title="Pesan & Kesan Warga"
      description="Tinjau pesan, keluhan umum, dan apresiasi dari warga di lingkungan Anda."
    >
      <div className="space-y-6">
        {/* Filters Toolbar */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[180px] max-w-sm">
            <Input
              type="search"
              placeholder="Cari isi pesan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              prefixIcon={<Search className="h-4 w-4" />}
            />
          </div>
          <div className="min-w-[140px]">
            <Select
              value={kategoriFilter || undefined}
              onValueChange={(v) => setKategoriFilter(v === '__all' ? '' : v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter Kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all">Semua</SelectItem>
                {KATEGORI_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {(search || kategoriFilter) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearch('')
                setKategoriFilter('')
              }}
            >
              Reset
            </Button>
          )}
          <span className="ml-auto text-xs text-neutral-500">
            {loading ? 'Memuat...' : `${filteredFeedbacks.length} pesan`}
          </span>
        </div>

        {/* Feedbacks List */}
        <div className="grid gap-4">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
          ) : filteredFeedbacks.length === 0 ? (
            <div className="rounded-xl border border-neutral-200 bg-white p-8 text-center text-sm text-neutral-500">
              Belum ada pesan yang sesuai filter.
            </div>
          ) : (
            filteredFeedbacks.map((item) => (
              <Card key={item.id_feedback || item.id}>
                <CardHeader className="border-b border-neutral-100 pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{item.judul || 'Pesan Warga'}</CardTitle>
                      <CardDesc className="mt-1">
                        Kategori: {item.kategori || 'UMUM'} • {item.tanggal_submit || item.created_at?.slice(0, 10) || '-'}
                      </CardDesc>
                    </div>
                    <Badge variant="info">
                      {item.status || 'DITERIMA'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <p className="text-sm leading-relaxed text-neutral-600">
                    {item.isi_pesan || item.deskripsi || item.isi_feedback}
                  </p>
                </CardContent>
                <div className="flex items-center gap-3 border-t border-neutral-100 px-6 py-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-xs font-bold text-black uppercase">
                    {item.pelapor?.nama_lengkap?.[0] || 'W'}
                  </div>
                  <p className="text-sm font-semibold text-neutral-800">
                    {item.pelapor?.nama_lengkap || item.nama_pelapor || 'Warga'}
                  </p>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </PageShell>
  )
}
