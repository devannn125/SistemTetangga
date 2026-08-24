import { useState } from 'react'
import { PageShell } from '../../../components/layout/PageShell'

const initialUsers = [
  { id: 1, name: 'Budi Santoso', role: 'WARGA', status: 'AKTIF' },
  { id: 2, name: 'Andi Mulyono', role: 'WARGA', status: 'AKTIF' },
  { id: 3, name: 'Siti Aminah', role: 'SEKRETARIS', status: 'AKTIF' },
]

export default function RtUserManagementPage() {
  const [users, setUsers] = useState(initialUsers)
  const [notice, setNotice] = useState('')

  function handleSuspend(id) {
    setUsers(users.map(u => u.id === id ? { ...u, status: u.status === 'AKTIF' ? 'SUSPENDED' : 'AKTIF' } : u))
    setNotice('Status akun berhasil diubah (Suspension aktif/non-aktif).')
  }

  function handleAssignRole(id, role) {
    setUsers(users.map(u => u.id === id ? { ...u, role } : u))
    setNotice(`Role pengguna berhasil diubah menjadi ${role}.`)
  }

  function handleResetPassword(id) {
    setNotice('Password berhasil di-reset menjadi default (123456).')
  }

  return (
    <PageShell
      eyebrow="Sistem"
      title="Manajemen User (Level RT)"
      description="Suspen akun warga, atur ulang password, dan tetapkan role khusus (Sekretaris atau Bendahara RT). Peringatan: RT tidak memiliki hak untuk menghapus akun."
    >
      <section className="mt-8 space-y-6">
        {notice && (
          <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-semibold text-sky-900">
            {notice}
          </div>
        )}

        <div className="rounded-xl border bg-white overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-50 border-b">
              <tr>
                <th className="px-4 py-3 font-semibold text-neutral-600">Nama Pengguna</th>
                <th className="px-4 py-3 font-semibold text-neutral-600">Role</th>
                <th className="px-4 py-3 font-semibold text-neutral-600">Status</th>
                <th className="px-4 py-3 font-semibold text-neutral-600">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {users.map(u => (
                <tr key={u.id} className={u.status === 'SUSPENDED' ? 'bg-neutral-50 opacity-70' : ''}>
                  <td className="px-4 py-3 font-medium text-black">{u.name}</td>
                  <td className="px-4 py-3">
                    <select 
                      value={u.role} 
                      onChange={(e) => handleAssignRole(u.id, e.target.value)}
                      className="border rounded px-2 py-1 text-xs font-bold"
                    >
                      <option value="WARGA">WARGA</option>
                      <option value="SEKRETARIS">SEKRETARIS RT</option>
                      <option value="BENDAHARA">BENDAHARA RT</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${u.status === 'AKTIF' ? 'bg-emerald-100 text-emerald-900' : 'bg-red-100 text-red-900'}`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <button onClick={() => handleResetPassword(u.id)} className="text-sky-600 font-bold uppercase text-xs">Reset Password</button>
                      <button onClick={() => handleSuspend(u.id)} className={`font-bold uppercase text-xs ${u.status === 'AKTIF' ? 'text-red-600' : 'text-emerald-600'}`}>
                        {u.status === 'AKTIF' ? 'Suspend' : 'Aktifkan'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </PageShell>
  )
}
