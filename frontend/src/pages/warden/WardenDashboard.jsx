import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import WardenNavbar from '../../components/WardenNavbar'
import DashboardSummary from '../../components/DashboardSummary'
import { getDashboardSummary } from '../../services/adminService'
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  XCircle,
} from 'lucide-react'

function WardenDashboard() {
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    getDashboardSummary()
      .then((data) => {
        if (active) setSummary(data)
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
  }, [])
  const requests = summary?.recentRequests || []

  const cards = [
    { label: 'Total requests', value: summary?.totalRequests ?? 0, icon: FileText, iconClass: 'bg-brand-50 text-brand-700' },
    { label: 'Awaiting review', value: (summary?.pending ?? 0) + (summary?.inReview ?? 0), icon: Clock3, iconClass: 'bg-amber-50 text-amber-700' },
    { label: 'Approved', value: summary?.approved ?? 0, icon: CheckCircle2, iconClass: 'bg-emerald-50 text-emerald-700' },
    { label: 'Rejected', value: summary?.rejected ?? 0, icon: XCircle, iconClass: 'bg-rose-50 text-rose-700' },
  ]

  const recentRequests = requests.slice(0, 5)

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <WardenNavbar />

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <section className="flex flex-col justify-between gap-5 border-b border-slate-200 pb-7 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold tracking-[0.16em] text-brand-600">WARDEN PORTAL</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              Leave request overview
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Review student applications and keep request decisions up to date.
            </p>
          </div>
        </section>

        <DashboardSummary metrics={cards} loading={loading} />
        {error && (
          <p role="alert" className="mt-5 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
            {error}
          </p>
        )}

        <section className="mt-9">
          <div className="flex flex-col justify-between gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-end">
            <div>
              <h2 className="text-xl font-semibold">Recent requests</h2>
              <p className="mt-1 text-sm text-slate-500">The latest student applications.</p>
            </div>
          </div>

          {loading ? (
            <p role="status" className="mt-5 text-sm text-slate-500">Loading leave requests…</p>
          ) : recentRequests.length === 0 ? (
            <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center">
              <CalendarDays className="mx-auto text-brand-600" size={28} />
              <h3 className="mt-3 font-semibold">No leave requests yet</h3>
              <p className="mt-1 text-sm text-slate-500">
                Student applications will appear here when submitted.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {recentRequests.map((request) => {
                const status = request.status || 'Pending'
                const statusStyle = {
                  pending: 'bg-amber-50 text-amber-800 ring-amber-600/15',
                  'in review': 'bg-blue-50 text-blue-800 ring-blue-600/15',
                  approved: 'bg-emerald-50 text-emerald-800 ring-emerald-600/15',
                  rejected: 'bg-rose-50 text-rose-800 ring-rose-600/15',
                }[status.toLowerCase()] || 'bg-slate-100 text-slate-700 ring-slate-500/15'

                return (
                  <Link
                    key={request.id}
                    to={`/warden/review/${request.id}`}
                    className="flex flex-col gap-3 py-4 transition hover:bg-white sm:flex-row sm:items-center sm:px-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold">{request.leaveType || 'Leave'} request</h3>
                      <p className="mt-1 text-sm text-slate-500">
                        {request.fromDate || '—'} to {request.toDate || '—'}
                        {request.destination ? ` · ${request.destination}` : ''}
                      </p>
                    </div>
                    <span className={`w-fit rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${statusStyle}`}>
                      {status}
                    </span>
                  </Link>
                )
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

export default WardenDashboard
