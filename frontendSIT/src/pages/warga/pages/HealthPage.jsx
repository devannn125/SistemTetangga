import { useState, useEffect } from "react"
import { PageShell } from "@/components/layout/PageShell"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/Dialog"
import { Input } from "@/components/ui/Input"
import { Textarea } from "@/components/ui/Textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select"
import { Label } from "@/components/ui/Label"
import { DataTable } from "@/components/ui/DataTable"
import {
  getPosyanduSchedules,
  createPosyanduSchedule,
  updatePosyanduSchedule,
  deletePosyanduSchedule,
  getWilayah,
} from "@/services/api"
import { getAuthRole } from "@/services/authService"
import { useConfirm } from "@/components/ui/ConfirmContext"
import { useToast } from "@/components/ui/ToastContext"

const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"]

function CalendarWidget({ schedules, selectedDate, onSelectDate, currentMonth, currentYear, onChangeMonth }) {
  const firstDay = new Date(currentYear, currentMonth, 1).getDay()
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()

  const days = []
  for (let i = 0; i < firstDay; i++) days.push(null)
  for (let i = 1; i <= daysInMonth; i++) days.push(i)

  return (
    <div className="border-2 border-neutral-900 p-6 rounded-xl bg-white shadow-none h-full flex flex-col">
      <div className="flex justify-between items-center mb-6 border-b-2 border-neutral-100 pb-4">
        <button onClick={() => onChangeMonth(-1)} className="px-3 py-1 font-extrabold border-2 border-transparent hover:border-black rounded-lg transition">&lt; Prev</button>
        <h3 className="text-center font-extrabold text-black text-lg">{monthNames[currentMonth]} {currentYear}</h3>
        <button onClick={() => onChangeMonth(1)} className="px-3 py-1 font-extrabold border-2 border-transparent hover:border-black rounded-lg transition">Next &gt;</button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-neutral-400 mb-2">
        <div>Min</div><div>Sen</div><div>Sel</div><div>Rab</div><div>Kam</div><div>Jum</div><div>Sab</div>
      </div>
      <div className="grid grid-cols-7 gap-2 flex-grow">
        {days.map((d, i) => {
          if (!d) return <div key={`empty-${i}`} />
          const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`
          const isSelected = selectedDate === dateStr
          const isToday = new Date().toISOString().split("T")[0] === dateStr
          const activities = schedules.filter(s => s.tanggal_jadwal === dateStr)

          return (
            <button
              key={i}
              onClick={() => onSelectDate(dateStr)}
              className={`aspect-square rounded-xl flex flex-col items-center justify-center relative border-2 transition-all ${
                isSelected ? "border-black bg-black text-white" :
                isToday ? "border-sky-500 bg-sky-50 text-sky-900" :
                "border-transparent hover:border-neutral-300 bg-neutral-50 text-neutral-700"
              }`}
            >
              <span className="font-extrabold text-sm">{d}</span>
              {activities.length > 0 && (
                <span className={`w-1.5 h-1.5 rounded-full absolute bottom-1.5 ${isSelected ? "bg-white" : "bg-emerald-500"}`} />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default function HealthPage() {
  const isPkk = getAuthRole() === "PKK"

  const [schedules, setSchedules] = useState([])
  const [wilayahs, setWilayahs] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)

  const initialToday = new Date()
  const initialTodayStr = initialToday.toISOString().split("T")[0]
  const [selectedDate, setSelectedDate] = useState(initialTodayStr)
  const [currentMonth, setCurrentMonth] = useState(initialToday.getMonth())
  const [currentYear, setCurrentYear] = useState(initialToday.getFullYear())

  const [form, setForm] = useState({
    id_wilayah: "",
    tanggal_jadwal: initialTodayStr,
    jam_mulai: "",
    nama_kegiatan: "",
    lokasi: "",
    keterangan: "",
    penyelenggara: "",
  })

  const confirm = useConfirm()
  const { showToast } = useToast()

  async function loadData() {
    setIsLoading(true)
    try {
      const [resSched, resWil] = await Promise.all([
        getPosyanduSchedules({ per_page: 200 }),
        getWilayah({ per_page: 100 }),
      ])
      const scData = Array.isArray(resSched?.data) ? resSched.data : Array.isArray(resSched) ? resSched : []
      const wData = Array.isArray(resWil?.data) ? resWil.data : Array.isArray(resWil) ? resWil : []
      setSchedules(scData)
      setWilayahs(wData)
      if (isPkk && wData.length > 0 && scData.length === 0) {
        setForm((f) => ({ ...f, id_wilayah: wData[0].id_wilayah }))
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  function handleChangeMonth(dir) {
    let newM = currentMonth + dir
    let newY = currentYear
    if (newM < 0) { newM = 11; newY-- }
    else if (newM > 11) { newM = 0; newY++ }
    setCurrentMonth(newM)
    setCurrentYear(newY)
  }

  function openCreate() {
    setEditing(null)
    setForm({
      id_wilayah: wilayahs.length > 0 ? wilayahs[0].id_wilayah : "",
      tanggal_jadwal: selectedDate,
      jam_mulai: "",
      nama_kegiatan: "",
      lokasi: "",
      keterangan: "",
      penyelenggara: "",
    })
    setIsModalOpen(true)
  }

  function openEdit(row) {
    setEditing(row)
    setForm({
      id_wilayah: row.id_wilayah || (wilayahs.length > 0 ? wilayahs[0].id_wilayah : ""),
      tanggal_jadwal: row.tanggal_jadwal,
      jam_mulai: row.jam_mulai || "",
      nama_kegiatan: row.nama_kegiatan || "",
      lokasi: row.lokasi || "",
      keterangan: row.keterangan || "",
      penyelenggara: row.penyelenggara || "",
    })
    setIsModalOpen(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.nama_kegiatan.trim()) {
      showToast("Nama kegiatan wajib diisi.", "error")
      return
    }
    try {
      const payload = { ...form, jam_mulai: form.jam_mulai || null }
      if (editing) {
        await updatePosyanduSchedule(editing.id_posyandu_schedule, payload)
        showToast("Jadwal posyandu berhasil diperbarui.")
      } else {
        await createPosyanduSchedule(payload)
        showToast("Jadwal posyandu baru berhasil ditambahkan.")
      }
      setIsModalOpen(false)
      loadData()
    } catch (err) {
      console.error(err)
      showToast("Gagal menyimpan jadwal: " + (err.response?.data?.message || err.message), "error")
    }
  }

  async function handleDelete(row) {
    const approved = await confirm({
      title: "Konfirmasi Hapus",
      message: `Yakin ingin menghapus jadwal "${row.nama_kegiatan}"?`,
      confirmLabel: "Ya, Hapus",
    })
    if (!approved) return
    try {
      await deletePosyanduSchedule(row.id_posyandu_schedule)
      showToast("Jadwal berhasil dihapus.")
      loadData()
    } catch (err) {
      showToast("Gagal menghapus: " + err.message, "error")
    }
  }

  const activitiesOnSelectedDate = schedules.filter(s => s.tanggal_jadwal === selectedDate)

  const columns = [
    { key: "tanggal_jadwal", label: "Tanggal", render: (v) => <span className="font-bold text-neutral-900">{v}</span> },
    { key: "jam_mulai", label: "Jam", render: (v) => <span>{v || "-"}</span> },
    { key: "nama_kegiatan", label: "Nama Kegiatan", render: (v) => <span className="font-semibold text-neutral-900">{v}</span> },
    { key: "lokasi", label: "Lokasi", render: (v) => <span>{v || "-"}</span> },
    { key: "penyelenggara", label: "Penyelenggara", render: (v) => <span>{v || "-"}</span> },
    ...(isPkk ? [{
      key: "actions",
      label: "Aksi",
      render: (_, row) => (
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => openEdit(row)}>Edit</Button>
          <Button variant="destructive" size="sm" onClick={() => handleDelete(row)}>Hapus</Button>
        </div>
      ),
    }] : []),
  ]

  return (
    <PageShell
      eyebrow="Kesehatan"
      title={isPkk ? "Manajemen Jadwal Posyandu" : "Jadwal Posyandu"}
      description={isPkk
        ? "Kelola jadwal kegiatan Posyandu di wilayah Anda. Warga lain di RT yang sama akan melihat jadwal ini."
        : "Lihat jadwal kegiatan Posyandu di lingkungan Anda."}
    >
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="w-full lg:w-1/2">
            <CalendarWidget
              schedules={schedules}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              currentMonth={currentMonth}
              currentYear={currentYear}
              onChangeMonth={handleChangeMonth}
            />
          </div>
          <div className="w-full lg:w-1/2">
            <div className="border-2 border-neutral-900 p-6 rounded-xl bg-white shadow-none h-full flex flex-col">
              <h3 className="font-extrabold text-black text-lg mb-4 border-b-2 border-neutral-100 pb-4">
                Kegiatan Tanggal: <span className="text-emerald-600">{selectedDate}</span>
              </h3>
              <div className="flex-grow space-y-3 overflow-y-auto max-h-[300px]">
                {activitiesOnSelectedDate.length === 0 ? (
                  <div className="text-sm font-bold text-neutral-400 py-10 text-center">Tidak ada kegiatan posyandu pada tanggal ini.</div>
                ) : (
                  activitiesOnSelectedDate.map((a) => (
                    <div key={a.id_posyandu_schedule} className="flex items-start justify-between p-3 border rounded-lg bg-neutral-50 gap-3">
                      <div>
                        <p className="font-bold text-black text-sm">{a.nama_kegiatan}</p>
                        <p className="text-xs text-neutral-500 mt-1">
                          {a.jam_mulai ? `Jam ${a.jam_mulai} · ` : ""}{a.lokasi || "Lokasi belum ditentukan"}
                        </p>
                        {a.keterangan && <p className="text-xs text-neutral-500 mt-1">{a.keterangan}</p>}
                        {a.penyelenggara && (
                          <div className="mt-2"><Badge variant="success">{a.penyelenggara}</Badge></div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
              {isPkk && (
                <div className="mt-4 pt-4 border-t-2 border-neutral-100">
                  <Button
                    onClick={openCreate}
                    className="w-full bg-black text-white hover:bg-neutral-800 font-bold rounded-lg py-2"
                  >
                    + Tambah Jadwal ke Tanggal Ini
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        <Card className="border-2 border-neutral-900 shadow-none rounded-xl">
          <CardHeader className="border-b border-neutral-100">
            <CardTitle className="text-xl font-extrabold text-black">Daftar Jadwal Posyandu</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <DataTable
              data={schedules}
              columns={columns}
              searchKeys={["nama_kegiatan", "lokasi", "penyelenggara", "tanggal_jadwal"]}
              searchPlaceholder="Cari kegiatan, lokasi, atau penyelenggara..."
              loading={isLoading}
              emptyMessage="Belum ada jadwal posyandu."
              rowKey="id_posyandu_schedule"
              getRowKey={(row) => row.id_posyandu_schedule || row.id}
            />
          </CardContent>
        </Card>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Jadwal Posyandu" : "Tambah Jadwal Posyandu"}</DialogTitle>
            <DialogDescription>Isi formulir di bawah untuk {editing ? "memperbarui" : "menambahkan"} jadwal kegiatan posyandu.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="id_wilayah" className="text-sm font-bold text-black">Wilayah <span className="text-red-500">*</span></Label>
              <Select value={form.id_wilayah} onValueChange={(value) => setForm({ ...form, id_wilayah: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih wilayah" />
                </SelectTrigger>
                <SelectContent>
                  {wilayahs.map((w) => (
                    <SelectItem key={w.id_wilayah} value={w.id_wilayah}>{w.nama_wilayah}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tanggal_jadwal" className="text-sm font-bold text-black">Tanggal <span className="text-red-500">*</span></Label>
                <Input
                  id="tanggal_jadwal"
                  type="date"
                  required
                  value={form.tanggal_jadwal}
                  onChange={(e) => setForm({ ...form, tanggal_jadwal: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="jam_mulai" className="text-sm font-bold text-black">Jam Mulai</Label>
                <Input
                  id="jam_mulai"
                  type="time"
                  value={form.jam_mulai}
                  onChange={(e) => setForm({ ...form, jam_mulai: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="nama_kegiatan" className="text-sm font-bold text-black">Nama Kegiatan <span className="text-red-500">*</span></Label>
              <Input
                id="nama_kegiatan"
                placeholder="Misal: Posyandu Balita / Penimbangan"
                required
                value={form.nama_kegiatan}
                onChange={(e) => setForm({ ...form, nama_kegiatan: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lokasi" className="text-sm font-bold text-black">Lokasi</Label>
              <Input
                id="lokasi"
                placeholder="Misal: Balai RT / Posyandu Melati"
                value={form.lokasi}
                onChange={(e) => setForm({ ...form, lokasi: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="penyelenggara" className="text-sm font-bold text-black">Penyelenggara</Label>
              <Input
                id="penyelenggara"
                placeholder="Nama Ibu PKK / kader"
                value={form.penyelenggara}
                onChange={(e) => setForm({ ...form, penyelenggara: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="keterangan" className="text-sm font-bold text-black">Keterangan</Label>
              <Textarea
                id="keterangan"
                placeholder="Catatan tambahan (opsional)"
                value={form.keterangan}
                onChange={(e) => setForm({ ...form, keterangan: e.target.value })}
              />
            </div>
            <DialogFooter className="flex-col sm:flex-row gap-3">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Batal</Button>
              <Button type="submit">Simpan Jadwal</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </PageShell>
  )
}
