import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AdminNavbar from '../../components/AdminNavbar'
import DashboardSummary from '../../components/DashboardSummary'
import { getDashboardSummary } from '../../services/adminService'
import {
  Building2,
  CheckCircle2,
  FileBarChart2,
  Clock3,
  Users,
  XCircle,
} from 'lucide-react'



const sections = [
  {
    title: 'Leave reports',
    description: 'Review leave request totals, outcomes, and recent activity.',
    to: '/admin/reports',
    icon: FileBarChart2,
  },
  {
    title: 'Manage hostels',
    description: 'Add, update, and remove hostel records.',
    to: '/admin/hostels',
    icon: Building2,
  },
  {
    title: 'Manage users',
    description: 'View and manage student and warden accounts.',
    to: '/admin/users',
    icon: Users,
  },
]



function AdminDashboard() {
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

  const metrics = [
    { label: 'Total requests', value: summary?.totalRequests ?? 0, icon: FileBarChart2, iconClass: 'bg-brand-50 text-brand-700' },
    { label: 'Pending', value: summary?.pending ?? 0, icon: Clock3, iconClass: 'bg-amber-50 text-amber-700' },
    { label: 'Approved', value: summary?.approved ?? 0, icon: CheckCircle2, iconClass: 'bg-emerald-50 text-emerald-700' },
    { label: 'Rejected', value: summary?.rejected ?? 0, icon: XCircle, iconClass: 'bg-rose-50 text-rose-700' },
  ]

  return (

    <main className="min-h-screen bg-slate-50 text-slate-900">

      <AdminNavbar />

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <section className="border-b border-slate-200 pb-7">
          <p className="text-xs font-semibold tracking-[0.16em] text-brand-600">ADMINISTRATION</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Admin dashboard</h1>
          <p className="mt-2 text-sm text-slate-500">
            Manage hostel information, user accounts, and leave activity.
          </p>
        </section>

        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sections.map(({ title, description, to, icon: Icon }) => (

            <Link
              key={to}
              to={to}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-brand-300 hover:shadow-md">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <Icon size={21} />
              </span>
              <h2 className="mt-4 font-semibold">{title}</h2>
              <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
            </Link>
))}

        </section>


        {error && (
          <p role="alert" className="mt-5 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
            {error}
          </p>
        )}

        <DashboardSummary
          metrics={metrics}
          loading={loading}
          ariaLabel="Leave request totals"/>

        <section className="mt-6 grid gap-6 lg:grid-cols-2">

          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-semibold">Hostel occupancy</h2>
            <p className="mt-1 text-sm text-slate-500">Current resident count compared with hostel capacity.</p>
            {summary?.hostelWise?.length ? (
              <ul className="mt-4 space-y-4">
                {summary.hostelWise.map((hostel) => (
                  <li key={hostel.id}>

                    <div className="flex justify-between gap-3 text-sm">
                      <span className="font-medium">{hostel.hostelBlock}</span>
                      <span className="text-slate-500">
                        {hostel.students}/{hostel.capacity} · {hostel.occupancyPercent}%
                      </span>
                    </div>


                    <p className="mt-1 text-xs text-slate-500">
                      {hostel.activeLeaveRequests} active leave requests · {hostel.leaveRequestPercent}% of all requests
                    </p>


                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-brand-600"
                        style={{ width: `${Math.min(hostel.occupancyPercent, 100)}%` }}
                      />
                    </div>


                  </li>

                ))}
              </ul>
            ) : (
              <p className="mt-4 text-sm text-slate-500">
                {loading ? 'Loading hostel metrics…' : 'Add hostels to see occupancy.'}
              </p>
            )}

          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-semibold">Frequent leave requests</h2>

            <p className="mt-1 text-sm text-slate-500">Students with the highest number of submitted requests.</p>

            {summary?.studentLeaveFrequency?.length ? (
              <ol className="mt-4 divide-y divide-slate-100">
                {summary.studentLeaveFrequency.map((student) => (

                  <li key={student.studentId} className="flex justify-between gap-3 py-3 text-sm">
                    <span>
                      <span className="block font-medium">{student.studentName}</span>
                      <span className="text-xs text-slate-500">{student.rollNumber}</span>
                    </span>
                    <span className="text-slate-600">{student.leaveCount} requests</span>

                  </li>
                ))}

              </ol>
            ) : (
              <p className="mt-4 text-sm text-slate-500">
                {loading ? 'Loading student metrics…' : 'No leave history yet.'}
              </p>
            )}
          </article>

        </section>

      </div>
      
    </main>
  )
}

export default AdminDashboard
