/**
 * ConfirmDialog — dialog konfirmasi reusable.
 * Diupgrade menggunakan desain yang lebih clean, tetap mempertahankan
 * semua props dan perilaku yang sudah ada agar tidak ada perubahan fungsi.
 */
export function ConfirmDialog({ open, title, message, confirmLabel = 'Ya, Lanjutkan', cancelLabel = 'Batal', onConfirm, onCancel, children }) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      onClick={(e) => { if (e.target === e.currentTarget) onCancel?.() }}
    >
      <div className="w-full max-w-md rounded-xl border border-neutral-200 bg-white shadow-xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between rounded-t-xl border-b border-neutral-100 px-5 py-4">
          <h2
            id="confirm-dialog-title"
            className="text-sm font-bold text-neutral-900"
          >
            {title}
          </h2>
          <button
            onClick={onCancel}
            type="button"
            className="flex h-7 w-7 items-center justify-center rounded-full text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700"
            aria-label="Tutup"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-5 py-5">
          {message && (
            <p className="text-sm leading-relaxed text-neutral-600">{message}</p>
          )}
          {children}
        </div>

        {/* Footer */}
        {(message || children) && (
          <div className="flex justify-end gap-2 rounded-b-xl border-t border-neutral-100 px-5 py-4">
            <button
              className="inline-flex h-9 items-center rounded-md border border-neutral-300 px-4 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
              onClick={onCancel}
              type="button"
            >
              {cancelLabel}
            </button>
            <button
              className="inline-flex h-9 items-center rounded-md bg-neutral-900 px-4 text-sm font-medium text-white transition-colors hover:bg-neutral-700"
              onClick={onConfirm}
              type="button"
            >
              {confirmLabel}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
