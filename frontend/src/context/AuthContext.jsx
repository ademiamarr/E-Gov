import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth as useClerkAuth } from '@clerk/clerk-react'
import { useNavigate } from 'react-router-dom'
import API, { setTokenGetter } from '../api/axios'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const { getToken, signOut, isLoaded, isSignedIn } = useClerkAuth()
  const [dbUser, setDbUser]   = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  // Setup token getter për Axios
  useEffect(() => {
    if (isLoaded) {
      setTokenGetter(async () => {
        try {
          const token = await getToken()
          return token || null
        } catch (err) {
          console.error('❌ Error getting token:', err.message)
          return null
        }
      })
      console.log('✅ Token getter initialized')
    }
  }, [isLoaded, getToken])

  // Merr user data nga backend
  useEffect(() => {
    if (!isLoaded) return

    if (!isSignedIn) {
      setDbUser(null)
      setLoading(false)
      return
    }

    const fetchDbUser = async () => {
      try {
        console.log('🔍 Fetching user data from backend...')
        const res = await API.get('/auth/me')

        if (res.data?.success && res.data?.data) {
          const userData = res.data.data
          console.log('✅ User data received:', {
            email: userData.email,
            role: userData.role,
            personal_id: userData.personal_id,
            status: userData.verification_status
          })
          setDbUser(userData)
        } else {
          setDbUser(null)
        }
      } catch (err) {
        const status = err.response?.status
        const code   = err.response?.data?.code
        const message = err.response?.data?.message || err.message

        console.error(`❌ Error fetching user (HTTP ${status}):`, message)

        // 404 USER_NOT_REGISTERED - useri është në Clerk por nuk ka bërë register
        // Ridrejtojmë në /register
        if (status === 404 && code === 'USER_NOT_REGISTERED') {
          console.warn('⚠️ User not registered, redirecting to /register')
          navigate('/register', { replace: true })
          setDbUser(null)
          setLoading(false)
          return
        }

        // 401 - token invalid, logout
        if (status === 401) {
          console.warn('⚠️ Token invalid, logging out...')
          await signOut()
        }

        setDbUser(null)
      } finally {
        setLoading(false)
      }
    }

    fetchDbUser()
  }, [isLoaded, isSignedIn, signOut, navigate])

  // Redirekto bazuar në role
  useEffect(() => {
    if (loading || !isLoaded || !isSignedIn || !dbUser) return

    const { role, verification_status } = dbUser
    const currentPath = window.location.pathname

    console.log(`🎯 User role: ${role}, status: ${verification_status}, EMBG: ${dbUser.personal_id}`)

    if (verification_status === 'pending' && !currentPath.startsWith('/pending')) {
      navigate('/pending', { replace: true })
      return
    }

    if (verification_status === 'rejected' && !currentPath.startsWith('/rejected')) {
      navigate('/rejected', { replace: true })
      return
    }

    const adminRoles = ['super_admin', 'admin_users', 'admin_fines', 'admin_appointments']
    if (adminRoles.includes(role)) {
      if (['/login', '/register', '/dashboard'].includes(currentPath)) {
        navigate('/admin', { replace: true })
      }
      return
    }

    if (role === 'user') {
      if (currentPath === '/login' || currentPath === '/register' || currentPath.startsWith('/admin')) {
        navigate('/dashboard', { replace: true })
      }
    }
  }, [dbUser, loading, isLoaded, isSignedIn, navigate])

  const logout = async () => {
    console.log('🔴 Logging out...')
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