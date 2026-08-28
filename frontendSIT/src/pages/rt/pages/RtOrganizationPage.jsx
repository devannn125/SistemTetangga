import { useState, useEffect, useMemo, useCallback } from 'react'
import { PageShell } from '../../../components/layout/PageShell'
import { getOrganizationMembers, createOrganizationMember, deleteOrganizationMember, getUsers, getCitizenMe } from '../../../services/api'
import { useConfirm } from '../../../components/ui/ConfirmContext'
import { useToast } from '../../../components/ui/ToastContext'

const ALL_POSITIONS = [
  'Ketua RT',
  'Sekretaris',
  'Bendahara',
  'Pengurus Siskamling',
  'Ibu PKK',
  'Karang Taruna',
]

export default function RtOrganizationPage() {
  const [members, setMembers] = useState([])
  const [citizens, setCitizens] = useState([])
  const [myWilayah, setMyWilayah] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const confirm = useConfirm()
  const { showToast } = useToast()
  
  const [form, setForm] = useState({ 
    id_citizen: '', 
    jabatan: '', 
    id_wilayah: '', 
    periode_mulai: new Date().toISOString().split('T')[0], 
    status_aktif: true 
  })

  const occupiedPositions = useMemo(() => {
    return members
      .filter(m => m.status_aktif)
      .reduce((acc, m) => {
        const key = `${m.jabatan}-${m.id_wilayah}-${m.periode_mulai}`;
        acc[key] = m;
        return acc;
      }, {});
  }, [members]);

  const isPositionOccupied = useCallback((jabatan, idWilayah, periodeMulai) => {
    return Boolean(occupiedPositions[`${jabatan}-${idWilayah}-${periodeMulai}`]);
  }, [occupiedPositions]);

  async function loadData() {
    setLoading(true)
    try {
      const resMe = await getCitizenMe()
      const wil = resMe?.data?.wilayah || null
      if (!wil?.id_wilayah) {
        throw new Error('Akun Anda tidak terhubung ke data warga/wilayah RT manapun.')
      }
      setMyWilayah(wil)
      setForm(f => ({ ...f, id_wilayah: wil.id_wilayah }))

      const [resM, resUsers] = await Promise.all([
        getOrganizationMembers({ per_page: 100 }),
        getUsers({ per_page: 100 }),
      ])
      
      const arrM = Array.isArray(resM?.data) ? resM.data : Array.isArray(resM) ? resM : []
      const allUsers = Array.isArray(resUsers?.data) ? resUsers.data : Array.isArray(resUsers) ? resUsers : []
      
      const filteredUsers = allUsers.filter(u => {
        const roles = (u.user_roles || []).filter(r => r.status === 'ACTIVE').map(r => r.kode)
        return !roles.includes('ADMIN') && !roles.includes('DUKUH') && !roles.includes('RW')
      })

      const arrC = filteredUsers
        .filter(u => u.id_citizen && u.status === 'ACTIVE')
        .map(u => ({
          id_citizen: u.id_citizen,
          nama_lengkap: u.nama_users
        }))
      
      setMembers(arrM)
      setCitizens(arrC)

      setForm(f => {
        const isActive = (cId) => arrM.some(m => m.status_aktif && (m.id_citizen === cId || m.citizen?.id_citizen === cId))
        const availableCitizens = arrC.filter(c => !isActive(c.id_citizen))
        const isCurrentValid = f.id_citizen && !isActive(f.id_citizen) && arrC.some(c => c.id_citizen === f.id_citizen)
        
        return {
          ...f,
          id_citizen: isCurrentValid ? f.id_citizen : (availableCitizens[0]?.id_citizen || ''),
        }
      })
    } catch (err) {
      console.error(err)
      showToast('Gagal memuat data struktur organisasi: ' + err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    const approved = await confirm({
      title: 'Konfirmasi Simpan',
      message: 'Yakin ingin menunjuk warga ini sebagai "' + form.jabatan + '"? Perubahan pengurus otomatis menyesuaikan hak aksesnya di sistem.',
      confirmLabel: 'Ya, Simpan',
    })
    if (!approved) return
    try {
      const payload = new FormData()
      payload.append('id_citizen', form.id_citizen)
      payload.append('jabatan', form.jabatan)
      payload.append('id_wilayah', form.id_wilayah)
      payload.append('periode_mulai', form.periode_mulai)
      payload.append('status_aktif', form.status_aktif ? '1' : '0')
      if (form.foto) {
        payload.append('foto', form.foto)
      }
      
      await createOrganizationMember(payload)
      showToast('Pengurus berhasil ditambahkan.')
      setIsModalOpen(false)
      loadData()
    } catch (err) {
      showToast('Gagal menyimpan: ' + err.message, 'error')
    }
  }

  async function handleDelete(id) {
    const approved = await confirm({
      title: 'Konfirmasi Cabut',
      message: 'Yakin ingin mencabut pengurus ini dari struktur organisasi?',
      confirmLabel: 'Ya, Cabut',
    })
    if (!approved) return
    try {
      await deleteOrganizationMember(id)
      showToast('Data pengurus berhasil dihapus.')
      loadData()
    } catch (err) {
      showToast('Gagal menghapus: ' + err.message, 'error')
    }
  }

  return (
    <PageShell
      eyebrow="Organisasi"
      title="Struktur Organisasi & Pengurus"
      description="Kelola jabatan dan periode pengurus lingkungan (RT)."
    >
      <section className="mt-6 space-y-6">
        <div className="flex justify-end">
          <button onClick={() => setIsModalOpen(true)} className="rounded-full bg-black px-4 py-2 text-xs font-extrabold uppercase text-white hover:bg-neutral-900">
            + Tambah Pengurus
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {loading ? (
             <div className="col-span-full p-8 text-center text-sm text-neutral-500 bg-white border rounded-xl">Memuat data pengurus...</div>
          ) : members.length === 0 ? (
             <div className="col-span-full p-8 text-center text-sm text-neutral-500 bg-white border rounded-xl">Belum ada data struktur organisasi.</div>
          ) : members.filter(m => m.status_aktif).map(m => (
            <div key={m.id_organization_member || m.id} className="relative flex flex-col items-center rounded-2xl border border-neutral-300 bg-white p-6">
              <span className={`absolute top-4 right-4 h-3 w-3 rounded-full ${m.status_aktif ? 'bg-emerald-500' : 'bg-neutral-300'} z-10`} title={m.status_aktif ? 'Aktif' : 'Nonaktif'} />
              
              <div className="mb-4 flex h-32 w-32 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50 text-4xl font-extrabold text-neutral-300 shadow-sm">
                {m.foto_url ? (
                  <img src={m.foto_url.startsWith('http') ? m.foto_url : (import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://127.0.0.1:8000') + '/storage/' + m.foto_url} alt="Foto" className="h-full w-full object-cover" />
                ) : (
                  m.citizen?.nama_lengkap?.[0] || '?'
                )}
              </div>
              
              <div className="text-center">
                <h3 className="text-lg font-bold text-black">{m.citizen?.nama_lengkap || 'Warga Terhapus'}</h3>
                <p className="mt-1 text-xs font-extrabold uppercase tracking-wide text-sky-600">{m.jabatan}</p>
              </div>

              <div className="mt-6 flex w-full items-center justify-between border-t border-neutral-100 pt-4">
                <p className="text-[10px] font-medium text-neutral-400">Mulai: {m.periode_mulai}</p>
                <button onClick={() => handleDelete(m.id_organization_member || m.id)} className="text-xs font-bold uppercase text-red-600 hover:text-red-700">Cabut</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-black mb-4">Assign Pengurus Baru</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Pilih Warga</label>
                {citizens.length === 0 ? (
                  <p className="w-full border rounded-lg px-3 py-2 text-sm bg-neutral-100 text-neutral-500">Tidak ada warga aktif di RT ini yang dapat ditunjuk.</p>
                ) : (
                  <select required value={form.id_citizen} onChange={e => setForm({...form, id_citizen: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm bg-white">
                    <option value="">-- Pilih Warga --</option>
                    {citizens.map(c => {
                      const isActive = members.some(m => m.status_aktif && (m.id_citizen === c.id_citizen || m.citizen?.id_citizen === c.id_citizen))
                      return (
                        <option key={c.id_citizen} value={c.id_citizen} disabled={isActive}>
                          {c.nama_lengkap} {isActive ? '(Sudah Menjabat)' : ''}
                        </option>
                      )
                    })}
                  </select>
                )}
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Jabatan</label>
                <select 
                  required 
                  value={form.jabatan} 
                  onChange={e => setForm({...form, jabatan: e.target.value})} 
                  className="w-full border rounded-lg px-3 py-2 text-sm bg-white"
                >
                  <option value="">-- Pilih Jabatan --</option>
                  {ALL_POSITIONS.map(pos => (
                    <option 
                      key={pos} 
                      value={pos}
                      disabled={isPositionOccupied(pos, form.id_wilayah, form.periode_mulai)}
                    >
                      {pos} {isPositionOccupied(pos, form.id_wilayah, form.periode_mulai) ? '(Sudah diisi)' : ''}
                    </option>
                  ))}
                </select>
                {form.jabatan && isPositionOccupied(form.jabatan, form.id_wilayah, form.periode_mulai) && (
                  <p className="mt-1 text-xs text-red-600">Jabatan ini sudah dipegang oleh pengurus lain pada periode ini.</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Wilayah (RT)</label>
                <input
                  type="text"
                  readOnly
                  value={myWilayah ? myWilayah.nama_wilayah : ''}
                  title="Struktur organisasi hanya dapat dikelola di RT Anda sendiri"
                  className="w-full border rounded-lg px-3 py-2 text-sm bg-neutral-100 text-neutral-600 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Periode Mulai</label>
                <input type="date" required value={form.periode_mulai} onChange={e => setForm({...form, periode_mulai: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Foto Pengurus</label>
                <input type="file" accept="image/*" onChange={e => setForm({...form, foto: e.target.files[0]})} className="w-full border rounded-lg px-3 py-2 text-sm bg-white" />
              </div>
              <div className="flex items-center gap-2 mt-2">
                <input type="checkbox" id="status" checked={form.status_aktif} onChange={e => setForm({...form, status_aktif: e.target.checked})} />
                <label htmlFor="status" className="text-sm text-black">Status Aktif Menjabat</label>
              </div>
              <div className="mt-6 flex justify-end gap-3 pt-4 border-t">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-xs font-bold text-neutral-600 hover:text-black">BATAL</button>
                <button type="submit" className="rounded-full bg-black px-5 py-2 text-xs font-extrabold uppercase text-white hover:bg-neutral-900" disabled={form.jabatan && isPositionOccupied(form.jabatan, form.id_wilayah, form.periode_mulai)}>
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageShell>
  )
}
