import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useUser } from '@clerk/react'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL

const ICONS = { MVR:'🪪', Komuna:'🏛️', Gjykata:'⚖️', Spitali:'🏥', Taksave:'📋', Arsimi:'🎓', default:'📄' }
const getIcon = i => ICONS[i] || ICONS.default
const statusLabel = { pending:'Në pritje', approved:'Aprovuar', cancelled:'Anuluar', completed:'Kompletuar' }
const statusBadge = { pending:'sb-pend', approved:'sb-appr', cancelled:'sb-canc', completed:'sb-comp' }

const FILTERS = [
  { key:'all', label:'Të gjitha' },
  { key:'pending', label:'Në pritje' },
  { key:'approved', label:'Aprovuar' },
  { key:'completed', label:'Kompletuar' },
  { key:'cancelled', label:'Anuluar' },
]

export default function MyAppointments() {
  const navigate = useNavigate()
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [cancelTarget, setCancelTarget] = useState(null)
  const [cancelling, setCancelling] = useState(false)
  const [toast, setToast] = useState(null)

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2500) }

  useEffect(() => {
    const load = async () => {
      try {
        const headers = window.__authToken ? { Authorization:`Bearer ${window.__authToken}` } : {}
        const res = await axios.get(`${API}/api/appointments/my`, { headers })
        setAppointments(res.data?.data || [])
      } catch { setAppointments([]) }
      finally { setLoading(false) }
    }
    load()
  }, [])

  const filtered = filter === 'all' ? appointments : appointments.filter(a => a.status === filter)
  const canCancel = a => ['pending','approved'].includes(a.status)

  const handleCancel = async () => {
    if (!cancelTarget) return
    setCancelling(true)
    try {
      const headers = window.__authToken ? { Authorization:`Bearer ${window.__authToken}` } : {}
      await axios.delete(`${API}/api/appointments/${cancelTarget.id}`, { headers })
      setAppointments(prev => prev.map(a => a.id === cancelTarget.id ? {...a, status:'cancelled'} : a))
      showToast('✅ Termini u anulua')
    } catch {
      showToast('❌ Gabim — provo sërish')
    } finally {
      setCancelling(false)
      setCancelTarget(null)
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }
        body { font-family:'Plus Jakarta Sans',sans-serif; background:#f4f6fb; }

        .ma { min-height:100dvh; background:#f4f6fb; padding-bottom:80px; }

        /* Header */
        .ma-header {
          background:#fff; padding:14px 20px;
          display:flex; align-items:center; gap:12px;
          border-bottom:1px solid #eaecf0;
          position:sticky; top:0; z-index:50;
        }
        .ma-back {
          width:36px; height:36px; border-radius:10px; border:1.5px solid #eaecf0;
          background:none; cursor:pointer; font-size:16px; flex-shrink:0;
          display:flex; align-items:center; justify-content:center;
          -webkit-tap-highlight-color:transparent;
        }
        .ma-hinfo { flex:1; }
        .ma-title { font-size:17px; font-weight:800; color:#0f1728; letter-spacing:-0.02em; }
        .ma-subtitle { font-size:11px; font-weight:500; color:#94a3b8; margin-top:1px; }
        .ma-add {
          width:36px; height:36px; border-radius:10px; background:#1e3a8a;
          display:flex; align-items:center; justify-content:center;
          font-size:20px; color:#fff; text-decoration:none; flex-shrink:0;
          -webkit-tap-highlight-color:transparent; font-weight:700;
        }

        /* Tabs */
        .ma-tabs {
          display:flex; overflow-x:auto; padding:12px 16px;
          background:#fff; border-bottom:1px solid #eaecf0;
          -webkit-overflow-scrolling:touch; scrollbar-width:none; gap:6px;
        }
        .ma-tabs::-webkit-scrollbar { display:none; }
        .ma-tab {
          flex-shrink:0; padding:7px 13px; border-radius:20px;
          font-size:12px; font-weight:700; cursor:pointer;
          background:none; border:1.5px solid transparent;
          font-family:'Plus Jakarta Sans',sans-serif;
          color:#6b7280; white-space:nowrap;
          -webkit-tap-highlight-color:transparent;
        }
        .ma-tab.active { background:#eff6ff; border-color:#bfdbfe; color:#1e3a8a; }

        /* Content */
        .ma-content { padding:14px 16px; }

        /* Card */
        .ma-card {
          background:#fff; border-radius:18px; border:1.5px solid #eaecf0;
          margin-bottom:10px; overflow:hidden;
        }
        .ma-card-top { display:flex; align-items:flex-start; gap:11px; padding:14px 14px 0; margin-bottom:10px; }
        .ma-card-icon {
          width:44px; height:44px; border-radius:13px; background:#eff6ff;
          display:flex; align-items:center; justify-content:center; font-size:21px; flex-shrink:0;
        }
        .ma-card-main { flex:1; min-width:0; }
        .ma-card-inst { font-size:15px; font-weight:800; color:#0f1728; display:block; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
        .ma-card-reason { font-size:12px; color:#6b7280; display:block; margin-top:2px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }

        /* Badge */
        .ma-badge { padding:4px 9px; border-radius:20px; font-size:11px; font-weight:700; flex-shrink:0; }
        .sb-pend { background:#fef9c3; color:#a16207; }
        .sb-appr { background:#dcfce7; color:#166534; }
        .sb-canc { background:#f1f5f9; color:#94a3b8; }
        .sb-comp { background:#eff6ff; color:#1e40af; }

        /* Meta */
        .ma-card-meta {
          display:flex; gap:6px; flex-wrap:wrap;
          padding:10px 14px; border-top:1px solid #f8fafc; border-bottom:1px solid #f8fafc;
          margin-bottom:10px;
        }
        .ma-meta { display:flex; align-items:center; gap:4px; font-size:11px; font-weight:600; color:#9ca3af; }
        .ma-meta.note { color:#1e40af; }

        /* Actions */
        .ma-card-actions { display:flex; gap:8px; padding:0 14px 14px; }
        .ma-btn {
          flex:1; padding:9px 0; border-radius:10px;
          font-size:12px; font-weight:700; font-family:'Plus Jakarta Sans',sans-serif;
          cursor:pointer; border:1.5px solid #e5e7eb; background:#f8fafc; color:#374151;
          -webkit-tap-highlight-color:transparent;
        }
        .ma-btn:active { background:#f1f5f9; }
        .ma-btn-red { background:#fff5f5; border-color:#fecaca; color:#ef4444; }
        .ma-btn-red:active { background:#fee2e2; }
        .ma-btn-off { opacity:0.4; pointer-events:none; }

        /* Empty */
        .ma-empty { text-align:center; padding:60px 20px; }
        .ma-empty-icon { font-size:44px; display:block; margin-bottom:10px; }
        .ma-empty-title { font-size:16px; font-weight:800; color:#374151; margin-bottom:4px; }
        .ma-empty-sub { font-size:13px; color:#9ca3af; margin-bottom:18px; }
        .ma-empty-btn {
          display:inline-flex; align-items:center; gap:5px;
          background:#1e3a8a; color:#fff; text-decoration:none;
          padding:11px 22px; border-radius:12px; font-size:13px; font-weight:700;
        }

        /* Modal */
        .ma-modal-bg {
          position:fixed; inset:0; background:rgba(15,23,40,0.55);
          z-index:200; display:flex; align-items:flex-end;
        }
        .ma-modal {
          background:#fff; border-radius:24px 24px 0 0;
          padding:20px 20px env(safe-area-inset-bottom,28px); width:100%;
        }
        .ma-modal-handle { width:38px; height:4px; background:#e5e7eb; border-radius:2px; margin:0 auto 18px; }
        .ma-modal-title { font-size:18px; font-weight:800; color:#0f1728; letter-spacing:-0.02em; margin-bottom:4px; }
        .ma-modal-sub { font-size:13px; color:#6b7280; margin-bottom:16px; }
        .ma-modal-warn {
          background:#fef2f2; border:1.5px solid #fecaca; border-radius:11px;
          padding:11px 13px; font-size:13px; color:#dc2626; font-weight:600;
          display:flex; align-items:center; gap:7px; margin-bottom:18px;
        }
        .ma-modal-btns { display:flex; gap:9px; }
        .ma-modal-keep {
          flex:1; padding:13px; border-radius:12px; border:1.5px solid #e5e7eb;
          background:#fff; font-size:14px; font-weight:700; color:#374151;
          font-family:'Plus Jakarta Sans',sans-serif; cursor:pointer;
        }
        .ma-modal-conf {
          flex:1; padding:13px; border-radius:12px; border:none;
          background:#ef4444; color:#fff; font-size:14px; font-weight:700;
          font-family:'Plus Jakarta Sans',sans-serif; cursor:pointer;
        }
        .ma-modal-conf:disabled { opacity:0.6; }

        /* Toast */
        .ma-toast {
          position:fixed; bottom:90px; left:50%; transform:translateX(-50%);
          background:#0f1728; color:#fff; padding:10px 20px; border-radius:10px;
          font-size:13px; font-weight:600; z-index:300; white-space:nowrap; pointer-events:none;
        }

        /* Spinner */
        .ma-spinner { display:flex; align-items:center; justify-content:center; padding:56px; }
        .spinner { width:22px; height:22px; border:2.5px solid #e5e7eb; border-top-color:#1e3a8a; border-radius:50%; animation:maspin 0.6s linear infinite; }
        @keyframes maspin { to { transform:rotate(360deg); } }

        /* Bottom nav */
        .ma-nav {
          position:fixed; bottom:0; left:0; right:0;
          background:#fff; border-top:1px solid #eaecf0;
          display:flex; padding:8px 0 env(safe-area-inset-bottom,0); z-index:100;
        }
        .ma-nav-item {
          flex:1; display:flex; flex-direction:column; align-items:center; gap:3px;
          padding:6px 0; cursor:pointer; text-decoration:none;
          -webkit-tap-highlight-color:transparent;
        }
        .ma-nav-icon { font-size:20px; }
        .ma-nav-label { font-size:9px; font-weight:700; color:#94a3b8; letter-spacing:0.02em; text-transform:uppercase; }
        .ma-nav-item.active .ma-nav-label { color:#1e3a8a; }
        .ma-nav-dot { width:4px; height:4px; border-radius:50%; background:#1e3a8a; display:none; }
        .ma-nav-item.active .ma-nav-dot { display:block; }
      `}</style>

      <div className="ma">
        {/* Header */}
        <header className="ma-header">
          <button className="ma-back" onClick={() => navigate(-1)}>←</button>
          <div className="ma-hinfo">
            <p className="ma-title">Terminet e Mia</p>
            <p className="ma-subtitle">{appointments.length} termin gjithsej</p>
          </div>
          <Link to="/book-appointment" className="ma-add">+</Link>
        </header>

        {/* Tabs */}
        <div className="ma-tabs">
          {FILTERS.map(f => (
            <button
              key={f.key}
              className={`ma-tab${filter===f.key?' active':''}`}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
              {f.key !== 'all' && (
                <span style={{ marginLeft:4, opacity:0.6 }}>
                  ({appointments.filter(a => a.status === f.key).length})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="ma-content">
          {loading ? (
            <div className="ma-spinner"><div className="spinner"/></div>
          ) : filtered.length === 0 ? (
            <div className="ma-empty">
              <span className="ma-empty-icon">📭</span>
              <p className="ma-empty-title">Asnjë termin</p>
              <p className="ma-empty-sub">
                {filter === 'all'
                  ? 'Nuk keni rezervuar termine ende.'
                  : `Nuk keni termine me statusin "${statusLabel[filter]||filter}".`}
              </p>
              {filter === 'all' && (
                <Link to="/book-appointment" className="ma-empty-btn">+ Rezervo Termin</Link>
              )}
            </div>
          ) : filtered.map(a => (
            <div key={a.id} className="ma-card">
              <div className="ma-card-top">
                <div className="ma-card-icon">{getIcon(a.institution)}</div>
                <div className="ma-card-main">
                  <span className="ma-card-inst">{a.institution}</span>
                  <span className="ma-card-reason">{a.reason}</span>
                </div>
                <span className={`ma-badge ${statusBadge[a.status]||'sb-pend'}`}>
                  {statusLabel[a.status]||a.status}
                </span>
              </div>

              <div className="ma-card-meta">
                <span className="ma-meta">
                  📅 {a.appointment_date
                    ? new Date(a.appointment_date).toLocaleDateString('sq-MK',{day:'numeric',month:'short',year:'numeric'})
                    : 'Data pritet'}
                </span>
                <span className="ma-meta">🔖 #{a.id?.slice(0,8).toUpperCase()}</span>
                {a.admin_note && (
                  <span className="ma-meta note">💬 {a.admin_note}</span>
                )}
              </div>

              <div className="ma-card-actions">
                <button
                  className={`ma-btn ${canCancel(a) ? 'ma-btn-red' : 'ma-btn-off'}`}
                  onClick={() => canCancel(a) && setCancelTarget(a)}
                >
                  Anullo
                </button>
                {a.status === 'approved' && a.appointment_date && (
                  <button className="ma-btn">📥 Shkarko</button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Cancel modal */}
        {cancelTarget && (
          <div className="ma-modal-bg" onClick={() => setCancelTarget(null)}>
            <div className="ma-modal" onClick={e => e.stopPropagation()}>
              <div className="ma-modal-handle"/>
              <p className="ma-modal-title">Anulo Terminin</p>
              <p className="ma-modal-sub">{cancelTarget.institution} — {cancelTarget.reason}</p>
              <div className="ma-modal-warn">
                ⚠️ Ky veprim nuk mund të kthehet mbrapsht.
              </div>
              <div className="ma-modal-btns">
                <button className="ma-modal-keep" onClick={() => setCancelTarget(null)}>
                  Jo, mbaj
                </button>
                <button className="ma-modal-conf" onClick={handleCancel} disabled={cancelling}>
                  {cancelling ? 'Duke anuluar...' : 'Po, anullo'}
                </button>
              </div>
            </div>
          </div>
        )}

        {toast && <div className="ma-toast">{toast}</div>}

        {/* Bottom nav */}
        <nav className="ma-nav">
          {[
            { icon:'🏠', label:'Kryesorja', to:'/' },
            { icon:'📅', label:'Terminet', to:'/my-appointments' },
            { icon:'💳', label:'Gjobat', to:'/fines' },
            { icon:'👤', label:'Profili', to:'/profile' },
          ].map(n => (
            <Link key={n.to} to={n.to} className={`ma-nav-item${location.pathname===n.to?' active':''}`}>
              <span className="ma-nav-icon">{n.icon}</span>
              <span className="ma-nav-label">{n.label}</span>
              <div className="ma-nav-dot"/>
            </Link>
          ))}
        </nav>
      </div>
    </>
  )
}