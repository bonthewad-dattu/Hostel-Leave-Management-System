import { useState } from 'react'
import { addLeaveRequest } from '../services/leaveService'

const initialForm = {
  studentName: '',
  rollNumber: '',
  hostelBlock: '',
  leaveType: 'Home Visit',
  reason: '',
  fromDate: '',
  toDate: '',
  parentContact: '',
  destination: '',
  emergencyContact: '',
}

const inputClass =
  'mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10'

const labelClass = 'text-sm font-semibold text-slate-700'

function LeaveForm({ onSubmit, initialValues = {} }) {
  const [form, setForm] = useState({
    ...initialForm,
    ...initialValues,
  })
  const [errors, setErrors] = useState({})
  const [success, setSuccess] = useState('')

  const handleChange = (event) => {
    const { name, value } = event.target

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }))

    setErrors((previous) => ({
      ...previous,
      [name]: '',
    }))

    setSuccess('')
  }

  const validate = () => {
    const nextErrors = {}

    Object.entries(form).forEach(([key, value]) => {
      if (!String(value).trim()) {
        nextErrors[key] = 'This field is required.'
      }
    })

    if (
      form.parentContact &&
      !/^[6-9]\d{9}$/.test(form.parentContact)
    ) {
      nextErrors.parentContact = 'Enter a valid 10-digit Indian mobile number.'
    }

    if (
      form.emergencyContact &&
      !/^[6-9]\d{9}$/.test(form.emergencyContact)
    ) {
      nextErrors.emergencyContact = 'Enter a valid 10-digit Indian mobile number.'
    }

    if (form.fromDate && form.toDate) {
      if (form.toDate < form.fromDate) {
        nextErrors.toDate = 'End date must be after the start date.'
      }

      const today = new Date().toISOString().split('T')[0]

      if (form.fromDate < today) {
        nextErrors.fromDate = 'Start date cannot be in the past.'
      }
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSuccess('')

    if (!validate()) return

    try {
      if (onSubmit) {
        await onSubmit(form)
      } else {
        await addLeaveRequest(form)
      }

      setSuccess('Your leave request has been submitted successfully.')
      setForm(initialForm)
    } catch (submitError) {
      setErrors({
        form: submitError.message || 'Unable to submit the request. Please try again.',
      })
    }
  }

  const fields = [
    { name: 'studentName', label: 'Student name', placeholder: 'Enter your full name' },
    { name: 'rollNumber', label: 'Roll number', placeholder: 'Enter your roll number' },
    { name: 'hostelBlock', label: 'Hostel block', placeholder: 'Example: Block A' },
    { name: 'parentContact', label: 'Parent contact number', placeholder: '10-digit mobile number' },
    { name: 'emergencyContact', label: 'Emergency contact number', placeholder: '10-digit mobile number' },
    { name: 'destination', label: 'Destination address', placeholder: 'Enter your destination address' },
  ]

  return (
    <form
      onSubmit={handleSubmit}
      className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

      <div className="border-b border-slate-100 bg-slate-50/70 px-6 py-5">
        <p className="text-xs font-bold uppercase tracking-widest text-teal-700">
          Student application
        </p>
        <h2 className="mt-1 text-xl font-bold text-slate-900">
          Leave request details
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Complete all the required information before submitting.
        </p>
      </div>

      <div className="grid gap-5 p-6 sm:grid-cols-2">
        {fields.map((field) => (
          <div
            key={field.name}
            className={field.name === 'destination' ? 'sm:col-span-2' : ''}>

            <label className={labelClass} htmlFor={field.name}>
              {field.label} *
            </label>

            <input
              id={field.name}
              name={field.name}
              value={form[field.name]}
              onChange={handleChange}
              placeholder={field.placeholder}
              className={inputClass}/>

            {field.name === 'hostelBlock' && (
              <p className="mt-1.5 text-xs leading-5 text-slate-500">
                Use the block name configured by your administrator under Manage Hostels.
              </p>
            )}
            {errors[field.name] && (
              <p className="mt-1 text-xs text-rose-600">
                {errors[field.name]}
              </p>
            )}
          </div>

        ))}

        <div>
          <label className={labelClass} htmlFor="leaveType">
            Leave type *
          </label>

          <select
            id="leaveType"
            name="leaveType"
            value={form.leaveType}
            onChange={handleChange}
            className={inputClass}>

            <option>Home Visit</option>
            <option>Personal</option>
            <option>Medical</option>
            <option>Family Emergency</option>
            <option>Other</option>
          </select>

        </div>

        <div>

          <label className={labelClass} htmlFor="fromDate">
            From date *
          </label>
          <input
            id="fromDate"
            name="fromDate"
            type="date"
            value={form.fromDate}
            onChange={handleChange}
            className={inputClass}/>
          {errors.fromDate && (
            <p className="mt-1 text-xs text-rose-600">{errors.fromDate}</p>
          )}
        </div>

        <div>
          <label className={labelClass} htmlFor="toDate">
            To date *
          </label>


          <input
            id="toDate"
            name="toDate"
            type="date"
            min={form.fromDate || undefined}
            value={form.toDate}
            onChange={handleChange}
            className={inputClass}/>

          {errors.toDate && (
            <p className="mt-1 text-xs text-rose-600">{errors.toDate}</p>
          )}
        </div>

        <div className="sm:col-span-2">
          <label className={labelClass} htmlFor="reason">
            Reason for leave *
          </label>

          <textarea
            id="reason"
            name="reason"
            rows={4}
            value={form.reason}
            onChange={handleChange}
            placeholder="Explain why you need leave..."
            className={`${inputClass} resize-y`}/>
          {errors.reason && (
            <p className="mt-1 text-xs text-rose-600">{errors.reason}</p>
          )}
        </div>

        {errors.form && (
          <p className="sm:col-span-2 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">
            {errors.form}
          </p>
        )}

        {success && (
          <p className="sm:col-span-2 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">
            {success}
          </p>
        )}
      </div>

      <div className="flex justify-end border-t border-slate-100 bg-slate-50/50 px-6 py-4">

        <button
          type="submit"
          className="rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 focus:outline-none focus:ring-4 focus:ring-brand-500/20">
          Submit leave request
        </button>

      </div>
    </form>
  )
}

export default LeaveForm
