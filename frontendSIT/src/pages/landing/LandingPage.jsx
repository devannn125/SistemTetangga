import { useEffect, useState, useMemo } from 'react'
import { Icon } from '@/components/ui/Icon'
import { FloatingTelegramButton } from '@/components/FloatingTelegramButton'
import { landingData } from './landingData'
import { getPublicOrganizationMembers, getPublicWilayah, getLandingData, resolveMediaUrl } from '@/services/api'

function WaLink({ waNumber, text, children, className = '' }) {
  const href = `https://wa.me/${waNumber}?text=${encodeURIComponent(text)}`
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
      {children}
    </a>
  )
}

function OrgTreeCard({ topText, bottomText }) {
  return (
    <div className="w-28 sm:w-32 md:w-34 shrink-0 overflow-hidden rounded-xs border border-neutral-800 bg-white shadow-[2px_3px_5px_rgba(0,0,0,0.25)] transition-transform hover:-translate-y-0.5">
      <div className="bg-[#54a22b] px-2 py-1.5 text-center text-xs font-bold text-white tracking-wider">
        {topText}
      </div>
      <div className="flex min-h-[44px] items-center justify-center border-t border-neutral-800/60 bg-white px-2 py-2 text-center text-xs sm:text-[13px] font-bold text-neutral-900 leading-tight">
        {bottomText}
      </div>
    </div>
  )
}

