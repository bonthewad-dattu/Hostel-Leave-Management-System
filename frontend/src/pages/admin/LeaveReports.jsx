import { useEffect, useState } from 'react'
import {FileBarChart2,} from 'lucide-react'
import AdminNavbar from '../../components/AdminNavbar'
import Pagination from '../../components/Pagination'
import { getHostels, getUsers } from '../../services/adminService'
import { getLeaveRequests } from '../../services/leaveService'

function LeaveReports() {
  const [requests, setRequests] = useState([])
  const [filters, setFilters] = useState({
    status: '',
    hostelBlock: '',
    studentName: '',
    fromDate: '',
    toDate: '',
    wardenId: '',
  })
  const [hostels, setHostels] = useState([])
  const [wardens, setWardens] = useState([])
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    Promise.all([
      getHostels(),
      getUsers({ role: 'warden', active: 'true', limit: 100 }),
    ])
      .then(([hostelItems, userData]) => {
        if (!active) return
        setHostels(hostelItems)
        setWardens(userData.items)
      })
      .catch((requestError) => {
        if (active) setError(requestError.message)
      })
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    let active = true
    const params = {
      page,
      limit: 20,
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.hostelBlock ? { hostelBlock: filters.hostelBlock } : {}),
      ...(filters.studentName ? { studentName: filters.studentName } : {}),
      ...(filters.fromDate ? { fromDate: filters.fromDate } : {}),
      ...(filters.toDate ? { toDate: filters.toDate } : {}),
      ...(filters.wardenId ? { wardenId: filters.wardenId } : {}),
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
  }, [filters, page])

  const updateFilter = (name, value) => {
    setLoading(true)
    setError('')
    setPage(1)
    setFilters((previous) => ({ ...previous, [name]: value }))
  }

  const clearFilters = () => {
    setLoading(true)
    setError('')
    setPage(1)
    setFilters({
      status: '',
      hostelBlock: '',
      studentName: '',
      fromDate: '',
      toDate: '',
      wardenId: '',
    })
  }

  const visibleRequests = requests

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">

      <AdminNavbar />


      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="border-b border-slate-200 pb-7">
          <div>
            <p className="text-xs font-semibold tracking-[0.16em] text-brand-600">ADMINISTRATION</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Leave reports</h1>
            <p className="mt-2 text-sm text-slate-500">Filter and review leave requests. Overall totals are on the dashboard.</p>
          </div>
        </div>


        {error && (
          <p role="alert" className="mt-5 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
            {error}
          </p>
        )}

        <section className="mt-8">
          <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-lg font-semibold">Leave requests</h2>
              <p className="mt-1 text-sm text-slate-500">
                {loading ? 'Loading…' : `${pagination?.total ?? visibleRequests.length} matching requests`}
              </p>
            </div>
          </div>

          <div className="mb-5 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-3">
            <p className="text-xs leading-5 text-slate-500 sm:col-span-2 lg:col-span-3">
              The date range filters the leave period, not the submission date. Requests overlapping the selected range are included.
            </p>

            <label className="text-sm font-medium text-slate-600">
              Student name
              <input
                type="search"
                value={filters.studentName}
                onChange={(event) => updateFilter('studentName', event.target.value)}
                placeholder="Search student name"
                className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-600/20"/>
            </label>

            <label className="text-sm font-medium text-slate-600">
              Hostel block

              <select
                value={filters.hostelBlock}
                onChange={(event) => updateFilter('hostelBlock', event.target.value)}
                className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-800 outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-600/20">
                <option value="">All hostels</option>
                {hostels.map((hostel) => <option key={hostel.id} value={hostel.name}>{hostel.name}</option>)}
              </select>

            </label>


            <label className="text-sm font-medium text-slate-600">
              Status
              <select
                value={filters.status}
                onChange={(event) => updateFilter('status', event.target.value)}
                className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-800 outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-600/20">


                <option value="">All statuses</option>
                <option value="pending">Pending</option>
                <option value="in review">In Review</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="cancelled">Cancelled</option>


              </select>


            </label>


            <label className="text-sm font-medium text-slate-600">
              Leave period from
              <input
                type="date"
                value={filters.fromDate}
                onChange={(event) => updateFilter('fromDate', event.target.value)}
                className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-600/20"/>

            </label>



            <label className="text-sm font-medium text-slate-600">
              Leave period through
              <input
                type="date"
                value={filters.toDate}
                onChange={(event) => updateFilter('toDate', event.target.value)}
                min={filters.fromDate || undefined}
                className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-600/20"/>
            </label>


            <label className="text-sm font-medium text-slate-600">
              Warden
              <select
                value={filters.wardenId}
                onChange={(event) => updateFilter('wardenId', event.target.value)}
                className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-800 outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-600/20">
                <option value="">All wardens</option>
                {wardens.map((warden) => <option key={warden.id} value={warden.id}>{warden.name}</option>)}
              </select>
            </label>


            <div className="flex items-end sm:col-span-2 lg:col-span-3">

              <button
                type="button"
                onClick={clearFilters}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">

                Clear filters
              </button>

            </div>

          </div>

          {loading ? (
            <p role="status" className="rounded-2xl bg-white px-6 py-10 text-sm text-slate-500">
              Loading leave reports…
            </p>
          ) : visibleRequests.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center">
              <FileBarChart2 className="mx-auto text-brand-600" size={30} />
              <h3 className="mt-3 font-semibold">{requests.length ? 'No matching requests' : 'No leave data yet'}</h3>
              <p className="mt-1 text-sm text-slate-500">Leave applications will appear here when submitted.</p>
            </div>
          ) : (

            <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>

                    <th className="px-5 py-3 font-semibold">Leave type</th>
                    <th className="px-5 py-3 font-semibold">Leave period</th>
                    <th className="px-5 py-3 font-semibold">Destination</th>
                    <th className="px-5 py-3 font-semibold">Submitted</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                  </tr>

                </thead>
                <tbody className="divide-y divide-slate-100">
                  {visibleRequests.map((request) => {
                    const status = request.status || 'Pending'
                    const badgeClass = {
                      pending: 'bg-amber-50 text-amber-800',
                      'in review': 'bg-blue-50 text-blue-800',
                      approved: 'bg-emerald-50 text-emerald-800',
                      rejected: 'bg-rose-50 text-rose-800',
                    }[status.toLowerCase()] || 'bg-slate-100 text-slate-700'

                    return (
                      <tr key={request.id}>
                        <td className="px-5 py-4 font-medium text-slate-900">{request.leaveType || 'Leave'}</td>
                        <td className="px-5 py-4 text-slate-600">{request.fromDate || '—'} to {request.toDate || '—'}</td>
                        <td className="max-w-56 truncate px-5 py-4 text-slate-600">{request.destination || '—'}</td>
                        <td className="px-5 py-4 text-slate-600">
                          {request.submittedAt ? new Date(request.submittedAt).toLocaleDateString() : '—'}
                        </td>


                        <td className="px-5 py-4">
                          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${badgeClass}`}>{status}</span>
                        </td>
                      </tr>


                    )
                  })}
                </tbody>

              </table>

            </div>

          )}

        </section>

        <Pagination
          pagination={pagination}
          onPageChange={(nextPage) => {
            setLoading(true)
            setPage(nextPage)
          }}/>
      </div>
    </main>
  )
}

export default LeaveReports