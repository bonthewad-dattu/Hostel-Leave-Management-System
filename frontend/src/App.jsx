import { Navigate, Route, Routes } from 'react-router-dom'

import ProtectedRoute from './components/ProtectedRoute'

import Login from './pages/auth/Login'
import Register from './pages/auth/Register'

import StudentDashboard from './pages/student/StudentDashboard'
import ApplyLeave from './pages/student/ApplyLeave'
import MyLeaves from './pages/student/MyLeaves'
import LeaveDetails from './pages/student/LeaveDetails'
import LeaveHistory from './pages/student/LeaveHistory'
import StudentProfile from './pages/student/StudentProfile'

import WardenDashboard from './pages/warden/WardenDashboard'
import ReviewQueue from './pages/warden/ReviewQueue'
import ReviewDetails from './pages/warden/ReviewDetails'

import AdminDashboard from './pages/admin/AdminDashboard'
import ManageUsers from './pages/admin/ManageUsers'
import ManageHostels from './pages/admin/ManageHostels'
import LeaveReports from './pages/admin/LeaveReports'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<ProtectedRoute allowedRoles={['student']} />}>
        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/student/apply-leave" element={<ApplyLeave />} />
        <Route path="/student/my-leaves" element={<MyLeaves />} />
        <Route path="/student/leave/:id" element={<LeaveDetails />} />
        <Route path="/student/leave-history" element={<LeaveHistory />} />
        <Route path="/student/profile" element={<StudentProfile />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['warden']} />}>
        <Route path="/warden/dashboard" element={<WardenDashboard />} />
        <Route path="/warden/review-queue" element={<ReviewQueue />} />
        <Route path="/warden/review/:id" element={<ReviewDetails />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<ManageUsers />} />
        <Route path="/admin/hostels" element={<ManageHostels />} />
        <Route path="/admin/reports" element={<LeaveReports />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App
