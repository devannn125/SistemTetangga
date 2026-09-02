import { useEffect, useState } from 'react'
import { PageShell } from '@/components/layout/PageShell'
import { DataTable } from '@/components/ui/DataTable'
import { getCitizens, getFamilies, getWilayah } from '@/services/api'

function enumLabel(val) {
  if (!val) return "-";
  return val.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
}
function yaTidakLabel(val) {
  if (val === true || val === 1 || val === "true") return "Ya";
  return "Tidak";
}
function formatDateShort(dateStr) {
  if (!dateStr) return "-";
  try {
    return new Date(dateStr).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return dateStr;
  }
}
function CellStack({ main, subs = [] }) {
  return (
    <div className="flex flex-col">
      <span className="font-medium text-neutral-900">{main}</span>
      {subs.filter(Boolean).map((sub, i) => (
        <span key={i} className="text-xs text-neutral-500">{sub}</span>
      ))}
    </div>
  );
}

const WARGA_FILTERS = [
  {
    key: "status_warga",
    label: "Status Warga",
    options: [
      { value: "TETAP", label: "Tetap" },
      { value: "TIDAK_TETAP", label: "Tidak Tetap" },
    ],
  },
  {
    key: "status_aktif",
    label: "Status Aktif",
    options: [
      { value: "true", label: "Aktif" },
      { value: "false", label: "Nonaktif" },
    ],
  },
];

const KK_FILTERS = [
  {
    key: "status",
    label: "Status KK",
    options: [
      { value: "ACTIVE", label: "Aktif" },
      { value: "PINDAH", label: "Pindah" },
      { value: "DIHAPUS", label: "Dihapus" },
    ],
  },
];

