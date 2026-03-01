import { useState } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Building2, Users, UserCheck, AlertTriangle, Calendar, MapPin, LogOut, Menu, X } from 'lucide-react'
import RegistrationPanel from './panels/RegistrationPanel.jsx'
import MVRPanel from './panels/MVRPanel.jsx'
import KomunaPanel from './panels/KomunaPanel.jsx'
import GjobaPanel from './panels/GjobaPanel.jsx'
import './AdminLayout.css'

const AdminLayout = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [active, setActive] = useState('registrations')
  const [sidebarOpen, setSidebarOpen] = useState(true)

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
    { id: 'komuna',        icon: MapPin,        label: 'Terminë Komuna' },
    { id: 'gjoba',         icon: AlertTriangle, label: 'Gjoba' },
  ].filter(n => isAdmin(n.id) || user?.role === 'super_admin')

  return (
    <div className="admin-layout">
      {/* SIDEBAR */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="admin-sidebar-logo">
          <div className="admin-logo-icon"><Building2 size={18} color="#fff" /></div>
          <div>
            <div className="admin-logo-title">eGov Admin</div>
            <div className="admin-logo-sub">{user?.role?.replace(/_/g,' ')}</div>
          </div>
        </div>

        <nav className="admin-nav">
          {navItems.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              className={`admin-nav-item ${active === id ? 'active' : ''}`}
              onClick={() => {
                go(id)
                if (window.innerWidth < 768) setSidebarOpen(false)
              }}
            >
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
            <div>
              <span className="admin-user-name">{user?.first_name} {user?.last_name}</span>
              <span className="admin-user-role">{user?.role}</span>
            </div>
          </div>
          <button className="admin-logout" onClick={logout} title="Dil">
            <LogOut size={15} />
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="admin-main">
        <div className="admin-topbar">
          <button 
            className="admin-menu-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          
          <div className="admin-topbar-content">
            <h1 className="admin-page-title">
              {active === 'registrations' && 'Regjistrime në pritje'}
              {active === 'mvr' && 'Terminë MVR'}
              {active === 'komuna' && 'Terminë Komuna'}
              {active === 'gjoba' && 'Gjoba'}
            </h1>
          </div>

          <div className="admin-topbar-user">
            <span className="admin-user-badge">{user?.role}</span>
          </div>
        </div>

        <div className="admin-content">
          <Routes>
            <Route path="/" element={<RegistrationPanel />} />
            <Route path="/registrations" element={<RegistrationPanel />} />
            <Route path="/mvr" element={<MVRPanel />} />
            <Route path="/komuna" element={<KomunaPanel />} />
            <Route path="/gjoba" element={<GjobaPanel />} />
          </Routes>
        </div>
      </main>
    </div>
  )
}

export default AdminLayout