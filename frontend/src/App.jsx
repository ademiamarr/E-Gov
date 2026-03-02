import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider }    from './context/AuthContext'
import { SocketProvider }  from './context/SocketContext'
import ProtectedRoute      from './components/ProtectedRoute'
import Login               from './pages//Login'
import Register            from './pages//Register'
import VerifyEmail         from './pages//VerifyEmail'
import Pending             from './pages//Pending'
import Rejected            from './pages//Rejected'
import Dashboard           from './pages/dashboard/Dashboard'
import AdminLayout         from './admin/AdminLayout'

const ADMIN_ROLES = [
  'super_admin', 'admin_users', 'admin_mvr', 'admin_komuna', 'admin_fines'
]

const App = () => {
  return (
    <AuthProvider>
      <SocketProvider>
        <Routes>
          {/* Public */}
          <Route path="/login"        element={<Login />} />
          <Route path="/register"     element={<Register />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/pending"      element={<Pending />} />
          <Route path="/rejected"     element={<Rejected />} />

          {/* User i rregullt */}
          <Route path="/dashboard" element={
            <ProtectedRoute allowedRoles={['user']}>
              <Dashboard />
            </ProtectedRoute>
          } />

          {/* Të gjithë adminët — panelet filtrohen brenda AdminLayout */}
          <Route path="/admin/*" element={
            <ProtectedRoute allowedRoles={ADMIN_ROLES}>
              <AdminLayout />
            </ProtectedRoute>
          } />

          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </SocketProvider>
    </AuthProvider>
  )
}

export default App