export function DukuhCitizenPage() {
  const [activeTab, setActiveTab] = useState("warga")
  const [citizens, setCitizens] = useState([])
  const [families, setFamilies] = useState([])
  const [wilayahFilters, setWilayahFilters] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [notice, setNotice] = useState("")

  async function loadData() {
    setIsLoading(true)
    setNotice("")
    try {
      const [resCit, resFam, resWil] = await Promise.all([
        getCitizens({ per_page: 200 }),
        getFamilies({ per_page: 200 }),
        getWilayah({ all: true })
      ])

      const wilData = Array.isArray(resWil?.data) ? resWil.data : []
      const wilMap = {}
      wilData.forEach(w => { wilMap[w.id_wilayah] = w })

      // Bikin list filter wilayah berjenjang
      const wilOptions = []
      const dukuhs = wilData.filter(w => w.tipe === "DUKUH")
      const rws = wilData.filter(w => w.tipe === "RW")
      const rts = wilData.filter(w => w.tipe === "RT")

      // Kelompokkan berdasar Dukuh
      dukuhs.forEach(d => {
        const groupItems = []
        groupItems.push({ value: d.id_wilayah, label: "Semua " + d.nama_wilayah })

        const childRws = rws.filter(rw => rw.parent_id === d.id_wilayah)
        childRws.forEach(rw => {
          groupItems.push({ value: rw.id_wilayah, label: rw.nama_wilayah })
          const childRts = rts.filter(rt => rt.parent_id === rw.id_wilayah)
          childRts.forEach(rt => {
            groupItems.push({ value: rt.id_wilayah, label: "    " + rt.nama_wilayah })
          })
        })
        if (groupItems.length > 0) {
          wilOptions.push({ group: d.nama_wilayah, items: groupItems })
        }
      })

      setWilayahFilters([{
        key: "wilayah_ids",
        label: "Wilayah (RW/RT)",
        options: wilOptions
      }])

      let cData = Array.isArray(resCit?.data) ? resCit.data : []
      let fData = Array.isArray(resFam?.data) ? resFam.data : []

      // Memperkaya data warga dengan array wilayah_ids [rt_id, rw_id, dukuh_id]
      cData = cData.map(c => {
        const ids = []
        let currentId = c.wilayah?.id_wilayah || c.id_wilayah
        let current = wilMap[currentId]
        while (current) {
          ids.push(current.id_wilayah)
          current = wilMap[current.parent_id]
        }
        return { ...c, wilayah_ids: ids }
      })

      // Memperkaya data keluarga dengan array wilayah_ids [rt_id, rw_id, dukuh_id]
      fData = fData.map(f => {
        const ids = []
        let currentId = f.wilayah?.id_wilayah || f.id_wilayah
        let current = wilMap[currentId]
        while (current) {
          ids.push(current.id_wilayah)
          current = wilMap[current.parent_id]
        }
        return { ...f, wilayah_ids: ids }
      })

      setCitizens(cData)
      setFamilies(fData)
    } catch (err) {
      setNotice(err.message || "Gagal memuat data kependudukan.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const wargaColumns = [
    {
      key: "nama_lengkap",
      label: "Warga",
      render: (_, item) => (
        <CellStack main={item.nama_lengkap || "-"} subs={[item.nik ? `NIK: ${item.nik}` : null]} />
      ),
    },
    {
      key: "jenis_kelamin",
      label: "JK & Lahir",
      render: (v, item) => (
        <CellStack
          main={enumLabel(v)}
          subs={[item.tempat_lahir, formatDateShort(item.tanggal_lahir)]}
        />
      ),
    },
    {
      key: "no_hp",
      label: "Kontak",
      render: (v, item) => (
        <CellStack main={v || "-"} subs={[item?.email]} />
      ),
    },
    {
      key: "pendidikan",
      label: "Pendidikan & Profesi",
      render: (v, item) => (
        <CellStack main={v?.nama_master || "-"} subs={[item?.profesi?.nama_master]} />
      ),
    },
    {
      key: "agama",
      label: "Agama & Nikah",
      render: (v, item) => (
        <CellStack
          main={v?.nama_master || "-"}
          subs={[item?.status_nikah ? enumLabel(item.status_nikah) : null]}
        />
      ),
    },
    {
      key: "status_warga",
      label: "Status & Sosial",
      render: (v, item) => (
        <CellStack
          main={enumLabel(v)}
          subs={[
            item.kewarganegaraan ? enumLabel(item.kewarganegaraan) : null,
            item.status_ekonomi ? enumLabel(item.status_ekonomi) : null,
            item.penerima_bansos === undefined || item.penerima_bansos === null
              ? null
              : `Bansos: ${yaTidakLabel(item.penerima_bansos)}`,
          ]}
        />
      ),
    },
    {
      key: "family",
      label: "KK & Hubungan",
      render: (v, item) => (
        <CellStack
          main={v?.no_kk || "-"}
          subs={[item?.hubungan_keluarga ? enumLabel(item?.hubungan_keluarga) : null]}
        />
      ),
    },
    {
      key: "tanggal_masuk_rt",
      label: "Domisili & Status",
      render: (v, item) => (
        <CellStack
          main={v ? `Masuk RT: ${formatDateShort(v)}` : "-"}
          subs={[
            item.wilayah?.nama_wilayah ? `Wilayah: ${item.wilayah.nama_wilayah}` : null,
            `KK Luar RT: ${yaTidakLabel(item?.alamat_kk_luar_rt)}`,
            `Aktif: ${yaTidakLabel(item?.status_aktif)}`,
          ]}
        />
      ),
    },
  ]

  const kkColumns = [
    { key: "no_kk", label: "No. KK", render: v => <span className="font-mono font-medium">{v}</span> },
    { key: "kepala_keluarga", label: "Kepala KK", render: (v) => v?.nama_lengkap || "-" },
    { key: "wilayah", label: "Wilayah", render: (v) => v?.nama_wilayah || "-" },
    { key: "status", label: "Status", render: (v) => (
      <span className={`inline-block px-2.5 py-1 text-xs font-bold rounded-full ${v === "ACTIVE" ? "bg-emerald-100 text-emerald-900" : "bg-neutral-100 text-neutral-900"}`}>{v}</span>
    ) },
  ]

  const columns = activeTab === "warga" ? wargaColumns : kkColumns
  const data = activeTab === "warga" ? citizens : families
  const filters = activeTab === "warga" ? [...WARGA_FILTERS, ...wilayahFilters] : [...KK_FILTERS, ...wilayahFilters]
  const searchKeys = activeTab === "warga"
    ? ["nama_lengkap", "nik", "no_hp", "email"]
    : ["no_kk"]
  const rowKey = activeTab === "warga" ? "id_citizen" : "id_family"

  return (
    <PageShell
      eyebrow="Kependudukan"
      title="Data Warga & KK"
      description="Kelola dan pantau data warga serta Kartu Keluarga. Akses bersifat Read-Only untuk tingkat Dukuh / Kelurahan."
    >
      <section className="mt-8 space-y-6">
        {notice ? (
          <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-semibold text-sky-900">
            {notice}
          </div>
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={`rounded-full border px-4 py-2 text-xs font-extrabold transition ${
                activeTab === "warga"
                  ? "border-black bg-black text-white"
                  : "border-neutral-300 bg-white text-neutral-700 hover:border-black hover:bg-neutral-100"
              }`}
              onClick={() => setActiveTab("warga")}
            >
              Data Warga
            </button>
            <button
              type="button"
              className={`rounded-full border px-4 py-2 text-xs font-extrabold transition ${
                activeTab === "kk"
                  ? "border-black bg-black text-white"
                  : "border-neutral-300 bg-white text-neutral-700 hover:border-black hover:bg-neutral-100"
              }`}
              onClick={() => setActiveTab("kk")}
            >
              Kartu Keluarga (KK)
            </button>
          </div>
        </div>

        <div className="rounded-2xl border bg-white shadow-sm p-4">
          <DataTable
            columns={columns}
            data={data}
            searchKeys={searchKeys}
            searchPlaceholder={activeTab === "warga" ? "Cari nama, NIK..." : "Cari No. KK..."}
            filters={filters}
            loading={isLoading}
            emptyMessage={activeTab === "warga" ? "Belum ada data warga." : "Belum ada data KK."}
            rowKey={rowKey}
          />
        </div>
      </section>
    </PageShell>
  )
}
