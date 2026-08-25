import { useEffect, useState } from 'react'
import { PageShell } from '../../../components/layout/PageShell'
import { getUsers, updateUser, assignUserRole, getCitizenMe } from '../../../services/api'
import { useConfirm } from '../../../components/ui/ConfirmContext'
import { useToast } from '../../../components/ui/ToastContext'

const ROLE_OPTIONS = [
  { kode: 'WARGA', label: 'Warga' },
  { kode: 'SISKAMLING', label: 'Pengurus Siskamling' },
  { kode: 'PKK', label: 'Ibu PKK' },
  { kode: 'KARANG_TARUNA', label: 'Karang Taruna' },
  { kode: 'SEKRETARIS', label: 'Sekretaris RT' },
  { kode: 'BENDAHARA', label: 'Bendahara RT' },
]

const STATUS_LABEL = {
  ACTIVE: 'AKTIF',
  SUSPENDED: 'DISPENSASI',
  PENDING_VERIFICATION: 'MENUNGGU VERIFIKASI',
  INACTIVE: 'NONAKTIF',
}

function getStatusClass(status) {
  return {
    ACTIVE: 'bg-emerald-100 text-emerald-900',
    SUSPENDED: 'bg-red-100 text-red-900',
    PENDING_VERIFICATION: 'bg-amber-100 text-amber-900',
    INACTIVE: 'bg-neutral-200 text-neutral-600',
  }[status] || 'bg-neutral-100 text-neutral-900'
}

function getRoleConfirmMessage(roleLabel) {
  if (roleLabel === 'Pengurus Siskamling') {
    return `Tunjuk warga ini sebagai Pengurus Siskamling? Ia mendapat wewenang tambahan: mengusulkan jadwal ronda, check-in presensi GPS, melaporkan kejadian, dan panic button. Pengesahan jadwal final tetap wewenang Anda.`
  }
  if (roleLabel === 'Sekretaris RT' || roleLabel === 'Bendahara RT') {
    return `Tunjuk warga ini sebagai ${roleLabel}? Jabatan strategis hanya boleh dipegang satu orang aktif per periode dan akan tercatat di Struktur Organisasi.`
  }
  return `Ubah peran warga ini menjadi "${roleLabel}"? Peran khusus lain yang aktif akan otomatis diakhiri.`
}

