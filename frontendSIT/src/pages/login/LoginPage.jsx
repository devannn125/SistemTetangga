import { useState } from 'react'
import { Icon } from '@/components/ui/Icon'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Textarea } from '@/components/ui/Textarea'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/Dialog'
import { login, setAuthData } from '@/services/authService'

export function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showRequestDialog, setShowRequestDialog] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [form, setForm] = useState({
    email: '',
    password: '',
  })
  const [requestForm, setRequestForm] = useState({
    name: '',
    nik: '',
    rt: '',
    address: '',
    note: '',
  })
  const [error, setError] = useState('')
  const [requestMessage, setRequestMessage] = useState('')

  function handleChange(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
    setError('')
  }

  function handleRequestChange(event) {
    const { name, value } = event.target
    setRequestForm((current) => ({ ...current, [name]: value }))
    setRequestMessage('')
  }

  function fillDemoAccount(email, password) {
    setForm({ email, password })
    setError('')
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (!form.email.trim() || !form.password.trim()) {
      setError('Email dan kata sandi wajib diisi.')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const response = await login({
        email: form.email,
        password: form.password,
      })

      setAuthData(response)

      const roleKode = (response.data?.role?.kode || '').toLowerCase()
      const roleLower = roleKode === 'warga' ? 'warga' : roleKode
      const fallbackDest =
        roleLower === 'warga'
          ? '/warga'
          : roleLower === 'sekretaris'
            ? '/sek'
            : roleLower === 'bendahara'
              ? '/ben'
              : roleLower === 'dukuh'
                ? '/dukuh'
                : roleLower === 'admin'
                  ? '/dashboard'
                  : `/role/${roleLower}`

      const destination = response.data?.redirect_to || fallbackDest
      window.location.assign(destination)
    } catch (err) {
      setError(err.message || 'Terjadi kesalahan saat masuk.')
    } finally {
      setIsLoading(false)
    }
  }

  function handleRequestSubmit(event) {
    event.preventDefault()

    if (!requestForm.name.trim() || !requestForm.nik.trim() || !requestForm.rt.trim() || !requestForm.address.trim()) {
      setRequestMessage('Nama lengkap, NIK, RT, dan alamat wajib diisi.')
      return
    }

    const requests = JSON.parse(localStorage.getItem('residentRequests') || '[]')
    const newRequest = {
      ...requestForm,
      id: Date.now(),
      status: 'Menunggu persetujuan Ketua RT',
      submittedAt: new Date().toISOString(),
    }

    localStorage.setItem('residentRequests', JSON.stringify([newRequest, ...requests]))
    setRequestForm({ name: '', nik: '', rt: '', address: '', note: '' })
    setRequestMessage('Pengajuan berhasil dikirim ke Ketua RT.')
  }

  return (
    <main className="flex min-h-screen flex-col bg-neutral-100 text-neutral-900">
      <header className="border-b border-neutral-200 bg-neutral-50">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-8 px-6 max-md:h-auto max-md:flex-wrap max-md:py-4">
          <a className="flex items-center gap-2 text-xl font-extrabold text-black no-underline" href="/">
            <Icon name="building" className="h-6 w-6" />
            <span>Kenaran</span>
          </a>

          <Button variant="outline" size="sm" asChild>
            <a href="/">
              <Icon name="home" className="h-4 w-4 mr-2" />
              Kembali ke Beranda
            </a>
          </Button>
        </div>
      </header>

      <section className="grid flex-1 place-items-center px-6 py-10">
        <div className="w-full max-w-[500px]">
          <div className="bg-neutral-900 px-6 py-4 text-xl font-extrabold text-white">
            <span className="inline-flex items-center gap-2">
              <Icon name="key" className="h-5 w-5" />
              Akses Portal
            </span>
          </div>

          <div className="border border-neutral-200 bg-white rounded-xl p-8 max-sm:p-6">
            <div className="text-center">
              <h1 className="text-3xl font-extrabold leading-tight text-black">Masuk</h1>
              <p className="mx-auto mt-3 max-w-xs text-base leading-7 text-neutral-600">
                Silakan masukkan kredensial akun Anda untuk melanjutkan.
              </p>
            </div>

            <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-neutral-700">
                  Email
                </Label>
                <div className="relative">
                  <Icon name="idCard" className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    disabled={isLoading}
                    placeholder="nama@contoh.com"
                    value={form.email}
                    onChange={handleChange}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-medium text-neutral-700">
                    Kata Sandi
                  </Label>
                  <a className="text-xs font-medium text-neutral-500 underline hover:text-sky-700" href="/">
                    Lupa Password?
                  </a>
                </div>
                <div className="relative">
                  <Icon name="lock" className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    disabled={isLoading}
                    placeholder="Masukkan kata sandi"
                    value={form.password}
                    onChange={handleChange}
                    className="pl-10 pr-12"
                  />
                  <button
                    aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-sky-700"
                    disabled={isLoading}
                    onClick={() => setShowPassword((current) => !current)}
                    type="button"
                  >
                    <Icon name={showPassword ? 'eyeOff' : 'eye'} className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {error ? (
                <p className="text-sm font-medium text-red-600 bg-red-50 border border-red-200 p-3 rounded-md">
                  {error}
                </p>
              ) : null}

              <Button
                className="w-full h-11"
                disabled={isLoading}
                type="submit"
              >
                {isLoading ? (
                  'Memproses Masuk...'
                ) : (
                  <>
                    Masuk
                    <Icon name="arrowRight" className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>

              {/* Quick Demo Accounts Helper */}
              <div className="border border-neutral-200 bg-neutral-50 rounded-lg p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-neutral-600">
                  Akun Uji Coba Cepat:
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {[
                    { email: 'siti@example.com', password: 'password', label: 'Warga' },
                    { email: 'admin@sukamaju.test', password: 'password', label: 'Admin' },
                    { email: 'budi@example.com', password: 'password', label: 'Ketua RT' },
                    { email: 'dukuh@sukamaju.test', password: 'password', label: 'Kepala Dukuh' },
                    { email: 'bendahara@example.com', password: 'password', label: 'Bendahara' },
                    { email: 'sekretaris@example.com', password: 'password', label: 'Sekretaris' },
                    { email: 'rudi@example.com', password: 'password', label: 'Ketua RW' },
                  ].map((account) => (
                    <Button
                      key={account.label}
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => fillDemoAccount(account.email, account.password)}
                      type="button"
                    >
                      {account.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="mt-6 border-t border-neutral-200 pt-5 text-center text-sm text-neutral-600">
                Belum terdaftar?{' '}
                <Button
                  variant="ghost"
                  size="sm"
                  className="font-extrabold text-black hover:text-sky-700"
                  onClick={() => {
                    setRequestMessage('')
                    setShowRequestDialog(true)
                  }}
                  type="button"
                >
                  Hubungi Pengurus RT/RW
                </Button>
              </div>
            </form>
          </div>
        </div>
      </section>

      <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
        <DialogContent className="max-w-lg max-h-[86vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Icon name="userPlus" className="h-5 w-5" />
              Pengajuan Warga
            </DialogTitle>
            <DialogDescription>
              Isi formulir berikut untuk mengajukan pendaftaran sebagai warga baru.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleRequestSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-neutral-700">
                Nama Lengkap
              </Label>
              <div className="relative">
                <Icon name="users" className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
                <Input
                  id="name"
                  name="name"
                  placeholder="Masukkan nama lengkap"
                  value={requestForm.name}
                  onChange={handleRequestChange}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nik" className="text-sm font-medium text-neutral-700">
                NIK
              </Label>
              <div className="relative">
                <Icon name="idCard" className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
                <Input
                  id="nik"
                  name="nik"
                  placeholder="Masukkan NIK"
                  value={requestForm.nik}
                  onChange={handleRequestChange}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rt" className="text-sm font-medium text-neutral-700">
                RT Mana
              </Label>
              <div className="relative">
                <Icon name="building" className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
                <Input
                  id="rt"
                  name="rt"
                  placeholder="Contoh: RT 03"
                  value={requestForm.rt}
                  onChange={handleRequestChange}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address" className="text-sm font-medium text-neutral-700">
                Alamat
              </Label>
              <Textarea
                id="address"
                name="address"
                placeholder="Masukkan alamat rumah"
                value={requestForm.address}
                onChange={handleRequestChange}
                className="min-h-[80px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="note" className="text-sm font-medium text-neutral-700">
                Catatan
              </Label>
              <Textarea
                id="note"
                name="note"
                placeholder="Tambahkan keterangan bila diperlukan"
                value={requestForm.note}
                onChange={handleRequestChange}
                className="min-h-[80px]"
              />
            </div>

            {requestMessage ? (
              <p className="text-sm font-medium text-sky-800 bg-sky-50 border border-sky-200 p-3 rounded-md">
                {requestMessage}
              </p>
            ) : null}

            <DialogFooter className="flex-col sm:flex-row gap-3">
              <Button variant="outline" onClick={() => setShowRequestDialog(false)}>
                Batal
              </Button>
              <Button type="submit">Kirim ke Ketua RT</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <footer className="bg-black px-6 py-12 text-neutral-400">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-8 max-md:flex-col max-md:items-start">
          <a className="flex items-center gap-2 text-sm font-extrabold tracking-[0.08em] text-white no-underline" href="/">
            <Icon name="building" className="h-5 w-5" />
            Kenaran
          </a>

          <nav className="flex flex-wrap gap-8 text-xs" aria-label="Tautan portal">
            <a className="text-neutral-400 no-underline transition hover:text-white" href="/">Kebijakan Privasi</a>
            <a className="text-neutral-400 no-underline transition hover:text-white" href="/">Kontak Pengurus</a>
            <a className="text-neutral-400 no-underline transition hover:text-white" href="/">Bantuan</a>
          </nav>

          <p className="text-sm">&copy; 2024 Kenaran. Transparansi & Stabilitas.</p>
        </div>
      </footer>
    </main>
  )
}