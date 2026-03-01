import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth as useClerkAuth } from '@clerk/clerk-react'
import { useNavigate } from 'react-router-dom'
import API, { setTokenGetter } from '../api/axios'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const { getToken, signOut, isLoaded, isSignedIn, user: clerkUser } = useClerkAuth()
  const [dbUser, setDbUser]   = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  // ✅ Setup token getter za Axios - CORRECT WAY
  useEffect(() => {
    if (isLoaded) {
      // ✅ Pass a function that RETURNS a promise
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

  // ✅ Merr user data nga backend
  useEffect(() => {
    if (!isLoaded) {
      console.log('⏳ Clerk is loading...')
      return
    }

    if (!isSignedIn) {
      console.log('ℹ️ User not signed in')
      setDbUser(null)
      setLoading(false)
      return
    }

    const fetchDbUser = async () => {
      try {
        console.log('🔍 Fetching user data from backend...')
        
        const res = await API.get('/auth/me')
        
        if (res.data?.success && res.data?.data) {
          console.log('✅ User data received:', {
            email: res.data.data.email,
            role: res.data.data.role,
            status: res.data.data.verification_status
          })
          setDbUser(res.data.data)
        } else {
          console.error('❌ Invalid response format:', res.data)
          setDbUser(null)
        }
      } catch (err) {
        const status = err.response?.status
        const message = err.response?.data?.message || err.message

        console.error(`❌ Error fetching user (HTTP ${status}):`, message)
        console.error('❌ Full error:', err)

        // If 401 Unauthorized, logout
        if (status === 401) {
          console.warn('⚠️ Token invalid or user not found, logging out...')
          signOut()
        }

        setDbUser(null)
      } finally {
        setLoading(false)
      }
    }

    fetchDbUser()
  }, [isLoaded, isSignedIn, signOut])

  // ✅ Redirekto bazuar në role
  useEffect(() => {
    if (loading || !isLoaded || !isSignedIn || !dbUser) {
      return
    }

    const { role, verification_status } = dbUser
    const currentPath = window.location.pathname

    console.log(`🎯 User role: ${role}, status: ${verification_status}`)

    // Nëse pending
    if (verification_status === 'pending' && !currentPath.startsWith('/pending')) {
      console.log('➡️ Redirect → /pending')
      navigate('/pending', { replace: true })
      return
    }

    // Nëse rejected
    if (verification_status === 'rejected' && !currentPath.startsWith('/rejected')) {
      console.log('➡️ Redirect → /rejected')
      navigate('/rejected', { replace: true })
      return
    }

    // Nëse admin
    if (['super_admin', 'admin_users', 'admin_fines', 'admin_appointments'].includes(role)) {
      if (currentPath === '/login' || currentPath === '/register' || currentPath === '/dashboard') {
        console.log('➡️ Redirect → /admin')
        navigate('/admin', { replace: true })
      }
      return
    }

    // Nëse user normal
    if (role === 'user') {
      if (currentPath === '/login' || currentPath === '/register' || currentPath.startsWith('/admin')) {
        console.log('➡️ Redirect → /dashboard')
        navigate('/dashboard', { replace: true })
      }
      return
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
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}