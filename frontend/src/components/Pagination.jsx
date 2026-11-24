function Pagination({ pagination, onPageChange }) {
  if (!pagination || pagination.pages < 2) return null

  return (
    <nav
      aria-label="Pagination"
      className="mt-4 flex items-center justify-between gap-3 text-sm text-slate-600">

      <button
        type="button"
        disabled={pagination.page <= 1}
        onClick={() => onPageChange(pagination.page - 1)}
        className="rounded-lg border border-slate-200 bg-white px-3 py-2 font-medium hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50">
        Previous
      </button>
      
      <span>
        Page {pagination.page} of {pagination.pages} · {pagination.total} records
      </span>

      <button
        type="button"
        disabled={pagination.page >= pagination.pages}
        onClick={() => onPageChange(pagination.page + 1)}
        className="rounded-lg border border-slate-200 bg-white px-3 py-2 font-medium hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50">
        Next
      </button>
      
    </nav>
  )
}

export default Pagination
