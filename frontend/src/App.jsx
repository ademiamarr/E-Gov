import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider }    from './context/AuthContext'
import { SocketProvider }  from './context/SocketContext'
import ProtectedRoute      from './components/ProtectedRoute'
import Login               from './pages/Login'
import Register            from './pages/Register'
import VerifyEmail         from './pages/VerifyEmail'
import ForgotPassword      from './pages/Forgotpassword'
import ResetPassword       from './pages/ResetPassword'
import Pending             from './pages/Pending'
import Rejected            from './pages/Rejected'
import Dashboard           from './pages/dashboard/Dashboard'
import Profile             from './pages/Profile'
import AdminLayout         from './admin/AdminLayout'


const ADMIN_ROLES = [
  'super_admin', 
  'admin_users', 
  'admin_mvr', 
  'admin_komuna', 
  'admin_fines'
]

const App = () => {
  return (
    <AuthProvider>
      <SocketProvider>
        <Routes>
          
          {/* Login & Register */}
          <Route path="/login"           element={<Login />} />
          <Route path="/register"        element={<Register />} />
          
          {/* Email Verification */}
          <Route path="/verify-email"    element={<VerifyEmail />} />
          
          {/* Forgot & Reset Password */}
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password"  element={<ResetPassword />} />
          
          {/* Status Pages */}
          <Route path="/pending"         element={<Pending />} />
          <Route path="/rejected"        element={<Rejected />} />
          
          {/* Main Dashboard */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['user']}>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          
          {/* User Profile & Settings */}
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute allowedRoles={['user']}>
                <Profile />
              </ProtectedRoute>
            } 
          />

          {/* Admin Panel (with sub-routes) */}
          <Route 
            path="/admin/*" 
            element={
              <ProtectedRoute allowedRoles={ADMIN_ROLES}>
                <AdminLayout />
              </ProtectedRoute>
            } 
          />
          
          {/* Root path - redirect to login */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          
          {/* All other paths - redirect to login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </SocketProvider>
    </AuthProvider>
  )
}

export default App