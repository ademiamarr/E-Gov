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

  // ✅ Setup token getter za Axios
  useEffect(() => {
    if (isLoaded) {
      setTokenGetter(() => getToken)
      console.log('✅ Token getter e caktuar')
    }
  }, [isLoaded, getToken])

  // ✅ Merr user data nga backend
  useEffect(() => {
    if (!isLoaded) {
      console.log('⏳ Clerk nuk e ka ngarkuar ende...')
      return
    }

    if (!isSignedIn) {
      console.log('ℹ️ Useri nuk është i logguar')
      setDbUser(null)
      setLoading(false)
      return
    }

    const fetchDbUser = async () => {
      try {
        console.log('🔍 Po marr user data nga backend...')
        const res = await API.get('/auth/me')
        console.log('✅ User data marrë:', res.data.data)
        setDbUser(res.data.data)
      } catch (err) {
        const status = err.response?.status
        const message = err.response?.data?.message || err.message
        
        console.error(`❌ Gabim në fetchDbUser (HTTP ${status}):`, message)
        console.error('📋 Full error:', err)

        setDbUser(null)

        // ⚠️ Nëse 401, logout userin
        if (status === 401) {
          console.log('⚠️ Token invalid, logout user...')
          signOut()
        }
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

    const { role } = dbUser
    const currentPath = window.location.pathname

    console.log(`🎯 Redirekto bazuar në role: ${role} (aktual path: ${currentPath})`)

    // Nëse pending, shko në /pending
    if (role === 'pending' && !currentPath.startsWith('/pending')) {
      console.log('➡️ Redirekto → /pending')
      navigate('/pending', { replace: true })
    }
    // Nëse rejected, shko në /rejected
    else if (role === 'rejected' && !currentPath.startsWith('/rejected')) {
      console.log('➡️ Redirekto → /rejected')
      navigate('/rejected', { replace: true })
    }
    // Nëse admin dhe në /dashboard, shko në /admin
    else if (
      ['super_admin', 'admin_users', 'admin_fines', 'admin_appointments'].includes(role) &&
      currentPath === '/dashboard'
    ) {
      console.log('➡️ Redirekto → /admin')
      navigate('/admin', { replace: true })
    }
    // Nëse user normal dhe në /admin, shko në /dashboard
    else if (role === 'user' && currentPath.startsWith('/admin')) {
      console.log('➡️ Redirekto → /dashboard')
      navigate('/dashboard', { replace: true })
    }
    // Nëse user approved dhe në /login, shko në dashboard/admin
    else if ((role === 'user' || ['super_admin', 'admin_users', 'admin_fines', 'admin_appointments'].includes(role)) && currentPath === '/login') {
      const nextPath = ['super_admin', 'admin_users', 'admin_fines', 'admin_appointments'].includes(role) ? '/admin' : '/dashboard'
      console.log(`➡️ Redirekto → ${nextPath}`)
      navigate(nextPath, { replace: true })
    }
  }, [dbUser, loading, isLoaded, isSignedIn, navigate])

  const logout = async () => {
    console.log('🔴 Logout process starting...')
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
    throw new Error('useAuth duhet të përdoret brenda AuthProvider')
  }
  return context
}