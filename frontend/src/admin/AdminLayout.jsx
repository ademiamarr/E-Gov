import { useState } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Building2, Users, UserCheck, AlertTriangle, Calendar, MapPin, LogOut, Menu, X } from 'lucide-react'
import RegistrationPanel from './panels/RegistrationPanel.jsx'
import MVRPanel from './panels/MVRPanel.jsx'
import KomunaPanel from './panels/KomunaPanel.jsx'
import GjobaPanel from './panels/GjobaPanel.jsx'

const AdminLayout = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [active, setActive] = useState('registrations')
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const styles = {
    adminLayout: { display: 'flex', minHeight: '100vh', background: '#0a1628' },
    adminSidebar: { 
      width: '240px', flexShrink: 0, background: 'rgba(8,18,40,0.95)',
      borderRight: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column',
      padding: '24px 16px', transition: 'all 0.3s', position: 'sticky', top: 0, height: '100vh'
    },
    sidebarLogo: { display: 'flex', alignItems: 'center', gap: '10px', paddingBottom: '24px', borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: '20px' },
    logoIcon: { width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
    logoTitle: { fontSize: '13px', fontWeight: 700, color: '#f0f4ff' },
    logoSub: { fontSize: '10px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.06em' },
    adminNav: { flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' },
    adminNavItem: {
      display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '10px',
      border: 'none', background: 'transparent', color: 'rgba(255,255,255,0.4)', fontSize: '13px',
      fontWeight: 500, transition: 'all 0.15s', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left'
    },
    adminNavItemActive: {
      background: 'linear-gradient(135deg, rgba(79,70,229,0.4), rgba(124,58,237,0.3))',
      color: '#a5b4fc', boxShadow: '0 0 0 1px rgba(79,70,229,0.3)'
    },
    adminSidebarFooter: { display: 'flex', alignItems: 'center', gap: '10px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.06)' },
    adminUser: { display: 'flex', alignItems: 'center', gap: '8px', flex: 1, overflow: 'hidden' },
    adminUserAvatar: { width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, color: '#fff', flexShrink: 0 },
    adminUserName: { fontSize: '12px', fontWeight: 600, color: '#f0f4ff', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
    adminUserRole: { fontSize: '10px', color: 'rgba(255,255,255,0.3)', display: 'block' },
    adminLogout: { background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: '8px', color: 'rgba(255,255,255,0.3)', padding: '7px', cursor: 'pointer', display: 'flex', alignItems: 'center', transition: 'all 0.15s', flexShrink: 0 },
    adminMain: { flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' },
    adminTopbar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 32px', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(15,31,80,0.5)' },
    adminMenuToggle: { background: 'none', border: 'none', color: '#f0f4ff', cursor: 'pointer', display: 'none', fontSize: '20px', padding: '8px' },
    adminTopbarContent: { flex: 1, paddingLeft: '20px' },
    adminPageTitle: { fontSize: '1.2rem', fontWeight: 800, color: '#f0f4ff', margin: 0, letterSpacing: '-0.02em' },
    adminTopbarUser: { display: 'flex', alignItems: 'center', gap: '8px' },
    adminUserBadge: { background: 'rgba(79,70,229,0.2)', border: '1px solid rgba(79,70,229,0.3)', color: '#a5b4fc', padding: '6px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, textTransform: 'capitalize' },
    adminContent: { flex: 1, padding: '32px', overflowY: 'auto' },
  }

  const isAdmin = (role) => {
    const map = {
      super_admin: ['registrations','mvr','komuna','gjoba'],
      admin_users: ['registrations'],
      admin_appointments: ['mvr','komuna'],
      admin_fines: ['gjoba'],
    }
    return map[user?.role]?.includes(role)
  }

  const go = (panel) => {
    setActive(panel)
    navigate(`/admin/${panel}`)
  }

  const navItems = [
    { id: 'registrations', icon: UserCheck, label: 'Regjistrime' },
    { id: 'mvr', icon: Calendar, label: 'Terminë MVR' },
    { id: 'komuna', icon: MapPin, label: 'Terminë Komuna' },
    { id: 'gjoba', icon: AlertTriangle, label: 'Gjoba' },
  ].filter(n => isAdmin(n.id) || user?.role === 'super_admin')

  return (
    <>
      <style>{`
        @media (max-width: 768px) {
          .admin-sidebar-closed { display: none; }
          .admin-menu-toggle { display: flex !important; }
        }
        button:hover { opacity: 0.9; }
      `}</style>

      <div style={styles.adminLayout}>
        {/* SIDEBAR */}
        <aside style={{ ...styles.adminSidebar, ...(sidebarOpen ? {} : { transform: 'translateX(-100%)', position: 'absolute', zIndex: 100 }) }} className={sidebarOpen ? '' : 'admin-sidebar-closed'}>
          <div style={styles.sidebarLogo}>
            <div style={styles.logoIcon}><Building2 size={18} /></div>
            <div>
              <div style={styles.logoTitle}>eGov Admin</div>
              <div style={styles.logoSub}>{user?.role?.replace(/_/g,' ')}</div>
            </div>
          </div>

          <nav style={styles.adminNav}>
            {navItems.map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                style={{ ...styles.adminNavItem, ...(active === id ? styles.adminNavItemActive : {}) }}
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

          <div style={styles.adminSidebarFooter}>
            <div style={styles.adminUser}>
              <div style={styles.adminUserAvatar}>
                {user?.first_name?.[0]}{user?.last_name?.[0]}
              </div>
              <div>
                <span style={styles.adminUserName}>{user?.first_name} {user?.last_name}</span>
                <span style={styles.adminUserRole}>{user?.role}</span>
              </div>
            </div>
            <button style={styles.adminLogout} onClick={logout} title="Dil">
              <LogOut size={15} />
            </button>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main style={styles.adminMain}>
          <div style={styles.adminTopbar}>
            <button
              style={styles.adminMenuToggle}
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            <div style={styles.adminTopbarContent}>
              <h1 style={styles.adminPageTitle}>
                {active === 'registrations' && 'Regjistrime në pritje'}
                {active === 'mvr' && 'Terminë MVR'}
                {active === 'komuna' && 'Terminë Komuna'}
                {active === 'gjoba' && 'Gjoba'}
              </h1>
            </div>

            <div style={styles.adminTopbarUser}>
              <span style={styles.adminUserBadge}>{user?.role}</span>
            </div>
          </div>

          <div style={styles.adminContent}>
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
    </>
  )
}

export default AdminLayout