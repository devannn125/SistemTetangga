/**
 * PageShell — wrapper konten halaman portal reusable.
 * Menampilkan eyebrow (label kecil), title, dan description di bagian atas,
 * diikuti children (konten halaman).
 *
 * Diupgrade menggunakan desain yang lebih clean namun tetap mempertahankan
 * semua props yang sudah ada.
 */
export function PageShell({ children, eyebrow, title, description }) {
  return (
    <div className="px-6 py-6 max-md:px-4 max-md:py-5">
      {/* Page Header */}
      <div className="mb-6 border-b border-neutral-100 pb-5">
        {eyebrow && (
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-sky-600">
            {eyebrow}
          </p>
        )}
        <h1 className="text-2xl font-bold leading-tight text-neutral-900 max-sm:text-xl">
          {title}
        </h1>
        {description && (
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-neutral-500">
            {description}
          </p>
        )}
      </div>

      {/* Page Content */}
      {children}
    </div>
  )
}