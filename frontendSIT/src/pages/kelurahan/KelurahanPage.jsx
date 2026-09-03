import { useState, useEffect } from 'react'
import { PortalLayout } from '@/components/layout/PortalLayout'
import StrukturOrganisasi from '@/components/StrukturOrganisasi'
import { PageShell } from '@/components/layout/PageShell'
import { getAuthData } from '@/services/authService'
import { getCitizens, getComplaints, getLetterRequests } from '@/services/api'
import { LurahDashboard } from '@/components/dashboard/roles/LurahDashboard'
import {
  DukuhCitizenPage,
  DukuhHousingPage,
  DukuhFinancePage,
  DukuhStatisticsPage,
  DukuhRegulationPage,
  DukuhInventoryPage,
} from '@/pages/dukuh/DukuhPage'
import DataKepalaDukuhPage from '@/pages/kelurahan/pages/DataKepalaDukuhPage'
import WilayahDukuhPage from '@/pages/kelurahan/pages/WilayahDukuhPage'

// Menu portal Kelurahan — hanya modul yang memiliki halaman & akses role LURAH.
const KelurahanMenus = [
  { label: 'Beranda', path: '/kelurahan', icon: 'home' },
  { label: 'Data Warga', path: '/kelurahan/warga', icon: 'users' },
  { label: 'Wilayah Dukuh', path: '/kelurahan/wilayah-dukuh', icon: 'building' },
  { label: 'Data Kepala Dukuh', path: '/kelurahan/data-dukuh', icon: 'users' },
  { label: 'Perumahan', path: '/kelurahan/perumahan', icon: 'box' },
  { label: 'Keuangan', path: '/kelurahan/keuangan', icon: 'wallet' },
  { label: 'Informasi & Statistik', path: '/kelurahan/statistik', icon: 'trendingUp' },
  { label: 'Peraturan', path: '/kelurahan/peraturan', icon: 'scroll' },
  { label: 'Struktur Organisasi', path: '/kelurahan/struktur', icon: 'building' },
  { label: 'Inventaris', path: '/kelurahan/inventaris', icon: 'box' },
]

function getCurrentMenu() {
  const pathname = window.location.pathname
  return KelurahanMenus.find((item) => item.path === pathname) || KelurahanMenus[0]
}

function KelurahanHomePage() {
  const authUser = getAuthData()
  const [counts, setCounts] = useState({ warga: 0, complaints: 0, letters: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      getCitizens({ per_page: 200 }).catch(() => null),
      getComplaints({ per_page: 200 }).catch(() => null),
      getLetterRequests({ per_page: 200 }).catch(() => null),
    ]).then(([resCit, resComp, resLetters]) => {
      const cit = Array.isArray(resCit?.data) ? resCit.data : Array.isArray(resCit) ? resCit : []
      const comp = Array.isArray(resComp?.data) ? resComp.data : Array.isArray(resComp) ? resComp : []
      const letr = Array.isArray(resLetters?.data) ? resLetters.data : Array.isArray(resLetters) ? resLetters : []
      setCounts({ warga: cit.length, complaints: comp.length, letters: letr.length })
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  return (
    <PageShell
      eyebrow="Portal Kelurahan"
      title={`Selamat datang, ${authUser?.nama_users || 'Kepala Lurah'}`}
      description="Pusat monitoring dan pengelolaan administrasi tingkat kelurahan/dukuh."
    >
      <section className="mt-8 grid gap-5 md:grid-cols-3">
        <article className="rounded-2xl border border-neutral-300 bg-white p-6 shadow-sm">
          <p className="text-sm font-bold uppercase text-neutral-500">Total Warga</p>
          <p className="mt-3 text-2xl font-extrabold text-black">{loading ? '...' : counts.warga} Jiwa</p>
          <p className="mt-2 text-xs text-neutral-600">Beserta kartu keluarga (KK) terdaftar.</p>
        </article>
        <article className="rounded-2xl border border-neutral-300 bg-white p-6 shadow-sm">
          <p className="text-sm font-bold uppercase text-neutral-500">Pengaduan</p>
          <p className="mt-3 text-2xl font-extrabold text-black">{loading ? '...' : counts.complaints} Tiket</p>
          <p className="mt-2 text-xs text-neutral-600">Seluruh pengaduan terdaftar di wilayah.</p>
        </article>
        <article className="rounded-2xl border border-neutral-300 bg-white p-6 shadow-sm">
          <p className="text-sm font-bold uppercase text-neutral-500">Surat Terbit</p>
          <p className="mt-3 text-2xl font-extrabold text-black">{loading ? '...' : counts.letters} Dokumen</p>
          <p className="mt-2 text-xs text-neutral-600">Total surat keterangan warga terdaftar.</p>
        </article>
      </section>
    </PageShell>
  )
}

function renderPage(activePath) {
  if (activePath === '/kelurahan/warga') return <DukuhCitizenPage />
  if (activePath === '/kelurahan/wilayah-dukuh') return <WilayahDukuhPage />
  if (activePath === '/kelurahan/data-dukuh') return <DataKepalaDukuhPage />
  if (activePath === '/kelurahan/perumahan') return <DukuhHousingPage />
  if (activePath === '/kelurahan/keuangan') return <DukuhFinancePage />
  if (activePath === '/kelurahan/statistik') return <DukuhStatisticsPage />
  if (activePath === '/kelurahan/peraturan') return <DukuhRegulationPage />
  if (activePath === '/kelurahan/struktur') return <StrukturOrganisasi />
  if (activePath === '/kelurahan/inventaris') return <DukuhInventoryPage />
  return ( <PageShell eyebrow="Portal Lurah" title="Dashboard Lurah" description="Ringkasan informasi kelurahan."><LurahDashboard /></PageShell> )
}

export function KelurahanPage() {
  const activeMenu = getCurrentMenu()

  return (
    <PortalLayout
      menuItems={KelurahanMenus}
      activePath={activeMenu.path}
      homePath="/kelurahan"
      brandTitle="Portal Kelurahan"
      brandSubtitle="Panel Kepala Lurah"
      footerLabel="Panel Kepala Lurah"
    >
      {renderPage(activeMenu.path)}
    </PortalLayout>
  )
}

