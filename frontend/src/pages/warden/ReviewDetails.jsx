import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import WardenNavbar from '../../components/WardenNavbar'
import CommentSection from '../../components/CommentSection'
import {
  addReviewComment,
  getLeaveById,
  updateLeaveRequest,
} from '../../services/leaveService'
import {
  CalendarDays,
  CheckCircle2,
  FileText,
  MapPin,
  Phone,
  XCircle,
} from 'lucide-react'

function ReviewDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [details, setDetails] = useState(null)
  const [loading, setLoading] = useState(true)
  const [comment, setComment] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

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

  async function updateDecision(status) {
    setError('')
    setSaving(true)
    try {
      await updateLeaveRequest(id, {
        status,
        wardenComment: comment.trim(),
      })
      navigate('/warden/review-queue')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleAddComment(message) {
    const newComment = await addReviewComment(id, message)
    setDetails((previous) => ({
      ...previous,
      comments: [...previous.comments, newComment],
    }))
  }

  if (loading) {
    return (
      <>
        <WardenNavbar />
        <main className="min-h-screen bg-slate-50 px-4 py-12 text-center text-sm text-slate-500">
          Loading leave request…
        </main>
      </>
    )
  }

  if (!request) {
    return (
      <>
        <WardenNavbar />
        <main className="min-h-screen bg-slate-50 px-4 py-12 text-slate-900">
          <section className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <FileText className="mx-auto text-slate-500" size={30} />
            <h1 className="mt-4 text-2xl font-semibold">Request not found</h1>
            <p className="mt-2 text-sm text-slate-500">
              {error || 'This request may have been removed or is not assigned to your account.'}
            </p>
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
    { label: 'Departure date', value: request.fromDate || '—', icon: CalendarDays },
    { label: 'Return date', value: request.toDate || '—', icon: CalendarDays },
    { label: 'Destination', value: request.destination || '—', icon: MapPin },
    { label: 'Parent contact', value: request.parentContact || '—', icon: Phone },
    { label: 'Emergency contact', value: request.emergencyContact || request.contactNumber || '—', icon: Phone },
  ]

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <WardenNavbar />
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <header className="flex flex-col justify-between gap-4 border-b border-slate-200 px-5 py-6 sm:flex-row sm:items-center sm:px-7">
            <div>
              <p className="text-xs font-semibold tracking-[0.16em] text-brand-600">APPLICATION DETAILS</p>
              <h1 className="mt-2 text-2xl font-semibold">{request.leaveType || 'Leave'} request</h1>
              <p className="mt-1 text-sm text-slate-500">Request #{request.id}</p>
            </div>
            <span className={`w-fit rounded-full px-3 py-1.5 text-sm font-semibold ring-1 ring-inset ${statusStyle}`}>
              {status}
            </span>
          </header>

          <div className="px-5 py-6 sm:px-7">
            <h2 className="text-sm font-semibold">Request details</h2>
            <dl className="mt-4 grid gap-3 sm:grid-cols-2">
              {requestDetails.map(({ label, value, icon: Icon }) => (
                <div key={label} className="flex items-start gap-3 rounded-xl bg-slate-50 p-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-brand-600 shadow-sm">
                    <Icon size={18} />
                  </span>
                  <div>
                    <dt className="text-xs font-medium text-slate-500">{label}</dt>
                    <dd className="mt-1 break-words text-sm font-semibold text-slate-800">{value}</dd>
                  </div>
                </div>
              ))}
            </dl>

            <section className="mt-6 border-t border-slate-100 pt-6">
              <h2 className="text-sm font-semibold">Student&apos;s reason</h2>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                {request.reason || 'No reason provided.'}
              </p>
            </section>

            <section className="mt-6 border-t border-slate-100 pt-6">
              <h2 className="text-sm font-semibold">Review timeline</h2>
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
            </section>

            <div className="mt-6">
              <CommentSection
                comments={details.comments || []}
                onAddComment={handleAddComment}
              />
            </div>

            <form
              className="mt-6 border-t border-slate-100 pt-6"
              onSubmit={(event) => event.preventDefault()}>
              <label htmlFor="warden-comment" className="block text-sm font-semibold">
                Warden comment <span className="font-normal text-slate-500">(optional)</span>
              </label>
              <textarea
                id="warden-comment"
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                rows={3}
                placeholder="Add a note for the student..."
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-600/20"  />

              {request.wardenComment && (
                <p className="mt-2 text-xs text-slate-500">
                  Previous comment: {request.wardenComment}
                </p>
              )}

              {error && (
                <p role="alert" className="mt-3 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">
                  {error}
                </p>
              )}

              <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => updateDecision('Rejected')}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-rose-200 px-4 py-2.5 text-sm font-semibold text-rose-700 transition hover:bg-rose-50" >
                  <XCircle size={17} />
                  {saving ? 'Saving…' : 'Reject request'}
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => updateDecision('Approved')}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700">
                  <CheckCircle2 size={17} />
                  {saving ? 'Saving…' : 'Approve request'}
                </button>

              </div>

            </form>

          </div>

        </section>

      </div>
      
    </main>
  )
}

export default ReviewDetails