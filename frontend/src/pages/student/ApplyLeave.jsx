import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { addLeaveRequest, updateLeaveRequest } from '../../services/leaveService'
import { isRequired, isValidDateRange, isValidPhone } from '../../utils/validators'
import StudentNavbar from '../../components/StudentNavbar'

function ApplyLeave() {
  const navigate = useNavigate()
  const location = useLocation()
  const editRequest = location.state?.editRequest

  const [formData, setFormData] = useState({
    leaveType: editRequest?.leaveType || 'Personal',
    fromDate: editRequest?.fromDate || '',
    toDate: editRequest?.toDate || '',
    destination: editRequest?.destination || '',
    parentContact: editRequest?.parentContact || '',
    emergencyContact: editRequest?.emergencyContact || '',
    reason: editRequest?.reason || '',
  })

  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function handleChange(e) {
    const { name, value } = e.target

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    const {
      fromDate,
      toDate,
      reason,
      destination,
      parentContact,
      emergencyContact,
    } = formData

    if (![fromDate, toDate, reason, destination, parentContact, emergencyContact].every(isRequired)) {
      setError('Please fill in all required fields.')
      return
    }

    if (!isValidDateRange(fromDate, toDate)) {
      setError('Return date cannot be before the departure date.')
      return
    }

    if (!isValidPhone(parentContact) || !isValidPhone(emergencyContact)) {
      setError('Enter valid 10-digit Indian mobile numbers for both contacts.')
      return
    }

    setSubmitting(true)
    try {
      if (editRequest) {
        await updateLeaveRequest(editRequest.id, formData)
        navigate(`/student/leave/${editRequest.id}`, { replace: true })
      } else {
        await addLeaveRequest(formData)
        navigate('/student/leave-history', {
          replace: true,
          state: { success: 'Your leave request was submitted successfully.' },
        })
      }
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <StudentNavbar />
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-6">
          <p className="text-xs font-semibold tracking-[0.16em] text-brand-600">
            STUDENT PORTAL
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
            {editRequest ? 'Edit leave request' : 'Apply for leave'}
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Fill in the details below to submit your request for review.
          </p>
        </div>
        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Leave Information
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Provide your leave dates and reason.
            </p>
          </div>


          <div>
            <label className="mb-2 block text-sm font-medium">
              Leave Type
            </label>

            <select
              name="leaveType"
              value={formData.leaveType}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10">
              <option>Personal</option>
              <option>Medical</option>
              <option>Family Function</option>
              <option>Emergency</option>
              <option>Other</option>
            </select>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">
                Departure Date
              </label>

              <input
                type="date"
                name="fromDate"
                value={formData.fromDate}
                onChange={handleChange}
                min={new Date().toLocaleDateString('en-CA')}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10" />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Return Date
              </label>

              <input
                type="date"
                name="toDate"
                value={formData.toDate}
                onChange={handleChange}
                min={formData.fromDate || new Date().toLocaleDateString('en-CA')}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10"/>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Destination / Address
            </label>

            <input
              type="text"
              name="destination"
              value={formData.destination}
              onChange={handleChange}
              placeholder="Where will you be going?"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10"/>
          </div>

          <div className="grid gap-5 md:grid-cols-2">


            <label className="mb-2 block text-sm font-medium">
              Parent Contact Number
              <input
                type="tel"
                name="parentContact"
                value={formData.parentContact}
                onChange={handleChange}
                placeholder="10-digit mobile number"
                maxLength={10}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10"/>
            </label>


            <label className="mb-2 block text-sm font-medium">
              Emergency Contact Number
              <input
                type="tel"
                name="emergencyContact"
                value={formData.emergencyContact}
                onChange={handleChange}
                placeholder="10-digit mobile number"
                maxLength={10}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10" />
            </label>


          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Reason for Leave
            </label>

            <textarea
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              rows={4}
              placeholder="Explain why you need leave..."
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10"/>
          </div>

          {error && (
            <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
              {error}
            </p>
          )}

          <div className="flex flex-col-reverse gap-3 border-t pt-5 sm:flex-row sm:justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 disabled:cursor-not-allowed disabled:opacity-60">
              {submitting
                ? 'Saving…'
                : editRequest
                  ? 'Save changes'
                  : 'Submit Leave Request'}
            </button>


          </div>

        </form>
      </main>


    </div>

  )
}

export default ApplyLeave
