import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth as useClerkAuth } from '@clerk/react'
import { useNavigate } from 'react-router-dom'
import API, { setTokenGetter } from '../api/axios'

const AuthContext = createContext(null)

const ADMIN_ROLES = [
  'super_admin', 'admin_users', 'admin_mvr', 'admin_komuna', 'admin_fines'
]

// Ku shkon çdo admin sapo kyçet
const ADMIN_HOME = {
  super_admin:  '/admin/registrations',
  admin_users:  '/admin/registrations',
  admin_mvr:    '/admin/mvr',
  admin_komuna: '/admin/komuna',
  admin_fines:  '/admin/gjoba',
}

export const AuthProvider = ({ children }) => {
  const { getToken, signOut, isLoaded, isSignedIn } = useClerkAuth()
  const [dbUser, setDbUser]   = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  // Inicializo token getter për Axios
  useEffect(() => {
    if (!isLoaded) return
    setTokenGetter(async () => {
      try { return await getToken() || null }
      catch { return null }
    })
  }, [isLoaded, getToken])

  // Merr user nga backend
  useEffect(() => {
    if (!isLoaded) return

    if (!isSignedIn) {
      setDbUser(null)
      setLoading(false)
      return
    }

    const fetchUser = async () => {
      try {
        const res = await API.get('/auth/me')
        if (res.data?.success && res.data?.data) {
          setDbUser(res.data.data)
        } else {
          setDbUser(null)
        }
      } catch (err) {
        if (err.response?.status === 401) signOut()
        setDbUser(null)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [isLoaded, isSignedIn, signOut])

  // Redirect bazuar në rol
  useEffect(() => {
    if (loading || !isLoaded || !isSignedIn || !dbUser) return

    const { role, verification_status } = dbUser
    const path = window.location.pathname

    // Pending → faqja e pritjes
    if (verification_status === 'pending' && !path.startsWith('/pending')) {
      navigate('/pending', { replace: true })
      return
    }

    // Rejected → faqja e refuzimit
    if (verification_status === 'rejected' && !path.startsWith('/rejected')) {
      navigate('/rejected', { replace: true })
      return
    }

    // Admin → drejto te paneli i vet
    if (ADMIN_ROLES.includes(role)) {
      const adminHome = ADMIN_HOME[role] || '/admin/registrations'
      const isOnWrongPage =
        path === '/login'     ||
        path === '/register'  ||
        path === '/dashboard' ||
        path === '/admin'     ||
        path === '/admin/'

      if (isOnWrongPage) {
        navigate(adminHome, { replace: true })
      }
      return
    }

    // User i rregullt → dashboard
    if (role === 'user') {
      if (path === '/login' || path === '/register' || path.startsWith('/admin')) {
        navigate('/dashboard', { replace: true })
      }
    }
  }, [dbUser, loading, isLoaded, isSignedIn, navigate])

  const logout = async () => {
    await signOut()
    setDbUser(null)
    navigate('/login', { replace: true })
  }

  return (
    <AuthContext.Provider value={{ user: dbUser, loading, logout, isSignedIn }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}