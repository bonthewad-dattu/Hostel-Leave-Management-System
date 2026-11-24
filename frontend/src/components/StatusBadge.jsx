function StatusBadge({ status = 'Pending' }) {
  const styles = {
    pending: 'bg-amber-50 text-amber-700 ring-amber-200',
    'in review': 'bg-blue-50 text-blue-700 ring-blue-200',
    approved: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    rejected: 'bg-rose-50 text-rose-700 ring-rose-200',
    cancelled: 'bg-slate-100 text-slate-600 ring-slate-200',
  }

  const normalizedStatus = status.toLowerCase()
  const style = styles[normalizedStatus] || styles.pending

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold capitalize ring-1 ring-inset ${style}`}>
      {status}
    </span>
  )
}

export default StatusBadge
