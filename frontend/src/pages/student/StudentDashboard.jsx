import { useEffect, useState } from 'react'
import { getDashboardSummary } from '../../services/adminService'
import { formatDate } from '../../utils/dateUtils'
import DashboardSummary from '../../components/DashboardSummary'
import StudentNavbar from '../../components/StudentNavbar'
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  MapPin,
  ShieldCheck,
  XCircle,
} from 'lucide-react'

function StudentDashboard() {
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

  const recentRequests = summary?.recentRequests || []

  const summaryCards = [
    {
      label: 'Total requests',
      value: summary?.totalRequests ?? 0,
      icon: FileText,
      iconClass: 'bg-brand-50 text-brand-700',
    },
    {
      label: 'Awaiting review',
      value: (summary?.pending ?? 0) + (summary?.inReview ?? 0),
      icon: Clock3,
      iconClass: 'bg-amber-50 text-amber-700',
    },
    {
      label: 'Approved',
      value: summary?.approved ?? 0,
      icon: CheckCircle2,
      iconClass: 'bg-emerald-50 text-emerald-700',
    },
    {
      label: 'Rejected',
      value: summary?.rejected ?? 0,
      icon: XCircle,
      iconClass: 'bg-rose-50 text-rose-700',
    },
  ]

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <StudentNavbar />

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">


        <section className="border-b border-slate-200 pb-7">

          <div>
            <p className="text-xs font-semibold tracking-[0.16em] text-brand-600">
              STUDENT PORTAL
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              Track your hostel leave
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
              See your applications, review decisions, and keep your plans up to date.
            </p>
            
          </div>


        </section>

        <DashboardSummary metrics={summaryCards} loading={loading} />

        {error && (
          <p role="alert" className="mt-5 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
            {error}
          </p>
        )}

        <section className="mt-9">
          <div className="flex flex-col justify-between gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-end">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-slate-900">Recent leave activity</h2>
              <p className="mt-1 text-sm text-slate-500">Your five latest applications and their current status.</p>
            </div>
          </div>

          {loading ? (
            <p role="status" className="py-8 text-sm text-slate-500">Loading your leave requests…</p>
          ) : recentRequests.length === 0 ? (
            <div className="flex flex-col gap-5 py-10 sm:flex-row sm:items-center">

              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
                <CalendarDays aria-hidden="true" size={25} strokeWidth={1.8} />
              </span>

              <div className="flex-1">
                <h3 className="font-semibold text-slate-900">No leave applications yet</h3>
                <p className="mt-1 max-w-xl text-sm leading-6 text-slate-500">
                  Once you apply, your dates, destination, and request status will appear here.
                </p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {recentRequests.map((request) => {
                const status = request.status || 'Pending'
                const statusClass = {
                  pending: 'bg-amber-50 text-amber-800 ring-amber-600/15',
                  'in review': 'bg-blue-50 text-blue-800 ring-blue-600/15',
                  approved: 'bg-emerald-50 text-emerald-800 ring-emerald-600/15',
                  rejected: 'bg-rose-50 text-rose-800 ring-rose-600/15',
                }[status.toLowerCase()] || 'bg-slate-100 text-slate-700 ring-slate-500/15'

                return (
                  <article key={request.id} className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center">
                    <div className="flex min-w-0 items-center gap-3 rounded-xl bg-brand-50 p-3 sm:w-64">
                      <CalendarDays aria-hidden="true" size={19} className="shrink-0 text-brand-600" />
                      <div className="min-w-0">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-brand-600">Leave dates</p>
                        <p className="truncate text-sm font-medium text-slate-800">
                          {formatDate(request.fromDate)} <span className="text-slate-400">–</span> {formatDate(request.toDate)}
                        </p>
                      </div>
                    </div>


                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-slate-900">{request.leaveType || 'Leave'}</h3>
                      <p className="mt-1 inline-flex max-w-full items-center gap-1.5 truncate text-sm text-slate-500">
                        <MapPin aria-hidden="true" size={14} className="shrink-0 text-slate-400" />
                        {request.destination || 'No destination provided'}
                      </p>
                    </div>
                    <span className={`inline-flex w-fit items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${statusClass}`}>
                      {status}
                    </span>
                  </article>
                )
              })}
            </div>
          )}
        </section>

        <section className="mt-8 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
            <ShieldCheck aria-hidden="true" size={21} className="shrink-0 text-brand-600" />
            <div>
              <h2 className="font-semibold text-slate-900">What happens after you apply?</h2>
              <p className="mt-1 text-sm text-slate-500">Your warden reviews the request and updates its status.</p>
            </div>
          </div>


          <ol className="mt-5 grid gap-4 border-t border-slate-100 pt-5 sm:grid-cols-3 sm:gap-0 sm:divide-x sm:divide-slate-100">
            <li className="flex items-start gap-3 sm:px-4 sm:first:pl-0">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-semibold text-brand-600">1</span>
              <div>
                <p className="text-sm font-medium text-slate-800">Submit your request</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">Add your leave dates and destination.</p>
              </div>
            </li>


            <li className="flex items-start gap-3 sm:px-4">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-semibold text-brand-600">2</span>
              <div>
                <p className="text-sm font-medium text-slate-800">Wait for review</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">Your warden can approve or reject it.</p>
              </div>
            </li>


            <li className="flex items-start gap-3 sm:px-4 sm:last:pr-0">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-semibold text-brand-600">3</span>
              <div>
                <p className="text-sm font-medium text-slate-800">Check the outcome</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">Follow updates in your leave history.</p>
              </div>
            </li>
          </ol>
        </section>

        <p className="mt-5 flex items-start gap-2 text-xs leading-5 text-slate-500">
          <Clock3 aria-hidden="true" size={15} className="mt-0.5 shrink-0" />
          Your leave requests are securely stored with the hostel management system.
        </p>


      </div>
    </main>
  )
}

export default StudentDashboard
