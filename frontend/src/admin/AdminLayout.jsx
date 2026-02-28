import { useState } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Building2, Users, UserCheck, AlertTriangle, Calendar, MapPin, LogOut, BarChart2 } from 'lucide-react'
import RegistrationPanel from './panels/RegistrationPanel'
import MVRPanel from './panels/MVRPanel'
import KomunaPanel from './panels/KomunaPanel'
import GjobaPanel from './panels/GjobaPanel'
import './AdminLayout.css'

const AdminLayout = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [active, setActive] = useState('registrations')

  const isAdmin = (role) => {
    const map = {
      super_admin:          ['registrations','mvr','komuna','gjoba'],
      admin_users:          ['registrations'],
      admin_appointments:   ['mvr','komuna'],
      admin_fines:          ['gjoba'],
    }
    return map[user?.role]?.includes(role)
  }

  const go = (panel) => {
    setActive(panel)
    navigate(`/admin/${panel}`)
  }

  const navItems = [
    { id: 'registrations', icon: UserCheck,    label: 'Regjistrime' },
    { id: 'mvr',           icon: Calendar,      label: 'Terminë MVR' },
    { id: 'komuna',        icon: MapPin,         label: 'Terminë Komuna' },
    { id: 'gjoba',         icon: AlertTriangle,  label: 'Gjoba' },
  ].filter(n => isAdmin(n.id) || user?.role === 'super_admin')

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-logo">
          <div className="admin-logo-icon"><Building2 size={18} color="#fff" /></div>
          <div>
            <div className="admin-logo-title">eGov Admin</div>
            <div className="admin-logo-sub">{user?.role?.replace('_',' ')}</div>
          </div>
        </div>

        <nav className="admin-nav">
          {navItems.map(({ id, icon: Icon, label }) => (
            <button key={id}
              className={`admin-nav-item ${active === id ? 'active' : ''}`}
              onClick={() => go(id)}>
              <Icon size={17} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-user">
            <div className="admin-user-avatar">
              {user?.first_name?.[0]}{user?.last_name?.[0]}
            </div>
            <div className="admin-user-info">
              <span className="admin-user-name">{user?.first_name} {user?.last_name}</span>
              <span className="admin-user-role">{user?.role}</span>
            </div>
          </div>
          <button className="admin-logout" onClick={logout}><LogOut size={15} /></button>
        </div>
      </aside>

      <main className="admin-main">
        <Routes>
          <Route path="/"                element={<RegistrationPanel />} />
          <Route path="/registrations"   element={<RegistrationPanel />} />
          <Route path="/mvr"             element={<MVRPanel />} />
          <Route path="/komuna"          element={<KomunaPanel />} />
          <Route path="/gjoba"           element={<GjobaPanel />} />
        </Routes>
      </main>
    </div>
  )
}

export default AdminLayout