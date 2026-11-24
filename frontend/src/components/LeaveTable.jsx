import { Link } from 'react-router-dom'
import StatusBadge from './StatusBadge'

function LeaveTable({
  requests = [],
  basePath = '/student/leave',
  showStudent = false,
  emptyMessage = 'No leave requests found.',
}) {
  if (!requests.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
        <p className="font-semibold text-slate-800">{emptyMessage}</p>
        <p className="mt-1 text-sm text-slate-500">
          New applications will appear here.
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
            <tr>
              {showStudent && <th className="px-5 py-4">Student</th>}
              <th className="px-5 py-4">Request ID</th>
              <th className="px-5 py-4">Leave dates</th>
              <th className="px-5 py-4">Destination</th>
              <th className="px-5 py-4">Status</th>
              <th className="px-5 py-4">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {requests.map((request) => (
              <tr key={request.id} className="transition hover:bg-slate-50/80">
                {showStudent && (
                  <td className="px-5 py-4">
                    <p className="font-semibold text-slate-800">
                      {request.studentName || 'Student name unavailable'}
                    </p>
                    <p className="text-xs text-slate-500">
                      {request.rollNumber || '—'}
                    </p>
                  </td>
                )}

                <td className="px-5 py-4 font-medium text-slate-700">
                  #{String(request.id).slice(0, 8)}
                </td>

                <td className="px-5 py-4 text-slate-600">
                  <p>{request.fromDate || '—'}</p>
                  <p className="text-xs text-slate-400">
                    to {request.toDate || '—'}
                  </p>
                </td>

                <td className="max-w-48 truncate px-5 py-4 text-slate-600">
                  {request.destination || '—'}
                </td>

                <td className="px-5 py-4">
                  <StatusBadge status={request.status} />
                </td>

                <td className="px-5 py-4">
                  <Link
                    to={`${basePath}/${request.id}`}
                    className="font-semibold text-teal-700 hover:text-teal-900"
                  >
                    View details
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default LeaveTable
