import { useState, useEffect } from 'react'
import { PageShell } from '@/components/layout/PageShell'
import { Label } from '@/components/ui/Label'
import { Input } from '@/components/ui/Input'
import { Icon } from '@/components/ui/Icon'
import { request } from '@/services/api'
import { useConfirm } from '@/components/ui/ConfirmContext'
import { useToast } from '@/components/ui/ToastContext'

export default function AdminSettingsPage() {
  const [profile, setProfile] = useState({
    nama: 'Kenaran',
    alamat: 'Jl. Kenaran No. 123, Kabupaten Sleman',
    kodepos: '55581',
    telepon: '081234567890'
  })

  const [isSaving, setIsSaving] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const confirm = useConfirm()
  const { showToast } = useToast()

  useEffect(() => {
    const savedProfile = localStorage.getItem('sistem_tetangga_profil')
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile))
    }
  }, [])

  function handleChange(e) {
    setProfile(p => ({ ...p, [e.target.name]: e.target.value }))
  }

  async function handleSave() {
    const ok = await confirm({
      title: 'Simpan Profil Desa',
      message: `Simpan perubahan profil ${profile.nama}?`,
      confirmLabel: 'Ya, Simpan',
    })
    if (!ok) return
    setIsSaving(true)
    setTimeout(() => {
      localStorage.setItem('sistem_tetangga_profil', JSON.stringify(profile))
      setIsSaving(false)
      showToast('Profil berhasil disimpan.')
    }, 600)
  }

  async function handleDownloadBackup() {
    const ok = await confirm({
      title: 'Download Backup',
      message: 'Unduh backup data warga dalam format CSV?',
      confirmLabel: 'Ya, Unduh',
    })
    if (!ok) return
    setIsDownloading(true)
    try {
      const res = await request('/citizens?per_page=1000')
      const citizens = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : [])

      let csv = 'NIK,Nama Lengkap,Jenis Kelamin,Status\n'
      citizens.forEach(c => {
        csv += `${c.nik},${c.nama_lengkap},${c.jenis_kelamin},${c.status_warga}\n`
      })

      const blob = new Blob([csv], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `backup_warga_${new Date().toISOString().slice(0, 10)}.csv`
      a.click()
      window.URL.revokeObjectURL(url)
      showToast('Backup berhasil diunduh.')
    } catch (err) {
      showToast(err.message || 'Gagal mengunduh backup.', 'error')
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <PageShell
      eyebrow='Pengaturan Sistem'
      title='Konfigurasi Global'
      description='Atur profil identitas Kelurahan dan pengaturan dasar sistem.'
    >
      <div className='mt-6 grid max-w-3xl gap-6'>
        <div className='rounded-xl border border-neutral-300 bg-white p-6 shadow-sm'>
          <h2 className='text-lg font-bold text-black'>Profil Desa / Kelurahan</h2>
          <p className='text-sm text-neutral-500'>Informasi ini akan muncul di kop surat cetak pengantar.</p>
          
          <div className='mt-4 space-y-4'>
            <div className='space-y-2'>
              <Label className='text-sm font-bold text-black'>Nama Kelurahan</Label>
              <Input name='nama' value={profile.nama} onChange={handleChange} />
            </div>
            <div className='space-y-2'>
              <Label className='text-sm font-bold text-black'>Alamat Kantor</Label>
              <Input name='alamat' value={profile.alamat} onChange={handleChange} />
            </div>
            <div className='grid gap-4 sm:grid-cols-2'>
              <div className='space-y-2'>
                <Label className='text-sm font-bold text-black'>Kode Pos</Label>
                <Input name='kodepos' value={profile.kodepos} onChange={handleChange} />
              </div>
              <div className='space-y-2'>
                <Label className='text-sm font-bold text-black'>No Telepon / WA Resmi</Label>
                <Input name='telepon' value={profile.telepon} onChange={handleChange} />
              </div>
            </div>
            <button onClick={handleSave} disabled={isSaving} className='flex w-full items-center justify-center gap-2 rounded-full bg-black px-6 py-2.5 text-sm font-bold text-white transition hover:bg-neutral-800 disabled:opacity-50'>
              <Icon name='save' className='h-4 w-4' />
              {isSaving ? 'Menyimpan...' : 'Simpan Profil'}
            </button>
          </div>
        </div>

        <div className='rounded-xl border border-neutral-300 bg-white p-6 shadow-sm'>
          <h2 className='text-lg font-bold text-black'>Backup Database</h2>
          <p className='text-sm text-neutral-500 mb-4'>Unduh seluruh data sistem dalam format CSV (Warga, Kas, Inventaris) untuk cadangan (mitigasi bencana).</p>
          <button onClick={handleDownloadBackup} disabled={isDownloading} className='flex items-center gap-2 rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm font-bold text-black transition hover:bg-neutral-50 disabled:opacity-50'>
            <Icon name='download' className='h-4 w-4' />
            {isDownloading ? 'Mengunduh...' : 'Download Backup (.CSV)'}
          </button>
        </div>
      </div>
    </PageShell>
  )
}
