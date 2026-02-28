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

  useEffect(() => {
    if (isLoaded) setTokenGetter(() => getToken)
  }, [isLoaded, getToken])

  useEffect(() => {
    if (!isLoaded) return
    if (!isSignedIn) { setDbUser(null); setLoading(false); return }

    const fetch = async () => {
      try {
        const res = await API.get('/auth/me')
        setDbUser(res.data.data)
      } catch (err) {
        console.error('fetchDbUser:', err.response?.status)
        setDbUser(null)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [isLoaded, isSignedIn])

  useEffect(() => {
    if (loading || !isLoaded || !isSignedIn || !dbUser) return
    const { role } = dbUser
    const path = window.location.pathname
    const adminRoles = ['super_admin','admin_users','admin_fines','admin_appointments']

    if (role === 'pending'  && path !== '/pending')   return navigate('/pending')
    if (role === 'rejected' && path !== '/rejected')  return navigate('/rejected')
    if (role === 'user' && path.startsWith('/admin')) return navigate('/dashboard')
    if (adminRoles.includes(role) && path === '/dashboard') return navigate('/admin')
  }, [dbUser, loading, isLoaded, isSignedIn])

  const logout = async () => {
    await signOut()
    setDbUser(null)
    navigate('/login')
  }

  return (
    <AuthContext.Provider value={{ user: dbUser, loading, logout, isSignedIn }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)