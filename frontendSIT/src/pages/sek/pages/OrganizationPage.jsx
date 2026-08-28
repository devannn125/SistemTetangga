import { useState, useEffect, useMemo } from 'react'
import { PageShell } from '../../../components/layout/PageShell'
import { getOrganizationMembers, getUsers } from '../../../services/api'

export default function OrganizationPage() {
const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)

  async function loadData() {
    try {
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

      // Merge citizen names into members for display
      const membersWithNames = arrM.map(m => {
        const citizen = arrC.find(c => c.id_citizen === (m.id_citizen || m.citizen?.id_citizen))
        return {
          ...m,
          citizen: citizen ? { ...m.citizen, nama_lengkap: citizen.nama_lengkap } : m.citizen
        }
      })

      setMembers(membersWithNames)
    } catch (err) {
      console.error(err)
      // Notice not shown to avoid toast dependency
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData()
  }, [])

  const activeMembers = useMemo(() => members.filter(m => m.status_aktif), [members])

  return (
    <PageShell
      eyebrow="Organisasi"
      title="Struktur Organisasi & Pengurus"
      description="Daftar pengurus RT (Read-only). Penunjukan dan pergantian pengurus dikelola oleh Ketua RT."
    >
      <section className="mt-6 space-y-6">

        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {loading ? (
             <div className="col-span-full p-8 text-center text-sm text-neutral-500 bg-white border rounded-xl">Memuat data pengurus...</div>
          ) : activeMembers.length === 0 ? (
             <div className="col-span-full p-8 text-center text-sm text-neutral-500 bg-white border rounded-xl">Belum ada data struktur organisasi.</div>
          ) : activeMembers.map(m => (
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
                {m.periode_selesai && <p className="text-[10px] font-medium text-neutral-400">Selesai: {m.periode_selesai}</p>}
              </div>
            </div>
          ))}
        </div>
      </section>
    </PageShell>
  )
}