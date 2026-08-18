export function ConfirmDialog({ open, title, message, confirmLabel = 'Ya, Lanjutkan', cancelLabel = 'Batal', onConfirm, onCancel }) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-labelledby="confirm-dialog-title">
      <div className="w-full max-w-sm border-2 border-neutral-900 bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <div className="border-b-2 border-neutral-900 bg-black px-5 py-3">
          <h2 id="confirm-dialog-title" className="text-sm font-extrabold uppercase tracking-widest text-white">{title}</h2>
        </div>
        <div className="p-6">
          <p className="text-sm leading-6 text-neutral-700">{message}</p>
          <div className="mt-6 flex justify-end gap-3">
            <button
              className="h-10 border border-neutral-900 px-5 text-xs font-extrabold text-black transition hover:bg-neutral-100"
              onClick={onCancel}
              type="button"
            >
              {cancelLabel}
            </button>
            <button
              className="h-10 border border-black bg-black px-5 text-xs font-extrabold text-white transition hover:border-red-600 hover:bg-red-600"
              onClick={onConfirm}
              type="button"
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
