import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Spinner from './Spinner'

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading, isSignedIn } = useAuth()

  if (loading)     return <Spinner />
  if (!isSignedIn) return <Navigate to="/login" replace />
  if (!user)       return <Spinner />

  if (user.role === 'pending')  return <Navigate to="/pending"  replace />
  if (user.role === 'rejected') return <Navigate to="/rejected" replace />

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    const adminRoles = ['super_admin','admin_users','admin_fines','admin_appointments']
    return adminRoles.includes(user.role)
      ? <Navigate to="/admin" replace />
      : <Navigate to="/dashboard" replace />
  }

  return children
}

export default ProtectedRoute