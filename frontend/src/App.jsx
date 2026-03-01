import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { SocketProvider } from './context/SocketContext'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Register from './pages/Register'
import VerifyEmail from './pages/VerifyEmail'
import Pending from './pages/Pending'
import Rejected from './pages/Rejected'
import Dashboard from './pages/dashboard/Dashboard'
import AdminLayout from './admin/AdminLayout'

const App = () => {
  return (
    <AuthProvider>
      <SocketProvider>
        <Routes>
          <Route path="/login"        element={<Login />} />
          <Route path="/register"     element={<Register />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/pending"      element={<Pending />} />
          <Route path="/rejected"     element={<Rejected />} />

          <Route path="/dashboard" element={
            <ProtectedRoute allowedRoles={['user']}>
              <Dashboard />
            </ProtectedRoute>
          } />

          <Route path="/admin/*" element={
            <ProtectedRoute allowedRoles={['super_admin','admin_users','admin_fines','admin_appointments']}>
              <AdminLayout />
            </ProtectedRoute>
          } />

          <Route path="/"  element={<Navigate to="/login" replace />} />
          <Route path="*"  element={<Navigate to="/login" replace />} />
        </Routes>
      </SocketProvider>
    </AuthProvider>
  )
}

export default App