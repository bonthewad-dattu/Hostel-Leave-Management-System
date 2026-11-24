import { useState } from 'react'
import { useAuth } from '../../context/useAuth'
import StudentNavbar from '../../components/StudentNavbar'
import { isValidPhone } from '../../utils/validators'

function StudentProfile() {
  const { user, updateProfile } = useAuth()
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setMessage('')
    if (!isValidPhone(phoneNumber)) {
      setError('Enter a valid 10-digit Indian mobile number.')
      return
    }

    setSaving(true)
    try {
      await updateProfile({ phoneNumber })
      setMessage('Your phone number has been updated.')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSaving(false)
    }
  }

  const details = [
    { label: 'Full name', value: user?.name },
    { label: 'Email address', value: user?.email },
    { label: 'College roll number', value: user?.rollNumber },
    { label: 'Student mobile number', value: user?.phoneNumber },
    { label: 'Hostel block', value: user?.hostelBlock },
    { label: 'Assigned warden', value: user?.assignedWarden?.name },
  ]

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <StudentNavbar />

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
        <header className="border-b border-slate-200 pb-7">
          <p className="text-xs font-semibold tracking-[0.16em] text-brand-600">STUDENT PORTAL</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">My profile</h1>
          <p className="mt-2 text-sm text-slate-500">
            Check your admission and hostel details. Keep your mobile number up to date.
          </p>
        </header>


        <section className="mt-7 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <h2 className="text-lg font-semibold">Student details</h2>


          <dl className="mt-5 grid gap-4 sm:grid-cols-2">
            {details.map(({ label, value }) => (
              <div key={label} className="rounded-xl bg-slate-50 p-4">
                <dt className="text-xs font-medium text-slate-500">{label}</dt>
                <dd className="mt-1 break-words text-sm font-semibold text-slate-800">
                  {value || 'Not available'}
                </dd>
              </div>

            ))}
            {user?.assignedWarden?.email && (
              <div className="rounded-xl bg-slate-50 p-4">
                <dt className="text-xs font-medium text-slate-500">Warden email</dt>
                <dd className="mt-1 break-words text-sm font-semibold text-slate-800">
                  {user.assignedWarden.email}
                </dd>
              </div>
            )}
          </dl>

          <form onSubmit={handleSubmit} className="mt-6 border-t border-slate-100 pt-6">
            <label htmlFor="profile-phone" className="block text-sm font-semibold">
              Student mobile number
            </label>
            <p className="mt-1 text-xs text-slate-500">Use a 10-digit Indian mobile number.</p>
            <div className="mt-3 flex flex-col gap-3 sm:flex-row">
              <input
                id="profile-phone"
                type="tel"
                inputMode="numeric"
                maxLength={10}
                value={phoneNumber}
                onChange={(event) => setPhoneNumber(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 sm:max-w-sm"/>
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60" >
                {saving ? 'Saving…' : 'Save phone number'}
              </button>
            </div>
            {error && <p role="alert" className="mt-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
            {message && <p role="status" className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{message}</p>}
          </form>

        </section>
        
      </div>
    </main>
  )
}

export default StudentProfile