export function LandingPage() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [videoOpen, setVideoOpen] = useState(false)
  const [heroImageFailed, setHeroImageFailed] = useState(false)
  const [orgMembers, setOrgMembers] = useState(null)
  const [cmsData, setCmsData] = useState(null)
  const [wilayahs, setWilayahs] = useState([])
  const [orgLoading, setOrgLoading] = useState(false)
  const [selectedDukuhId, setSelectedDukuhId] = useState(null)
  const [selectedRwId, setSelectedRwId] = useState(null)
  const { brand, navItems, video, struktur, kontak } = landingData
  const brandName = cmsData?.profile?.brand_name || 'Kenaran.com'
  const heroBgImage = resolveMediaUrl(cmsData?.profile?.hero_image_url)
  
  const heroData = cmsData?.profile?.hero_title ? { title: cmsData.profile.hero_title, description: cmsData.profile.hero_subtitle, ctaLabel: landingData.hero.ctaLabel, ctaHref: landingData.hero.ctaHref } : landingData.hero
  const visiData = cmsData?.profile?.visi || landingData.visi
  const misiData = cmsData?.profile?.misi ? cmsData.profile.misi.split('\n') : (landingData.misi || []);
  const sejarahData = cmsData?.profile?.sejarah || landingData.sejarah || ''
  const videoUrlData = resolveMediaUrl(cmsData?.profile?.video_url)
  const emailData = cmsData?.profile?.kontak_email || kontak?.email
  const hpData = cmsData?.profile?.kontak_hp || kontak?.phone
  const alamatData = cmsData?.profile?.kontak_alamat || kontak?.address
  const kegiatanData = Array.isArray(cmsData?.articles) && cmsData.articles.length > 0 ? cmsData.articles.map(a => ({ id: a.id_article, title: a.judul, description: a.konten, image: resolveMediaUrl(a.image_url) || null, date: new Date(a.published_at).toLocaleDateString('id-ID') })) : (landingData.kegiatan || []);
  const umkmData = Array.isArray(cmsData?.umkms) && cmsData.umkms.length > 0 ? cmsData.umkms.map(u => ({ id: u.id_umkm, title: u.nama_usaha, owner: u.nama_pemilik, description: u.deskripsi, phone: u.no_hp, image: resolveMediaUrl(u.image_url) || null })) : (landingData.umkm?.items || []);

  useEffect(() => {
    const html = document.documentElement
    const prev = html.style.scrollBehavior
    html.style.scrollBehavior = 'smooth'
    if (window.location.hash) {
      const el = document.querySelector(window.location.hash)
      if (el) {
        const header = document.querySelector('header')
        const offset = (header?.offsetHeight || 64) + 8
        const top = el.getBoundingClientRect().top + window.scrollY - offset
        setTimeout(() => window.scrollTo({ top, behavior: 'smooth' }), 50)
      }
    }
    return () => {
      html.style.scrollBehavior = prev
    }
  }, [])

  useEffect(() => { getLandingData().then(setCmsData).catch(console.error) }, [])

  // Data dari sistem public endpoint (tanpa login) + tab per Dukuh; fallback mock bila backend kosong/offline
  useEffect(() => {
    let cancelled = false
    setOrgLoading(true)
    Promise.all([
      getPublicOrganizationMembers({ per_page: 200 }).catch(() => ({ data: [] })),
      getPublicWilayah({ per_page: 500, all: 1 }).catch(() => ({ data: [] })),
    ])
      .then(([resOrg, resWil]) => {
        if (cancelled) return
        const arrOrg = Array.isArray(resOrg?.data) ? resOrg.data : Array.isArray(resOrg) ? resOrg : []
        const arrWil = Array.isArray(resWil?.data) ? resWil.data : Array.isArray(resWil) ? resWil : []
        if (arrWil.length > 0) setWilayahs(arrWil)
        const active = arrOrg.filter((m) => m.status_aktif !== false)
        if (active.length > 0) setOrgMembers(active)
        else if (arrOrg.length > 0) setOrgMembers(arrOrg)
        else {
          setOrgMembers(null)
          setWilayahs((prev) => (prev.length ? prev : []))
        }
      })
      .catch(() => {
        if (!cancelled) {
          setOrgMembers(null)
        }
      })
      .finally(() => {
        if (!cancelled) setOrgLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const handleNav = (e, href) => {
    if (!href.startsWith('#')) return
    e.preventDefault()
    setMobileOpen(false)
    const el = document.querySelector(href)
    if (!el) return
    const header = document.querySelector('header')
    const offset = (header?.offsetHeight || 64) + 8
    const top = el.getBoundingClientRect().top + window.scrollY - offset
    window.scrollTo({ top, behavior: 'smooth' })
    history.replaceState(null, '', href)
  }

  // Mock fallback when not logged in -> shape mirip API agar render sama kayak admin
  const mockWilayahs = useMemo(
    () => [
      { id_wilayah: 'KEL-01', nama_wilayah: brandName, tipe: 'KELURAHAN', parent_id: null },
      { id_wilayah: 'DK-01', nama_wilayah: brandName, tipe: 'DUKUH', parent_id: 'KEL-01' },
      { id_wilayah: 'RW-02', nama_wilayah: 'RW 02', tipe: 'RW', parent_id: 'DK-01' },
      { id_wilayah: 'RT-01', nama_wilayah: 'RT 01', tipe: 'RT', parent_id: 'RW-02' },
      { id_wilayah: 'RT-02', nama_wilayah: 'RT 02', tipe: 'RT', parent_id: 'RW-02' },
      { id_wilayah: 'RT-03', nama_wilayah: 'RT 03', tipe: 'RT', parent_id: 'RW-02' },
      { id_wilayah: 'RT-04', nama_wilayah: 'RT 04', tipe: 'RT', parent_id: 'RW-02' },
      { id_wilayah: 'RT-05', nama_wilayah: 'RT 05', tipe: 'RT', parent_id: 'RW-02' },
      { id_wilayah: 'RT-06', nama_wilayah: 'RT 06', tipe: 'RT', parent_id: 'RW-02' },
    ],
    [brandName]
  )

  const mockMembers = useMemo(() => {
    // map struktur flat -> api shape
    const mapWil = {
      Lurah: 'KEL-01',
      Dukuh: 'DK-01',
      'Ketua RW 02': 'RW-02',
      'Ketua RT 01': 'RT-01',
      'Ketua RT 02': 'RT-02',
      'Ketua RT 03': 'RT-03',
      'Ketua RT 04': 'RT-04',
      'Ketua RT 05': 'RT-05',
      'Ketua RT 06': 'RT-06',
    }
    return struktur.map((s, idx) => {
      const jabatan = s.role === 'Lurah' ? 'Kepala Lurah' : s.role === 'Dukuh' ? 'Kepala Dukuh' : s.role
      return {
        id_organization_member: `mock-${idx}`,
        id_citizen: `CIT-mock-${idx}`,
        jabatan,
        id_wilayah: mapWil[s.role] || 'DK-01',
        periode_mulai: '2024-01-01',
        status_aktif: true,
        foto_url: null,
        image: s.image,
        citizen: { nama_lengkap: s.name },
        wilayah: { id_wilayah: mapWil[s.role] || 'DK-01', nama_wilayah: mapWil[s.role] || '', tipe: 'RT' },
      }
    })
  }, [struktur])

  const effectiveWilayahs = wilayahs.length > 0 ? wilayahs : mockWilayahs
  const effectiveMembers = orgMembers && orgMembers.length > 0 ? orgMembers : mockMembers

  const tree = useMemo(() => {
    if (effectiveWilayahs.length === 0) return { kelurahan: null, dukuhList: [], kelurahanList: [] }
    const kelurahanList = effectiveWilayahs.filter((w) => w.tipe === 'KELURAHAN').sort((a, b) => a.nama_wilayah.localeCompare(b.nama_wilayah))
    const kelurahan = kelurahanList[0] || null
    if (kelurahanList.length === 0) return { kelurahan: null, dukuhList: [], kelurahanList }
    const dukuhList = effectiveWilayahs
      .filter((w) => w.tipe === 'DUKUH')
      .sort((a, b) => a.nama_wilayah.localeCompare(b.nama_wilayah))
      .map((d) => ({
        ...d,
        rws: effectiveWilayahs
          .filter((w) => w.parent_id === d.id_wilayah && w.tipe === 'RW')
          .sort((a, b) => a.nama_wilayah.localeCompare(b.nama_wilayah))
          .map((rw) => ({
            ...rw,
            rts: effectiveWilayahs.filter((w) => w.parent_id === rw.id_wilayah && w.tipe === 'RT').sort((a, b) => a.nama_wilayah.localeCompare(b.nama_wilayah)),
          })),
      }))
    return { kelurahan, dukuhList, kelurahanList }
  }, [effectiveWilayahs])

  const lurahMember = useMemo(() => {
    const found = effectiveMembers.find((m) => (m.jabatan || '').toLowerCase().includes('lurah'))
    return found || null
  }, [effectiveMembers])

  const getRwMembers = (rwId) => effectiveMembers.filter((m) => m.id_wilayah === rwId)
  const getRtMembers = (rtId) => effectiveMembers.filter((m) => m.id_wilayah === rtId)
  const getDukuhMember = (dukuhId) => effectiveMembers.find((m) => m.id_wilayah === dukuhId && (m.jabatan || '').toLowerCase().includes('dukuh'))

  const visibleDukuhs = useMemo(() => {
    if (tree.dukuhList.length <= 1) return tree.dukuhList
    if (selectedDukuhId) {
      const sel = tree.dukuhList.find((d) => d.id_wilayah === selectedDukuhId)
      return sel ? [sel] : tree.dukuhList
    }
    return tree.dukuhList
  }, [tree.dukuhList, selectedDukuhId])

  // auto select first dukuh when tree loads
  useEffect(() => {
    if (tree.dukuhList.length > 1 && !selectedDukuhId) setSelectedDukuhId(tree.dukuhList[0].id_wilayah)
  }, [tree.dukuhList, selectedDukuhId])

  useEffect(() => {
    setSelectedRwId(null)
  }, [selectedDukuhId])

  return (
    <main className="min-h-screen bg-white text-neutral-800">
      <header className="sticky top-0 z-20 border-b border-neutral-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-6">
          <a href="#beranda" onClick={(e) => handleNav(e, '#beranda')} className="flex items-center gap-3 no-underline">
            <span className="text-xl font-extrabold leading-none text-neutral-900" style={{ fontFamily: "'Archivo', sans-serif" }}>
              {brandName}
            </span>
          </a>

          <nav className="hidden items-center gap-7 text-sm font-semibold text-neutral-600 md:flex" aria-label="Navigasi">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={(e) => handleNav(e, item.href)}
                className="no-underline transition hover:text-[#14532d]"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <a
              href="/login"
              className="hidden rounded-full bg-[#14532d] px-6 py-2.5 text-sm font-bold text-white no-underline transition hover:bg-[#0f3d22] md:inline-flex"
            >
              Login
            </a>
            <button
              aria-label="Toggle menu"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-neutral-200 text-neutral-700 md:hidden"
              onClick={() => setMobileOpen((v) => !v)}
            >
              <Icon name={mobileOpen ? 'x' : 'menu'} className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className={`grid transition-all duration-200 ease-out md:hidden ${mobileOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
          <div className="overflow-hidden">
            <nav className="border-t border-neutral-200 bg-white px-6 py-4">
              <div className="flex flex-col gap-3">
                {navItems.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    onClick={(e) => handleNav(e, item.href)}
                    className="py-1 text-sm font-semibold text-neutral-700 no-underline transition hover:text-[#14532d]"
                  >
                    {item.label}
                  </a>
                ))}
                <a href="/login" className="mt-2 inline-flex justify-center rounded-full bg-[#14532d] px-6 py-2.5 text-sm font-bold text-white no-underline">
                  Login
                </a>
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section id="beranda" className="relative scroll-mt-24 overflow-hidden bg-white border-b border-neutral-100">
        {heroBgImage && !heroImageFailed && (
          <div className="absolute inset-0">
            <img
              src={heroBgImage}
              alt=""
              className="h-full w-full object-cover opacity-80"
              onError={() => setHeroImageFailed(true)}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-white/60 to-white" />
          </div>
        )}
        <div className="relative mx-auto max-w-7xl px-6 py-20 text-center md:py-28">
          <h1 className="mx-auto max-w-3xl text-3xl font-extrabold leading-tight text-neutral-900 md:text-5xl">{heroData.title}</h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-neutral-600 md:text-lg">{heroData.description}</p>
          <a
            href={heroData.ctaHref}
            onClick={(e) => handleNav(e, heroData.ctaHref)}
            className="mt-8 inline-flex rounded-full bg-[#14532d] px-8 py-3 text-sm font-bold text-white no-underline shadow-sm transition hover:bg-[#0f3d22]"
          >
            {heroData.ctaLabel}
          </a>
        </div>
      </section>

      {/* PROFIL: VISI, MISI, & SEJARAH SINGKAT */}
      <section id="profil" className="mx-auto max-w-7xl scroll-mt-24 px-6 py-16 md:py-20">
        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200/80 bg-emerald-50 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#14532d]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#14532d]" />
            Profil & Landasan Wilayah
          </span>
          <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-neutral-900 sm:text-3xl md:text-4xl">
            Visi, Misi & Jejak Historis {brandName}
          </h2>
          <p className="mt-3 text-base leading-relaxed text-neutral-600">
            Arah pandang dan komitmen bersama dalam mewujudkan kehidupan masyarakat yang guyub rukun, mandiri, dan berkesinambungan.
          </p>
        </div>

        {/* VISI & MISI DUA KOLOM BERSTRUKTUR */}
        <div className="mt-10 grid gap-8 lg:grid-cols-12 items-stretch">
          {/* VISI CARD */}
          <div className="flex flex-col justify-between rounded-2xl border border-stone-200/90 bg-[#fafaf8] p-7 sm:p-9 shadow-xs lg:col-span-5">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#14532d]">
                  Visi Pembangunan
                </span>
                <span className="text-3xl font-serif leading-none text-emerald-800/40 select-none">“</span>
              </div>
              <blockquote className="mt-4 text-lg font-bold leading-relaxed text-neutral-900 sm:text-xl">
                {visiData}
              </blockquote>
            </div>

            <div className="mt-8 border-t border-stone-200/80 pt-4">
              <p className="text-xs font-semibold text-neutral-500">
                Landasan cita-cita bersama warga {brandName} untuk masa depan yang lebih baik.
              </p>
            </div>
          </div>

          {/* MISI LIST */}
          <div className="flex flex-col justify-between rounded-2xl border border-stone-200/90 bg-white p-7 sm:p-9 shadow-xs lg:col-span-7">
            <div>
              <div className="flex items-center justify-between border-b border-stone-200/80 pb-4">
                <div>
                  <span className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#14532d]">
                    Misi Kepengurusan
                  </span>
                  <h3 className="text-base font-extrabold text-neutral-900">
                    Langkah Nyata & Pengabdian Warga
                  </h3>
                </div>
                <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-[#14532d] border border-emerald-200/70">
                  {misiData.length} Pilar
                </span>
              </div>

              <div className="mt-5 space-y-3.5">
                {misiData.map((m, idx) => (
                  <div
                    key={m}
                    className="flex items-start gap-3.5 rounded-xl border border-stone-100 bg-[#fbfbf9] p-3.5 transition-colors hover:border-stone-200 hover:bg-stone-50/60"
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-emerald-200/80 bg-emerald-50 text-[11px] font-black text-[#14532d]">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <p className="text-sm font-medium leading-relaxed text-neutral-700">
                      {m}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 border-t border-stone-100 pt-3">
              <p className="text-[11px] text-neutral-500">
                Dilaksanakan secara berkesinambungan melalui semangat gotong royong dan partisipasi aktif seluruh warga.
              </p>
            </div>
          </div>
        </div>

        {/* SEJARAH SINGKAT */}
        {sejarahData && (
          <div className="mt-10 rounded-2xl border border-stone-200/90 bg-[#fafaf8] p-7 sm:p-10 shadow-xs">
            <div className="flex items-center gap-3 border-b border-stone-200/80 pb-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-stone-100 text-[#14532d] border border-stone-200">
                <Icon name="book" className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#14532d]">
                  Historis & Asal-Usul
                </span>
                <h3 className="text-lg font-extrabold text-neutral-900 sm:text-xl">
                  Sejarah Singkat {brandName}
                </h3>
              </div>
            </div>

            <div className="mt-6 w-full space-y-4 text-[15px] sm:text-base font-normal leading-relaxed text-neutral-700 text-justify">
              {sejarahData
                .split(/\n+/)
                .filter((p) => p.trim().length > 0)
                .map((paragraph, index) => (
                  <p
                    key={index}
                    className={`text-justify ${index === 0 ? 'text-neutral-900 font-medium' : ''}`}
                  >
                    {paragraph}
                  </p>
                ))}
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-stone-200/80 pt-5 text-xs text-neutral-500">
              <span className="font-semibold text-neutral-600">
                Peninggalan Nilai: Guyub Rukun &bull; Gotong Royong &bull; Kemandirian
              </span>
              <span className="italic text-neutral-400">
                Catatan sejarah resmi {brandName}
              </span>
            </div>
          </div>
        )}
      </section>

      {/* VIDEO */}
      {videoUrlData && (
        <section className="mx-auto max-w-7xl px-6 pb-14">
          <h3 className="text-center text-xl font-extrabold text-neutral-900">{video.title}</h3>
          <div className="mx-auto mt-6 max-w-3xl overflow-hidden rounded-xl border border-neutral-200 bg-black shadow-sm">
            <video
              src={videoUrlData}
              controls
              preload="metadata"
              className="aspect-video w-full bg-black object-contain"
            />
          </div>
        </section>
      )}

      {/* STRUKTUR ORGANISASI: HANYA MENAMPILKAN JABATAN */}
      <section id="struktur" className="border-t border-stone-200/80 bg-[#f8f9f6] px-6 py-16 md:py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/80 bg-emerald-50 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#14532d]">
              <Icon name="shield" className="h-3.5 w-3.5" />
              Tata Kelola Wilayah
            </span>
            <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-neutral-900 md:text-3xl">
              Struktur Organisasi {brandName}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-neutral-600">
              Bagan tata kelola dan hierarki jabatan kepengurusan wilayah dari tingkat Kalurahan, Padukuhan, Rukun Warga (RW), hingga Rukun Tetangga (RT).
            </p>
          </div>

          {orgLoading ? (
            <div className="mt-10 rounded-2xl border border-stone-200 bg-white p-12 text-center text-sm font-medium text-neutral-500 shadow-xs">
              <div className="mx-auto mb-3 h-6 w-6 animate-spin rounded-full border-2 border-stone-300 border-t-[#14532d]" />
              <p>Memuat struktur tata kelola wilayah...</p>
            </div>
          ) : (
            <div className="mt-10 space-y-6">
              {/* Tabs Dukuh jika >1 dukuh */}
              {tree.dukuhList.length > 1 && (
                <div className="flex flex-wrap justify-center gap-2">
                  {tree.dukuhList.map((d) => (
                    <button
                      key={d.id_wilayah}
                      onClick={() => setSelectedDukuhId(d.id_wilayah)}
                      className={`rounded-full border px-5 py-2 text-xs font-bold transition-colors ${
                        (selectedDukuhId || tree.dukuhList[0]?.id_wilayah) === d.id_wilayah
                          ? 'border-[#14532d] bg-[#14532d] text-white shadow-xs'
                          : 'border-stone-300 bg-white text-neutral-700 hover:border-[#14532d] hover:text-[#14532d]'
                      }`}
                    >
                      Padukuhan {d.nama_wilayah}
                    </button>
                  ))}
                </div>
              )}

              {(() => {
                const currentDukuh = visibleDukuhs[0] || tree.dukuhList[0]
                const rwList = currentDukuh?.rws || []
                const activeRw = rwList.find((r) => r.id_wilayah === selectedRwId) || rwList[0]
                const rts = activeRw?.rts || []
                const lurahTitle = lurahMember?.jabatan?.replace(/Kepala\s+/i, '') || 'Lurah'
                const dukuhMember = currentDukuh ? getDukuhMember(currentDukuh.id_wilayah) : null
                const dukuhTitle = dukuhMember?.jabatan?.replace(/Kepala\s+/i, '') || 'Dukuh'

                if (!currentDukuh && effectiveMembers.length === 0) {
                  return (
                    <p className="rounded-2xl border border-stone-200 bg-white p-12 text-center text-sm text-neutral-500">
                      Belum ada data struktur kepengurusan wilayah yang tersedia.
                    </p>
                  )
                }

                return (
                  <div className="space-y-6">
                    {/* Tabs RW jika terdapat lebih dari 1 RW */}
                    {rwList.length > 1 && (
                      <div className="flex flex-wrap items-center justify-center gap-2">
                        <span className="text-xs font-semibold text-neutral-500 mr-1">Pilih RW:</span>
                        {rwList.map((rw) => (
                          <button
                            key={rw.id_wilayah}
                            onClick={() => setSelectedRwId(rw.id_wilayah)}
                            className={`rounded-full border px-4 py-1.5 text-xs font-bold transition-colors ${
                              activeRw?.id_wilayah === rw.id_wilayah
                                ? 'border-[#14532d] bg-[#14532d] text-white shadow-xs'
                                : 'border-stone-300 bg-white text-neutral-700 hover:border-[#14532d] hover:text-[#14532d]'
                            }`}
                          >
                            {rw.nama_wilayah}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Kontainer Bagan Organisasi (Canvas) */}
                    <div className="rounded-2xl border border-stone-200/90 bg-[#fafaf8] p-5 sm:p-8 md:p-10 shadow-xs">
                      <div className="overflow-x-auto pb-4 pt-2">
                        <div className="min-w-max flex flex-col items-center mx-auto px-4">
                          {/* TINGKAT 1: Lurah (kiri) & Dukuh (tengah) */}
                          <div className="flex items-center justify-center">
                            {/* Lurah */}
                            <OrgTreeCard topText="Kalurahan" bottomText={lurahTitle} />

                            {/* Garis konektor horizontal Lurah - Dukuh */}
                            <div className="h-0.5 w-10 sm:w-16 bg-neutral-700" />

                            {/* Dukuh */}
                            <OrgTreeCard topText="Padukuhan" bottomText={dukuhTitle} />

                            {/* Spacer penyeimbang sisi kanan agar Dukuh persis berada di tengah vertikal di atas RW */}
                            <div className="w-[calc(7rem+2.5rem)] sm:w-[calc(8rem+4rem)] shrink-0 pointer-events-none" aria-hidden="true" />
                          </div>

                          {/* Garis vertikal dari Dukuh ke RW */}
                          <div className="h-8 sm:h-10 w-0.5 bg-neutral-700" />

                          {/* TINGKAT 2: Ketua RW */}
                          {activeRw ? (
                            <>
                              <OrgTreeCard topText={activeRw.nama_wilayah} bottomText={`Ketua ${activeRw.nama_wilayah}`} />

                              {/* TINGKAT 3: Garis Bus & Kolom RT */}
                              {rts.length === 0 ? (
                                <p className="mt-6 text-xs italic text-neutral-400">Belum ada RT terdaftar di bawah RW ini.</p>
                              ) : rts.length === 1 ? (
                                <div className="flex flex-col items-center">
                                  <div className="h-6 sm:h-8 w-0.5 bg-neutral-700" />
                                  <OrgTreeCard topText={rts[0].nama_wilayah} bottomText={`Ketua ${rts[0].nama_wilayah}`} />
                                </div>
                              ) : (
                                <>
                                  {/* Garis vertikal dari RW ke Bus RT */}
                                  <div className="h-6 sm:h-8 w-0.5 bg-neutral-700" />

                                  {/* Baris Kolom RT */}
                                  <div className="flex items-start justify-center">
                                    {rts.map((rt, idx) => {
                                      const isFirst = idx === 0
                                      const isLast = idx === rts.length - 1
                                      return (
                                        <div key={rt.id_wilayah} className="flex flex-col items-center px-1.5 sm:px-3">
                                          {/* Garis bus horizontal antar kolom RT */}
                                          <div className="flex h-5 sm:h-6 w-full">
                                            <div className={`w-1/2 ${!isFirst ? 'border-t-2 border-neutral-700' : ''}`} />
                                            <div className={`w-1/2 ${!isLast ? 'border-t-2 border-neutral-700' : ''}`} />
                                          </div>
                                          {/* Garis vertikal masuk ke kartu RT */}
                                          <div className="-mt-5 sm:-mt-6 h-5 sm:h-6 w-0.5 bg-neutral-700" />
                                          <OrgTreeCard topText={rt.nama_wilayah} bottomText={`Ketua ${rt.nama_wilayah}`} />
                                        </div>
                                      )
                                    })}
                                  </div>
                                </>
                              )}
                            </>
                          ) : (
                            <p className="mt-6 text-xs italic text-neutral-400">Padukuhan ini belum memiliki daftar RW.</p>
                          )}
                        </div>
                      </div>

                      {/* Keterangan Bagan di bagian bawah */}
                      <p className="mt-6 border-t border-stone-200/80 pt-4 text-center text-xs sm:text-sm font-medium text-neutral-500">
                        Bagan struktur organisasi tata kelola wilayah
                      </p>
                    </div>
                  </div>
                )
              })()}
            </div>
          )}
        </div>
      </section>

      {/* KEGIATAN */}
      <section id="kegiatan" className="mx-auto max-w-7xl scroll-mt-24 px-6 py-14">
        <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#14532d]">Kegiatan Warga</p>
        <h2 className="mt-2 text-2xl font-extrabold text-neutral-900">Kegiatan {brandName}</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {kegiatanData.map((k) => (
            <article key={k.title} className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm transition hover:shadow-md">
              {k.image ? (
                <img
                  src={k.image}
                  alt={k.title}
                  className="aspect-[16/10] w-full object-cover"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                    if (e.currentTarget.nextElementSibling) {
                      e.currentTarget.nextElementSibling.style.display = 'flex'
                    }
                  }}
                />
              ) : null}
              <div
                className={`aspect-[16/10] w-full items-center justify-center border-b border-neutral-100 bg-neutral-50 text-neutral-300 ${
                  k.image ? 'hidden' : 'flex'
                }`}
              >
                <Icon name="newspaper" className="h-10 w-10 text-neutral-300" />
              </div>
              <div className="p-5">
                <p className="text-xs font-semibold text-neutral-500">{k.date}</p>
                <h3 className="mt-1 line-clamp-2 text-sm font-extrabold leading-6 text-neutral-900">{k.title}</h3>
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-neutral-600">{k.description}</p>
                <a href={k.href} className="mt-4 inline-flex text-sm font-bold text-[#14532d] no-underline hover:underline">
                  Selengkapnya
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* UMKM */}
      <section id="umkm" className="scroll-mt-24 bg-[#f6f7f4] px-6 py-14">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#14532d]">Usaha Warga</p>
          <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-extrabold text-neutral-900">{landingData.umkm.headerTitle}</h2>
              <p className="mt-2 text-sm font-semibold text-neutral-900">{landingData.umkm.headerDesc}</p>
              <p className="text-sm text-neutral-600">{landingData.umkm.headerSub}</p>
            </div>
            <a href={landingData.umkm.instagramHref} className="inline-flex rounded-full border border-neutral-300 bg-white px-5 py-2 text-sm font-bold text-neutral-800 no-underline hover:bg-neutral-50">
              Follow di Instagram
            </a>
          </div>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {umkmData.map((item) => (
              <article key={item.title} className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.title}
                    className="aspect-[4/3] w-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                      if (e.currentTarget.nextElementSibling) {
                        e.currentTarget.nextElementSibling.style.display = 'flex'
                      }
                    }}
                  />
                ) : null}
                <div
                  className={`aspect-[4/3] w-full items-center justify-center border-b border-neutral-100 bg-neutral-50 text-neutral-300 ${
                    item.image ? 'hidden' : 'flex'
                  }`}
                >
                  <Icon name="box" className="h-10 w-10 text-neutral-300" />
                </div>
                <div className="p-5">
                  <h3 className="line-clamp-2 text-sm font-extrabold leading-6 text-neutral-900">{item.title}</h3>
                  <p className="mt-2 line-clamp-3 text-sm leading-6 text-neutral-600">{item.description}</p>
                  <WaLink
                    waNumber={hpData}
                    text={`Halo, saya tertarik dengan ${item.title}`}
                    className="mt-4 inline-flex w-full justify-center rounded-full bg-[#25D366] px-4 py-2.5 text-sm font-bold text-white no-underline hover:bg-[#1da851]"
                  >
                    Chat via WhatsApp
                  </WaLink>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* KONTAK */}
      <section id="kontak" className="mx-auto max-w-7xl scroll-mt-24 px-6 py-14">
        <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#14532d]">Kontak {brandName}</p>
        <h2 className="mt-2 text-2xl font-extrabold text-neutral-900">Hubungi Kami</h2>
        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          <div className="space-y-5 text-sm leading-6">
            <div className="flex gap-3">
              <span className="mt-1 text-[#14532d]"><Icon name="map" className="h-5 w-5" /></span>
              <div>
                <p className="font-bold text-neutral-900">Alamat</p>
                <p className="text-neutral-600">{alamatData}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="mt-1 text-[#14532d]"><Icon name="clock" className="h-5 w-5" /></span>
              <div>
                <p className="font-bold text-neutral-900">Jam Kerja</p>
                <p className="text-neutral-600">{kontak.jamKerja}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="mt-1 text-[#14532d]"><Icon name="message" className="h-5 w-5" /></span>
              <div>
                <p className="font-bold text-neutral-900">Telepon / WhatsApp</p>
                <WaLink waNumber={hpData} text={`Halo ${brandName}`} className="text-[#14532d] no-underline hover:underline">
                  {hpData}
                </WaLink>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="mt-1 text-[#14532d]">
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-[1.9]" aria-hidden="true"><path d="M4 6h16v12H4z" /><path d="m4 7 8 7 8-7" /></svg>
              </span>
              <div>
                <p className="font-bold text-neutral-900">Email</p>
                <a href={`mailto:${emailData}`} className="text-[#14532d] no-underline hover:underline">{emailData}</a>
              </div>
            </div>
          </div>
          <div className="overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100">
            <iframe title={`Peta ${brandName}`} src={kontak.mapEmbed} className="h-[320px] w-full border-0" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#111111] px-6 py-12 text-xs text-neutral-400">
        <div className="mx-auto grid max-w-7xl items-center gap-8 md:grid-cols-3">
          <div className="text-center leading-relaxed md:text-left">
            {alamatData}
          </div>
          <div className="text-center font-medium text-neutral-500">
            Copyright &copy; {new Date().getFullYear()} {brandName}. All rights reserved.
          </div>
          <div className="flex justify-center gap-6 font-medium text-neutral-300 md:justify-end">
            {emailData && (
              <a href={`mailto:${emailData}`} className="transition-colors hover:text-white">Surel</a>
            )}
            {hpData && (
              <WaLink waNumber={hpData} text={`Halo ${brandName}`} className="transition-colors hover:text-white">WhatsApp</WaLink>
            )}
          </div>
        </div>
      </footer>

      <FloatingTelegramButton />
    </main>
  )
}


