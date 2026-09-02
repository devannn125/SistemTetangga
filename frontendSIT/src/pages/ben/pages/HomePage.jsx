import { PageShell } from '@/components/layout/PageShell'
import { getAuthData } from '@/services/authService'

export default function HomePage() {
  const authUser = getAuthData()

  return (
    <PageShell
      eyebrow="Portal Bendahara RT"
      title={`Selamat datang, ${authUser?.nama_users || 'Bendahara'}`}
      description="Kelola pemasukan & pengeluaran kas RT, tagihan iuran, serta pemantauan data warga dan perumahan."
    >
      <section className="mt-8 grid gap-5 md:grid-cols-3">
        <article className="border border-neutral-900 bg-white p-6">
          <h2 className="text-lg font-extrabold text-black">Keuangan</h2>
          <p className="mt-3 text-sm leading-6 text-neutral-600">Input pemasukan/pengeluaran kas RT, lengkap dengan kategori dan bukti.</p>
          <a className="mt-4 inline-flex text-xs font-extrabold uppercase text-black no-underline hover:text-sky-700" href="/ben/keuangan">
            Buka Keuangan
          </a>
        </article>
        <article className="border border-neutral-900 bg-white p-6">
          <h2 className="text-lg font-extrabold text-black">Iuran Warga</h2>
          <p className="mt-3 text-sm leading-6 text-neutral-600">Buat tagihan per KK, konfirmasi pembayaran (lunas/sebagian).</p>
          <a className="mt-4 inline-flex text-xs font-extrabold uppercase text-black no-underline hover:text-sky-700" href="/ben/iuran">
            Buka Iuran
          </a>
        </article>
        <article className="border border-neutral-900 bg-white p-6">
          <h2 className="text-lg font-extrabold text-black">Perumahan</h2>
          <p className="mt-3 text-sm leading-6 text-neutral-600">Pantau status pajak rumah warga dan kos.</p>
          <a className="mt-4 inline-flex text-xs font-extrabold uppercase text-black no-underline hover:text-sky-700" href="/ben/perumahan">
            Buka Perumahan
          </a>
        </article>
      </section>
    </PageShell>
  )
}
