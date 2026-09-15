import { useEffect, useState, useMemo } from 'react'
import { Icon } from '@/components/ui/Icon'
import { FloatingWhatsAppButton } from '@/components/FloatingWhatsAppButton'
import { landingData } from './landingData'
import { getPublicOrganizationMembers, getPublicWilayah } from '@/services/api'

function WaLink({ waNumber, text, children, className = '' }) {
  const href = `https://wa.me/${waNumber}?text=${encodeURIComponent(text)}`
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
      {children}
    </a>
  )
}

function avatarUrl(url) {
  if (!url) return null
  if (url.startsWith('http')) return url
  const base = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://127.0.0.1:8000'
  return `${base}/storage/${url}`
}

function Avatar({ member, size = 'md' }) {
  const name = member?.citizen?.nama_lengkap || member?.name || member?.nama_users || '?'
  const url = avatarUrl(member?.foto_url) || member?.image || null
  const box = size === 'lg' ? 'h-20 w-20 text-3xl' : size === 'md' ? 'h-12 w-12 text-lg' : 'h-9 w-9 text-sm'
  return (
    <div className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-neutral-200 bg-neutral-50 font-extrabold text-neutral-300 ${box}`}>
      {url ? <img src={url} alt={name} className="h-full w-full object-cover" /> : (name[0] || '?').toUpperCase()}
    </div>
  )
}

function SectionHeading({ children }) {
  return (
    <div className="flex items-center gap-4 py-3">
      <div className="h-px flex-1 bg-neutral-200" />
      <p className="shrink-0 text-xs font-extrabold uppercase tracking-[0.12em] text-neutral-500">{children}</p>
      <div className="h-px flex-1 bg-neutral-200" />
    </div>
  )
}

function OfficialRow({ member }) {
  return (
    <div className="flex items-center gap-4 py-3">
      <Avatar member={member} size="md" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-black">{member.citizen?.nama_lengkap || member.name || 'Tidak Diketahui'}</p>
        <p className="text-xs font-extrabold uppercase tracking-wide text-sky-600">{member.jabatan || member.role}</p>
      </div>
    </div>
  )
}

export function LandingPage() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [videoOpen, setVideoOpen] = useState(false)
  const [orgMembers, setOrgMembers] = useState(null)
  const [wilayahs, setWilayahs] = useState([])
  const [orgLoading, setOrgLoading] = useState(false)
  const [selectedDukuhId, setSelectedDukuhId] = useState(null)
  const { brand, navItems, hero, visi, misi, video, struktur, kegiatan, umkm, kontak } = landingData

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

  // Data dari sistem — public endpoint (tanpa login) + tab per Dukuh; fallback mock bila backend kosong/offline
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

  // Mock fallback when not logged in — shape mirip API agar render sama kayak admin
  const mockWilayahs = useMemo(
    () => [
      { id_wilayah: 'KEL-01', nama_wilayah: brand.name, tipe: 'KELURAHAN', parent_id: null },
      { id_wilayah: 'DK-01', nama_wilayah: brand.name, tipe: 'DUKUH', parent_id: 'KEL-01' },
      { id_wilayah: 'RW-02', nama_wilayah: 'RW 02', tipe: 'RW', parent_id: 'DK-01' },
      { id_wilayah: 'RT-01', nama_wilayah: 'RT 01', tipe: 'RT', parent_id: 'RW-02' },
      { id_wilayah: 'RT-02', nama_wilayah: 'RT 02', tipe: 'RT', parent_id: 'RW-02' },
      { id_wilayah: 'RT-03', nama_wilayah: 'RT 03', tipe: 'RT', parent_id: 'RW-02' },
      { id_wilayah: 'RT-04', nama_wilayah: 'RT 04', tipe: 'RT', parent_id: 'RW-02' },
      { id_wilayah: 'RT-05', nama_wilayah: 'RT 05', tipe: 'RT', parent_id: 'RW-02' },
      { id_wilayah: 'RT-06', nama_wilayah: 'RT 06', tipe: 'RT', parent_id: 'RW-02' },
    ],
    [brand.name]
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

  return (
    <main className="min-h-screen bg-white text-neutral-800">
      <header className="sticky top-0 z-20 border-b border-neutral-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-6">
          <a href="#beranda" onClick={(e) => handleNav(e, '#beranda')} className="flex items-center gap-3 no-underline">
            <img src={brand.logo} alt={`Logo ${brand.name}`} className="h-9 w-9 object-contain" />
            <span className="text-sm font-extrabold leading-none text-neutral-900">{brand.name}</span>
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
      <section id="beranda" className="relative scroll-mt-24 overflow-hidden bg-[#f6f7f4]">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1600&q=80"
            alt=""
            className="h-full w-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/60 to-[#f6f7f4]" />
        </div>
        <div className="relative mx-auto max-w-7xl px-6 py-20 text-center md:py-28">
          <h1 className="mx-auto max-w-3xl text-3xl font-extrabold leading-tight text-neutral-900 md:text-5xl">{hero.title}</h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-neutral-600 md:text-lg">{hero.description}</p>
          <a
            href={hero.ctaHref}
            onClick={(e) => handleNav(e, hero.ctaHref)}
            className="mt-8 inline-flex rounded-full bg-[#14532d] px-8 py-3 text-sm font-bold text-white no-underline shadow-sm transition hover:bg-[#0f3d22]"
          >
            {hero.ctaLabel}
          </a>
        </div>
      </section>

      {/* PROFIL */}
      <section id="profil" className="mx-auto max-w-7xl scroll-mt-24 px-6 py-14 md:py-16">
        <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#14532d]">Profil {brand.name}</p>
        <h2 className="mt-2 text-2xl font-extrabold text-neutral-900 md:text-3xl">Profil {brand.name}</h2>
        <div className="mt-8 grid gap-10 md:grid-cols-[1.1fr_0.9fr]">
          <div>
            <h3 className="text-lg font-extrabold text-neutral-900">Visi</h3>
            <p className="mt-3 max-w-xl text-[15px] leading-7 text-neutral-600">{visi}</p>
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-neutral-900">Misi</h3>
            <ul className="mt-3 space-y-3">
              {misi.map((m) => (
                <li key={m} className="flex gap-3 text-[15px] leading-6 text-neutral-600">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#14532d]" />
                  <span>{m}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* VIDEO */}
      <section className="mx-auto max-w-7xl px-6 pb-14">
        <h3 className="text-center text-xl font-extrabold text-neutral-900">{video.title}</h3>
        <div className="mx-auto mt-6 max-w-3xl overflow-hidden rounded-xl border border-neutral-200 bg-black shadow-sm">
          {!videoOpen ? (
            <button onClick={() => setVideoOpen(true)} className="group relative block w-full text-left">
              <img src={video.thumb} alt="Video profil" className="aspect-video w-full object-cover opacity-90 group-hover:opacity-100" />
              <span className="absolute inset-0 grid place-items-center">
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/90 text-[#14532d] shadow-lg transition group-hover:scale-105">
                  <svg viewBox="0 0 24 24" className="h-7 w-7 fill-current"><path d="M8 5.14v14l11-7z" /></svg>
                </span>
              </span>
            </button>
          ) : (
            <div className="aspect-video w-full bg-black">
              <iframe
                title={`Video Profil ${brand.name}`}
                src={video.youtubeUrl}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}
        </div>
      </section>

      {/* STRUKTUR - mirip admin StrukturOrganisasi (read-only, tab dukuh) */}
      <section className="bg-[#f6f7f4] px-6 py-14">
        <div className="mx-auto max-w-4xl">
          <h3 className="text-center text-xl font-extrabold text-neutral-900">Struktur Organisasi {brand.name}</h3>
          <p className="mt-2 text-center text-xs text-neutral-500">
            {orgMembers ? 'Data dari sistem — hierarki Lurah → Dukuh → RW → RT' : 'Bagan struktur organisasi lengkap beserta nama pengurus'}
          </p>

          {orgLoading ? (
            <div className="mt-8 rounded-xl border border-neutral-200 bg-white p-8 text-center text-sm text-neutral-500">Memuat struktur organisasi...</div>
          ) : (
            <div className="mt-6 space-y-6">
              {/* Tabs Dukuh jika >1 dukuh (mirip admin LURAH tab dukuh) */}
              {tree.dukuhList.length > 1 && (
                <div className="flex flex-wrap justify-center gap-2">
                  {tree.dukuhList.map((d) => (
                    <button
                      key={d.id_wilayah}
                      onClick={() => setSelectedDukuhId(d.id_wilayah)}
                      className={`rounded-full border px-5 py-2 text-xs font-extrabold transition ${
                        (selectedDukuhId || tree.dukuhList[0]?.id_wilayah) === d.id_wilayah
                          ? 'border-[#14532d] bg-[#14532d] text-white'
                          : 'border-neutral-300 bg-white text-neutral-700 hover:border-[#14532d] hover:text-[#14532d]'
                      }`}
                    >
                      {d.nama_wilayah}
                    </button>
                  ))}
                </div>
              )}

              {/* Kepala Lurah */}
              {lurahMember && (
                <div className="flex justify-center">
                  <div className="flex w-full max-w-sm flex-col items-center rounded-2xl border border-neutral-300 bg-white px-8 py-6 shadow-sm">
                    <Avatar member={lurahMember} size="lg" />
                    <p className="mt-3 text-base font-bold text-black">{lurahMember.citizen?.nama_lengkap || lurahMember.name}</p>
                    <span className="mt-1 inline-block rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-emerald-700">
                      Kepala Lurah
                    </span>
                  </div>
                </div>
              )}

              {/* Kepala Dukuh */}
              {visibleDukuhs.length > 0 && (
                <>
                  <SectionHeading>Kepala Dukuh</SectionHeading>
                  <div className="space-y-4">
                    {visibleDukuhs.map((dk) => {
                      const dkMember = getDukuhMember(dk.id_wilayah)
                      return (
                        <div key={dk.id_wilayah} className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
                          <div className="mb-3 flex items-center gap-2">
                            <Icon name="building" className="h-4 w-4 text-neutral-400" />
                            <p className="text-sm font-extrabold text-black">{dk.nama_wilayah}</p>
                          </div>
                          <div className="divide-y divide-neutral-200 rounded-lg bg-white px-4">
                            {dkMember ? (
                              <div className="flex items-center gap-4 py-3">
                                <Avatar member={dkMember} size="lg" />
                                <div className="min-w-0 flex-1">
                                  <p className="truncate text-sm font-bold text-black">{dkMember.citizen?.nama_lengkap || dkMember.name}</p>
                                  <p className="text-xs font-extrabold uppercase tracking-wide text-sky-600">Kepala Dukuh</p>
                                </div>
                              </div>
                            ) : (
                              <p className="py-3 text-xs italic text-neutral-400">Kepala Dukuh belum ditunjuk</p>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </>
              )}

              {/* Pengurus RW + RT (hierarki) */}
              {visibleDukuhs.length > 0 && (
                <>
                  <SectionHeading>Pengurus RW</SectionHeading>
                  <div className="space-y-4">
                    {visibleDukuhs.map((dk) => {
                      const rwList = dk.rws
                      return (
                        <div key={dk.id_wilayah} className="space-y-3">
                          {rwList.length === 0 && (
                            <p className="rounded-xl border border-neutral-200 bg-white p-4 text-center text-xs text-neutral-400">Dukuh ini belum memiliki RW</p>
                          )}
                          {rwList.map((rw) => {
                            const rwMembers = getRwMembers(rw.id_wilayah)
                            return (
                              <div key={rw.id_wilayah} className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
                                <div className="mb-3 flex items-center gap-2">
                                  <Icon name="building" className="h-4 w-4 text-neutral-400" />
                                  <p className="text-sm font-extrabold text-black">{rw.nama_wilayah}</p>
                                </div>
                                <div className="divide-y divide-neutral-200 rounded-lg bg-white px-4">
                                  {rwMembers.length === 0 ? (
                                    <p className="py-3 text-xs italic text-neutral-400">Belum ada pengurus</p>
                                  ) : (
                                    rwMembers.map((m) => (
                                      <div key={m.id_organization_member} className="flex items-center gap-4 py-3">
                                        <Avatar member={m} size="md" />
                                        <div className="min-w-0 flex-1">
                                          <p className="truncate text-sm font-bold text-black">{m.citizen?.nama_lengkap || m.name}</p>
                                          <p className="text-xs font-extrabold uppercase tracking-wide text-sky-600">{m.jabatan}</p>
                                        </div>
                                      </div>
                                    ))
                                  )}
                                </div>

                                {rw.rts.map((rt) => (
                                  <div key={rt.id_wilayah} className="mt-3 rounded-lg border border-neutral-200 bg-white px-4">
                                    <div className="flex items-center gap-2 border-b border-neutral-100 py-2">
                                      <Icon name="building" className="h-3.5 w-3.5 text-neutral-400" />
                                      <p className="text-xs font-extrabold text-black">{rt.nama_wilayah}</p>
                                    </div>
                                    {getRtMembers(rt.id_wilayah).length === 0 ? (
                                      <p className="py-2 text-[11px] italic text-neutral-400">Belum ada pengurus RT</p>
                                    ) : (
                                      <div className="divide-y divide-neutral-100">
                                        {getRtMembers(rt.id_wilayah).map((m) => (
                                          <OfficialRow key={m.id_organization_member} member={m} />
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )
                          })}
                        </div>
                      )
                    })}
                  </div>
                </>
              )}

              {visibleDukuhs.length === 0 && effectiveMembers.length === 0 && (
                <p className="rounded-xl border border-neutral-200 bg-white p-8 text-center text-sm text-neutral-500">Belum ada data struktur organisasi.</p>
              )}
            </div>
          )}
        </div>
      </section>

      {/* KEGIATAN */}
      <section id="kegiatan" className="mx-auto max-w-7xl scroll-mt-24 px-6 py-14">
        <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#14532d]">Kegiatan Warga</p>
        <h2 className="mt-2 text-2xl font-extrabold text-neutral-900">Kegiatan {brand.name}</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {kegiatan.map((k) => (
            <article key={k.title} className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm transition hover:shadow-md">
              <img src={k.image} alt={k.title} className="aspect-[16/10] w-full object-cover" loading="lazy" />
              <div className="p-5">
                <p className="text-xs font-semibold text-neutral-500">{k.date}</p>
                <h3 className="mt-1 line-clamp-2 text-sm font-extrabold leading-6 text-neutral-900">{k.title}</h3>
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-neutral-600">{k.description}</p>
                <a href={k.href} className="mt-4 inline-flex text-sm font-bold text-[#14532d] no-underline hover:underline">
                  Selengkapnya →
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
              <h2 className="text-2xl font-extrabold text-neutral-900">{umkm.headerTitle}</h2>
              <p className="mt-2 text-sm font-semibold text-neutral-900">{umkm.headerDesc}</p>
              <p className="text-sm text-neutral-600">{umkm.headerSub}</p>
            </div>
            <a href={umkm.instagramHref} className="inline-flex rounded-full border border-neutral-300 bg-white px-5 py-2 text-sm font-bold text-neutral-800 no-underline hover:bg-neutral-50">
              Follow di Instagram
            </a>
          </div>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {umkm.items.map((item) => (
              <article key={item.title} className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
                <img src={item.image} alt={item.title} className="aspect-[4/3] w-full object-cover" loading="lazy" />
                <div className="p-5">
                  <h3 className="line-clamp-2 text-sm font-extrabold leading-6 text-neutral-900">{item.title}</h3>
                  <p className="mt-2 line-clamp-3 text-sm leading-6 text-neutral-600">{item.description}</p>
                  <WaLink
                    waNumber={kontak.waNumber}
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
        <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#14532d]">Kontak {brand.name}</p>
        <h2 className="mt-2 text-2xl font-extrabold text-neutral-900">Hubungi Kami</h2>
        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          <div className="space-y-5 text-sm leading-6">
            <div className="flex gap-3">
              <span className="mt-1 text-[#14532d]"><Icon name="map" className="h-5 w-5" /></span>
              <div>
                <p className="font-bold text-neutral-900">Alamat</p>
                <p className="text-neutral-600">{kontak.alamat}</p>
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
                <WaLink waNumber={kontak.waNumber} text={`Halo ${brand.name}`} className="text-[#14532d] no-underline hover:underline">
                  {kontak.telepon}
                </WaLink>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="mt-1 text-[#14532d]">
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-[1.9]" aria-hidden="true"><path d="M4 6h16v12H4z" /><path d="m4 7 8 7 8-7" /></svg>
              </span>
              <div>
                <p className="font-bold text-neutral-900">Email</p>
                <a href={`mailto:${kontak.email}`} className="text-[#14532d] no-underline hover:underline">{kontak.email}</a>
              </div>
            </div>
          </div>
          <div className="overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100">
            <iframe title={`Peta ${brand.name}`} src={kontak.mapEmbed} className="h-[320px] w-full border-0" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#0f1f14] px-6 py-10 text-neutral-300">
        <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-3">
              <img src={brand.logo} alt="" className="h-8 w-8 object-contain opacity-90" />
              <strong className="text-sm font-extrabold tracking-wide text-white">{brand.name}</strong>
            </div>
            <p className="mt-3 text-sm leading-6 text-neutral-400">{kontak.alamat}</p>
            <p className="mt-3 text-sm">
              <WaLink waNumber={kontak.waNumber} text="Halo" className="text-white no-underline hover:underline">{kontak.telepon}</WaLink>
              <span className="mx-2 text-neutral-600">•</span>
              <a href={`mailto:${kontak.email}`} className="text-white no-underline hover:underline">{kontak.email}</a>
            </p>
          </div>
          <div>
            <p className="text-sm font-extrabold text-white">Tautan Cepat</p>
            <nav className="mt-3 flex flex-col gap-2 text-sm">
              {navItems.filter(i=>i.href.startsWith('#')).map((i) => (
                <a key={i.label} href={i.href} onClick={(e) => handleNav(e, i.href)} className="text-neutral-400 no-underline hover:text-white">{i.label}</a>
              ))}
            </nav>
          </div>
          <div className="text-sm text-neutral-400">
            <p>© 2026 {brand.name}. All Rights Reserved.</p>
            <p className="mt-2">Developed by <span className="font-bold text-white">Universitas xyz</span> XYZ</p>
          </div>
        </div>
      </footer>

      <WaLink
        waNumber={kontak.waNumber}
        text={`Halo, saya ingin bertanya tentang ${brand.name}`}
        className="fixed bottom-4 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition hover:scale-105 max-sm:bottom-3 max-sm:right-3 max-sm:h-12 max-sm:w-12"
      >
        <span className="sr-only">Hubungi via WhatsApp</span>
        <svg viewBox="0 0 24 24" className="h-7 w-7 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" /></svg>
      </WaLink>
      <FloatingWhatsAppButton />
    </main>
  )
}
