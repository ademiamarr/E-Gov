import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useUser, useClerk } from '@clerk/clerk-react'
import { useTranslation } from 'react-i18next'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL

const ICONS = { MVR:'🪪', Komuna:'🏛️', Gjykata:'⚖️', Spitali:'🏥', Taksave:'📋', Arsimi:'🎓', default:'📄' }
const getIcon = i => ICONS[i] || ICONS.default
const statusLabel = { pending:'Në pritje', approved:'Aprovuar', cancelled:'Anuluar', completed:'Kompletuar' }
const statusClass = { pending:'badge-pend', approved:'badge-appr', cancelled:'badge-canc', completed:'badge-comp' }

export default function Dashboard() {
  const { user } = useUser()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)

  const firstName = user?.firstName || 'Qytetar'
  const initials = (user?.firstName?.[0] || '') + (user?.lastName?.[0] || '')

  useEffect(() => {
    const load = async () => {
      try {
        const headers = window.__authToken ? { Authorization:`Bearer ${window.__authToken}` } : {}
        const res = await axios.get(`${API}/api/appointments/my`, { headers })
        setAppointments(res.data?.data || [])
      } catch {
        setAppointments([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const stats = {
    total: appointments.length,
    active: appointments.filter(a => ['pending','approved'].includes(a.status)).length,
    done: appointments.filter(a => a.status === 'completed').length,
  }

  const recent = appointments.slice(0, 3)

  const actions = [
    { icon:'📅', bg:'#eff6ff', title:'Rezervo Termin', sub:'Çdo institucion', to:'/book-appointment' },
    { icon:'📋', bg:'#fef9c3', title:'Terminet e Mia', sub:`${stats.active} aktive`, to:'/my-appointments' },
    { icon:'💳', bg:'#f0fdf4', title:'Gjobat', sub:'Shiko e paguaj', to:'/fines' },
    { icon:'👤', bg:'#fdf4ff', title:'Profili Im', sub:'Të dhënat', to:'/profile' },
  ]

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Mirëmëngjes' : hour < 18 ? 'Mirëdita' : 'Mirëmbrëma'

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }
        body { font-family:'Plus Jakarta Sans',sans-serif; background:#f4f6fb; }

        .dsh { min-height:100dvh; background:#f4f6fb; padding-bottom:80px; }

        /* Header */
        .dsh-header {
          background:#fff; padding:14px 20px;
          display:flex; align-items:center; justify-content:space-between;
          border-bottom:1px solid #eaecf0;
          position:sticky; top:0; z-index:50;
        }
        .dsh-logo { display:flex; align-items:center; gap:9px; }
        .dsh-logo-mark {
          width:34px; height:34px; background:#1e3a8a; border-radius:9px;
          display:flex; align-items:center; justify-content:center; flex-shrink:0;
        }
        .dsh-logo-texts {}
        .dsh-logo-name { font-size:14px; font-weight:800; color:#1e3a8a; letter-spacing:-0.02em; display:block; }
        .dsh-logo-sub { font-size:9px; font-weight:600; color:#94a3b8; letter-spacing:0.03em; text-transform:uppercase; display:block; margin-top:-1px; }
        .dsh-avatar {
          width:36px; height:36px; border-radius:50%; background:#1e3a8a;
          display:flex; align-items:center; justify-content:center;
          font-size:13px; font-weight:800; color:#fff; cursor:pointer;
          -webkit-tap-highlight-color:transparent; text-transform:uppercase;
        }

        /* Hero */
        .dsh-hero {
          background:linear-gradient(135deg,#1e3a8a 0%,#1e40af 55%,#2563eb 100%);
          padding:24px 20px 60px; position:relative; overflow:hidden;
        }
        .dsh-hero::after {
          content:''; position:absolute; bottom:-2px; left:0; right:0; height:40px;
          background:#f4f6fb; border-radius:50% 50% 0 0 / 100% 100% 0 0;
        }
        .dsh-greeting { font-size:12px; font-weight:600; color:rgba(255,255,255,0.6); margin-bottom:3px; }
        .dsh-name { font-size:26px; font-weight:800; color:#fff; letter-spacing:-0.03em; line-height:1.2; margin-bottom:14px; }
        .dsh-chips { display:flex; gap:7px; flex-wrap:wrap; position:relative; z-index:2; }
        .dsh-chip {
          display:inline-flex; align-items:center; gap:5px;
          background:rgba(255,255,255,0.14); border:1px solid rgba(255,255,255,0.22);
          border-radius:20px; padding:5px 11px;
          font-size:11px; font-weight:600; color:rgba(255,255,255,0.88);
        }

        /* Content */
        .dsh-content { padding:0 16px; margin-top:-28px; position:relative; z-index:1; }

        /* Stats */
        .dsh-stats { display:grid; grid-template-columns:1fr 1fr 1fr; gap:9px; margin-bottom:22px; }
        .dsh-stat {
          background:#fff; border-radius:14px; padding:14px 10px;
          border:1.5px solid #eaecf0; text-align:center;
        }
        .dsh-stat-num { font-size:22px; font-weight:800; color:#0f1728; letter-spacing:-0.03em; display:block; }
        .dsh-stat-label { font-size:9px; font-weight:700; color:#94a3b8; margin-top:2px; display:block; text-transform:uppercase; letter-spacing:0.04em; }

        /* Section */
        .dsh-sec { font-size:11px; font-weight:700; color:#94a3b8; letter-spacing:0.06em; text-transform:uppercase; margin-bottom:10px; }

        /* Actions grid */
        .dsh-actions { display:grid; grid-template-columns:1fr 1fr; gap:9px; margin-bottom:24px; }
        .dsh-action {
          background:#fff; border-radius:16px; padding:16px 14px;
          border:1.5px solid #eaecf0; cursor:pointer; text-decoration:none; display:block;
          -webkit-tap-highlight-color:transparent;
        }
        .dsh-action:active { border-color:#93c5fd; box-shadow:0 0 0 3px #dbeafe; }
        .dsh-action-icon {
          width:38px; height:38px; border-radius:11px;
          display:flex; align-items:center; justify-content:center;
          font-size:17px; margin-bottom:9px;
        }
        .dsh-action-title { font-size:13px; font-weight:700; color:#0f1728; display:block; margin-bottom:1px; }
        .dsh-action-sub { font-size:11px; font-weight:500; color:#94a3b8; display:block; }

        /* Appointment cards */
        .dsh-appts { display:flex; flex-direction:column; gap:9px; margin-bottom:24px; }
        .dsh-appt {
          background:#fff; border-radius:14px; padding:14px;
          border:1.5px solid #eaecf0; display:flex; align-items:center; gap:12px;
        }
        .dsh-appt-icon {
          width:42px; height:42px; border-radius:12px; background:#eff6ff;
          display:flex; align-items:center; justify-content:center; font-size:19px; flex-shrink:0;
        }
        .dsh-appt-info { flex:1; min-width:0; }
        .dsh-appt-inst { font-size:14px; font-weight:700; color:#0f1728; display:block; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
        .dsh-appt-reason { font-size:12px; color:#6b7280; display:block; margin-top:1px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
        .dsh-appt-date { font-size:11px; font-weight:600; color:#94a3b8; display:block; margin-top:3px; }

        /* Badges */
        .dsh-badge { padding:4px 9px; border-radius:20px; font-size:11px; font-weight:700; flex-shrink:0; }
        .badge-pend { background:#fef9c3; color:#a16207; }
        .badge-appr { background:#dcfce7; color:#166534; }
        .badge-canc { background:#f1f5f9; color:#94a3b8; }
        .badge-comp { background:#eff6ff; color:#1e40af; }

        /* Empty */
        .dsh-empty {
          background:#fff; border-radius:16px; padding:28px 16px;
          border:1.5px dashed #e2e8f0; text-align:center;
        }
        .dsh-empty-icon { font-size:32px; display:block; margin-bottom:8px; }
        .dsh-empty-title { font-size:14px; font-weight:700; color:#374151; margin-bottom:3px; }
        .dsh-empty-sub { font-size:12px; color:#9ca3af; margin-bottom:14px; }
        .dsh-empty-btn {
          display:inline-flex; align-items:center; gap:5px;
          background:#1e3a8a; color:#fff; text-decoration:none;
          padding:9px 18px; border-radius:10px; font-size:13px; font-weight:700;
        }

        /* Spinner */
        .dsh-spinner { display:flex; align-items:center; justify-content:center; padding:32px; }
        .spinner { width:22px; height:22px; border:2.5px solid #e5e7eb; border-top-color:#1e3a8a; border-radius:50%; animation:dspin 0.6s linear infinite; }
        @keyframes dspin { to { transform:rotate(360deg); } }

        /* Bottom nav */
        .dsh-nav {
          position:fixed; bottom:0; left:0; right:0;
          background:#fff; border-top:1px solid #eaecf0;
          display:flex; padding:8px 0 env(safe-area-inset-bottom,0); z-index:100;
        }
        .dsh-nav-item {
          flex:1; display:flex; flex-direction:column; align-items:center; gap:3px;
          padding:6px 0; cursor:pointer; text-decoration:none;
          -webkit-tap-highlight-color:transparent;
        }
        .dsh-nav-icon { font-size:20px; }
        .dsh-nav-label { font-size:9px; font-weight:700; color:#94a3b8; letter-spacing:0.02em; text-transform:uppercase; }
        .dsh-nav-item.active .dsh-nav-label { color:#1e3a8a; }
        .dsh-nav-dot { width:4px; height:4px; border-radius:50%; background:#1e3a8a; display:none; }
        .dsh-nav-item.active .dsh-nav-dot { display:block; }
      `}</style>

      <div className="dsh">
        {/* Header */}
        <header className="dsh-header">
          <div className="dsh-logo">
            <div className="dsh-logo-mark">
              <svg viewBox="0 0 24 24" fill="none" width={18} height={18}>
                <path d="M3 22V10L12 3L21 10V22H15V16H9V22H3Z" fill="#fff"/>
              </svg>
            </div>
            <div className="dsh-logo-texts">
              <span className="dsh-logo-name">eGov Portal</span>
              <span className="dsh-logo-sub">Republika e Maqedonisë SV</span>
            </div>
          </div>
          <div className="dsh-avatar" onClick={() => navigate('/profile')}>
            {initials || firstName[0]}
          </div>
        </header>

        {/* Hero */}
        <div className="dsh-hero">
          <p className="dsh-greeting">{greeting},</p>
          <h1 className="dsh-name">{firstName} 👋</h1>
          <div className="dsh-chips">
            <span className="dsh-chip">✅ Llogari aktive</span>
            {stats.active > 0 && (
              <span className="dsh-chip">🕐 {stats.active} termin aktiv</span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="dsh-content">

          {/* Stats */}
          <div className="dsh-stats">
            <div className="dsh-stat">
              <span className="dsh-stat-num">{stats.total}</span>
              <span className="dsh-stat-label">Gjithsej</span>
            </div>
            <div className="dsh-stat">
              <span className="dsh-stat-num">{stats.active}</span>
              <span className="dsh-stat-label">Aktive</span>
            </div>
            <div className="dsh-stat">
              <span className="dsh-stat-num">{stats.done}</span>
              <span className="dsh-stat-label">Komplet.</span>
            </div>
          </div>

          {/* Quick actions */}
          <p className="dsh-sec">Veprime të shpejta</p>
          <div className="dsh-actions">
            {actions.map(a => (
              <Link key={a.to} to={a.to} className="dsh-action">
                <div className="dsh-action-icon" style={{ background: a.bg }}>{a.icon}</div>
                <span className="dsh-action-title">{a.title}</span>
                <span className="dsh-action-sub">{a.sub}</span>
              </Link>
            ))}
          </div>

          {/* Recent appointments */}
          <p className="dsh-sec">Terminet e fundit</p>
          {loading ? (
            <div className="dsh-spinner"><div className="spinner"/></div>
          ) : recent.length === 0 ? (
            <div className="dsh-empty">
              <span className="dsh-empty-icon">📭</span>
              <p className="dsh-empty-title">Nuk keni termine ende</p>
              <p className="dsh-empty-sub">Rezervoni terminin tuaj të parë</p>
              <Link to="/book-appointment" className="dsh-empty-btn">+ Rezervo Termin</Link>
            </div>
          ) : (
            <div className="dsh-appts">
              {recent.map(a => (
                <div key={a.id} className="dsh-appt">
                  <div className="dsh-appt-icon">{getIcon(a.institution)}</div>
                  <div className="dsh-appt-info">
                    <span className="dsh-appt-inst">{a.institution}</span>
                    <span className="dsh-appt-reason">{a.reason}</span>
                    <span className="dsh-appt-date">
                      {a.appointment_date
                        ? new Date(a.appointment_date).toLocaleDateString('sq-MK',{day:'numeric',month:'short',year:'numeric'})
                        : 'Data pritet'}
                    </span>
                  </div>
                  <span className={`dsh-badge ${statusClass[a.status]||'badge-pend'}`}>
                    {statusLabel[a.status]||a.status}
                  </span>
                </div>
              ))}
              {appointments.length > 3 && (
                <Link to="/my-appointments"
                  style={{ textAlign:'center', fontSize:13, fontWeight:700, color:'#1e3a8a', textDecoration:'none', display:'block', padding:'6px 0' }}
                >
                  Shiko të gjitha ({appointments.length}) →
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Bottom nav */}
        <nav className="dsh-nav">
          {[
            { icon:'🏠', label:'Kryesorja', to:'/' },
            { icon:'📅', label:'Terminet', to:'/my-appointments' },
            { icon:'💳', label:'Gjobat', to:'/fines' },
            { icon:'👤', label:'Profili', to:'/profile' },
          ].map(n => (
            <Link key={n.to} to={n.to} className={`dsh-nav-item${location.pathname===n.to?' active':''}`}>
              <span className="dsh-nav-icon">{n.icon}</span>
              <span className="dsh-nav-label">{n.label}</span>
              <div className="dsh-nav-dot"/>
            </Link>
          ))}
        </nav>
      </div>
    </>
  )
}