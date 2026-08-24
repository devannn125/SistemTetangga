import { useState } from 'react'
import { PortalLayout } from '../../components/layout/PortalLayout'
import { getAuthData } from '../../services/authService'
import HomePage from './pages/HomePage'
import WargaPage from './pages/WargaPage'
import LetterPage from './pages/LetterPage'
import InventoryPage from './pages/InventoryPage'
import PerumahanPage from './pages/PerumahanPage'
import InformasiStatistikPage from './pages/InformasiStatistikPage'
import PlaceholderPage from './pages/PlaceholderPage'

const sekMenus = [
  { label: 'Beranda', path: '/sek', icon: 'home' },
  { label: 'Data Warga', path: '/sek/warga', icon: 'users' },
  { label: 'Perumahan', path: '/sek/perumahan', icon: 'box' },
  { label: 'Tamu', path: '/sek/tamu', icon: 'idCard' },
  { label: 'Keuangan', path: '/sek/keuangan', icon: 'wallet' },
  { label: 'Iuran', path: '/sek/iuran', icon: 'receipt' },
  { label: 'Surat Keterangan', path: '/sek/surat', icon: 'file' },
  { label: 'Siskamling', path: '/sek/siskamling', icon: 'shield' },
  { label: 'Informasi & Statistik', path: '/sek/statistik', icon: 'chart' },
  { label: 'Peraturan', path: '/sek/peraturan', icon: 'scroll' },
  { label: 'Struktur Organisasi', path: '/sek/organisasi', icon: 'building' },
  { label: 'Pesan & Kesan', path: '/sek/pesan', icon: 'message' },
  { label: 'Inventaris', path: '/sek/inventaris', icon: 'box' },
]

function getCurrentMenu() {
  const pathname = window.location.pathname
  return sekMenus.find((item) => item.path === pathname) || sekMenus[0]
}

function renderPage(activePath) {
  if (activePath === '/sek/surat') return <LetterPage />
  if (activePath === '/sek/inventaris') return <InventoryPage />
  if (activePath === '/sek/warga') return <WargaPage />
  if (activePath === '/sek/perumahan') return <PerumahanPage />
  if (activePath === '/sek/tamu') return <PlaceholderPage title="Tamu" desc="Daftar tamu warga (Read-only) - Segera hadir" />
  if (activePath === '/sek/keuangan') return <PlaceholderPage title="Keuangan" desc="Pemasukan & pengeluaran kas RT (Read-only) - Segera hadir" />
  if (activePath === '/sek/iuran') return <PlaceholderPage title="Iuran" desc="Tagihan iuran warga per KK (Read-only) - Segera hadir" />
  if (activePath === '/sek/siskamling') return <PlaceholderPage title="Siskamling" desc="Jadwal ronda, kejadian, presensi (Read-only) - Segera hadir" />
  if (activePath === '/sek/statistik') return <InformasiStatistikPage />
  if (activePath === '/sek/peraturan') return <PlaceholderPage title="Peraturan" desc="Tata tertib warga tetap & tidak tetap (CRUD) - Segera hadir" />
  if (activePath === '/sek/organisasi') return <PlaceholderPage title="Struktur Organisasi" desc="Daftar pengurus RT (Read-only) - Segera hadir" />
  if (activePath === '/sek/pesan') return <PlaceholderPage title="Pesan & Kesan" desc="Pesan, keluhan, apresiasi warga (Read-only) - Segera hadir" />
  return <HomePage />
}

export function SekretarisPage() {
  const activeMenu = getCurrentMenu()

  return (
    <PortalLayout
      menuItems={sekMenus}
      activePath={activeMenu.path}
      homePath="/sek"
      brandTitle="Portal Sekretaris"
      brandSubtitle="Panel Administrasi RT"
      footerLabel="Panel Sekretaris"
    >
      {renderPage(activeMenu.path)}
    </PortalLayout>
  )
}