export default function RtUserManagementPage() {
  const [users, setUsers] = useState([])
  const [myWilayahName, setMyWilayahName] = useState('')
  const [notice, setNotice] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [processingId, setProcessingId] = useState('')
  const confirm = useConfirm()
  const { showToast } = useToast()

  async function loadData() {
    setIsLoading(true)
    try {
      const [resUsers, resMe] = await Promise.all([
        getUsers({ per_page: 100 }),
        getCitizenMe().catch(() => null),
      ])

      const arr = Array.isArray(resUsers?.data) ? resUsers.data : Array.isArray(resUsers) ? resUsers : []
      setUsers(arr)
      setMyWilayahName(resMe?.data?.wilayah?.nama_wilayah || '')
      setNotice('')
    } catch (err) {
      setNotice(err.message || 'Gagal memuat data pengguna.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  function buildUpdatePayload(user, overrides = {}) {
    return {
      nama_users: user.nama_users,
      no_hp: user.no_hp,
      email: user.email || null,
      auth_provider: user.auth_provider || 'EMAIL',
      ...overrides,
    }
  }

  async function handleToggleStatus(user) {
    const suspending = user.status === 'ACTIVE'
    const approved = await confirm({
      title: suspending ? 'Konfirmasi Suspensi' : 'Konfirmasi Aktivasi',
      message: suspending
        ? `Suspensi akun "${user.nama_users}"? Akun tidak dapat login sampai diaktifkan kembali.`
        : `Aktifkan kembali akun "${user.nama_users}"?`,
      confirmLabel: suspending ? 'Ya, Suspend' : 'Ya, Aktifkan',
    })
    if (!approved) return

    setProcessingId(user.id_users)
    try {
      await updateUser(user.id_users, buildUpdatePayload(user, { status: suspending ? 'SUSPENDED' : 'ACTIVE' }))
      showToast(`Akun berhasil ${suspending ? 'disuspend' : 'diaktifkan'}.`)
      loadData()
    } catch (err) {
      showToast(err.message || 'Gagal memperbarui status akun.', 'error')
    } finally {
      setProcessingId('')
    }
  }

  async function handleResetPassword(user) {
    const approved = await confirm({
      title: 'Konfirmasi Reset Password',
      message: `Reset password akun "${user.nama_users}" menjadi default (123456)? Warga disarankan menggantinya setelah login.`,
      confirmLabel: 'Ya, Reset',
    })
    if (!approved) return

    setProcessingId(user.id_users)
    try {
      await updateUser(user.id_users, buildUpdatePayload(user, { password: '123456' }))
      showToast('Password berhasil di-reset menjadi default (123456).')
    } catch (err) {
      showToast(err.message || 'Gagal mereset password.', 'error')
    } finally {
      setProcessingId('')
    }
  }

  function currentRoleCode(user) {
    const actives = (user.user_roles || []).filter((r) => r.status === 'ACTIVE')
    const custom = actives.find((r) => ROLE_OPTIONS.some((o) => o.kode === r.kode && o.kode !== 'WARGA'))
    return custom?.kode || 'WARGA'
  }

  async function handleAssignRole(user, nextKode) {
    const prevKode = currentRoleCode(user)
    if (nextKode === prevKode) return

    const option = ROLE_OPTIONS.find((o) => o.kode === nextKode)
    const approved = await confirm({
      title: 'Konfirmasi Penunjukan',
      message: getRoleConfirmMessage(option?.label || nextKode),
      confirmLabel: 'Ya, Tunjuk',
    })
    if (!approved) return

    setProcessingId(user.id_users)
    try {
      await assignUserRole(user.id_users, nextKode)
      showToast(`Peran "${option?.label || nextKode}" berhasil ditetapkan untuk ${user.nama_users}.`)
      loadData()
    } catch (err) {
      showToast(err.message || 'Gagal menetapkan peran.', 'error')
      loadData()
    } finally {
      setProcessingId('')
    }
  }

  return (
    <PageShell
      eyebrow="Sistem"
      title="Manajemen User (Level RT)"
      description={myWilayahName
        ? `Kelola akun warga ${myWilayahName}: suspen akun, reset password, dan tunjuk peran khusus (Pengurus Siskamling, Ibu PKK, Karang Taruna, Sekretaris, Bendahara).`
        : 'Kelola akun warga di lingkup RT Anda: suspen akun, reset password, dan tunjuk peran khusus.'}
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
                <th className="px-4 py-3 font-semibold text-neutral-600">Nama Warga</th>
                <th className="px-4 py-3 font-semibold text-neutral-600">Role Aktif</th>
                <th className="px-4 py-3 font-semibold text-neutral-600">Status</th>
                <th className="px-4 py-3 font-semibold text-neutral-600">Tunjuk Peran</th>
                <th className="px-4 py-3 font-semibold text-neutral-600">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {isLoading ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-neutral-500">Memuat data pengguna...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-neutral-500">Belum ada akun warga di lingkup RT Anda.</td></tr>
              ) : users.map((u) => {
                const actives = (u.user_roles || []).filter((r) => r.status === 'ACTIVE')
                return (
                  <tr key={u.id_users} className={u.status !== 'ACTIVE' ? 'bg-neutral-50 opacity-70' : ''}>
                    <td className="px-4 py-3">
                      <div className="font-medium text-black">{u.citizen?.nama_lengkap || u.nama_users}</div>
                      <div className="text-xs text-neutral-500">{u.citizen?.wilayah?.nama_wilayah || '-'} · {u.no_hp}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {actives.length === 0 ? (
                          <span className="text-xs italic text-neutral-400">Tanpa role</span>
                        ) : actives.map((r) => (
                          <span key={r.id_user_role} className="rounded-full bg-sky-100 px-2 py-0.5 text-xs font-bold text-sky-900">
                            {ROLE_OPTIONS.find((o) => o.kode === r.kode)?.label || r.nama_role || r.kode}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${getStatusClass(u.status)}`}>
                        {STATUS_LABEL[u.status] || u.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={currentRoleCode(u)}
                        disabled={processingId === u.id_users}
                        onChange={(e) => handleAssignRole(u, e.target.value)}
                        className="border rounded px-2 py-1 text-xs font-bold bg-white"
                      >
                        {ROLE_OPTIONS.map((o) => (
                          <option key={o.kode} value={o.kode}>{o.label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleResetPassword(u)}
                          disabled={processingId === u.id_users}
                          className="text-sky-600 font-bold uppercase text-xs disabled:opacity-50"
                        >
                          Reset Password
                        </button>
                        <button
                          onClick={() => handleToggleStatus(u)}
                          disabled={processingId === u.id_users}
                          className={`font-bold uppercase text-xs disabled:opacity-50 ${u.status === 'ACTIVE' ? 'text-red-600' : 'text-emerald-600'}`}
                        >
                          {u.status === 'ACTIVE' ? 'Suspend' : 'Aktifkan'}
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {!isLoading && !notice && users.length > 0 && (
          <p className="text-xs text-neutral-500">
            Catatan: akun dengan role Ketua RT/RW/Kelurahan/Admin dikelola melalui Struktur Organisasi dan tidak dapat diubah dari halaman ini.
          </p>
        )}
      </section>
    </PageShell>
  )
}
