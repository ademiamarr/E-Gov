import { useState } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Users, UserCheck, AlertTriangle, Calendar, MapPin, LogOut, ChevronRight, Menu, X } from 'lucide-react'
import RegistrationPanel from './panels/RegistrationPanel.jsx'
import MVRPanel from './panels/MVRPanel.jsx'
import KomunaPanel from './panels/KomunaPanel.jsx'
import GjobaPanel from './panels/GjobaPanel.jsx'

const AdminLayout = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [active, setActive] = useState('registrations')
  const [sidebarOpen, setSidebarOpen] = useState(true)

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
    if (window.innerWidth < 768) setSidebarOpen(false)
  }

  const navItems = [
    { id: 'registrations', icon: UserCheck, label: 'Regjistrime', desc: 'Kërkesa për aprovim' },
    { id: 'mvr',           icon: Calendar,  label: 'Terminë MVR', desc: 'Min. e Brendshme' },
    { id: 'komuna',        icon: MapPin,    label: 'Terminë Komuna', desc: 'Shërbime komunale' },
    { id: 'gjoba',         icon: AlertTriangle, label: 'Gjoba', desc: 'Menaxhim gjobash' },
  ].filter(n => user?.role === 'super_admin' || isAdmin(n.id))

  const roleLabel = {
    super_admin: 'Super Admin',
    admin_users: 'Admin Regjistrime',
    admin_fines: 'Admin Gjoba',
    admin_appointments: 'Admin Termine',
  }

  const pageTitle = {
    registrations: 'Regjistrime',
    mvr: 'Terminë MVR',
    komuna: 'Terminë Komuna',
    gjoba: 'Gjoba',
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }

        .adm-root {
          display: flex;
          min-height: 100vh;
          background: #f5f6f8;
          font-family: 'DM Sans', sans-serif;
        }

        /* ── SIDEBAR ── */
        .adm-sidebar {
          width: 240px;
          flex-shrink: 0;
          background: #fff;
          border-right: 1px solid #eaecf0;
          display: flex;
          flex-direction: column;
          height: 100vh;
          position: sticky;
          top: 0;
        }

        .adm-sidebar-header {
          padding: 20px 20px 18px;
          border-bottom: 1px solid #eaecf0;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .adm-logo-box {
          width: 32px; height: 32px;
          background: #0c1220;
          border-radius: 7px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }

        .adm-logo-box svg { width: 18px; height: 18px; }

        .adm-brand-name {
          font-size: 14px;
          font-weight: 700;
          color: #0c1220;
          letter-spacing: -0.02em;
        }

        .adm-brand-sub {
          font-size: 10px;
          color: #8a929e;
          font-weight: 400;
        }

        .adm-nav {
          flex: 1;
          padding: 12px 10px;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .adm-nav-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 9px 12px;
          border-radius: 8px;
          border: none;
          background: transparent;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          transition: background 0.12s;
          text-align: left;
          width: 100%;
        }

        .adm-nav-item:hover { background: #f5f6f8; }

        .adm-nav-item.active {
          background: #f0f2ff;
        }

        .adm-nav-icon {
          width: 30px; height: 30px;
          border-radius: 6px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          background: #f5f6f8;
          color: #6b7280;
        }

        .adm-nav-item.active .adm-nav-icon {
          background: #0c1220;
          color: #fff;
        }

        .adm-nav-text { flex: 1; }
        .adm-nav-label { font-size: 13px; font-weight: 600; color: #374151; display: block; }
        .adm-nav-desc  { font-size: 11px; color: #9ca3af; display: block; margin-top: 1px; }
        .adm-nav-item.active .adm-nav-label { color: #0c1220; }
        .adm-nav-item.active .adm-nav-desc  { color: #6b7280; }

        .adm-nav-arrow { color: #d1d5db; }
        .adm-nav-item.active .adm-nav-arrow { color: #0c1220; }

        .adm-sidebar-footer {
          padding: 14px 16px;
          border-top: 1px solid #eaecf0;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .adm-user-avatar {
          width: 34px; height: 34px;
          border-radius: 50%;
          background: #0c1220;
          display: flex; align-items: center; justify-content: center;
          font-size: 12px; font-weight: 700; color: #fff;
          flex-shrink: 0;
          letter-spacing: -0.02em;
        }

        .adm-user-info { flex: 1; overflow: hidden; }
        .adm-user-name {
          font-size: 13px; font-weight: 600; color: #0c1220;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: block;
        }
        .adm-user-role { font-size: 10px; color: #8a929e; display: block; margin-top: 1px; }

        .adm-logout-btn {
          background: none; border: none;
          color: #9ca3af; cursor: pointer; padding: 4px;
          border-radius: 6px; display: flex; align-items: center;
          transition: color 0.15s, background 0.15s;
        }
        .adm-logout-btn:hover { color: #ef4444; background: #fef2f2; }

        /* ── MAIN ── */
        .adm-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        .adm-topbar {
          background: #fff;
          border-bottom: 1px solid #eaecf0;
          padding: 0 28px;
          height: 56px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          flex-shrink: 0;
        }

        .adm-topbar-left { display: flex; align-items: center; gap: 12px; }

        .adm-menu-btn {
          display: none;
          background: none; border: none;
          color: #6b7280; cursor: pointer; padding: 4px;
          border-radius: 6px;
        }

        .adm-page-title {
          font-size: 15px;
          font-weight: 700;
          color: #0c1220;
          letter-spacing: -0.01em;
        }

        .adm-topbar-right { display: flex; align-items: center; gap: 10px; }

        .adm-role-badge {
          font-size: 11px;
          font-weight: 600;
          color: #374151;
          background: #f5f6f8;
          border: 1px solid #e5e7eb;
          border-radius: 20px;
          padding: 4px 12px;
          letter-spacing: 0.01em;
          text-transform: capitalize;
        }

        .adm-content {
          flex: 1;
          padding: 28px;
          overflow-y: auto;
        }

        /* Mobile */
        .adm-overlay {
          display: none;
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.4);
          z-index: 99;
        }

        @media (max-width: 768px) {
          .adm-sidebar {
            position: fixed; left: 0; top: 0; z-index: 100;
            transform: translateX(-100%);
            transition: transform 0.2s;
          }
          .adm-sidebar.open { transform: translateX(0); }
          .adm-overlay.show { display: block; }
          .adm-menu-btn { display: flex; }
          .adm-content { padding: 20px 16px; }
        }
      `}</style>

      <div className="adm-root">
        {/* Sidebar overlay for mobile */}
        <div className={`adm-overlay ${sidebarOpen && window?.innerWidth < 768 ? 'show' : ''}`} onClick={() => setSidebarOpen(false)} />

        {/* SIDEBAR */}
        <aside className={`adm-sidebar ${sidebarOpen ? 'open' : ''}`}>
          <div className="adm-sidebar-header">
            <div className="adm-logo-box">
              <svg viewBox="0 0 24 24" fill="none"><path d="M3 22V10L12 3L21 10V22H15V16H9V22H3Z" fill="#fff"/></svg>
            </div>
            <div>
              <div className="adm-brand-name">eGov Admin</div>
              <div className="adm-brand-sub">Paneli i administrimit</div>
            </div>
          </div>

          <nav className="adm-nav">
            {navItems.map(({ id, icon: Icon, label, desc }) => (
              <button
                key={id}
                className={`adm-nav-item ${active === id ? 'active' : ''}`}
                onClick={() => go(id)}
              >
                <div className="adm-nav-icon">
                  <Icon size={15} />
                </div>
                <div className="adm-nav-text">
                  <span className="adm-nav-label">{label}</span>
                  <span className="adm-nav-desc">{desc}</span>
                </div>
                <ChevronRight size={13} className="adm-nav-arrow" />
              </button>
            ))}
          </nav>

          <div className="adm-sidebar-footer">
            <div className="adm-user-avatar">
              {user?.first_name?.[0]}{user?.last_name?.[0]}
            </div>
            <div className="adm-user-info">
              <span className="adm-user-name">{user?.first_name} {user?.last_name}</span>
              <span className="adm-user-role">{roleLabel[user?.role] || user?.role}</span>
            </div>
            <button className="adm-logout-btn" onClick={logout} title="Dil">
              <LogOut size={15} />
            </button>
          </div>
        </aside>

        {/* MAIN */}
        <main className="adm-main">
          <div className="adm-topbar">
            <div className="adm-topbar-left">
              <button className="adm-menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
                {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
              <h1 className="adm-page-title">{pageTitle[active]}</h1>
            </div>
            <div className="adm-topbar-right">
              <span className="adm-role-badge">{roleLabel[user?.role] || user?.role}</span>
            </div>
          </div>

          <div className="adm-content">
            <Routes>
              <Route path="/"              element={<RegistrationPanel />} />
              <Route path="/registrations" element={<RegistrationPanel />} />
              <Route path="/mvr"           element={<MVRPanel />} />
              <Route path="/komuna"        element={<KomunaPanel />} />
              <Route path="/gjoba"         element={<GjobaPanel />} />
            </Routes>
          </div>
        </main>
      </div>
    </>
  )
}

export default AdminLayout