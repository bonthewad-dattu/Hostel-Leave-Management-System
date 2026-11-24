import { useEffect, useState } from 'react'
import { ClipboardList } from 'lucide-react'

import SearchFilter from '../../components/SearchFilter'
import LeaveTable from '../../components/LeaveTable'
import Pagination from '../../components/Pagination'
import WardenNavbar from '../../components/WardenNavbar'
import { getLeaveRequests } from '../../services/leaveService'

function ReviewQueue() {
  const [requests, setRequests] = useState([])
  const [pagination, setPagination] = useState(null)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')

  useEffect(() => {
    let active = true
    const params = {
      page,
      limit: 20,
      ...(status === 'all' ? {} : { status }),
      ...(search.trim() ? { search: search.trim() } : {}),
    }

    getLeaveRequests(params)
      .then((result) => {
        if (!active) return
        setRequests(result.items)
        setPagination(result.pagination)
      })
      .catch((requestError) => {
        if (active) setError(requestError.message)
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [page, search, status])

  const updateSearch = (value) => {
    setPage(1)
    setLoading(true)
    setError('')
    setSearch(value)
  }

  const updateStatus = (value) => {
    setPage(1)
    setLoading(true)
    setError('')
    setStatus(value)
  }

  const clearFilters = () => {
    updateSearch('')
    updateStatus('all')
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">

      <WardenNavbar />

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-7 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold tracking-[0.16em] text-brand-600">
              WARDEN PORTAL
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              Review queue
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Search applications, check student details and review leave requests.
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <p className="text-xs text-slate-500">Matching requests</p>
            <p className="mt-1 text-2xl font-semibold text-brand-600">
              {pagination?.total ?? 0}
            </p>
          </div>
        </div>

        <section className="mt-7">
          <SearchFilter
            search={search}
            onSearchChange={updateSearch}
            status={status}
            onStatusChange={updateStatus} />
        </section>


        {error && (
          <p role="alert" className="mt-5 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
            {error}
          </p>
        )}


        <section className="mt-6" aria-label="Leave applications">
          {loading ? (
            <p role="status" className="rounded-xl bg-white p-6 text-sm text-slate-500">
              Loading review queue…
            </p>
          ) : requests.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
              <ClipboardList className="mx-auto text-brand-600" size={32} />
              <h2 className="mt-3 font-semibold text-slate-800">
                {search || status !== 'all' ? 'No matching requests found' : 'No leave requests yet'}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {search || status !== 'all'
                  ? 'Try another search term or status filter.'
                  : 'Student applications will appear here when submitted.'}
              </p>
              {(search || status !== 'all') && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-4 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <LeaveTable
              requests={requests}
              basePath="/warden/review"
              showStudent
              emptyMessage="No leave requests found."/>
          )}
        </section>
        <Pagination
          pagination={pagination}
          onPageChange={(nextPage) => {
            setLoading(true)
            setPage(nextPage)
          }} />
      </div>
    </main>
  )
}

export default ReviewQueue
