import { Icon } from '../ui/Icon'

const menuItems = [
  { title: 'Profil Warga', description: 'Lihat dan perbarui data keluarga.', icon: 'idCard' },
  { title: 'Iuran Bulanan', description: 'Pantau status pembayaran lingkungan.', icon: 'wallet' },
  { title: 'Pengumuman', description: 'Baca informasi terbaru dari pengurus.', icon: 'megaphone' },
]

export function WargaPage() {
  return (
    <main className="min-h-screen bg-neutral-100 text-neutral-900">
      <header className="border-b border-neutral-900 bg-white">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-6 px-6 max-sm:h-auto max-sm:flex-col max-sm:items-start max-sm:py-5">
          <a className="flex items-center gap-2 text-xl font-extrabold text-black no-underline" href="/">
            <Icon name="building" className="h-6 w-6" />
            SIW MASYARAKAT
          </a>

          <nav className="flex items-center gap-3">
            <a
              className="flex h-10 items-center justify-center border border-neutral-900 px-4 text-sm font-extrabold text-black no-underline transition hover:border-sky-600 hover:text-sky-700"
              href="/"
            >
              Beranda
            </a>
            <a
              className="flex h-10 items-center justify-center gap-2 border border-black bg-black px-4 text-sm font-extrabold text-white no-underline transition hover:border-sky-600 hover:bg-sky-600"
              href="/login"
            >
              <Icon name="logout" className="h-4 w-4" />
              Keluar
            </a>
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="border-2 border-neutral-900 bg-white p-8 max-sm:p-5">
          <p className="text-sm font-extrabold uppercase tracking-[0.08em] text-sky-700">Portal Warga</p>
          <h1 className="mt-3 text-4xl font-extrabold leading-tight text-black max-sm:text-3xl">
            Selamat datang di halaman warga
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-neutral-600">
            Akses layanan warga, pembayaran iuran, pengumuman, dan data lingkungan dari satu tempat.
          </p>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {menuItems.map((item) => (
            <article key={item.title} className="border border-neutral-900 bg-white p-6">
              <div className="grid h-11 w-11 place-items-center bg-black text-white">
                <Icon name={item.icon} className="h-5 w-5" />
              </div>
              <h2 className="mt-5 text-xl font-extrabold text-black">{item.title}</h2>
              <p className="mt-3 text-sm leading-6 text-neutral-600">{item.description}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}
