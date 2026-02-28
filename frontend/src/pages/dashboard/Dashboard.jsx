import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useSocket } from '../../context/SocketContext'
import API from '../../api/axios'
import {
  LayoutDashboard, Calendar, AlertTriangle, FileText,
  CreditCard, User, LogOut, Bell, X, CheckCircle,
  Clock, XCircle, Plus, ChevronRight, Building2
} from 'lucide-react'
import './Dashboard.css'

const Dashboard = () => {
  const { user, logout } = useAuth()
  const { liveNotif } = useSocket()
  const [activeTab, setActiveTab]         = useState('overview')
  const [appointments, setAppointments]   = useState([])
  const [fines, setFines]                 = useState([])
  const [permits, setPermits]             = useState([])
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading]             = useState(true)
  const [showApptModal, setShowApptModal] = useState(false)
  const [showPayModal, setShowPayModal]   = useState(null)
  const [toast, setToast]                 = useState(null)

  const [apptForm, setApptForm] = useState({ institution: '', reason: '', appointment_date: '' })
  const [payForm, setPayForm]   = useState({ card_number: '', card_holder: '', expiry: '', cvv: '' })

  useEffect(() => {
    fetchAll()
  }, [])

  useEffect(() => {
    if (liveNotif) showToast(liveNotif.message, liveNotif.type)
  }, [liveNotif])

  const fetchAll = async () => {
    try {
      const [a, f, p, n] = await Promise.all([
        API.get('/appointments/my'),
        API.get('/fines/my'),
        API.get('/permits/my'),
        API.get('/notifications/my'),
      ])
      setAppointments(a.data.data || [])
      setFines(f.data.data || [])
      setPermits(p.data.data || [])
      setNotifications(n.data.data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  const bookAppointment = async () => {
    if (!apptForm.institution || !apptForm.reason) return
    try {
      await API.post('/appointments', apptForm)
      setShowApptModal(false)
      setApptForm({ institution: '', reason: '', appointment_date: '' })
      fetchAll()
      showToast('Termini u rezervua me sukses!')
    } catch (err) {
      showToast(err.response?.data?.message || 'Gabim!', 'error')
    }
  }

  const payFine = async () => {
    if (!payForm.card_number || !payForm.card_holder || !payForm.expiry || !payForm.cvv) return
    try {
      await API.post('/payments/pay', { fine_id: showPayModal, ...payForm })
      setShowPayModal(null)
      setPayForm({ card_number: '', card_holder: '', expiry: '', cvv: '' })
      fetchAll()
      showToast('Pagesa u krye me sukses!')
    } catch (err) {
      showToast(err.response?.data?.message || 'Pagesa dështoi!', 'error')
    }
  }

  const statusBadge = (status) => {
    const map = {
      pending:   { label: 'Në pritje',  cls: 'badge-pending'  },
      approved:  { label: 'Aprovuar',   cls: 'badge-approved' },
      rejected:  { label: 'Refuzuar',   cls: 'badge-rejected' },
      cancelled: { label: 'Anuluar',    cls: 'badge-rejected' },
      unpaid:    { label: 'Pa paguar',  cls: 'badge-pending'  },
      paid:      { label: 'Paguar',     cls: 'badge-approved' },
    }
    const s = map[status] || { label: status, cls: 'badge-pending' }
    return <span className={`badge ${s.cls}`}>{s.label}</span>
  }

  const unpaidFines       = fines.filter(f => f.status === 'unpaid')
  const activeAppointments = appointments.filter(a => a.status !== 'cancelled')
  const activePermits     = permits.filter(p => p.status !== 'rejected')

  if (loading) return (
    <div className="dash-loading">
      <div className="dash-spinner" />
    </div>
  )

  return (
    <div className="dash-layout">
      {/* ── Toast ── */}
      {toast && (
        <div className={`dash-toast ${toast.type === 'error' ? 'toast-error' : 'toast-success'}`}>
          {toast.type === 'error' ? <XCircle size={16} /> : <CheckCircle size={16} />}
          {toast.msg}
        </div>
      )}

      {/* ── Sidebar ── */}
      <aside className="dash-sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon"><Building2 size={18} color="#fff" /></div>
          <div>
            <div className="sidebar-logo-title">eGov Portal</div>
            <div className="sidebar-logo-sub">Republika e MV</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {[
            { id: 'overview',      icon: LayoutDashboard, label: 'Pasqyrë'  },
            { id: 'appointments',  icon: Calendar,        label: 'Terminë'  },
            { id: 'fines',         icon: AlertTriangle,   label: 'Gjoba'    },
            { id: 'permits',       icon: FileText,        label: 'Leje'     },
            { id: 'payments',      icon: CreditCard,      label: 'Pagesa'   },
            { id: 'notifications', icon: Bell,            label: 'Njoftime' },
            { id: 'profile',       icon: User,            label: 'Profili'  },
          ].map(({ id, icon: Icon, label }) => (
            <button key={id}
              className={`nav-item ${activeTab === id ? 'active' : ''}`}
              onClick={() => setActiveTab(id)}>
              <Icon size={18} />
              <span>{label}</span>
              {id === 'fines' && unpaidFines.length > 0 &&
                <span className="nav-badge">{unpaidFines.length}</span>}
              {id === 'notifications' && notifications.filter(n => !n.is_read).length > 0 &&
                <span className="nav-badge">{notifications.filter(n => !n.is_read).length}</span>}
            </button>
          ))}
        </nav>

        <button className="sidebar-logout" onClick={logout}>
          <LogOut size={16} /> Dil
        </button>
      </aside>

      {/* ── Main ── */}
      <main className="dash-main">
        <div className="dash-topbar">
          <div>
            <h2 className="dash-page-title">
              {activeTab === 'overview' && 'Pasqyrë'}
              {activeTab === 'appointments' && 'Terminët e mia'}
              {activeTab === 'fines' && 'Gjobat e mia'}
              {activeTab === 'permits' && 'Lejet e mia'}
              {activeTab === 'payments' && 'Pagesat e mia'}
              {activeTab === 'notifications' && 'Njoftimet'}
              {activeTab === 'profile' && 'Profili im'}
            </h2>
            <p className="dash-page-sub">Mirë se erdhët, {user?.first_name}!</p>
          </div>
          <div className="topbar-avatar">
            {user?.first_name?.[0]}{user?.last_name?.[0]}
          </div>
        </div>

        <div className="dash-content">

          {/* ─── OVERVIEW ─── */}
          {activeTab === 'overview' && (
            <>
              <div className="stats-grid">
                {[
                  { label: 'Terminë aktive',  value: activeAppointments.length, icon: Calendar,      color: '#3b82f6' },
                  { label: 'Gjoba pa paguar', value: unpaidFines.length,         icon: AlertTriangle, color: '#f59e0b' },
                  { label: 'Leje aktive',     value: activePermits.length,       icon: FileText,      color: '#8b5cf6' },
                  { label: 'Pagesa totale',   value: fines.filter(f=>f.status==='paid').length, icon: CreditCard, color: '#10b981' },
                ].map(({ label, value, icon: Icon, color }) => (
                  <div key={label} className="stat-card">
                    <div className="stat-icon" style={{ background: `${color}20` }}>
                      <Icon size={20} color={color} />
                    </div>
                    <div className="stat-info">
                      <div className="stat-value">{value}</div>
                      <div className="stat-label">{label}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="overview-grid">
                <div className="overview-card">
                  <div className="overview-card-header">
                    <span>Terminët e fundit</span>
                    <button className="link-btn" onClick={() => setActiveTab('appointments')}>
                      Shiko të gjitha <ChevronRight size={14} />
                    </button>
                  </div>
                  {appointments.slice(0, 3).map(a => (
                    <div key={a.id} className="overview-row">
                      <div>
                        <div className="overview-row-title">{a.institution}</div>
                        <div className="overview-row-sub">{a.reason}</div>
                      </div>
                      {statusBadge(a.status)}
                    </div>
                  ))}
                  {appointments.length === 0 && <p className="empty-msg">Nuk keni terminë</p>}
                </div>

                <div className="overview-card">
                  <div className="overview-card-header">
                    <span>Gjobat e fundit</span>
                    <button className="link-btn" onClick={() => setActiveTab('fines')}>
                      Shiko të gjitha <ChevronRight size={14} />
                    </button>
                  </div>
                  {fines.slice(0, 3).map(f => (
                    <div key={f.id} className="overview-row">
                      <div>
                        <div className="overview-row-title">{f.type}</div>
                        <div className="overview-row-sub">{f.amount} MKD</div>
                      </div>
                      {statusBadge(f.status)}
                    </div>
                  ))}
                  {fines.length === 0 && <p className="empty-msg">Nuk keni gjoba</p>}
                </div>
              </div>
            </>
          )}

          {/* ─── APPOINTMENTS ─── */}
          {activeTab === 'appointments' && (
            <>
              <button className="btn-add" onClick={() => setShowApptModal(true)}>
                <Plus size={16} /> Rezervo termin të ri
              </button>
              <div className="table-card">
                {appointments.length === 0
                  ? <p className="empty-msg">Nuk keni terminë të rezervuara</p>
                  : appointments.map(a => (
                    <div key={a.id} className="table-row">
                      <div className="table-row-icon" style={{ background: '#3b82f620' }}>
                        <Calendar size={16} color="#3b82f6" />
                      </div>
                      <div className="table-row-info">
                        <div className="table-row-title">{a.institution}</div>
                        <div className="table-row-sub">{a.reason}
                          {a.approved_date && ` • ${new Date(a.approved_date).toLocaleDateString('sq-AL')}`}
                        </div>
                      </div>
                      {statusBadge(a.status)}
                    </div>
                  ))}
              </div>
            </>
          )}

          {/* ─── FINES ─── */}
          {activeTab === 'fines' && (
            <div className="table-card">
              {fines.length === 0
                ? <p className="empty-msg">Nuk keni gjoba</p>
                : fines.map(f => (
                  <div key={f.id} className="table-row">
                    <div className="table-row-icon" style={{ background: '#f59e0b20' }}>
                      <AlertTriangle size={16} color="#f59e0b" />
                    </div>
                    <div className="table-row-info">
                      <div className="table-row-title">{f.type}</div>
                      <div className="table-row-sub">{f.amount} MKD
                        {f.description && ` • ${f.description}`}
                      </div>
                    </div>
                    <div className="table-row-actions">
                      {statusBadge(f.status)}
                      {f.status === 'unpaid' && (
                        <button className="btn-pay" onClick={() => setShowPayModal(f.id)}>
                          Paguaj
                        </button>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          )}

          {/* ─── PERMITS ─── */}
          {activeTab === 'permits' && (
            <div className="table-card">
              {permits.length === 0
                ? <p className="empty-msg">Nuk keni leje të aplikuara</p>
                : permits.map(p => (
                  <div key={p.id} className="table-row">
                    <div className="table-row-icon" style={{ background: '#8b5cf620' }}>
                      <FileText size={16} color="#8b5cf6" />
                    </div>
                    <div className="table-row-info">
                      <div className="table-row-title">{p.permit_type}</div>
                      <div className="table-row-sub">{p.description || 'Pa përshkrim'}</div>
                    </div>
                    {statusBadge(p.status)}
                  </div>
                ))}
            </div>
          )}

          {/* ─── PAYMENTS ─── */}
          {activeTab === 'payments' && (
            <div className="table-card">
              {fines.filter(f => f.status === 'paid').length === 0
                ? <p className="empty-msg">Nuk keni pagesa të kryera</p>
                : fines.filter(f => f.status === 'paid').map(f => (
                  <div key={f.id} className="table-row">
                    <div className="table-row-icon" style={{ background: '#10b98120' }}>
                      <CheckCircle size={16} color="#10b981" />
                    </div>
                    <div className="table-row-info">
                      <div className="table-row-title">{f.type}</div>
                      <div className="table-row-sub">{f.amount} MKD
                        {f.paid_at && ` • ${new Date(f.paid_at).toLocaleDateString('sq-AL')}`}
                      </div>
                    </div>
                    <span className="badge badge-approved">Paguar</span>
                  </div>
                ))}
            </div>
          )}

          {/* ─── NOTIFICATIONS ─── */}
          {activeTab === 'notifications' && (
            <div className="table-card">
              {notifications.length === 0
                ? <p className="empty-msg">Nuk keni njoftime</p>
                : notifications.map(n => (
                  <div key={n.id} className={`notif-row ${!n.is_read ? 'unread' : ''}`}>
                    <div className={`notif-dot notif-${n.type}`} />
                    <div className="table-row-info">
                      <div className="table-row-title">{n.title}</div>
                      <div className="table-row-sub">{n.message}</div>
                      <div className="notif-time">
                        {new Date(n.created_at).toLocaleDateString('sq-AL')}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}

          {/* ─── PROFILE ─── */}
          {activeTab === 'profile' && (
            <div className="profile-card">
              <div className="profile-avatar">
                {user?.first_name?.[0]}{user?.last_name?.[0]}
              </div>
              <h2 className="profile-name">{user?.first_name} {user?.last_name}</h2>
              <span className="badge badge-approved" style={{ marginBottom: 24 }}>Llogari aktive</span>
              <div className="profile-fields">
                {[
                  { label: 'Email',    value: user?.email       },
                  { label: 'EMBG',     value: user?.personal_id },
                  { label: 'Roli',     value: user?.role        },
                  { label: 'Statusi',  value: user?.verification_status },
                ].map(({ label, value }) => (
                  <div key={label} className="profile-field">
                    <span className="profile-field-label">{label}</span>
                    <span className="profile-field-value">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </main>

      {/* ─── MODAL: APPOINTMENT ─── */}
      {showApptModal && (
        <div className="modal-overlay" onClick={() => setShowApptModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Rezervo termin</h3>
              <button className="modal-close" onClick={() => setShowApptModal(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>INSTITUCIONI</label>
                <select value={apptForm.institution}
                  onChange={e => setApptForm({ ...apptForm, institution: e.target.value })}>
                  <option value="">Zgjidhni institucionin</option>
                  {['MVR','Komuna','Cadastre','Tax Office','Other'].map(i => (
                    <option key={i} value={i}>{i}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>SHËRBIMI / ARSYEJA</label>
                <input value={apptForm.reason} placeholder="p.sh. Pasaportë, Letërnjoftim..."
                  onChange={e => setApptForm({ ...apptForm, reason: e.target.value })} />
              </div>
              <div className="form-group">
                <label>DATA E PREFERUAR (opsionale)</label>
                <input type="datetime-local" value={apptForm.appointment_date}
                  onChange={e => setApptForm({ ...apptForm, appointment_date: e.target.value })} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-ghost-modal" onClick={() => setShowApptModal(false)}>Anulo</button>
              <button className="btn-primary-modal" onClick={bookAppointment}>Rezervo ✓</button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL: PAYMENT ─── */}
      {showPayModal && (
        <div className="modal-overlay" onClick={() => setShowPayModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Paguaj gjobën</h3>
              <button className="modal-close" onClick={() => setShowPayModal(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <div className="pay-amount">
                💰 {fines.find(f => f.id === showPayModal)?.amount} MKD
              </div>
              <div className="form-group">
                <label>NUMRI I KARTËS</label>
                <input value={payForm.card_number} placeholder="1234 5678 9012 3456" maxLength={19}
                  onChange={e => setPayForm({ ...payForm, card_number: e.target.value })} />
              </div>
              <div className="form-group">
                <label>EMRI NË KARTË</label>
                <input value={payForm.card_holder} placeholder="EMRI MBIEMRI"
                  onChange={e => setPayForm({ ...payForm, card_holder: e.target.value.toUpperCase() })} />
              </div>
              <div className="pay-row">
                <div className="form-group">
                  <label>DATA SKADIMIT</label>
                  <input value={payForm.expiry} placeholder="MM/YY" maxLength={5}
                    onChange={e => setPayForm({ ...payForm, expiry: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>CVV</label>
                  <input value={payForm.cvv} placeholder="123" maxLength={3} type="password"
                    onChange={e => setPayForm({ ...payForm, cvv: e.target.value })} />
                </div>
              </div>
              <div className="pay-note">🔒 Lidhje e sigurt SSL — të dhënat janë të enkriptuara</div>
            </div>
            <div className="modal-footer">
              <button className="btn-ghost-modal" onClick={() => setShowPayModal(null)}>Anulo</button>
              <button className="btn-primary-modal" onClick={payFine}>Paguaj tani ✓</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard