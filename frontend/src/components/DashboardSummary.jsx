function DashboardSummary({ metrics, loading, ariaLabel = 'Leave request summary' }) {
  return (
    <section
      aria-label={ariaLabel}
      aria-busy={loading}
      className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {metrics.map(({ label, value, icon: Icon, iconClass }) => (
        <article
          key={label}
          className="flex min-h-[92px] items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-5 shadow-sm transition hover:border-brand-200 hover:shadow-md">

          <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconClass}`}>
            <Icon aria-hidden="true" size={19} />
          </span>

          <div className="min-w-0">
            <p className="text-2xl font-semibold leading-none text-slate-900">
              {loading ? '…' : value}
            </p>
            <p className="mt-1 text-sm text-slate-500">{label}</p>
          </div>
          
        </article>
      ))}
    </section>
  )
}

export default DashboardSummary
