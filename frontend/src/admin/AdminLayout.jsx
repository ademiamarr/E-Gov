import { useState } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTranslation } from 'react-i18next'
import { UserCheck, AlertTriangle, Calendar, MapPin, LogOut, ChevronRight, Menu, X } from 'lucide-react'
import LanguageSwitcher from '../components/LanguageSwitcher'
import RegistrationPanel from './panels/RegistrationPanel.jsx'
import MVRPanel          from './panels/MVRPanel.jsx'
import KomunaPanel       from './panels/KomunaPanel.jsx'
import GjobaPanel        from './panels/GjobaPanel.jsx'

const ROLE_PANELS = {
  super_admin:  ['registrations', 'mvr', 'komuna', 'gjoba'],
  admin_users:  ['registrations'],
  admin_mvr:    ['mvr'],
  admin_komuna: ['komuna'],
  admin_fines:  ['gjoba'],
}

const AdminLayout = () => {
  const { user, logout } = useAuth()
  const navigate         = useNavigate()
  const { t }            = useTranslation()
  const allowedPanels    = ROLE_PANELS[user?.role] || []

  const defaultPanel = allowedPanels[0] || 'registrations'
  const [active, setActive]           = useState(defaultPanel)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const go = (panel) => {
    setActive(panel)
    navigate(`/admin/${panel}`)
    if (window.innerWidth < 768) setSidebarOpen(false)
  }

  // ✅ TRANSLATIONS ARRAY
  const NAV_ITEMS = [
    { id: 'registrations', icon: UserCheck,      label: t('admin_registrations'),      desc: t('admin_registrations_desc') },
    { id: 'mvr',           icon: Calendar,       label: t('admin_mvr'),                 desc: t('admin_mvr_desc') },
    { id: 'komuna',        icon: MapPin,         label: t('admin_komuna'),              desc: t('admin_komuna_desc') },
    { id: 'gjoba',         icon: AlertTriangle,  label: t('admin_fines'),               desc: t('admin_fines_desc') },
  ]

  const PAGE_TITLES = {
    registrations: t('admin_registrations'),
    mvr:           t('admin_mvr'),
    komuna:        t('admin_komuna'),
    gjoba:         t('admin_fines'),
  }

  const ROLE_LABELS = {
    super_admin:  t('role_super_admin'),
    admin_users:  t('role_admin_users'),
    admin_mvr:    t('role_admin_mvr'),
    admin_komuna: t('role_admin_komuna'),
    admin_fines:  t('role_admin_fines'),
  }

  const visibleNav = NAV_ITEMS.filter(n => allowedPanels.includes(n.id))

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }

        .adm-root {
          display: flex; min-height: 100vh;
          background: #f5f6f8;
          font-family: 'DM Sans', sans-serif;
        }

        .adm-sidebar {
          width: 240px; flex-shrink: 0;
          background: #fff; border-right: 1px solid #eaecf0;
          display: flex; flex-direction: column;
          height: 100vh; position: sticky; top: 0;
        }

        .adm-sidebar-header {
          padding: 20px 20px 18px; border-bottom: 1px solid #eaecf0;
          display: flex; align-items: center; gap: 10px;
        }

        .adm-logo-box {
          width: 32px; height: 32px; background: #0c1220;
          border-radius: 7px; display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }

        .adm-brand-name { font-size: 14px; font-weight: 700; color: #0c1220; letter-spacing: -0.02em; }
        .adm-brand-sub  { font-size: 10px; color: #8a929e; }

        .adm-nav { flex: 1; padding: 12px 10px; display: flex; flex-direction: column; gap: 2px; }

        .adm-nav-item {
          display: flex; align-items: center; gap: 10px;
          padding: 9px 12px; border-radius: 8px; border: none;
          background: transparent; cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          transition: background 0.12s; text-align: left; width: 100%;
        }
        .adm-nav-item:hover  { background: #f5f6f8; }
        .adm-nav-item.active { background: #f0f2ff; }

        .adm-nav-icon {
          width: 30px; height: 30px; border-radius: 6px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; background: #f5f6f8; color: #6b7280;
        }
        .adm-nav-item.active .adm-nav-icon { background: #0c1220; color: #fff; }

        .adm-nav-text  { flex: 1; }
        .adm-nav-label { font-size: 13px; font-weight: 600; color: #374151; display: block; }
        .adm-nav-desc  { font-size: 11px; color: #9ca3af; display: block; margin-top: 1px; }
        .adm-nav-item.active .adm-nav-label { color: #0c1220; }
        .adm-nav-item.active .adm-nav-desc  { color: #6b7280; }
        .adm-nav-arrow { color: #d1d5db; }
        .adm-nav-item.active .adm-nav-arrow { color: #0c1220; }

        .adm-sidebar-footer {
          padding: 14px 16px; border-top: 1px solid #eaecf0;
          display: flex; align-items: center; gap: 10px;
        }

        .adm-user-avatar {
          width: 34px; height: 34px; border-radius: 50%;
          background: #0c1220; display: flex; align-items: center;
          justify-content: center; font-size: 12px; font-weight: 700;
          color: #fff; flex-shrink: 0; letter-spacing: -0.02em;
        }

        .adm-user-info  { flex: 1; overflow: hidden; }
        .adm-user-name  { font-size: 13px; font-weight: 600; color: #0c1220; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: block; }
        .adm-user-role  { font-size: 10px; color: #8a929e; display: block; margin-top: 1px; }

        .adm-logout-btn {
          background: none; border: none; color: #9ca3af;
          cursor: pointer; padding: 4px; border-radius: 6px;
          display: flex; align-items: center; transition: color 0.15s, background 0.15s;
        }
        .adm-logout-btn:hover { color: #ef4444; background: #fef2f2; }

        .adm-main  { flex: 1; display: flex; flex-direction: column; min-width: 0; }

        .adm-topbar {
          background: #fff; border-bottom: 1px solid #eaecf0;
          padding: 0 28px; height: 56px;
          display: flex; align-items: center;
          justify-content: space-between; gap: 16px; flex-shrink: 0;
        }

        .adm-topbar-left { display: flex; align-items: center; gap: 12px; }
        .adm-topbar-right { display: flex; align-items: center; gap: 10px; }

        .adm-menu-btn {
          display: none; background: none; border: none;
          color: #6b7280; cursor: pointer; padding: 4px; border-radius: 6px;
        }

        .adm-page-title { font-size: 15px; font-weight: 700; color: #0c1220; letter-spacing: -0.01em; }

        .adm-role-badge {
          font-size: 11px; font-weight: 600; color: #374151;
          background: #f5f6f8; border: 1px solid #e5e7eb;
          border-radius: 20px; padding: 4px 12px;
        }

        /* Override LanguageSwitcher for light topbar */
        .adm-topbar .lang-switcher-btn {
          background: #f5f6f8 !important;
          border: 1px solid #e5e7eb !important;
          color: #374151 !important;
          font-size: 12px !important;
          padding: 6px 10px !important;
        }
        .adm-topbar .lang-switcher-btn:hover {
          background: #eaecf0 !important;
          border-color: #d1d5db !important;
        }
        .adm-topbar .lang-switcher-btn.active {
          background: #eff6ff !important;
          border-color: #bfdbfe !important;
          color: #1e40af !important;
        }
        .adm-topbar .lang-dropdown {
          background: #fff !important;
          border: 1px solid #e5e7eb !important;
          box-shadow: 0 8px 24px rgba(0,0,0,0.10) !important;
        }
        .adm-topbar .lang-dropdown-item {
          color: #374151 !important;
        }
        .adm-topbar .lang-dropdown-item:hover {
          background: #f5f6f8 !important;
          color: #111827 !important;
        }
        .adm-topbar .lang-dropdown-item.active {
          background: #eff6ff !important;
          color: #1e40af !important;
        }
        .adm-topbar .lang-country {
          color: #9ca3af !important;
        }
        .adm-topbar .lang-checkmark {
          color: #1e40af !important;
        }

        .adm-content { flex: 1; padding: 28px; overflow-y: auto; }

        .adm-overlay {
          display: none; position: fixed; inset: 0;
          background: rgba(0,0,0,0.4); z-index: 99;
        }

        @media (max-width: 768px) {
          .adm-sidebar {
            position: fixed; left: 0; top: 0; z-index: 100;
            transform: translateX(-100%); transition: transform 0.2s;
          }
          .adm-sidebar.open { transform: translateX(0); }
          .adm-overlay.show { display: block; }
          .adm-menu-btn { display: flex; }
          .adm-content  { padding: 20px 16px; }
        }
      `}</style>

      <div className="adm-root">
        <div
          className={`adm-overlay ${sidebarOpen && window?.innerWidth < 768 ? 'show' : ''}`}
          onClick={() => setSidebarOpen(false)}
        />

        {/* SIDEBAR */}
        <aside className={`adm-sidebar ${sidebarOpen ? 'open' : ''}`}>
          <div className="adm-sidebar-header">
            <div className="adm-logo-box">
              <svg viewBox="0 0 24 24" fill="none" width={18} height={18}>
                <path d="M3 22V10L12 3L21 10V22H15V16H9V22H3Z" fill="#fff"/>
              </svg>
            </div>
            <div>
              <div className="adm-brand-name">eGov Admin</div>
              <div className="adm-brand-sub">{t('admin_panel')}</div>
            </div>
          </div>

          <nav className="adm-nav">
            {visibleNav.map(({ id, icon: Icon, label, desc }) => (
              <button
                key={id}
                className={`adm-nav-item ${active === id ? 'active' : ''}`}
                onClick={() => go(id)}
              >
                <div className="adm-nav-icon"><Icon size={15} /></div>
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
              <span className="adm-user-role">{ROLE_LABELS[user?.role] || user?.role}</span>
            </div>
            <button className="adm-logout-btn" onClick={logout} title={t('logout')}>
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
              <h1 className="adm-page-title">{PAGE_TITLES[active]}</h1>
            </div>
            <div className="adm-topbar-right">
              <LanguageSwitcher />
              <span className="adm-role-badge">{ROLE_LABELS[user?.role] || user?.role}</span>
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