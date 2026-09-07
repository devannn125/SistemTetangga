import { Icon } from '@/components/ui/Icon'
import { FloatingWhatsAppButton } from '@/components/FloatingWhatsAppButton'
import { landingData } from './landingData'

const heroImage =
  'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1400&q=80'

function LandingButton({ children, href, variant = 'default', className = '' }) {
  const variants = {
    default: 'bg-neutral-900 text-white hover:bg-neutral-700',
    outline: 'border border-neutral-900 bg-transparent text-neutral-900 hover:bg-neutral-100 hover:text-sky-700',
  }

  return (
    <a
      className={`inline-flex min-h-11 items-center justify-center border px-7 text-sm font-bold no-underline transition duration-200 ${variants[variant]} ${className}`}
      href={href}
    >
      {children}
    </a>
  )
}

function SectionLabel({ children }) {
  return (
    <div className="inline-flex bg-neutral-900 px-6 py-4 text-xl font-extrabold leading-none text-white">
      {children}
    </div>
  )
}

function ImageFrame({ src, alt, className = '' }) {
  return (
    <div className={`overflow-hidden border border-neutral-900 bg-neutral-200 ${className}`}>
      <img
        alt={alt}
        className="h-full w-full object-cover grayscale"
        loading="lazy"
        src={src}
      />
    </div>
  )
}

export function LandingPage() {
  const isWargaLoggedIn = localStorage.getItem('authRole') === 'warga'

  return (
    <main className="min-h-screen bg-neutral-100 text-neutral-900">
      <header className="sticky top-0 z-20 border-b border-neutral-900 bg-neutral-50/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-6 max-md:h-auto max-md:flex-wrap max-md:py-4">
          <a className="flex items-center gap-2 text-xl font-extrabold text-black no-underline" href="/">
            <Icon name="building" className="h-5 w-5" />
            <span>Kenaran</span>
          </a>

          {isWargaLoggedIn ? (
            <nav className="flex items-center gap-14 text-sm font-bold text-neutral-500 max-md:order-3 max-md:w-full max-md:justify-between max-md:gap-4" aria-label="Navigasi landing page">
              {landingData.navItems.map((item) => (
                <a className="no-underline transition hover:text-sky-700" href={item.href} key={item.label}>
                  {item.label}
                </a>
              ))}
            </nav>
          ) : null}

          <LandingButton href={isWargaLoggedIn ? '/warga' : '/login'}>
            {isWargaLoggedIn ? 'Portal Warga' : 'Login'}
          </LandingButton>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl grid-cols-[minmax(0,0.95fr)_minmax(420px,1.05fr)] items-center gap-20 px-6 pb-20 pt-20 max-lg:grid-cols-1 max-lg:gap-10 max-md:pb-14 max-md:pt-12">
        <div>
          <h1 className="max-w-xl text-5xl font-extrabold leading-[1.08] text-black max-md:text-4xl">
            Satu Pintu untuk Segala Urusan Warga
          </h1>
          <p className="mt-7 max-w-lg text-lg leading-8 text-neutral-600">
            Platform digital terintegrasi untuk memudahkan administrasi, pelaporan, dan partisipasi warga dalam membangun lingkungan yang lebih baik dan transparan.
          </p>
        </div>

        <ImageFrame
          alt="Ruang layanan warga modern"
          className="aspect-[4/3] min-h-[360px] max-lg:min-h-0"
          src={heroImage}
        />
      </section>

      <section className="mx-auto max-w-7xl px-6 py-12" id="layanan">
        <SectionLabel>Layanan Utama</SectionLabel>

        <div className="mt-7 grid grid-cols-3 gap-6 max-lg:grid-cols-2 max-md:grid-cols-1">
          {landingData.services.map((service) => (
            <article className="group border border-neutral-900 bg-white p-6 transition duration-200 hover:-translate-y-0.5 hover:border-sky-600 hover:bg-sky-50 hover:shadow-md" key={service.title}>
              <ImageFrame alt={service.title} className="aspect-[16/9] border-neutral-300" src={service.image} />
              <Icon name={service.icon} className="mt-7 h-8 w-8 text-black group-hover:text-sky-700" />
              <h2 className="mt-4 border-b border-neutral-900 pb-3 text-sm font-extrabold text-black">
                {service.title}
              </h2>
              <p className="mt-4 min-h-20 text-base leading-7 text-neutral-600">
                {service.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-24 max-md:py-16" id="informasi">
        <h2 className="text-2xl font-extrabold text-black">Mengapa Sistem Informasi Desa Itu Penting?</h2>
        <div className="mt-5 h-1 w-24 bg-neutral-950" />

        <div className="mt-12 grid grid-cols-3 gap-10 max-lg:grid-cols-1">
          {landingData.reasons.map((reason) => (
            <article className="border-l-2 border-neutral-900 pl-6" key={reason.title}>
              <h3 className="text-sm font-extrabold uppercase tracking-[0.12em] text-neutral-900">
                {reason.title}
              </h3>
              <p className="mt-4 max-w-md text-base leading-7 text-neutral-600">{reason.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-12" aria-label="Statistik sistem">
        <div className="grid grid-cols-3 border-y border-neutral-900 py-10 max-md:grid-cols-1 max-md:gap-8">
          {landingData.stats.map((stat, index) => (
            <div className={`text-center ${index > 0 ? 'border-l border-neutral-500 max-md:border-l-0 max-md:border-t max-md:pt-8' : ''}`} key={stat.label}>
              <strong className="block text-4xl font-extrabold leading-none text-black">{stat.value}</strong>
              <span className="mt-3 block text-sm font-extrabold uppercase tracking-[0.15em] text-neutral-500">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-20 text-center" id="agenda">
        <h2 className="text-2xl font-extrabold text-black">Siap Berpartisipasi?</h2>
        <p className="mx-auto mt-5 max-w-xl text-lg leading-8 text-neutral-600">
          Jadilah bagian dari perubahan positif di lingkungan Anda. Akses semua layanan dalam satu genggaman.
        </p>
        <div className="mt-9 flex justify-center gap-4 max-sm:flex-col">
          <LandingButton href="/login" variant="outline">Login Warga</LandingButton>
        </div>
      </section>

      <footer className="bg-black px-6 py-10 text-neutral-400">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-8 max-md:flex-col max-md:items-start">
          <div>
            <strong className="block text-sm tracking-[0.2em] text-white">Kenaran</strong>
            <p className="mt-3 text-sm">&copy; 2024 Kenaran. All rights reserved.</p>
          </div>

          <nav className="flex flex-wrap gap-7 text-sm font-medium" aria-label="Tautan bantuan">
            <a className="text-neutral-400 no-underline transition hover:text-white" href="/">Privacy Policy</a>
            <a className="text-neutral-400 no-underline transition hover:text-white" href="/">Terms of Service</a>
            <a className="text-neutral-400 no-underline transition hover:text-white" href="/">Contact Support</a>
            <a className="text-neutral-400 no-underline transition hover:text-white" href="/">Accessibility</a>
          </nav>
        </div>
      </footer>
      <FloatingWhatsAppButton />
    </main>
  )
}