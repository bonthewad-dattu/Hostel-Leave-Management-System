import { AlertTriangle, X } from 'lucide-react'

function ConfirmModal({
  open,
  title = 'Are you sure?',
  message = 'Please confirm that you want to continue.',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'primary',
  busy = false,
}) {
  if (!open) return null

  const buttonStyles = {
    primary: 'bg-brand-600 hover:bg-brand-700',
    danger: 'bg-rose-600 hover:bg-rose-700',
    warning: 'bg-amber-600 hover:bg-amber-700',
  }

  return (
    <div
    className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
    onMouseDown={(event) => {
      if (!busy && event.target === event.currentTarget) onCancel?.()
    }}>
    <section
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">

      <div className="flex items-start justify-between">

        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
          <AlertTriangle size={23} />
        </span>

        <button
          type="button"
          onClick={onCancel}
          disabled={busy}
          className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          aria-label="Close dialog">
          <X size={19} />
        </button>
      </div>

      <h2
        id="confirm-title"
        className="mt-5 text-xl font-bold text-slate-900">
        {title}
      </h2>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        {message}
      </p>

      <div className="mt-7 flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={busy}
          className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">

          {cancelText}
        </button>

        <button
          type="button"
          onClick={onConfirm}
          disabled={busy}
          className={`rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${buttonStyles[variant] || buttonStyles.primary}`}>
          {busy ? 'Please wait…' : confirmText}
        </button>

      </div>

    </section>
    
  </div>
  )
}

export default ConfirmModal
