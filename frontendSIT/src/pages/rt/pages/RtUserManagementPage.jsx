import { useEffect, useState } from 'react'
import { PageShell } from '@/components/layout/PageShell'
import { DataTable } from '@/components/ui/DataTable'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { getUsers, updateUser, assignUserRole, getCitizenMe } from '@/services/api'
import { useConfirm } from '@/components/ui/ConfirmContext'
import { useToast } from '@/components/ui/ToastContext'

const ROLE_OPTIONS = [
  { kode: 'WARGA', label: 'Warga' },
  { kode: 'SISKAMLING', label: 'Pengurus Siskamling' },
  { kode: 'PKK', label: 'Ibu PKK' },
  { kode: 'KARANG_TARUNA', label: 'Karang Taruna' },
]

const STATUS_LABEL = {
  ACTIVE: 'Aktif',
  SUSPENDED: 'Tersuspend',
  PENDING_VERIFICATION: 'Menunggu Verifikasi',
  INACTIVE: 'Nonaktif',
}

const STATUS_VARIANT = {
  ACTIVE: 'success',
  SUSPENDED: 'danger',
  PENDING_VERIFICATION: 'warning',
  INACTIVE: 'default',
}

const FILTERS = [
  {
    key: 'status',
    label: 'Status',
    options: [
      { value: 'ACTIVE', label: 'Aktif' },
      { value: 'SUSPENDED', label: 'Tersuspend' },
      { value: 'PENDING_VERIFICATION', label: 'Menunggu Verifikasi' },
      { value: 'INACTIVE', label: 'Nonaktif' },
    ],
  },
]

function getRoleConfirmMessage(roleLabel) {
  if (roleLabel === 'Pengurus Siskamling') {
    return `Tunjuk warga ini sebagai Pengurus Siskamling? Ia mendapat wewenang tambahan: mengusulkan jadwal ronda, check-in presensi GPS, melaporkan kejadian, dan panic button.`
  }
  if (roleLabel === 'Ibu PKK' || roleLabel === 'Karang Taruna') {
    return `Tunjuk warga ini sebagai ${roleLabel}? Peran khusus ini akan tercatat di sistem dan hak aksesnya otomatis disesuaikan.`
  }
  return `Ubah peran warga ini menjadi "${roleLabel}"? Peran khusus lain yang aktif akan otomatis diakhiri.`
}

function currentRoleCode(user) {
  const actives = (user.user_roles || []).filter((r) => r.status === 'ACTIVE')
  const custom = actives.find((r) => ROLE_OPTIONS.some((o) => o.kode === r.kode && o.kode !== 'WARGA'))
  return custom?.kode || 'WARGA'
}

function isVerifiedRw(user) {
  return ['VERIFIED_RW', 'APPROVED_DUKUH'].includes(user.citizen?.status_verifikasi)
}

function canActivate(user) {
  // Warga yang belum diverifikasi Ketua RW / disetujui Dukuh tidak boleh diaktifkan akunnya.
  return isVerifiedRw(user)
}

