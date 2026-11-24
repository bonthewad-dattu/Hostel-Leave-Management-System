import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { deleteLeaveRequest, getLeaveById } from '../../services/leaveService'
import { formatDate } from '../../utils/dateUtils'
import StudentNavbar from '../../components/StudentNavbar'
import ConfirmModal from '../../components/ConfirmModal'
import {
  CalendarDays,
  FileText,
  MapPin,
  Phone,
  UserRound,
} from 'lucide-react'

function LeaveDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [details, setDetails] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [cancelling, setCancelling] = useState(false)
  const [confirmCancel, setConfirmCancel] = useState(false)

  useEffect(() => {
    let active = true
    getLeaveById(id)
      .then((result) => {
        if (active) setDetails(result)
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
  }, [id])

  const request = details?.request

  if (loading) {
    return (
      <>
        <StudentNavbar />
        <main className="min-h-screen bg-slate-50 px-4 py-12 text-center text-sm text-slate-500">
          Loading leave request…
        </main>
      </>
    )
  }

  if (!request) {
    return (
      <>
        <StudentNavbar />
        <main className="min-h-screen bg-slate-50 px-4 py-12 text-slate-900">
          <section className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
              <FileText size={26} />
            </span>
            <h1 className="mt-5 text-2xl font-semibold">Leave request not found</h1>
            <p className="mt-2 text-sm text-slate-500">
              {error || 'This request may have been removed or is not available to your account.'}
            </p>
            <Link
              to="/student/leave-history"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white"
            >
              Return to leave history
            </Link>
          </section>
        </main>
      </>
    )
  }

  const status = request.status || 'Pending'
  const statusStyle = {
    pending: 'bg-amber-50 text-amber-800 ring-amber-600/15',
    'in review': 'bg-blue-50 text-blue-800 ring-blue-600/15',
    approved: 'bg-emerald-50 text-emerald-800 ring-emerald-600/15',
    rejected: 'bg-rose-50 text-rose-800 ring-rose-600/15',
  }[status.toLowerCase()] || 'bg-slate-100 text-slate-700 ring-slate-500/15'

  const requestDetails = [
    { label: 'Departure date', value: formatDate(request.fromDate), icon: CalendarDays },
    { label: 'Return date', value: formatDate(request.toDate), icon: CalendarDays },
    { label: 'Destination', value: request.destination || '—', icon: MapPin },
    { label: 'Parent contact', value: request.parentContact || '—', icon: Phone },
    { label: 'Emergency contact', value: request.emergencyContact || request.contactNumber || '—', icon: Phone },
  ]

  async function handleCancel() {
    setError('')
    setCancelling(true)
    try {
      const updatedRequest = await deleteLeaveRequest(id)
      setDetails((previous) => ({ ...previous, request: updatedRequest }))
      setConfirmCancel(false)
    } catch (requestError) {
      setError(requestError.message)
      setConfirmCancel(false)
    } finally {
      setCancelling(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">

      <StudentNavbar />

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10">

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <header className="flex flex-col justify-between gap-4 border-b border-slate-200 px-5 py-6 sm:flex-row sm:items-center sm:px-7">
            <div>
              <p className="text-xs font-semibold tracking-[0.16em] text-brand-600">LEAVE REQUEST</p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight">
                {request.leaveType || 'Leave'}
              </h1>
              <p className="mt-1 text-sm text-slate-500">Request #{request.id}</p>
            </div>
            <span className={`w-fit rounded-full px-3 py-1.5 text-sm font-semibold ring-1 ring-inset ${statusStyle}`}>
              {status}
            </span>
          </header>


          <div className="px-5 py-6 sm:px-7">
            <h2 className="text-sm font-semibold text-slate-900">Request details</h2>
            <dl className="mt-4 grid gap-3 sm:grid-cols-2">
              {requestDetails.map(({ label, value, icon: Icon }) => (
                <div key={label} className="flex items-start gap-3 rounded-xl bg-slate-50 p-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-brand-600 shadow-sm">
                    <Icon size={18} />
                  </span>
                  <div className="min-w-0">
                    <dt className="text-xs font-medium text-slate-500">{label}</dt>
                    <dd className="mt-1 break-words text-sm font-semibold text-slate-800">{value}</dd>
                  </div>
                </div>
              ))}
            </dl>

            <div className="mt-6 border-t border-slate-100 pt-6">
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                  <UserRound size={18} />
                </span>
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">Reason for leave</h2>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                    {request.reason || 'No reason provided.'}
                  </p>
                </div>
              </div>

              {status.toLowerCase() === 'pending' && (
                <div className="mt-6 flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    disabled={cancelling}
                    onClick={() => navigate('/student/apply-leave', { state: { editRequest: request } })}
                    className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                    Edit request
                  </button>
                  <button
                    type="button"
                    disabled={cancelling}
                    onClick={() => setConfirmCancel(true)}
                    className="rounded-lg border border-rose-200 px-4 py-2.5 text-sm font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-60">
                    {cancelling ? 'Cancelling…' : 'Cancel request'}
                  </button>
                </div>
              )}

              {error && (
                <p role="alert" className="mt-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">
                  {error}
                </p>
              )}

              <section className="mt-6 border-t border-slate-100 pt-6">
                <h2 className="text-sm font-semibold text-slate-900">Review timeline</h2>
                <ol className="mt-3 space-y-3">
                  {(details.history || []).map((item) => (
                    <li key={item.id} className="rounded-lg bg-slate-50 p-3 text-sm">
                      <span className="font-semibold">{item.newStatus}</span>
                      <span className="ml-2 text-slate-500">
                        {new Date(item.createdAt).toLocaleString()}
                      </span>
                      {item.note && <p className="mt-1 text-slate-600">{item.note}</p>}
                    </li>
                  ))}
                </ol>
                <div className="mt-4 space-y-3">
                  {(details.comments || []).map((item) => (
                    <article key={item.id} className="rounded-lg border border-slate-100 p-3">
                      <p className="text-sm font-semibold">{item.author}</p>
                      <p className="mt-1 whitespace-pre-wrap text-sm text-slate-600">{item.message}</p>
                      <time className="mt-2 block text-xs text-slate-400">
                        {new Date(item.createdAt).toLocaleString()}
                      </time>
                    </article>
                  ))}
                </div>

              </section>

            </div>

            
          </div>

        </section>

      </div>

      <ConfirmModal
        open={confirmCancel}
        title="Cancel this leave request?"
        message="This pending request will be marked as cancelled. Its details and history will remain available."
        confirmText="Cancel request"
        onConfirm={handleCancel}
        onCancel={() => setConfirmCancel(false)}
        variant="warning"/>
    </main>
  )
}

export default LeaveDetails