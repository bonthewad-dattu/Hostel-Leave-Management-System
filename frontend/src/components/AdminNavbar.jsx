import { Building2, LogOut } from 'lucide-react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'

const navigation = [
  { label: 'Dashboard', to: '/admin/dashboard', end: true },
  { label: 'Leave reports', to: '/admin/reports' },
  { label: 'Hostels', to: '/admin/hostels' },
  { label: 'Users', to: '/admin/users' },
]

function getInitials(name) {
  return (name || 'Administrator')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

function AdminNavbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const name = user?.name || 'Administrator'

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
      <div className="mx-auto flex min-h-[76px] max-w-7xl flex-wrap items-center justify-between gap-x-6 gap-y-3 px-4 py-3 sm:px-6 lg:px-8">


        <Link to="/admin/dashboard" className="flex shrink-0 items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-800 text-white">
            <Building2 aria-hidden="true" size={21} />
          </span>

          <span>
            <span className="block text-base font-semibold tracking-tight text-slate-900">
              HostelEase
            </span>
            <span className="block text-xs text-slate-500">Administrator portal</span>
          </span>
          
        </Link>

        <nav
          aria-label="Administrator navigation"
          className="order-3 flex w-full gap-1 overflow-x-auto sm:order-none sm:w-auto">

          {navigation.map(({ label, to, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`
              }>

              {label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex min-w-0 items-center gap-3 sm:ml-0">

          <span
            aria-hidden="true"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700 ring-1 ring-brand-200">
            {getInitials(name)}
          </span>


          <div className="hidden min-w-0 sm:block">
            <p className="max-w-40 truncate text-sm font-semibold text-slate-800">
              {name}
            </p>
            <p className="max-w-40 truncate text-xs text-slate-500">
              {user?.email || 'Administrator account'}
            </p>
          </div>


          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700">
            <LogOut aria-hidden="true" size={16} />
            <span className="hidden md:inline">Sign out</span>
          </button>


        </div>
      </div>
    </header>
  )
}

export default AdminNavbar
