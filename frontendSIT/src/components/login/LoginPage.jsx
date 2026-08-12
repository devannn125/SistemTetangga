import { useState } from 'react'
import { Icon } from '../ui/Icon'

function PortalInput({ action, icon, id, label, onChange, placeholder, type = 'text', value }) {
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
          className="min-w-0 flex-1 border-0 bg-transparent text-base font-medium text-neutral-800 outline-0 placeholder:text-neutral-500"
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
  const [form, setForm] = useState({
    nik: '',
    password: '',
    role: 'warga',
  })
  const [error, setError] = useState('')

  function handleChange(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
    setError('')
  }

  function handleSubmit(event) {
    event.preventDefault()

    if (!form.nik.trim() || !form.password.trim()) {
      setError('NIK/ID dan kata sandi wajib diisi.')
      return
    }

    const destination = form.role === 'admin' ? '/dashboard' : '/warga'
    window.location.assign(destination)
  }

  return (
    <main className="flex min-h-screen flex-col bg-neutral-100 text-neutral-900">
      <header className="border-b border-neutral-900 bg-neutral-50">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-8 px-6 max-md:h-auto max-md:flex-wrap max-md:py-4">
          <a className="flex items-center gap-2 text-2xl font-extrabold text-black no-underline" href="/">
            <Icon name="building" className="h-6 w-6" />
            <span>SIW MASYARAKAT</span>
          </a>
        </div>
      </header>

      <section className="grid flex-1 place-items-center px-6 py-10">
        <div className="w-full max-w-[480px]">
          <div className="bg-black px-9 py-4 text-2xl font-extrabold text-white">
            <span className="inline-flex items-center gap-2">
              <Icon name="key" className="h-5 w-5" />
              Akses Portal
            </span>
          </div>

          <form className="border-2 border-neutral-900 bg-white px-12 py-12 max-sm:px-6" onSubmit={handleSubmit}>
            <div className="text-center">
              <h1 className="text-4xl font-extrabold leading-tight text-black">Masuk</h1>
              <p className="mx-auto mt-3 max-w-xs text-base leading-7 text-neutral-600">
                Silakan masukkan kredensial warga Anda untuk melanjutkan.
              </p>
            </div>

            <div className="mt-10 flex flex-col gap-6">
              <PortalInput
                icon="idCard"
                id="nik"
                label="Nomor NIK / ID Warga"
                onChange={handleChange}
                placeholder="Masukkan NIK atau ID admin"
                value={form.nik}
              />

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-extrabold text-black" htmlFor="role">
                  <span className="h-1.5 w-1.5 bg-black" />
                  Masuk Sebagai
                </label>

                <div className="flex h-[52px] items-center gap-3 border border-neutral-900 bg-neutral-50 px-3 text-neutral-500 transition focus-within:border-sky-600 focus-within:bg-white focus-within:text-sky-700">
                  <Icon name="users" className="h-5 w-5" />
                  <select
                    className="min-w-0 flex-1 border-0 bg-transparent text-base font-medium text-neutral-800 outline-0"
                    id="role"
                    name="role"
                    onChange={handleChange}
                    value={form.role}
                  >
                    <option value="warga">Warga</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

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
                    className="min-w-0 flex-1 border-0 bg-transparent text-base font-medium text-neutral-800 outline-0 placeholder:text-neutral-500"
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
                    onClick={() => setShowPassword((current) => !current)}
                    type="button"
                  >
                    <Icon name={showPassword ? 'eyeOff' : 'eye'} className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>

            {error ? (
              <p className="mt-5 border border-red-700 bg-red-50 px-4 py-3 text-sm font-bold text-red-800">{error}</p>
            ) : null}

            <button
              className="mt-14 flex h-[50px] w-full items-center justify-center gap-2 border border-black bg-black text-sm font-extrabold text-white transition hover:border-sky-600 hover:bg-sky-600"
              type="submit"
            >
              Masuk
              <Icon name="arrowRight" className="h-4 w-4" />
            </button>

            <div className="mt-9 border-t border-neutral-300 pt-7 text-center text-base text-neutral-600">
              Belum terdaftar?
              <a className="ml-2 font-extrabold text-black no-underline transition hover:text-sky-700" href="/">
                Hubungi Pengurus RT/RW
              </a>
            </div>
          </form>
        </div>
      </section>

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
