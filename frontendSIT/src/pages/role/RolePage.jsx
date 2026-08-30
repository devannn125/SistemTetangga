import { useState } from 'react'
import { Icon } from '@/components/ui/Icon'
import { Button } from '@/components/ui/Button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/Dialog'
import { clearAuthData, getAuthData, getAuthRole } from '@/services/authService'

export function RolePage({ roleParam }) {
  const authUser = getAuthData()
  const [confirmLogout, setConfirmLogout] = useState(false)
  const currentRole = (
    roleParam ||
    window.location.pathname.replace(/^\/role\/?/, '') ||
    getAuthRole() ||
    'ROLE'
  ).toUpperCase()

  const roleNameMap = {
    ADMIN: 'Administrator',
    RT: 'Ketua RT',
    RW: 'Ketua RW',
    DUKUH: 'Kepala Dukuh',
    WARGA: 'Warga',
  }

  const roleDisplayName = authUser?.role?.nama_role || roleNameMap[currentRole] || currentRole

  function handleLogout() {
    setConfirmLogout(false)
    clearAuthData()
    window.location.assign('/login')
  }

  return (
    <main className="flex min-h-screen flex-col bg-neutral-100 text-neutral-900">
      {/* Header */}
      <header className="border-b border-neutral-200 bg-neutral-50">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-8 px-6 max-md:h-auto max-md:flex-wrap max-md:py-4">
          <a className="flex items-center gap-2 text-2xl font-extrabold text-black no-underline" href="/">
            <Icon name="building" className="h-6 w-6" />
            <span>Kenaran</span>
          </a>

          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" asChild>
              <a href="/">
                <Icon name="home" className="h-4 w-4 mr-2" />
                Beranda
              </a>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-red-600 border-red-300 hover:bg-red-50"
              onClick={() => setConfirmLogout(true)}
              type="button"
            >
              <Icon name="logout" className="h-4 w-4 mr-2" />
              Keluar
            </Button>
          </div>
        </div>
      </header>

      <Dialog open={confirmLogout} onOpenChange={setConfirmLogout}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Keluar</DialogTitle>
            <DialogDescription>Apakah Anda yakin ingin keluar dari akun ini?</DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-3">
            <Button variant="outline" onClick={() => setConfirmLogout(false)}>
              Batal
            </Button>
            <Button variant="destructive" onClick={handleLogout}>
              Keluar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Main Content */}
      <section className="mx-auto flex w-full max-w-4xl flex-1 flex-col justify-center px-6 py-12">
        <div className="border-2 border-neutral-900 bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          {/* Header Banner */}
          <div className="border-b-2 border-neutral-900 bg-black px-8 py-5 text-white">
            <div className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-widest text-sky-400">
                <Icon name="shield" className="h-4 w-4" />
                Portal Peran Pengurus
              </span>
              <span className="rounded border border-neutral-700 bg-neutral-800 px-3 py-1 text-xs font-bold text-neutral-300">
                Akses: {currentRole}
              </span>
            </div>
          </div>

          <div className="p-8 max-sm:p-6">
            {/* The primary required heading */}
            <div className="border-b border-neutral-200 pb-6">
              <p className="text-xs font-extrabold uppercase tracking-widest text-neutral-500">Halaman Peran</p>
              <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-black sm:text-5xl">
                ini page {currentRole}
              </h1>
              <p className="mt-3 text-base text-neutral-600">
                Halaman khusus untuk peran <strong>{roleDisplayName}</strong> ({currentRole}). Fitur dashboard dan menu operasional sedang dalam tahap pengembangan.
              </p>
            </div>

            {/* Authenticated User Details */}
            {authUser ? (
              <div className="mt-6 rounded-none border border-neutral-900 bg-neutral-50 p-6">
                <h2 className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-wider text-black">
                  <Icon name="users" className="h-4 w-4" />
                  Informasi Akun Masuk
                </h2>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div className="border border-neutral-300 bg-white p-3">
                    <p className="text-xs font-semibold uppercase text-neutral-500">Nama Pengguna</p>
                    <p className="mt-1 text-base font-extrabold text-black">{authUser.nama_users || '-'}</p>
                  </div>
                  <div className="border border-neutral-300 bg-white p-3">
                    <p className="text-xs font-semibold uppercase text-neutral-500">Role / Jabatan</p>
                    <p className="mt-1 text-base font-extrabold text-sky-700">
                      {authUser.role?.nama_role || roleDisplayName} ({currentRole})
                    </p>
                  </div>
                  <div className="border border-neutral-300 bg-white p-3">
                    <p className="text-xs font-semibold uppercase text-neutral-500">Email</p>
                    <p className="mt-1 text-base font-medium text-neutral-800">{authUser.email || '-'}</p>
                  </div>
                  <div className="border border-neutral-300 bg-white p-3">
                    <p className="text-xs font-semibold uppercase text-neutral-500">Nomor HP</p>
                    <p className="mt-1 text-base font-medium text-neutral-800">{authUser.no_hp || '-'}</p>
                  </div>
                  {authUser.id_citizen && (
                    <div className="border border-neutral-300 bg-white p-3 sm:col-span-2">
                      <p className="text-xs font-semibold uppercase text-neutral-500">ID Citizen / NIK Terhubung</p>
                      <p className="mt-1 text-base font-mono font-bold text-neutral-800">{authUser.id_citizen}</p>
                    </div>
                  )}
                </div>
              </div>
            ) : null}

            {/* Quick Actions */}
            <div className="mt-8 flex flex-wrap gap-4">
              <Button asChild>
                <a href="/warga">
                  <Icon name="home" className="h-4 w-4 mr-2" />
                  Masuk ke Portal Warga
                </a>
              </Button>

              <Button variant="outline" asChild>
                <a href="/login">
                  <Icon name="key" className="h-4 w-4 mr-2" />
                  Ganti Akun / Login Ulang
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black px-6 py-8 text-neutral-400">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-8 max-md:flex-col max-md:items-start">
          <a className="flex items-center gap-2 text-sm font-extrabold tracking-[0.08em] text-white no-underline" href="/">
            <Icon name="building" className="h-5 w-5" />
            Kenaran
          </a>
          <p className="text-sm">&copy; 2024 Kenaran. Transparansi & Stabilitas.</p>
        </div>
      </footer>
    </main>
  )
}