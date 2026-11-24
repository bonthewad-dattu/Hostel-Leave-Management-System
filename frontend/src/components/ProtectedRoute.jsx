import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/useAuth'

function ProtectedRoute({ allowedRoles }) {
  const { user, isAuthenticated, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 text-sm text-slate-500">
        Checking your session…
      </main>
    )
  }

  if (!isAuthenticated) {
    return (
      <Navigate to="/login" replace state={{ from: location }}/>
    )
  }

  if (
    allowedRoles &&
    !allowedRoles.includes(user.role?.toLowerCase())
  ) {
    const roleHome = {
      student: '/student/dashboard',
      warden: '/warden/dashboard',
      admin: '/admin/dashboard',
    }

    return (
      <Navigate
        to={roleHome[user.role?.toLowerCase()] || '/login'}
        replace/>
    )
  }

  return <Outlet />
}

export default ProtectedRoute
