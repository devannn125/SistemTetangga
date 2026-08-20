import { getAuthData } from '../../../services/authService'
import { PageShell } from '../../../components/layout/PageShell'

export default function HomePage() {
  const authUser = getAuthData()

  return (
    <PageShell
      eyebrow="Portal Sekretaris RT"
      title={`Selamat datang, ${authUser?.nama_users || 'Sekretaris'}`}
      description="Verifikasi permohonan surat, kelola data warga, dan administrasi lingkungan."
    >
      <section className="mt-8 grid gap-5 md:grid-cols-3">
        <article className="border border-neutral-900 bg-white p-6">
          <h2 className="text-lg font-extrabold text-black">Surat Perlu Verifikasi</h2>
          <p className="mt-3 text-sm leading-6 text-neutral-600">Permohonan warga masuk di sini untuk diverifikasi sebelum disetujui Ketua RT.</p>
          <a className="mt-4 inline-flex text-xs font-extrabold uppercase text-black no-underline hover:text-sky-700" href="/sek/surat">
            Buka daftar surat
          </a>
        </article>
        <article className="border border-neutral-900 bg-white p-6">
          <h2 className="text-lg font-extrabold text-black">Data Warga</h2>
          <p className="mt-3 text-sm leading-6 text-neutral-600">Pengelolaan data kependudukan tingkat RT.</p>
          <a className="mt-4 inline-flex text-xs font-extrabold uppercase text-black no-underline hover:text-sky-700" href="/sek/warga">
            Buka data warga
          </a>
        </article>
        <article className="border border-neutral-900 bg-white p-6">
          <h2 className="text-lg font-extrabold text-black">Pesan & Kesan</h2>
          <p className="mt-3 text-sm leading-6 text-neutral-600">Tinjau pesan warga yang masuk.</p>
          <a className="mt-4 inline-flex text-xs font-extrabold uppercase text-black no-underline hover:text-sky-700" href="/sek/pesan">
            Buka pesan
          </a>
        </article>
      </section>
    </PageShell>
  )
}