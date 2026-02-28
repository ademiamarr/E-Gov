import { createContext, useContext, useEffect, useState, useRef } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from './AuthContext'

const SocketContext = createContext(null)

export const SocketProvider = ({ children }) => {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [liveNotif, setLiveNotif]         = useState(null)
  const socketRef = useRef(null)

  useEffect(() => {
    if (!user?.id) return

    socketRef.current = io(import.meta.env.VITE_SOCKET_URL, {
      transports: ['websocket'],
    })

    socketRef.current.emit('register', user.id)

    socketRef.current.on('notification', (notif) => {
      setNotifications(prev => [notif, ...prev])
      setLiveNotif(notif)
      setTimeout(() => setLiveNotif(null), 4000)
    })

    return () => socketRef.current?.disconnect()
  }, [user?.id])

  return (
    <SocketContext.Provider value={{ notifications, setNotifications, liveNotif }}>
      {children}
    </SocketContext.Provider>
  )
}

export const useSocket = () => useContext(SocketContext)