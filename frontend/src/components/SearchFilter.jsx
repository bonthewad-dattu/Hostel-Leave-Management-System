import { Search, SlidersHorizontal, X } from 'lucide-react'

function SearchFilter({
  search,
  onSearchChange,
  status,
  onStatusChange,
  placeholder = 'Search by student name or roll number...',
}) {
  const clearFilters = () => {
    onSearchChange('')
    onStatusChange('all')
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center">
      <div className="relative flex-1">

        <Search
          size={18}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"/>
        <input
          type="search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={placeholder}
          className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10"/>
      </div>

      <div className="flex items-center gap-2">
        <SlidersHorizontal size={17} className="text-slate-400" />
        <select
          value={status}
          onChange={(event) => onStatusChange(event.target.value)}
          className="min-w-36 rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700 outline-none focus:border-teal-600"
          aria-label="Filter by status">

          <option value="all">All statuses</option>
          <option value="pending">Pending</option>
          <option value="in review">In Review</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="cancelled">Cancelled</option>

        </select>

        <button
          type="button"
          onClick={clearFilters}
          className="inline-flex items-center gap-1 rounded-xl px-3 py-3 text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800">
          <X size={15} />
          <span className="hidden sm:inline">Clear</span>
        </button>

      </div>
      
    </div>
  )
}

export default SearchFilter
