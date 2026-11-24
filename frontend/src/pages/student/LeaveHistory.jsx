import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import StudentNavbar from '../../components/StudentNavbar'
import Pagination from '../../components/Pagination'
import { getStudentLeaveRequests } from '../../services/leaveService'
import { formatDate } from '../../utils/dateUtils'
import {
  CalendarDays,
  ChevronRight,
  Clock3,
  MapPin,
} from 'lucide-react'

function LeaveHistory() {
  const location = useLocation()
  const [requests, setRequests] = useState([])
  const [pagination, setPagination] = useState(null)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    getStudentLeaveRequests({ page, limit: 20 })
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
  }, [page])

  const statusClass = {
    pending: 'bg-amber-50 text-amber-800 ring-amber-600/15',
    'in review': 'bg-blue-50 text-blue-800 ring-blue-600/15',
    approved: 'bg-emerald-50 text-emerald-800 ring-emerald-600/15',
    rejected: 'bg-rose-50 text-rose-800 ring-rose-600/15',
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <StudentNavbar />
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        {location.state?.success && (
          <p
            role="status"
            className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800"
          >
            {location.state.success}
          </p>
        )}
        {error && (
          <p role="alert" className="mb-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </p>
        )}
        <div className="mt-6 flex flex-col justify-between gap-5 border-b border-slate-200 pb-7 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold tracking-[0.16em] text-brand-600">YOUR APPLICATIONS</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              Leave history
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Review your submitted leave requests and their outcomes.
            </p>
          </div>
        </div>

        {loading ? (
          <p role="status" className="mt-8 text-sm text-slate-500">Loading your leave history…</p>
        ) : requests.length === 0 ? (
          <section className="mt-8 flex flex-col gap-5 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-8 sm:flex-row sm:items-center">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
              <CalendarDays size={27} />
            </span>
            <div className="flex-1">
              <h2 className="font-semibold text-slate-900">No leave requests found</h2>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                Submit a leave request to see it in your history.
              </p>
            </div>
          </section>
        ) : (
          <section className="mt-8">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">All requests</h2>
              <span className="text-sm text-slate-500">
                {pagination?.total ?? requests.length} {pagination?.total === 1 ? 'request' : 'requests'}
              </span>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              {requests.map((request, index) => {
                const status = request.status || 'Pending'
                const statusStyle =
                  statusClass[status.toLowerCase()] ||
                  'bg-slate-100 text-slate-700 ring-slate-500/15'

                return (
                  <Link
                    key={request.id}
                    to={`/student/leave/${request.id}`}
                    className={`flex flex-col gap-4 px-5 py-5 transition hover:bg-slate-50 sm:flex-row sm:items-center ${
                      index > 0 ? 'border-t border-slate-100' : ''
                    }`}>
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                      <CalendarDays size={20} />
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-slate-900">
                          {request.leaveType || 'Leave'}
                        </h3>
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${statusStyle}`}>
                          {status}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-slate-500">
                        {formatDate(request.fromDate)} – {formatDate(request.toDate)}
                      </p>
                      <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
                        <MapPin size={14} className="shrink-0" />
                        <span className="truncate">{request.destination || 'No destination provided'}</span>
                      </p>
                    </div>

                    <ChevronRight size={18} className="hidden shrink-0 text-slate-400 sm:block" />
                  </Link>
                )
              })}
            </div>
          </section>
        )}

        <Pagination pagination={pagination} onPageChange={setPage} />

        <p className="mt-5 flex items-center gap-2 text-xs text-slate-500">
          <Clock3 size={15} />
          Leave requests are saved to the hostel management system.
        </p>
      </div>
    </main>
  )
}

export default LeaveHistory