import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Spinner from './Spinner'

const ADMIN_ROLES = [
  'super_admin', 'admin_users', 'admin_mvr', 'admin_komuna', 'admin_fines'
]

const ADMIN_HOME = {
  super_admin:  '/admin/registrations',
  admin_users:  '/admin/registrations',
  admin_mvr:    '/admin/mvr',
  admin_komuna: '/admin/komuna',
  admin_fines:  '/admin/gjoba',
}

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading, isSignedIn } = useAuth()

  if (loading)     return <Spinner />
  if (!isSignedIn) return <Navigate to="/login" replace />
  if (!user)       return <Spinner />

  if (user.verification_status === 'pending')  return <Navigate to="/pending"  replace />
  if (user.verification_status === 'rejected') return <Navigate to="/rejected" replace />

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Admin që nuk ka akses → drejtohet te paneli i vet
    if (ADMIN_ROLES.includes(user.role)) {
      return <Navigate to={ADMIN_HOME[user.role] || '/admin/registrations'} replace />
    }
    // User i rregullt → dashboard
    return <Navigate to="/dashboard" replace />
  }

  return children
}

export default ProtectedRoute