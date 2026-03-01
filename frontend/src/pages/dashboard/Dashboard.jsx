import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useSocket } from '../../context/SocketContext'
import API from '../../api/axios'
import {
  LayoutDashboard, Calendar, AlertTriangle, FileText,
  CreditCard, User, LogOut, Bell, X, CheckCircle,
  Clock, XCircle, Plus, ChevronRight, Building2
} from 'lucide-react'

const Dashboard = () => {
  const { user, logout } = useAuth()
  const { liveNotif } = useSocket()
  const [activeTab, setActiveTab] = useState('overview')
  const [appointments, setAppointments] = useState([])
  const [fines, setFines] = useState([])
  const [permits, setPermits] = useState([])
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [showApptModal, setShowApptModal] = useState(false)
  const [showPayModal, setShowPayModal] = useState(null)
  const [toast, setToast] = useState(null)
  const [apptForm, setApptForm] = useState({ institution: '', reason: '', appointment_date: '' })
  const [payForm, setPayForm] = useState({ card_number: '', card_holder: '', expiry: '', cvv: '' })

  // Styles
  const styles = {
    dashLayout: { display: 'flex', minHeight: '100vh', background: '#0a1628' },
    dashToast: { 
      position: 'fixed', top: '20px', right: '20px', zIndex: 9999,
      display: 'flex', alignItems: 'center', gap: '8px',
      padding: '12px 18px', borderRadius: '10px', fontSize: '13px', fontWeight: 600
    },
    toastSuccess: { background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: '#34d399' },
    toastError: { background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' },
    sidebar: { 
      width: '240px', flexShrink: 0, background: 'rgba(10,22,40,0.95)',
      borderRight: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column',
      padding: '24px 16px', position: 'sticky', top: 0, height: '100vh'
    },
    sidebarLogo: { display: 'flex', alignItems: 'center', gap: '10px', paddingBottom: '24px', borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: '20px' },
    logoIcon: { width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' },
    logoTitle: { fontSize: '13px', fontWeight: 700, color: '#f0f4ff' },
    logoSub: { fontSize: '10px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.06em' },
    sidebarNav: { flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' },
    navItem: { 
      display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px',
      borderRadius: '10px', border: 'none', background: 'transparent',
      color: 'rgba(255,255,255,0.4)', fontSize: '13px', fontWeight: 500,
      transition: 'all 0.15s', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left'
    },
    navItemActive: { 
      background: 'linear-gradient(135deg, rgba(29,78,216,0.5), rgba(59,130,246,0.3))',
      color: '#93c5fd', boxShadow: '0 0 0 1px rgba(59,130,246,0.2)'
    },
    navBadge: { marginLeft: 'auto', background: '#ef4444', color: '#fff', fontSize: '10px', fontWeight: 700, padding: '2px 6px', borderRadius: '10px', minWidth: '18px', textAlign: 'center' },
    sidebarLogout: { 
      display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px',
      borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)',
      background: 'transparent', color: 'rgba(255,255,255,0.3)', fontSize: '13px',
      cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s', marginTop: '16px'
    },
    dashMain: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
    dashTopbar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '28px 32px 0' },
    dashPageTitle: { fontSize: '1.4rem', fontWeight: 800, color: '#f0f4ff', letterSpacing: '-0.02em' },
    dashPageSub: { fontSize: '12px', color: 'rgba(255,255,255,0.3)', marginTop: '2px' },
    topbarAvatar: { width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700, color: '#fff' },
    dashContent: { flex: 1, padding: '24px 32px 32px', overflowY: 'auto' },
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' },
    statCard: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', transition: 'all 0.2s' },
    statIcon: { width: '44px', height: '44px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
    statValue: { fontSize: '1.5rem', fontWeight: 800, color: '#f0f4ff', lineHeight: 1 },
    statLabel: { fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '4px' },
    overviewGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
    overviewCard: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '20px' },
    overviewCardHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', fontSize: '13px', fontWeight: 700, color: 'rgba(255,255,255,0.7)' },
    linkBtn: { display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', color: '#60a5fa', fontSize: '11px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'opacity 0.15s' },
    overviewRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' },
    overviewRowTitle: { fontSize: '13px', fontWeight: 600, color: '#f0f4ff' },
    overviewRowSub: { fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '2px' },
    emptyMsg: { textAlign: 'center', color: 'rgba(255,255,255,0.3)', padding: '24px' },
    btnAdd: { display: 'flex', alignItems: 'center', gap: '6px', background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '10px', fontSize: '13px', fontWeight: 700, marginBottom: '16px', cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 14px rgba(59,130,246,0.3)', transition: 'all 0.2s' },
    tableCard: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', overflow: 'hidden' },
    tableRow: { display: 'flex', alignItems: 'center', gap: '16px', padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.15s' },
    tableRowIcon: { width: '44px', height: '44px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
    tableRowInfo: { flex: 1 },
    tableRowTitle: { fontSize: '13px', fontWeight: 600, color: '#f0f4ff' },
    tableRowSub: { fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginTop: '2px' },
    tableRowActions: { display: 'flex', alignItems: 'center', gap: '8px' },
    btnPay: { background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)', color: '#60a5fa', borderRadius: '7px', padding: '5px 10px', fontSize: '11px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' },
    badge: { display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700 },
    badgeApproved: { background: 'rgba(16,185,129,0.15)', color: '#34d399' },
    badgePending: { background: 'rgba(245,158,11,0.15)', color: '#fbbf24' },
    badgeRejected: { background: 'rgba(239,68,68,0.15)', color: '#f87171' },
    profileCard: { maxWidth: '440px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center' },
    profileAvatar: { width: '72px', height: '72px', borderRadius: '50%', background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', fontWeight: 800, color: '#fff', marginBottom: '12px' },
    profileName: { fontSize: '1.2rem', fontWeight: 800, color: '#f0f4ff', marginBottom: '8px', letterSpacing: '-0.02em' },
    profileFields: { width: '100%', marginTop: '8px' },
    profileField: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' },
    profileFieldLabel: { fontSize: '11px', color: 'rgba(255,255,255,0.35)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' },
    profileFieldValue: { fontSize: '13px', color: '#f0f4ff', fontWeight: 500 },
    modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '24px' },
    modal: { background: '#0f1f50', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', width: '100%', maxWidth: '440px', boxShadow: '0 24px 64px rgba(0,0,0,0.5)' },
    modalHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px 0' },
    modalClose: { background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '8px', color: 'rgba(255,255,255,0.5)', padding: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', transition: 'all 0.15s' },
    modalBody: { padding: '20px 24px' },
    formGroup: { display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' },
    formGroupLabel: { fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em' },
    formGroupInput: { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#f0f4ff', borderRadius: '10px', padding: '10px 14px', fontSize: '13px', outline: 'none', fontFamily: 'inherit', width: '100%', transition: 'all 0.2s' },
    payAmount: { fontSize: '24px', fontWeight: 700, color: '#f0f4ff', textAlign: 'center', marginBottom: '20px', padding: '16px', background: 'rgba(59,130,246,0.1)', borderRadius: '10px' },
    payRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
    payNote: { fontSize: '12px', color: 'rgba(255,255,255,0.4)', textAlign: 'center', marginTop: '16px' },
    modalFooter: { display: 'flex', gap: '10px', padding: '0 24px 20px' },
    btnGhostModal: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#f0f4ff', padding: '11px', borderRadius: '10px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' },
    btnPrimaryModal: { flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)', border: 'none', color: '#fff', padding: '11px', borderRadius: '10px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s', boxShadow: '0 4px 14px rgba(59,130,246,0.3)' },
    notifRow: { display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)' },
    notifDot: { width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0, marginTop: '6px' },
    notifTime: { fontSize: '10px', color: 'rgba(255,255,255,0.3)', marginTop: '4px' },
    dashLoading: { display: 'flex', justifyContent: 'center', padding: '60px' },
    dashSpinner: { width: '32px', height: '32px', border: '3px solid rgba(255,255,255,0.08)', borderTopColor: '#a5b4fc', borderRadius: '50%', animation: 'spin 0.7s linear infinite' },
  }

  useEffect(() => { fetchAll() }, [])
  useEffect(() => { if (liveNotif) showToast(liveNotif.message, liveNotif.type) }, [liveNotif])

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
    } catch (err) { console.error(err) } 
    finally { setLoading(false) }
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
    } catch (err) { showToast(err.response?.data?.message || 'Gabim!', 'error') }
  }

  const payFine = async () => {
    if (!payForm.card_number || !payForm.card_holder || !payForm.expiry || !payForm.cvv) return
    try {
      await API.post('/payments/pay', { fine_id: showPayModal, ...payForm })
      setShowPayModal(null)
      setPayForm({ card_number: '', card_holder: '', expiry: '', cvv: '' })
      fetchAll()
      showToast('Pagesa u krye me sukses!')
    } catch (err) { showToast(err.response?.data?.message || 'Pagesa dështoi!', 'error') }
  }

  const statusBadge = (status) => {
    const map = {
      pending:   { label: 'Në pritje',  style: styles.badgePending  },
      approved:  { label: 'Aprovuar',   style: styles.badgeApproved },
      rejected:  { label: 'Refuzuar',   style: styles.badgeRejected },
      cancelled: { label: 'Anuluar',    style: styles.badgeRejected },
      unpaid:    { label: 'Pa paguar',  style: styles.badgePending  },
      paid:      { label: 'Paguar',     style: styles.badgeApproved },
    }
    const s = map[status] || { label: status, style: styles.badgePending }
    return <span style={{ ...styles.badge, ...s.style }}>{s.label}</span>
  }

  const unpaidFines = fines.filter(f => f.status === 'unpaid')
  const activeAppointments = appointments.filter(a => a.status !== 'cancelled')
  const activePermits = permits.filter(p => p.status !== 'rejected')

  if (loading) return (
    <>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
      <div style={styles.dashLoading}>
        <div style={styles.dashSpinner} />
      </div>
    </>
  )

  return (
    <>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        button:hover { opacity: 0.9; }
        input:focus { border-color: rgba(59,130,246,0.6) !important; background: rgba(255,255,255,0.08) !important; }
        select:focus { border-color: rgba(59,130,246,0.6) !important; background: rgba(255,255,255,0.08) !important; }
      `}</style>
      
      <div style={styles.dashLayout}>
        {toast && (
          <div style={{ ...styles.dashToast, ...(toast.type === 'error' ? styles.toastError : styles.toastSuccess) }}>
            {toast.type === 'error' ? <XCircle size={16} /> : <CheckCircle size={16} />}
            {toast.msg}
          </div>
        )}

        <aside style={styles.sidebar}>
          <div style={styles.sidebarLogo}>
            <div style={styles.logoIcon}><Building2 size={18} /></div>
            <div>
              <div style={styles.logoTitle}>eGov Portal</div>
              <div style={styles.logoSub}>Republika e MV</div>
            </div>
          </div>

          <nav style={styles.sidebarNav}>
            {[
              { id: 'overview', icon: LayoutDashboard, label: 'Pasqyrë' },
              { id: 'appointments', icon: Calendar, label: 'Terminë' },
              { id: 'fines', icon: AlertTriangle, label: 'Gjoba' },
              { id: 'permits', icon: FileText, label: 'Leje' },
              { id: 'payments', icon: CreditCard, label: 'Pagesa' },
              { id: 'notifications', icon: Bell, label: 'Njoftime' },
              { id: 'profile', icon: User, label: 'Profili' },
            ].map(({ id, icon: Icon, label }) => (
              <button key={id}
                style={{ ...styles.navItem, ...(activeTab === id ? styles.navItemActive : {}) }}
                onClick={() => setActiveTab(id)}>
                <Icon size={18} />
                <span>{label}</span>
                {id === 'fines' && unpaidFines.length > 0 &&
                  <span style={styles.navBadge}>{unpaidFines.length}</span>}
                {id === 'notifications' && notifications.filter(n => !n.is_read).length > 0 &&
                  <span style={styles.navBadge}>{notifications.filter(n => !n.is_read).length}</span>}
              </button>
            ))}
          </nav>

          <button style={styles.sidebarLogout} onClick={logout}>
            <LogOut size={16} /> Dil
          </button>
        </aside>

        <main style={styles.dashMain}>
          <div style={styles.dashTopbar}>
            <div>
              <h2 style={styles.dashPageTitle}>
                {activeTab === 'overview' && 'Pasqyrë'}
                {activeTab === 'appointments' && 'Terminët e mia'}
                {activeTab === 'fines' && 'Gjobat e mia'}
                {activeTab === 'permits' && 'Lejet e mia'}
                {activeTab === 'payments' && 'Pagesat e mia'}
                {activeTab === 'notifications' && 'Njoftimet'}
                {activeTab === 'profile' && 'Profili im'}
              </h2>
              <p style={styles.dashPageSub}>Mirë se erdhët, {user?.first_name}!</p>
            </div>
            <div style={styles.topbarAvatar}>
              {user?.first_name?.[0]}{user?.last_name?.[0]}
            </div>
          </div>

          <div style={styles.dashContent}>
            {activeTab === 'overview' && (
              <>
                <div style={styles.statsGrid}>
                  {[
                    { label: 'Terminë aktive', value: activeAppointments.length, icon: Calendar, color: '#3b82f6' },
                    { label: 'Gjoba pa paguar', value: unpaidFines.length, icon: AlertTriangle, color: '#f59e0b' },
                    { label: 'Leje aktive', value: activePermits.length, icon: FileText, color: '#8b5cf6' },
                    { label: 'Pagesa totale', value: fines.filter(f=>f.status==='paid').length, icon: CreditCard, color: '#10b981' },
                  ].map(({ label, value, icon: Icon, color }) => (
                    <div key={label} style={styles.statCard}>
                      <div style={{ ...styles.statIcon, background: `${color}20` }}>
                        <Icon size={20} color={color} />
                      </div>
                      <div>
                        <div style={styles.statValue}>{value}</div>
                        <div style={styles.statLabel}>{label}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={styles.overviewGrid}>
                  <div style={styles.overviewCard}>
                    <div style={styles.overviewCardHeader}>
                      <span>Terminët e fundit</span>
                      <button style={styles.linkBtn} onClick={() => setActiveTab('appointments')}>
                        Shiko të gjitha <ChevronRight size={14} />
                      </button>
                    </div>
                    {appointments.slice(0, 3).map(a => (
                      <div key={a.id} style={styles.overviewRow}>
                        <div>
                          <div style={styles.overviewRowTitle}>{a.institution}</div>
                          <div style={styles.overviewRowSub}>{a.reason}</div>
                        </div>
                        {statusBadge(a.status)}
                      </div>
                    ))}
                    {appointments.length === 0 && <p style={styles.emptyMsg}>Nuk keni terminë</p>}
                  </div>

                  <div style={styles.overviewCard}>
                    <div style={styles.overviewCardHeader}>
                      <span>Gjobat e fundit</span>
                      <button style={styles.linkBtn} onClick={() => setActiveTab('fines')}>
                        Shiko të gjitha <ChevronRight size={14} />
                      </button>
                    </div>
                    {fines.slice(0, 3).map(f => (
                      <div key={f.id} style={styles.overviewRow}>
                        <div>
                          <div style={styles.overviewRowTitle}>{f.type}</div>
                          <div style={styles.overviewRowSub}>{f.amount} MKD</div>
                        </div>
                        {statusBadge(f.status)}
                      </div>
                    ))}
                    {fines.length === 0 && <p style={styles.emptyMsg}>Nuk keni gjoba</p>}
                  </div>
                </div>
              </>
            )}

            {activeTab === 'appointments' && (
              <>
                <button style={styles.btnAdd} onClick={() => setShowApptModal(true)}>
                  <Plus size={16} /> Rezervo termin të ri
                </button>
                <div style={styles.tableCard}>
                  {appointments.length === 0
                    ? <p style={styles.emptyMsg}>Nuk keni terminë të rezervuara</p>
                    : appointments.map(a => (
                      <div key={a.id} style={styles.tableRow}>
                        <div style={{ ...styles.tableRowIcon, background: '#3b82f620' }}>
                          <Calendar size={16} color="#3b82f6" />
                        </div>
                        <div style={styles.tableRowInfo}>
                          <div style={styles.tableRowTitle}>{a.institution}</div>
                          <div style={styles.tableRowSub}>{a.reason}
                            {a.approved_date && ` • ${new Date(a.approved_date).toLocaleDateString('sq-AL')}`}
                          </div>
                        </div>
                        {statusBadge(a.status)}
                      </div>
                    ))}
                </div>
              </>
            )}

            {activeTab === 'fines' && (
              <div style={styles.tableCard}>
                {fines.length === 0
                  ? <p style={styles.emptyMsg}>Nuk keni gjoba</p>
                  : fines.map(f => (
                    <div key={f.id} style={styles.tableRow}>
                      <div style={{ ...styles.tableRowIcon, background: '#f59e0b20' }}>
                        <AlertTriangle size={16} color="#f59e0b" />
                      </div>
                      <div style={styles.tableRowInfo}>
                        <div style={styles.tableRowTitle}>{f.type}</div>
                        <div style={styles.tableRowSub}>{f.amount} MKD
                          {f.description && ` • ${f.description}`}
                        </div>
                      </div>
                      <div style={styles.tableRowActions}>
                        {statusBadge(f.status)}
                        {f.status === 'unpaid' && (
                          <button style={styles.btnPay} onClick={() => setShowPayModal(f.id)}>
                            Paguaj
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            )}

            {activeTab === 'permits' && (
              <div style={styles.tableCard}>
                {permits.length === 0
                  ? <p style={styles.emptyMsg}>Nuk keni leje të aplikuara</p>
                  : permits.map(p => (
                    <div key={p.id} style={styles.tableRow}>
                      <div style={{ ...styles.tableRowIcon, background: '#8b5cf620' }}>
                        <FileText size={16} color="#8b5cf6" />
                      </div>
                      <div style={styles.tableRowInfo}>
                        <div style={styles.tableRowTitle}>{p.permit_type}</div>
                        <div style={styles.tableRowSub}>{p.description || 'Pa përshkrim'}</div>
                      </div>
                      {statusBadge(p.status)}
                    </div>
                  ))}
              </div>
            )}

            {activeTab === 'payments' && (
              <div style={styles.tableCard}>
                {fines.filter(f => f.status === 'paid').length === 0
                  ? <p style={styles.emptyMsg}>Nuk keni pagesa të kryera</p>
                  : fines.filter(f => f.status === 'paid').map(f => (
                    <div key={f.id} style={styles.tableRow}>
                      <div style={{ ...styles.tableRowIcon, background: '#10b98120' }}>
                        <CheckCircle size={16} color="#10b981" />
                      </div>
                      <div style={styles.tableRowInfo}>
                        <div style={styles.tableRowTitle}>{f.type}</div>
                        <div style={styles.tableRowSub}>{f.amount} MKD
                          {f.paid_at && ` • ${new Date(f.paid_at).toLocaleDateString('sq-AL')}`}
                        </div>
                      </div>
                      <span style={{ ...styles.badge, ...styles.badgeApproved }}>Paguar</span>
                    </div>
                  ))}
              </div>
            )}

            {activeTab === 'notifications' && (
              <div style={styles.tableCard}>
                {notifications.length === 0
                  ? <p style={styles.emptyMsg}>Nuk keni njoftime</p>
                  : notifications.map(n => (
                    <div key={n.id} style={{ ...styles.notifRow, background: !n.is_read ? 'rgba(59,130,246,0.05)' : 'transparent' }}>
                      <div style={{ ...styles.notifDot, background: n.type === 'success' ? '#10b981' : '#f59e0b' }} />
                      <div style={styles.tableRowInfo}>
                        <div style={styles.tableRowTitle}>{n.title}</div>
                        <div style={styles.tableRowSub}>{n.message}</div>
                        <div style={styles.notifTime}>
                          {new Date(n.created_at).toLocaleDateString('sq-AL')}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}

            {activeTab === 'profile' && (
              <div style={styles.profileCard}>
                <div style={styles.profileAvatar}>
                  {user?.first_name?.[0]}{user?.last_name?.[0]}
                </div>
                <h2 style={styles.profileName}>{user?.first_name} {user?.last_name}</h2>
                <span style={{ ...styles.badge, ...styles.badgeApproved, marginBottom: '24px' }}>Llogari aktive</span>
                <div style={styles.profileFields}>
                  {[
                    { label: 'Email', value: user?.email },
                    { label: 'EMBG', value: user?.personal_id },
                    { label: 'Roli', value: user?.role },
                    { label: 'Statusi', value: user?.verification_status },
                  ].map(({ label, value }) => (
                    <div key={label} style={styles.profileField}>
                      <span style={styles.profileFieldLabel}>{label}</span>
                      <span style={styles.profileFieldValue}>{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>

        {showApptModal && (
          <div style={styles.modalOverlay} onClick={() => setShowApptModal(false)}>
            <div style={styles.modal} onClick={e => e.stopPropagation()}>
              <div style={styles.modalHeader}>
                <h3>Rezervo termin</h3>
                <button style={styles.modalClose} onClick={() => setShowApptModal(false)}>
                  <X size={18} />
                </button>
              </div>
              <div style={styles.modalBody}>
                <div style={styles.formGroup}>
                  <label style={styles.formGroupLabel}>INSTITUCIONI</label>
                  <select value={apptForm.institution} style={styles.formGroupInput}
                    onChange={e => setApptForm({ ...apptForm, institution: e.target.value })}>
                    <option value="">Zgjidhni institucionin</option>
                    {['MVR','Komuna','Cadastre','Tax Office','Other'].map(i => (
                      <option key={i} value={i}>{i}</option>
                    ))}
                  </select>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.formGroupLabel}>SHËRBIMI / ARSYEJA</label>
                  <input value={apptForm.reason} placeholder="p.sh. Pasaportë, Letërnjoftim..." style={styles.formGroupInput}
                    onChange={e => setApptForm({ ...apptForm, reason: e.target.value })} />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.formGroupLabel}>DATA E PREFERUAR (opsionale)</label>
                  <input type="datetime-local" value={apptForm.appointment_date} style={styles.formGroupInput}
                    onChange={e => setApptForm({ ...apptForm, appointment_date: e.target.value })} />
                </div>
              </div>
              <div style={styles.modalFooter}>
                <button style={styles.btnGhostModal} onClick={() => setShowApptModal(false)}>Anulo</button>
                <button style={styles.btnPrimaryModal} onClick={bookAppointment}>Rezervo ✓</button>
              </div>
            </div>
          </div>
        )}

        {showPayModal && (
          <div style={styles.modalOverlay} onClick={() => setShowPayModal(null)}>
            <div style={styles.modal} onClick={e => e.stopPropagation()}>
              <div style={styles.modalHeader}>
                <h3>Paguaj gjobën</h3>
                <button style={styles.modalClose} onClick={() => setShowPayModal(null)}>
                  <X size={18} />
                </button>
              </div>
              <div style={styles.modalBody}>
                <div style={styles.payAmount}>
                  💰 {fines.find(f => f.id === showPayModal)?.amount} MKD
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.formGroupLabel}>NUMRI I KARTËS</label>
                  <input value={payForm.card_number} placeholder="1234 5678 9012 3456" maxLength={19} style={styles.formGroupInput}
                    onChange={e => setPayForm({ ...payForm, card_number: e.target.value })} />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.formGroupLabel}>EMRI NË KARTË</label>
                  <input value={payForm.card_holder} placeholder="EMRI MBIEMRI" style={styles.formGroupInput}
                    onChange={e => setPayForm({ ...payForm, card_holder: e.target.value.toUpperCase() })} />
                </div>
                <div style={styles.payRow}>
                  <div style={styles.formGroup}>
                    <label style={styles.formGroupLabel}>DATA SKADIMIT</label>
                    <input value={payForm.expiry} placeholder="MM/YY" maxLength={5} style={styles.formGroupInput}
                      onChange={e => setPayForm({ ...payForm, expiry: e.target.value })} />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.formGroupLabel}>CVV</label>
                    <input value={payForm.cvv} placeholder="123" maxLength={3} type="password" style={styles.formGroupInput}
                      onChange={e => setPayForm({ ...payForm, cvv: e.target.value })} />
                  </div>
                </div>
                <div style={styles.payNote}>🔒 Lidhje e sigurt SSL — të dhënat janë të enkriptuara</div>
              </div>
              <div style={styles.modalFooter}>
                <button style={styles.btnGhostModal} onClick={() => setShowPayModal(null)}>Anulo</button>
                <button style={styles.btnPrimaryModal} onClick={payFine}>Paguaj tani ✓</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default Dashboard