export default function RtUserManagementPage() {
  const [users, setUsers] = useState([])
  const [myWilayahName, setMyWilayahName] = useState('')
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [processingId, setProcessingId] = useState('')
  const confirm = useConfirm()
  const { showToast } = useToast()

  async function loadData() {
    setIsLoading(true)
    setError(null)
    try {
      const [resUsers, resMe] = await Promise.all([
        getUsers({ per_page: 100 }),
        getCitizenMe().catch(() => null),
      ])
      const arr = Array.isArray(resUsers?.data) ? resUsers.data : Array.isArray(resUsers) ? resUsers : []
      const filteredUsers = arr.filter((u) => {
        const roles = (u.user_roles || []).filter((r) => r.status === 'ACTIVE').map((r) => r.kode)
        return !roles.includes('ADMIN') && !roles.includes('DUKUH') && !roles.includes('RW')
      })
      setUsers(filteredUsers)
      setMyWilayahName(resMe?.data?.wilayah?.nama_wilayah || '')
    } catch (err) {
      setError(err.message || 'Gagal memuat data pengguna.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

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
      message: `Reset password akun "${user.nama_users}" menjadi default (123456)?`,
      confirmLabel: 'Ya, Reset',
    })
    if (!approved) return
    setProcessingId(user.id_users)
    try {
      await updateUser(user.id_users, buildUpdatePayload(user, { password: '123456', status: user.status }))
      showToast('Password berhasil di-reset menjadi default (123456).')
    } catch (err) {
      showToast(err.message || 'Gagal mereset password.', 'error')
    } finally {
      setProcessingId('')
    }
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

  const COLUMNS = [
    {
      key: 'nama_users',
      label: 'Nama Warga',
      render: (value, row) => (
        <div>
          <p className="font-medium text-neutral-900">{row.citizen?.nama_lengkap || value}</p>
          <p className="text-xs text-neutral-400">{row.citizen?.wilayah?.nama_wilayah || '-'} Â· {row.no_hp}</p>
        </div>
      ),
    },
    {
      key: 'user_roles',
      label: 'Role Aktif',
      render: (value, row) => {
        const actives = (value || []).filter((r) => r.status === 'ACTIVE')
        const hasPengurus = actives.some((r) => r.kode !== 'WARGA')
        const displayRoles = hasPengurus ? actives.filter((r) => r.kode !== 'WARGA') : actives
        return (
          <div className="flex flex-wrap gap-1">
            {displayRoles.length === 0 ? (
              <span className="text-xs italic text-neutral-400">Tanpa role</span>
            ) : (
              displayRoles.map((r) => (
                <Badge key={r.id_user_role} variant="info">
                  {ROLE_OPTIONS.find((o) => o.kode === r.kode)?.label || r.nama_role || r.kode}
                </Badge>
              ))
            )}
          </div>
        )
      },
    },
    {
      key: 'status',
      label: 'Status',
      render: (value, row) => (
        <Badge variant={STATUS_VARIANT[value] || 'default'}>
          {STATUS_LABEL[value] || value}
        </Badge>
      ),
    },
    {
      key: 'verifikasi',
      label: 'Verifikasi Warga',
      render: (value, row) => {
        const sv = row.citizen?.status_verifikasi
        if (sv === 'VERIFIED_RW') return <Badge variant="success">Terverifikasi RW</Badge>
        if (sv === 'APPROVED_DUKUH') return <Badge variant="success">Disetujui Dukuh</Badge>
        return <Badge variant="warning">Belum Verifikasi RW</Badge>
      },
    },
    {
      key: 'role_assign',
      label: 'Tunjuk Peran',
      render: (value, row) => {
        const isStructural = ['SEKRETARIS', 'BENDAHARA'].includes(currentRoleCode(row))
        return (
          <select
            value={currentRoleCode(row)}
            disabled={processingId === row.id_users || isStructural}
            onChange={(e) => handleAssignRole(row, e.target.value)}
            title={isStructural ? 'Jabatan struktural hanya dapat diubah melalui menu Struktur Organisasi' : ''}
            className="h-8 rounded-md border border-neutral-300 bg-white px-2 text-xs font-medium focus:border-sky-500 focus:outline-none disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-400"
          >
            {ROLE_OPTIONS.map((o) => (
              <option key={o.kode} value={o.kode}>{o.label}</option>
            ))}
          </select>
        )
      },
    },
    {
      key: 'actions',
      label: 'Aksi',
      render: (value, row) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            disabled={processingId === row.id_users}
            onClick={(e) => { e.stopPropagation(); handleResetPassword(row) }}
          >
            Reset PW
          </Button>
          <Button
            variant={row.status === 'ACTIVE' ? 'danger' : 'success'}
            size="sm"
            disabled={processingId === row.id_users || (row.status !== 'ACTIVE' && !canActivate(row))}
            title={row.status !== 'ACTIVE' && !canActivate(row) ? 'Akun belum dapat diaktifkan sebelum warga diverifikasi Ketua RW / disetujui Dukuh' : ''}
            onClick={(e) => { e.stopPropagation(); handleToggleStatus(row) }}
          >
            {row.status === 'ACTIVE' ? 'Suspend' : 'Aktifkan'}
          </Button>
        </div>
      ),
    },
  ]

  return (
    <PageShell
      eyebrow="Sistem"
      title="Manajemen User (Level RT)"
      description={
        myWilayahName
          ? `Kelola akun warga ${myWilayahName}: suspend akun, reset password, dan tunjuk peran khusus.`
          : 'Kelola akun warga di lingkup RT Anda: suspend akun, reset password, dan tunjuk peran khusus.'
      }
    >
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Daftar Akun Warga</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              data={users}
              columns={COLUMNS}
              searchKeys={['nama_users']}
              searchPlaceholder="Cari nama atau nomor HP..."
              filters={FILTERS}
              loading={isLoading}
              error={error}
              emptyMessage="Belum ada akun warga di lingkup RT Anda."
              rowKey="id_users"
            />
          </CardContent>
        </Card>
        {!isLoading && !error && users.length > 0 && (
          <Alert variant="info">
            Jabatan Sekretaris & Bendahara diatur melalui menu Struktur Organisasi. Akun dengan role Ketua RT/RW/Kelurahan/Admin juga dikelola di sana.
          </Alert>
        )}
      </div>
    </PageShell>
  )
}
