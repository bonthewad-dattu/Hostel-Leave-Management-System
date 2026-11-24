import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/useAuth'
import { isValidCollegeRollNumber, isValidPhone } from '../../utils/validators'
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Eye,
  EyeOff,
  GraduationCap,
  LockKeyhole,
  Mail,
  ShieldCheck,
  UserRound,
} from 'lucide-react'

function Register() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    rollNumber: '',
    phoneNumber: '',
    hostelBlock: '',
    password: '',
    confirmPassword: '',
  })
  function handleChange(e) {
    const { name, value } = e.target

    setFormData({
      ...formData,
      [name]: value,
    })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (Object.values(formData).some(value => !value)) {
      setError('Please fill in all fields.')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    if (!isValidPhone(formData.phoneNumber)) {
      setError('Enter a valid 10-digit Indian mobile number.')
      return
    }

    if (!isValidCollegeRollNumber(formData.rollNumber)) {
      setError('Use your college roll number in the format 26A100.')
      return
    }

    try {
      const newUser = await register(formData)
      setSuccess('Account created successfully.')
      navigate(`/${newUser.role}/dashboard`, { replace: true })
    } catch (registrationError) {
      setError(registrationError.message)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-2 sm:p-4 lg:p-5">
      <div className="grid w-full max-w-4xl overflow-hidden rounded-[28px] bg-white shadow-[0_24px_80px_-28px_rgba(15,35,48,0.28)] lg:grid-cols-2">
        <aside className="relative flex min-h-[240px] flex-col justify-between overflow-hidden bg-brand-800 px-6 py-6 text-white sm:px-8 sm:py-7 lg:px-9 lg:py-7">
          <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -bottom-40 -left-32 h-96 w-96 rounded-full bg-brand-900/60 blur-3xl" />

          <div className="relative">
            <div className="flex items-center gap-3">

              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15">
                <Building2 aria-hidden="true" size={23} strokeWidth={1.8} />
              </span>
              
              <span className="text-xl font-semibold tracking-tight">HostelEase</span>
            </div>

            <div className="mt-7 max-w-md sm:mt-9">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium tracking-wide text-teal-100 ring-1 ring-white/10">

                <GraduationCap aria-hidden="true" size={15} />
                YOUR CAMPUS, IN SYNC
              </span>
              <h1 className="mt-3 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl lg:text-[36px]">
                Make hostel life
                <br />
                work for you.
              </h1>
              <p className="mt-2 max-w-sm text-sm leading-5 text-slate-300">
                Create an account to request time away and stay up to date with
                your hostel.
              </p>
            </div>
          </div>

          <div className="relative mt-5 space-y-2">
            {['Easy leave requests', 'Clear approval updates', 'One place for your hostel'].map(
              (item) => (
                <div key={item} className="flex items-center gap-3 text-sm text-slate-200">
                  <CheckCircle2
                    aria-hidden="true"
                    className="shrink-0 text-teal-300"
                    size={17}
                  />
                  {item}
                </div>
              ),
            )}
            <p className="pt-2 text-xs text-slate-400">
              A better way to manage hostel life.
            </p>
          </div>
        </aside>

        <section className="flex items-center justify-center px-5 py-5 sm:px-8 sm:py-6 lg:px-9 lg:py-5">
          <div className="w-full max-w-sm">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-medium text-slate-500">Get started</span>
              <p className="text-sm text-slate-500">
                Already a member?{' '}

                <Link
                  to="/login"
                  className="font-semibold text-brand-600 transition hover:text-brand-700 hover:underline">
                  Sign in
                </Link>
              </p>
            </div>

            <div className="mt-5">
              <h2 className="text-3xl font-semibold tracking-tight text-slate-900">
                Create your account
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Register as a student for self-service access. Administrators can create student or warden accounts for controlled onboarding.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="mt-4 space-y-2.5 lg:grid lg:grid-cols-2 lg:gap-x-3 lg:gap-y-2.5 lg:space-y-0">
              {error && (
                <p
                  role="alert"
                  className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 lg:col-span-2">
                  {error}
                </p>

              )}

              {success && (
                <p
                  role="status"
                  className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 lg:col-span-2" >
                  {success}
                </p>
              )}
              <div className="min-w-0">

                <label
                  htmlFor="name"
                  className="mb-1 block text-sm font-medium text-slate-700">
                  Full name
                </label>


                <div className="relative">
                  <UserRound
                    aria-hidden="true"
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    size={18}
                    strokeWidth={1.8}/>
                  <input
                    id="name"
                    type="text"
                    name="name"
                    autoComplete="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Full name"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/60 py-2.5 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10"/>
                </div>
              </div>


              <div className="min-w-0">
                <label
                  htmlFor="email"
                  className="mb-1 block text-sm font-medium text-slate-700" >
                  Email address
                </label>

                <div className="relative">
                  <Mail
                    aria-hidden="true"
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    size={18}
                    strokeWidth={1.8} />

                  <input
                    id="email"
                    type="email"
                    name="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@college.edu"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/60 py-2.5 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10"/>
                </div>

              </div>

              <div className="min-w-0">

                <label
                  htmlFor="rollNumber"
                  className="mb-1 block text-sm font-medium text-slate-700">

                  Roll number
                </label>

                <input
                  id="rollNumber"
                  type="text"
                  name="rollNumber"
                  value={formData.rollNumber}
                  onChange={(event) => setFormData({ ...formData, rollNumber: event.target.value.toUpperCase() })}
                  placeholder="Ex:26A100"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10"/>
              </div>

              <div className="min-w-0">
                <label
                  htmlFor="phoneNumber"
                  className="mb-1 block text-sm font-medium text-slate-700">
                  Student mobile number
                </label>
                <input
                  id="phoneNumber"
                  type="tel"
                  name="phoneNumber"
                  inputMode="numeric"
                  maxLength={10}
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder="10-digit mobile number"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10"/>
              </div>

              <div className="min-w-0">
                <label
                  htmlFor="hostelBlock"
                  className="mb-1 block text-sm font-medium text-slate-700"
                >
                  Hostel block
                </label>
                <input
                  id="hostelBlock"
                  type="text"
                  name="hostelBlock"
                  value={formData.hostelBlock}
                  onChange={handleChange}
                  maxLength={80}
                  placeholder="Enter your hostel block"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10"/>
              </div>

              <div className="min-w-0">
                <label
                  htmlFor="password"
                  className="mb-1 block text-sm font-medium text-slate-700">
                  Password
                </label>

                <div className="relative">
                  <LockKeyhole
                    aria-hidden="true"
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    size={18}
                    strokeWidth={1.8}/>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    autoComplete="new-password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Password"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/60 py-2.5 pl-11 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10"/>
                  <button
                    type="button"
                    onClick={() => setShowPassword((visible) => !visible)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 transition hover:text-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500">
                    {showPassword ? (
                      <EyeOff aria-hidden="true" size={18} />
                    ) : (
                      <Eye aria-hidden="true" size={18} />
                    )}
                  </button>
                </div>
              </div>

              <div className="min-w-0">
                <label
                  htmlFor="confirmPassword"
                  className="mb-1 block text-sm font-medium text-slate-700">
                  Confirm password
                </label>
                <div className="relative">
                  <LockKeyhole
                    aria-hidden="true"
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    size={18}
                    strokeWidth={1.8}/>
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    autoComplete="new-password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Re-enter"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/60 py-2.5 pl-11 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10"/>
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((visible) => !visible)}
                    aria-label={showConfirmPassword ? 'Hide confirmation password' : 'Show confirmation password'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 transition hover:text-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500" >
                    {showConfirmPassword ? (
                      <EyeOff aria-hidden="true" size={18} />
                    ) : (
                      <Eye aria-hidden="true" size={18} />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 lg:col-span-2">
                Create account
                <ArrowRight
                  aria-hidden="true"
                  className="transition-transform group-hover:translate-x-0.5"
                  size={17}/>
              </button>
            </form>

            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-500 lg:mt-3">
              <ShieldCheck aria-hidden="true" className="text-brand-500" size={16} />
              Your details are only used to manage your account.
            </div>

          </div>

        </section>

      </div>
      

    </main>



  )
}

export default Register
