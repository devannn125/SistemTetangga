import { useState } from 'react'
import { Icon } from '../../components/ui/Icon'
import { login, setAuthData } from '../../services/authService'

function PortalInput({
  action,
  disabled = false,
  icon,
  id,
  label,
  onChange,
  placeholder,
  type = 'text',
  value,
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-4">
        <label className="flex items-center gap-2 text-sm font-extrabold text-black" htmlFor={id}>
          <span className="h-1.5 w-1.5 bg-black" />
          {label}
        </label>
        {action}
      </div>

      <div className="flex h-[52px] items-center gap-3 border border-neutral-900 bg-neutral-50 px-3 text-neutral-500 transition focus-within:border-sky-600 focus-within:bg-white focus-within:text-sky-700">
        <Icon name={icon} className="h-5 w-5" />
        <input
          className="min-w-0 flex-1 border-0 bg-transparent text-base font-medium text-neutral-800 outline-0 placeholder:text-neutral-500 disabled:opacity-50"
          disabled={disabled}
          id={id}
          name={id}
          onChange={onChange}
          placeholder={placeholder}
          type={type}
          value={value}
        />
      </div>
    </div>
  )
}

export function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showRequestDialog, setShowRequestDialog] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [form, setForm] = useState({
    nik: '',
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

  function fillDemoAccount(identifier, password) {
    setForm({
      nik: identifier,
      password,
    })
    setError('')
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (!form.nik.trim() || !form.password.trim()) {
      setError('NIK/Email/ID dan kata sandi wajib diisi.')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const response = await login({
        identifier: form.nik,
        password: form.password,
      })

      // Save user session (incl. access_token) to localStorage
      setAuthData(response)

      // Role otomatis ditentukan backend; redirect mengikuti kode role akun.
      const roleKode = (response.data?.role?.kode || '').toLowerCase()
      const roleLower = roleKode === 'warga' ? 'warga' : roleKode
      const fallbackDest =
        roleLower === 'warga'
          ? '/warga'
          : ['admin', 'dukuh'].includes(roleLower)
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
      <header className="border-b border-neutral-900 bg-neutral-50">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-8 px-6 max-md:h-auto max-md:flex-wrap max-md:py-4">
          <a className="flex items-center gap-2 text-2xl font-extrabold text-black no-underline" href="/">
            <Icon name="building" className="h-6 w-6" />
            <span>SIW MASYARAKAT</span>
          </a>

          <a
            className="inline-flex h-10 items-center gap-2 border border-black bg-black px-4 text-xs font-extrabold text-white transition hover:border-sky-600 hover:bg-sky-600"
            href="/"
          >
            <Icon name="home" className="h-4 w-4" />
            Kembali ke Beranda
          </a>
        </div>
      </header>

      <section className="grid flex-1 place-items-center px-6 py-10">
        <div className="w-full max-w-[500px]">
          <div className="bg-black px-9 py-4 text-2xl font-extrabold text-white">
            <span className="inline-flex items-center gap-2">
              <Icon name="key" className="h-5 w-5" />
              Akses Portal
            </span>
          </div>

          <form className="border-2 border-neutral-900 bg-white px-10 py-10 max-sm:px-6" onSubmit={handleSubmit}>
            <div className="text-center">
              <h1 className="text-4xl font-extrabold leading-tight text-black">Masuk</h1>
              <p className="mx-auto mt-3 max-w-xs text-base leading-7 text-neutral-600">
                Silakan masukkan kredensial akun Anda untuk melanjutkan.
              </p>
            </div>

            <div className="mt-8 flex flex-col gap-5">
              <PortalInput
                disabled={isLoading}
                icon="idCard"
                id="nik"
                label="Nomor NIK / Email / No. HP / ID"
                onChange={handleChange}
                placeholder="Contoh: 3471000000000001 atau email"
                value={form.nik}
              />

              <div>
                <div className="mb-2 flex items-center justify-between gap-4">
                  <label className="flex items-center gap-2 text-sm font-extrabold text-black" htmlFor="password">
                    <span className="h-1.5 w-1.5 bg-black" />
                    Kata Sandi
                  </label>
                  <a className="text-xs font-medium text-neutral-500 underline transition hover:text-sky-700" href="/">
                    Lupa Password?
                  </a>
                </div>

                <div className="flex h-[52px] items-center gap-3 border border-neutral-900 bg-neutral-50 px-3 text-neutral-500 transition focus-within:border-sky-600 focus-within:bg-white focus-within:text-sky-700">
                  <Icon name="lock" className="h-5 w-5" />
                  <input
                    className="min-w-0 flex-1 border-0 bg-transparent text-base font-medium text-neutral-800 outline-0 placeholder:text-neutral-500 disabled:opacity-50"
                    disabled={isLoading}
                    id="password"
                    name="password"
                    onChange={handleChange}
                    placeholder="Masukkan kata sandi"
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                  />
                  <button
                    aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                    className="grid h-8 w-8 place-items-center text-neutral-500 transition hover:text-sky-700"
                    disabled={isLoading}
                    onClick={() => setShowPassword((current) => !current)}
                    type="button"
                  >
                    <Icon name={showPassword ? 'eyeOff' : 'eye'} className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>

            {error ? (
              <p className="mt-5 border border-red-700 bg-red-50 px-4 py-3 text-sm font-bold text-red-800">
                {error}
              </p>
            ) : null}

            <button
              className="mt-8 flex h-[50px] w-full items-center justify-center gap-2 border border-black bg-black text-sm font-extrabold text-white transition hover:border-sky-600 hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isLoading}
              type="submit"
            >
              {isLoading ? (
                <span>Memproses Masuk...</span>
              ) : (
                <>
                  <span>Masuk</span>
                  <Icon name="arrowRight" className="h-4 w-4" />
                </>
              )}
            </button>

            {/* Quick Demo Accounts Helper */}
            <div className="mt-6 border border-neutral-300 bg-neutral-50 p-4">
              <p className="text-xs font-extrabold uppercase tracking-wider text-neutral-600">
                Akun Uji Coba Cepat:
              </p>
              <div className="mt-2 flex flex-wrap gap-2 text-xs">
                <button
                  className="border border-neutral-400 bg-white px-2.5 py-1 font-semibold text-neutral-800 transition hover:border-black hover:bg-neutral-100"
                  onClick={() => fillDemoAccount('3471000000000002', 'password')}
                  type="button"
                >
                  Warga
                </button>
                <button
                  className="border border-neutral-400 bg-white px-2.5 py-1 font-semibold text-neutral-800 transition hover:border-black hover:bg-neutral-100"
                  onClick={() => fillDemoAccount('admin@sukamaju.test', 'password')}
                  type="button"
                >
                  Admin
                </button>
                <button
                  className="border border-neutral-400 bg-white px-2.5 py-1 font-semibold text-neutral-800 transition hover:border-black hover:bg-neutral-100"
                  onClick={() => fillDemoAccount('budi@example.com', 'password')}
                  type="button"
                >
                  Ketua RT
                </button>
                <button
                  className="border border-neutral-400 bg-white px-2.5 py-1 font-semibold text-neutral-800 transition hover:border-black hover:bg-neutral-100"
                  onClick={() => fillDemoAccount('dukuh@sukamaju.test', 'password')}
                  type="button"
                >
                  Kepala Dukuh
                </button>
                <button
                  className="border border-neutral-400 bg-white px-2.5 py-1 font-semibold text-neutral-800 transition hover:border-black hover:bg-neutral-100"
                  onClick={() => fillDemoAccount('rudi@example.com', 'password')}
                  type="button"
                >
                  Ketua RW
                </button>
              </div>
            </div>

            <div className="mt-6 border-t border-neutral-300 pt-5 text-center text-sm text-neutral-600">
              Belum terdaftar?
              <button
                className="ml-2 font-extrabold text-black underline-offset-4 transition hover:text-sky-700"
                onClick={() => {
                  setRequestMessage('')
                  setShowRequestDialog(true)
                }}
                type="button"
              >
                Hubungi Pengurus RT/RW
              </button>
            </div>
          </form>
        </div>
      </section>

      {showRequestDialog ? (
        <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/45 px-4 py-8 backdrop-blur-sm">
          <div className="max-h-[86vh] w-full max-w-lg overflow-hidden border-2 border-neutral-900 bg-white shadow-2xl">
            <div className="flex items-center justify-between gap-4 border-b border-neutral-900 bg-black px-6 py-4 text-white">
              <h2 className="flex items-center gap-2 text-xl font-extrabold">
                <Icon name="userPlus" className="h-5 w-5" />
                Pengajuan Warga
              </h2>
              <button
                aria-label="Tutup dialog"
                className="grid h-9 w-9 place-items-center border border-white/70 text-lg font-extrabold transition hover:bg-white hover:text-black"
                onClick={() => setShowRequestDialog(false)}
                type="button"
              >
                x
              </button>
            </div>

            <form className="max-h-[calc(86vh-73px)] overflow-y-auto p-5" onSubmit={handleRequestSubmit}>
              <div className="grid gap-4">
                <PortalInput
                  icon="users"
                  id="name"
                  label="Nama Lengkap"
                  onChange={handleRequestChange}
                  placeholder="Masukkan nama lengkap"
                  value={requestForm.name}
                />
                <PortalInput
                  icon="idCard"
                  id="nik"
                  label="NIK"
                  onChange={handleRequestChange}
                  placeholder="Masukkan NIK"
                  value={requestForm.nik}
                />
                <PortalInput
                  icon="building"
                  id="rt"
                  label="RT Mana"
                  onChange={handleRequestChange}
                  placeholder="Contoh: RT 03"
                  value={requestForm.rt}
                />

                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-extrabold text-black" htmlFor="address">
                    <span className="h-1.5 w-1.5 bg-black" />
                    Alamat
                  </label>
                  <textarea
                    className="min-h-20 w-full resize-none border border-neutral-900 bg-neutral-50 px-3 py-3 text-base font-medium text-neutral-800 outline-0 placeholder:text-neutral-500 focus:border-sky-600 focus:bg-white"
                    id="address"
                    name="address"
                    onChange={handleRequestChange}
                    placeholder="Masukkan alamat rumah"
                    value={requestForm.address}
                  />
                </div>

                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-extrabold text-black" htmlFor="note">
                    <span className="h-1.5 w-1.5 bg-black" />
                    Catatan
                  </label>
                  <textarea
                    className="min-h-20 w-full resize-none border border-neutral-900 bg-neutral-50 px-3 py-3 text-base font-medium text-neutral-800 outline-0 placeholder:text-neutral-500 focus:border-sky-600 focus:bg-white"
                    id="note"
                    name="note"
                    onChange={handleRequestChange}
                    placeholder="Tambahkan keterangan bila diperlukan"
                    value={requestForm.note}
                  />
                </div>
              </div>

              {requestMessage ? (
                <p className="mt-5 border border-sky-700 bg-sky-50 px-4 py-3 text-sm font-bold text-sky-800">
                  {requestMessage}
                </p>
              ) : null}

              <div className="mt-6 flex justify-end gap-3 max-sm:flex-col">
                <button
                  className="h-11 border border-neutral-900 px-5 text-sm font-extrabold text-black transition hover:border-sky-600 hover:text-sky-700"
                  onClick={() => setShowRequestDialog(false)}
                  type="button"
                >
                  Batal
                </button>
                <button
                  className="h-11 border border-black bg-black px-5 text-sm font-extrabold text-white transition hover:border-sky-600 hover:bg-sky-600"
                  type="submit"
                >
                  Kirim ke Ketua RT
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      <footer className="bg-black px-6 py-12 text-neutral-400">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-8 max-md:flex-col max-md:items-start">
          <a className="flex items-center gap-2 text-sm font-extrabold tracking-[0.08em] text-white no-underline" href="/">
            <Icon name="building" className="h-5 w-5" />
            SIW MASYARAKAT
          </a>

          <nav className="flex flex-wrap gap-8 text-xs" aria-label="Tautan portal">
            <a className="text-neutral-400 no-underline transition hover:text-white" href="/">Kebijakan Privasi</a>
            <a className="text-neutral-400 no-underline transition hover:text-white" href="/">Kontak Pengurus</a>
            <a className="text-neutral-400 no-underline transition hover:text-white" href="/">Bantuan</a>
          </nav>

          <p className="text-sm">&copy; 2024 Sistem Informasi Warga. Transparansi & Stabilitas.</p>
        </div>
      </footer>
    </main>
  )
}
