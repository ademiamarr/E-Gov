import React, { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useSocket } from '../../context/SocketContext'
import API from '../../api/axios'
import {
  LayoutDashboard, Calendar, AlertTriangle,
  CreditCard, User, LogOut, CheckCircle,
  XCircle, Plus, ChevronRight, Building2,
  Check, X, Clock
} from 'lucide-react'

const SERVICES = {
  MVR: ['Pasaportë','Letërnjoftim (ID)','Licencë drejtimi','Regjistrim automjeti','Leje qëndrimi'],
  Komuna: ['Certifikatë lindjeje','Certifikatë martese','Regjistrim adrese','Vërtetim vendbanimi','Leje ndërtimi'],
}

const getWorkDays = () => {
  const days = []
  let d = new Date()
  d.setDate(d.getDate() + 1)
  while (days.length < 10) {
    if (d.getDay() !== 0 && d.getDay() !== 6) days.push(new Date(d))
    d.setDate(d.getDate() + 1)
  }
  return days
}

const TIME_SLOTS = ['08:30','09:00','09:30','10:00','10:30','11:00','12:00','13:00','13:30','14:00','14:30','15:00']

const Dashboard = () => {
  const { user, logout }        = useAuth()
  const { liveNotif }           = useSocket()
  const [activeTab, setActiveTab]       = useState('overview')
  const [appointments, setAppointments] = useState([])
  const [fines, setFines]               = useState([])
  const [loading, setLoading]           = useState(true)
  const [showApptModal, setShowApptModal] = useState(false)
  const [showPayModal, setShowPayModal]   = useState(null)
  const [toast, setToast]               = useState(null)

  const [step, setStep]                   = useState(1)
  const [apptInstitution, setApptInstitution] = useState('')
  const [apptService, setApptService]     = useState('')
  const [apptDate, setApptDate]           = useState(null)
  const [apptTime, setApptTime]           = useState('')
  const [payForm, setPayForm] = useState({ card_number:'', card_holder:'', expiry:'', cvv:'' })

  const workDays = getWorkDays()

  useEffect(() => { fetchAll() }, [])
  useEffect(() => { if (liveNotif) showToast(liveNotif.message, liveNotif.type) }, [liveNotif])

  const fetchAll = async () => {
    try {
      const [a, f] = await Promise.all([API.get('/appointments/my'), API.get('/fines/my')])
      setAppointments(a.data.data || [])
      setFines(f.data.data || [])
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  const resetForm = () => { setStep(1); setApptInstitution(''); setApptService(''); setApptDate(null); setApptTime('') }

  const bookAppointment = async () => {
    try {
      const dt = new Date(apptDate)
      const [h, m] = apptTime.split(':')
      dt.setHours(+h, +m, 0, 0)
      await API.post('/appointments', { institution: apptInstitution, reason: apptService, appointment_date: dt.toISOString() })
      setShowApptModal(false); resetForm(); fetchAll()
      showToast('Termini u rezervua me sukses.')
    } catch (e) { showToast(e.response?.data?.message || 'Gabim!', 'error') }
  }

  const payFine = async () => {
    try {
      await API.post('/payments/pay', { fine_id: showPayModal, ...payForm })
      setShowPayModal(null); setPayForm({ card_number:'', card_holder:'', expiry:'', cvv:'' })
      fetchAll(); showToast('Pagesa u krye me sukses.')
    } catch (e) { showToast(e.response?.data?.message || 'Pagesa dështoi.', 'error') }
  }

  const canNext = () => {
    if (step === 1) return !!apptInstitution
    if (step === 2) return !!apptService
    if (step === 3) return !!apptDate
    if (step === 4) return !!apptTime
  }

  const unpaid = fines.filter(f => f.status === 'unpaid')
  const active = appointments.filter(a => a.status !== 'cancelled')

  const StatusBadge = ({ status }) => {
    const cfg = {
      pending:  { bg: '#fffbeb', border: '#fde68a', color: '#92400e', dot: '#f59e0b', label: 'Në pritje' },
      approved: { bg: '#f0fdf4', border: '#bbf7d0', color: '#15803d', dot: '#22c55e', label: 'Aprovuar' },
      rejected: { bg: '#fef2f2', border: '#fecaca', color: '#dc2626', dot: '#ef4444', label: 'Refuzuar' },
      unpaid:   { bg: '#fffbeb', border: '#fde68a', color: '#92400e', dot: '#f59e0b', label: 'Pa paguar' },
      paid:     { bg: '#f0fdf4', border: '#bbf7d0', color: '#15803d', dot: '#22c55e', label: 'Paguar' },
    }
    const c = cfg[status] || { bg: '#f5f6f8', border: '#e5e7eb', color: '#6b7280', dot: '#9ca3af', label: status }
    return (
      <span style={{ display:'inline-flex', alignItems:'center', gap:5, background:c.bg, border:`1px solid ${c.border}`, color:c.color, borderRadius:20, padding:'3px 10px', fontSize:11, fontWeight:600, whiteSpace:'nowrap' }}>
        <span style={{ width:5, height:5, borderRadius:'50%', background:c.dot, flexShrink:0, display:'inline-block' }}/>
        {c.label}
      </span>
    )
  }

  if (loading) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#f5f6f8' }}>
      <div style={{ width:24, height:24, border:'2px solid #e5e7eb', borderTopColor:'#0c1220', borderRadius:'50%', animation:'spin .6s linear infinite' }}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  const S = {
    root: { display:'flex', minHeight:'100vh', background:'#f5f6f8', fontFamily:"'DM Sans', sans-serif" },

    /* sidebar */
    sidebar: { width:220, flexShrink:0, background:'#fff', borderRight:'1px solid #eaecf0', display:'flex', flexDirection:'column', height:'100vh', position:'sticky', top:0 },
    sidebarHeader: { padding:'20px 16px 16px', borderBottom:'1px solid #eaecf0', display:'flex', alignItems:'center', gap:10 },
    logoBox: { width:30, height:30, background:'#0c1220', borderRadius:7, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 },
    brandName: { fontSize:13, fontWeight:700, color:'#0c1220', letterSpacing:'-0.01em' },
    brandSub: { fontSize:10, color:'#8a929e' },
    nav: { flex:1, padding:'10px 8px', display:'flex', flexDirection:'column', gap:2 },
    navBtn: (active) => ({
      display:'flex', alignItems:'center', gap:8, padding:'8px 10px',
      borderRadius:7, border:'none', background: active ? '#f0f2ff' : 'transparent',
      cursor:'pointer', fontFamily:"'DM Sans', sans-serif",
      transition:'background .1s', textAlign:'left', width:'100%', position:'relative'
    }),
    navIcon: (active) => ({
      width:28, height:28, borderRadius:6, display:'flex', alignItems:'center', justifyContent:'center',
      background: active ? '#0c1220' : '#f5f6f8', color: active ? '#fff' : '#6b7280', flexShrink:0
    }),
    navLabel: (active) => ({ fontSize:13, fontWeight:600, color: active ? '#0c1220' : '#374151', display:'block' }),
    navBadge: { position:'absolute', right:10, background:'#ef4444', color:'#fff', fontSize:10, fontWeight:700, padding:'1px 6px', borderRadius:10 },
    sidebarFooter: { padding:'12px 14px', borderTop:'1px solid #eaecf0', display:'flex', alignItems:'center', gap:10 },
    userAvatar: { width:32, height:32, borderRadius:'50%', background:'#0c1220', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, color:'#fff', flexShrink:0 },
    userName: { fontSize:13, fontWeight:600, color:'#0c1220', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', display:'block' },
    userRole: { fontSize:10, color:'#8a929e', display:'block' },
    logoutBtn: { background:'none', border:'none', color:'#9ca3af', cursor:'pointer', padding:4, borderRadius:6, display:'flex', alignItems:'center', transition:'color .1s' },

    /* main */
    main: { flex:1, display:'flex', flexDirection:'column', minWidth:0 },
    topbar: { background:'#fff', borderBottom:'1px solid #eaecf0', padding:'0 24px', height:52, display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 },
    pageTitle: { fontSize:15, fontWeight:700, color:'#0c1220', letterSpacing:'-0.01em' },
    pageSub: { fontSize:12, color:'#8a929e', marginTop:2 },
    topbarAvatar: { width:32, height:32, borderRadius:'50%', background:'#0c1220', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, color:'#fff' },
    content: { flex:1, padding:'24px', overflowY:'auto' },

    /* stats */
    statsGrid: { display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:20 },
    statCard: { background:'#fff', border:'1px solid #e5e7eb', borderRadius:10, padding:16, display:'flex', alignItems:'center', gap:12 },
    statIcon: (color) => ({ width:38, height:38, borderRadius:9, background:`${color}15`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }),
    statNum: { fontSize:'1.4rem', fontWeight:800, color:'#0c1220', lineHeight:1, letterSpacing:'-0.03em' },
    statLabel: { fontSize:11, color:'#8a929e', marginTop:3 },

    /* cards */
    card: { background:'#fff', border:'1px solid #e5e7eb', borderRadius:10, overflow:'hidden' },
    cardHeader: { display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 18px', borderBottom:'1px solid #f3f4f6' },
    cardTitle: { fontSize:13, fontWeight:700, color:'#0c1220' },
    cardLink: { display:'flex', alignItems:'center', gap:3, background:'none', border:'none', color:'#2563eb', fontSize:11, fontWeight:600, cursor:'pointer', fontFamily:"'DM Sans', sans-serif" },
    tableRow: { display:'flex', alignItems:'center', justifyContent:'space-between', padding:'11px 18px', borderBottom:'1px solid #f9fafb' },
    tableRowTitle: { fontSize:13, fontWeight:600, color:'#111827' },
    tableRowSub: { fontSize:11, color:'#9ca3af', marginTop:1 },

    /* empty */
    emptyMsg: { textAlign:'center', color:'#9ca3af', fontSize:13, padding:'28px 0' },

    /* modal overlay */
    overlay: { position:'fixed', inset:0, background:'rgba(12,18,32,0.45)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:24 },
    modal: { background:'#fff', border:'1px solid #e5e7eb', borderRadius:14, width:'100%', maxWidth:440, boxShadow:'0 20px 60px rgba(0,0,0,.12)', overflow:'hidden' },
    modalHeader: { display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 20px', borderBottom:'1px solid #f3f4f6' },
    modalTitle: { fontSize:15, fontWeight:700, color:'#0c1220' },
    modalClose: { background:'#f5f6f8', border:'none', borderRadius:6, color:'#6b7280', padding:6, cursor:'pointer', display:'flex' },
    modalBody: { padding:'18px 20px' },
    modalFooter: { display:'flex', gap:8, padding:'14px 20px', borderTop:'1px solid #f3f4f6' },

    /* wizard step indicator */
    wzSteps: { display:'flex', alignItems:'center', marginBottom:18, gap:0 },
    wzDot: (state) => ({
      width:24, height:24, borderRadius:'50%', border:'1.5px solid',
      display:'flex', alignItems:'center', justifyContent:'center',
      fontSize:10, fontWeight:700, flexShrink:0,
      ...(state === 'done'   ? { background:'#0c1220', borderColor:'#0c1220', color:'#fff' } :
          state === 'active' ? { background:'#fff', borderColor:'#0c1220', color:'#0c1220' } :
                               { background:'#f5f6f8', borderColor:'#e5e7eb', color:'#9ca3af' })
    }),
    wzLine: (done) => ({ flex:1, height:1.5, background: done ? '#0c1220' : '#e5e7eb', margin:'0 4px' }),

    /* wizard content */
    instGrid: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 },
    instCard: (sel) => ({
      border:`1.5px solid ${sel ? '#0c1220' : '#e5e7eb'}`,
      borderRadius:10, padding:'16px 12px', textAlign:'center', cursor:'pointer',
      background: sel ? '#0c1220' : '#fff', transition:'all .1s'
    }),
    instIcon: { fontSize:24, display:'block', marginBottom:8 },
    instName: (sel) => ({ fontSize:13, fontWeight:700, color: sel ? '#fff' : '#111827' }),
    instSub: (sel) => ({ fontSize:11, color: sel ? 'rgba(255,255,255,.5)' : '#9ca3af', marginTop:2 }),

    svcList: { border:'1px solid #e5e7eb', borderRadius:9, overflow:'hidden' },
    svcItem: (sel) => ({
      display:'flex', alignItems:'center', gap:10,
      padding:'11px 14px', fontSize:13, fontWeight:500,
      color: sel ? '#0c1220' : '#6b7280',
      background: sel ? '#f0f2ff' : '#fff',
      cursor:'pointer', transition:'background .1s',
      borderBottom:'1px solid #f3f4f6'
    }),
    svcRadio: (sel) => ({
      width:14, height:14, borderRadius:'50%',
      border:`1.5px solid ${sel ? '#0c1220' : '#d1d5db'}`,
      display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0
    }),

    dateGrid: { display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:6 },
    dateCard: (sel) => ({
      border:`1.5px solid ${sel ? '#0c1220' : '#e5e7eb'}`,
      borderRadius:8, padding:'9px 4px', textAlign:'center', cursor:'pointer',
      background: sel ? '#0c1220' : '#fff', transition:'all .1s'
    }),
    dateDW: (sel) => ({ fontSize:9, fontWeight:700, color: sel ? 'rgba(255,255,255,.5)' : '#9ca3af', textTransform:'uppercase', letterSpacing:'.05em', marginBottom:3 }),
    dateNum: (sel) => ({ fontSize:16, fontWeight:800, color: sel ? '#fff' : '#111827', lineHeight:1 }),
    dateMo: (sel) => ({ fontSize:9, color: sel ? 'rgba(255,255,255,.5)' : '#9ca3af', marginTop:2 }),

    summary: { background:'#f9fafb', border:'1px solid #f3f4f6', borderRadius:8, padding:'12px 14px', marginBottom:14 },
    sumRow: { display:'flex', justifyContent:'space-between', fontSize:12, marginBottom:6 },
    sumKey: { color:'#9ca3af' },
    sumVal: { color:'#111827', fontWeight:600, textAlign:'right' },

    timeGrid: { display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:7 },
    timeBtn: (sel) => ({
      border:`1.5px solid ${sel ? '#0c1220' : '#e5e7eb'}`,
      borderRadius:7, padding:'8px 4px', textAlign:'center',
      cursor:'pointer', background: sel ? '#0c1220' : '#fff',
      fontSize:13, fontWeight:600, color: sel ? '#fff' : '#374151',
      fontFamily:"'DM Sans', sans-serif", transition:'all .1s'
    }),

    /* pay modal */
    piLabel: { fontSize:11, fontWeight:600, color:'#374151', textTransform:'uppercase', letterSpacing:'.04em', display:'block', marginBottom:5 },
    piInput: { width:'100%', background:'#f9fafb', border:'1.5px solid #e5e7eb', color:'#111827', borderRadius:8, padding:'10px 12px', fontSize:13, outline:'none', fontFamily:"'DM Sans', sans-serif", marginBottom:12, transition:'border .15s' },
  }

  const navItems = [
    { id:'overview',     icon:LayoutDashboard, label:'Pasqyrë' },
    { id:'appointments', icon:Calendar,        label:'Terminë' },
    { id:'fines',        icon:AlertTriangle,   label:'Gjoba' },
    { id:'payments',     icon:CreditCard,      label:'Pagesa' },
    { id:'profile',      icon:User,            label:'Profili' },
  ]

  const pageTitles = { overview:'Pasqyrë', appointments:'Terminët e mia', fines:'Gjobat e mia', payments:'Pagesat e mia', profile:'Profili im' }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        * { margin:0; padding:0; box-sizing:border-box; }
        .dash-logout-btn:hover { color: #ef4444 !important; }
        .dash-card-link:hover { opacity: 0.7; }
        .dash-nav-btn:hover .dash-nav-icon-inner { background: #eaecf0 !important; }
      `}</style>

      <div style={S.root}>

        {/* Toast */}
        {toast && (
          <div style={{
            position:'fixed', top:18, right:18, zIndex:9999,
            display:'flex', alignItems:'center', gap:8,
            padding:'10px 15px', borderRadius:8, fontSize:13, fontWeight:500,
            boxShadow:'0 4px 16px rgba(0,0,0,.08)', border:'1px solid',
            fontFamily:"'DM Sans', sans-serif",
            ...(toast.type==='error'
              ? { background:'#fef2f2', borderColor:'#fecaca', color:'#dc2626' }
              : { background:'#f0fdf4', borderColor:'#bbf7d0', color:'#15803d' })
          }}>
            {toast.type==='error' ? <XCircle size={14}/> : <CheckCircle size={14}/>}
            {toast.msg}
          </div>
        )}

        {/* SIDEBAR */}
        <aside style={S.sidebar}>
          <div style={S.sidebarHeader}>
            <div style={S.logoBox}>
              <svg viewBox="0 0 24 24" fill="none" width={16} height={16}><path d="M3 22V10L12 3L21 10V22H15V16H9V22H3Z" fill="#fff"/></svg>
            </div>
            <div>
              <div style={S.brandName}>eGov Portal</div>
              <div style={S.brandSub}>Porta qeveritare</div>
            </div>
          </div>

          <nav style={S.nav}>
            {navItems.map(({ id, icon: Icon, label }) => {
              const isActive = activeTab === id
              return (
                <button key={id} className="dash-nav-btn" style={S.navBtn(isActive)} onClick={() => setActiveTab(id)}>
                  <div className="dash-nav-icon-inner" style={S.navIcon(isActive)}><Icon size={14}/></div>
                  <span style={S.navLabel(isActive)}>{label}</span>
                  {id === 'fines' && unpaid.length > 0 && <span style={S.navBadge}>{unpaid.length}</span>}
                </button>
              )
            })}
          </nav>

          <div style={S.sidebarFooter}>
            <div style={S.userAvatar}>{user?.first_name?.[0]}{user?.last_name?.[0]}</div>
            <div style={{ flex:1, overflow:'hidden' }}>
              <span style={S.userName}>{user?.first_name} {user?.last_name}</span>
              <span style={S.userRole}>Qytetar</span>
            </div>
            <button className="dash-logout-btn" style={S.logoutBtn} onClick={logout} title="Dil"><LogOut size={14}/></button>
          </div>
        </aside>

        {/* MAIN */}
        <main style={S.main}>
          <div style={S.topbar}>
            <div>
              <div style={S.pageTitle}>{pageTitles[activeTab]}</div>
            </div>
            <div style={S.topbarAvatar}>{user?.first_name?.[0]}{user?.last_name?.[0]}</div>
          </div>

          <div style={S.content}>

            {/* ── OVERVIEW ── */}
            {activeTab === 'overview' && (
              <>
                <div style={S.statsGrid}>
                  {[
                    { label:'Terminë aktive', val:active.length, icon:Calendar, color:'#2563eb' },
                    { label:'Gjoba pa paguar', val:unpaid.length, icon:AlertTriangle, color:'#d97706' },
                    { label:'Pagesa totale', val:fines.filter(f=>f.status==='paid').length, icon:CreditCard, color:'#16a34a' },
                  ].map(({ label, val, icon:Icon, color }) => (
                    <div key={label} style={S.statCard}>
                      <div style={S.statIcon(color)}><Icon size={17} color={color}/></div>
                      <div>
                        <div style={S.statNum}>{val}</div>
                        <div style={S.statLabel}>{label}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                  {[
                    { title:'Terminët e fundit', data:appointments.slice(0,4), tab:'appointments', getTitle:a=>a.institution, getSub:a=>a.reason, getStatus:a=>a.status, empty:'Nuk keni terminë' },
                    { title:'Gjobat e fundit',   data:fines.slice(0,4),        tab:'fines',        getTitle:f=>f.type,        getSub:f=>`${f.amount} MKD`, getStatus:f=>f.status, empty:'Nuk keni gjoba' },
                  ].map(({ title, data, tab, getTitle, getSub, getStatus, empty }) => (
                    <div key={title} style={S.card}>
                      <div style={S.cardHeader}>
                        <span style={S.cardTitle}>{title}</span>
                        <button className="dash-card-link" style={S.cardLink} onClick={() => setActiveTab(tab)}>
                          Shiko të gjitha <ChevronRight size={12}/>
                        </button>
                      </div>
                      {data.length === 0
                        ? <div style={S.emptyMsg}>{empty}</div>
                        : data.map(item => (
                          <div key={item.id} style={S.tableRow}>
                            <div>
                              <div style={S.tableRowTitle}>{getTitle(item)}</div>
                              <div style={S.tableRowSub}>{getSub(item)}</div>
                            </div>
                            <StatusBadge status={getStatus(item)}/>
                          </div>
                        ))}
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* ── APPOINTMENTS ── */}
            {activeTab === 'appointments' && (
              <>
                <button
                  onClick={() => { resetForm(); setShowApptModal(true) }}
                  style={{ display:'flex', alignItems:'center', gap:6, background:'#0c1220', color:'#fff', border:'none', padding:'9px 16px', borderRadius:8, fontSize:13, fontWeight:600, marginBottom:16, cursor:'pointer', fontFamily:"'DM Sans', sans-serif" }}
                >
                  <Plus size={14}/> Rezervo termin të ri
                </button>
                <div style={S.card}>
                  {appointments.length === 0
                    ? <div style={S.emptyMsg}>Nuk keni termine të rezervuara</div>
                    : appointments.map(a => (
                      <div key={a.id} style={S.tableRow}>
                        <div>
                          <div style={S.tableRowTitle}>{a.institution}</div>
                          <div style={S.tableRowSub}>{a.reason}</div>
                        </div>
                        <StatusBadge status={a.status}/>
                      </div>
                    ))}
                </div>
              </>
            )}

            {/* ── FINES ── */}
            {activeTab === 'fines' && (
              <div style={S.card}>
                {fines.length === 0
                  ? <div style={S.emptyMsg}>Nuk keni gjoba të regjistruara</div>
                  : fines.map(f => (
                    <div key={f.id} style={S.tableRow}>
                      <div>
                        <div style={S.tableRowTitle}>{f.type}</div>
                        <div style={S.tableRowSub}>{f.amount} MKD</div>
                      </div>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <StatusBadge status={f.status}/>
                        {f.status === 'unpaid' && (
                          <button
                            onClick={() => setShowPayModal(f.id)}
                            style={{ background:'#fff', border:'1px solid #e5e7eb', color:'#374151', borderRadius:6, padding:'5px 11px', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:"'DM Sans', sans-serif" }}
                          >
                            Paguaj
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            )}

            {/* ── PAYMENTS ── */}
            {activeTab === 'payments' && (
              <div style={S.card}>
                {fines.filter(f=>f.status==='paid').length === 0
                  ? <div style={S.emptyMsg}>Nuk keni pagesa të regjistruara</div>
                  : fines.filter(f=>f.status==='paid').map(f => (
                    <div key={f.id} style={S.tableRow}>
                      <div>
                        <div style={S.tableRowTitle}>{f.type}</div>
                        <div style={S.tableRowSub}>{f.amount} MKD</div>
                      </div>
                      <StatusBadge status="paid"/>
                    </div>
                  ))}
              </div>
            )}

            {/* ── PROFILE ── */}
            {activeTab === 'profile' && (
              <div style={{ maxWidth:380 }}>
                <div style={{ ...S.card, padding:24, display:'flex', flexDirection:'column', alignItems:'center', marginBottom:16 }}>
                  <div style={{ width:56, height:56, borderRadius:'50%', background:'#0c1220', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, fontWeight:700, color:'#fff', marginBottom:12 }}>
                    {user?.first_name?.[0]}{user?.last_name?.[0]}
                  </div>
                  <h2 style={{ fontSize:'1.05rem', fontWeight:700, color:'#0c1220', letterSpacing:'-0.02em' }}>
                    {user?.first_name} {user?.last_name}
                  </h2>
                </div>
                <div style={S.card}>
                  {[['Email', user?.email], ['EMBG', user?.personal_id], ['Roli', user?.role], ['Statusi', user?.verification_status]].map(([k, v]) => (
                    <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'12px 18px', borderBottom:'1px solid #f9fafb', alignItems:'center' }}>
                      <span style={{ fontSize:11, fontWeight:600, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'.06em' }}>{k}</span>
                      <span style={{ fontSize:13, color:'#111827', fontWeight:500 }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>

        {/* ── APPOINTMENT MODAL (4 hapa) ── */}
        {showApptModal && (
          <div style={S.overlay} onClick={() => setShowApptModal(false)}>
            <div style={S.modal} onClick={e => e.stopPropagation()}>
              <div style={S.modalHeader}>
                <div>
                  <div style={S.modalTitle}>Rezervo termin</div>
                  <div style={{ fontSize:11, color:'#8a929e', marginTop:2 }}>Hapi {step} nga 4</div>
                </div>
                <button style={S.modalClose} onClick={() => setShowApptModal(false)}><X size={15}/></button>
              </div>

              <div style={S.modalBody}>
                {/* Step indicator */}
                <div style={S.wzSteps}>
                  {[1,2,3,4].map((n,i) => (
                    <React.Fragment key={n}>
                      <div style={S.wzDot(step > n ? 'done' : step === n ? 'active' : 'pending')}>
                        {step > n ? <Check size={10}/> : n}
                      </div>
                      {i < 3 && <div style={S.wzLine(step > n)}/>}
                    </React.Fragment>
                  ))}
                </div>

                {/* Step 1 */}
                {step === 1 && (
                  <div style={S.instGrid}>
                    {[
                      { id:'MVR', emoji:'🏛', name:'MVR', sub:'Min. e Brendshme' },
                      { id:'Komuna', emoji:'🏢', name:'Komuna', sub:'Shërbime Komunale' },
                    ].map(inst => {
                      const sel = apptInstitution === inst.id
                      return (
                        <div key={inst.id} style={S.instCard(sel)} onClick={() => { setApptInstitution(inst.id); setApptService('') }}>
                          <span style={S.instIcon}>{inst.emoji}</span>
                          <div style={S.instName(sel)}>{inst.name}</div>
                          <div style={S.instSub(sel)}>{inst.sub}</div>
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Step 2 */}
                {step === 2 && (
                  <div style={S.svcList}>
                    {SERVICES[apptInstitution].map(svc => {
                      const sel = apptService === svc
                      return (
                        <div key={svc} style={{ ...S.svcItem(sel), lastChild: { borderBottom:'none' } }} onClick={() => setApptService(svc)}>
                          <div style={S.svcRadio(sel)}>
                            {sel && <div style={{ width:6, height:6, borderRadius:'50%', background:'#0c1220' }}/>}
                          </div>
                          {svc}
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Step 3 */}
                {step === 3 && (
                  <div style={S.dateGrid}>
                    {workDays.map((d, i) => {
                      const sel = apptDate && d.toDateString() === apptDate.toDateString()
                      return (
                        <div key={i} style={S.dateCard(sel)} onClick={() => setApptDate(d)}>
                          <div style={S.dateDW(sel)}>{d.toLocaleDateString('sq-AL',{weekday:'short'})}</div>
                          <div style={S.dateNum(sel)}>{d.getDate()}</div>
                          <div style={S.dateMo(sel)}>{d.toLocaleDateString('sq-AL',{month:'short'})}</div>
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Step 4 */}
                {step === 4 && (
                  <>
                    <div style={S.summary}>
                      <div style={{ fontSize:10, fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'.07em', marginBottom:8 }}>Përmbledhje</div>
                      {[
                        ['Institucioni', apptInstitution],
                        ['Shërbimi', apptService],
                        ['Data', apptDate?.toLocaleDateString('sq-AL',{weekday:'long',day:'2-digit',month:'long'})],
                      ].map(([k,v]) => (
                        <div key={k} style={S.sumRow}>
                          <span style={S.sumKey}>{k}</span>
                          <span style={S.sumVal}>{v}</span>
                        </div>
                      ))}
                    </div>
                    <div style={S.timeGrid}>
                      {TIME_SLOTS.map(t => (
                        <button key={t} style={S.timeBtn(apptTime === t)} onClick={() => setApptTime(t)}>{t}</button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              <div style={S.modalFooter}>
                <button
                  style={{ flex:1, padding:10, background:'#fff', border:'1px solid #e5e7eb', color:'#6b7280', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:"'DM Sans', sans-serif" }}
                  onClick={() => step > 1 ? setStep(s=>s-1) : setShowApptModal(false)}
                >
                  {step > 1 ? '← Kthehu' : 'Anulo'}
                </button>
                {step < 4 ? (
                  <button
                    style={{ flex:2, padding:10, background: canNext() ? '#0c1220' : '#f5f6f8', border:'none', color: canNext() ? '#fff' : '#9ca3af', borderRadius:8, fontSize:13, fontWeight:600, cursor: canNext() ? 'pointer' : 'not-allowed', fontFamily:"'DM Sans', sans-serif" }}
                    onClick={() => canNext() && setStep(s=>s+1)}
                  >
                    Vazhdo →
                  </button>
                ) : (
                  <button
                    style={{ flex:2, padding:10, background: canNext() ? '#15803d' : '#f5f6f8', border:'none', color: canNext() ? '#fff' : '#9ca3af', borderRadius:8, fontSize:13, fontWeight:600, cursor: canNext() ? 'pointer' : 'not-allowed', fontFamily:"'DM Sans', sans-serif" }}
                    onClick={() => canNext() && bookAppointment()}
                  >
                    Konfirmo termin
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── PAY MODAL ── */}
        {showPayModal && (
          <div style={S.overlay} onClick={() => setShowPayModal(null)}>
            <div style={S.modal} onClick={e => e.stopPropagation()}>
              <div style={S.modalHeader}>
                <div style={S.modalTitle}>Paguaj gjobën</div>
                <button style={S.modalClose} onClick={() => setShowPayModal(null)}><X size={15}/></button>
              </div>
              <div style={S.modalBody}>
                <div style={{ background:'#f9fafb', border:'1px solid #f3f4f6', borderRadius:8, padding:14, textAlign:'center', marginBottom:16 }}>
                  <div style={{ fontSize:11, color:'#9ca3af', marginBottom:4 }}>Shuma totale</div>
                  <div style={{ fontSize:'1.5rem', fontWeight:800, color:'#0c1220', letterSpacing:'-0.03em' }}>
                    {fines.find(f=>f.id===showPayModal)?.amount} MKD
                  </div>
                </div>
                <label style={S.piLabel}>Numri i kartës</label>
                <input style={S.piInput} className="pay-input" value={payForm.card_number} placeholder="1234 5678 9012 3456" maxLength={19} onChange={e=>setPayForm({...payForm,card_number:e.target.value})}/>
                <label style={S.piLabel}>Emri në kartë</label>
                <input style={S.piInput} className="pay-input" value={payForm.card_holder} placeholder="EMRI MBIEMRI" onChange={e=>setPayForm({...payForm,card_holder:e.target.value.toUpperCase()})}/>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                  <div>
                    <label style={S.piLabel}>Data skadimit</label>
                    <input style={{...S.piInput, marginBottom:0}} className="pay-input" value={payForm.expiry} placeholder="MM/YY" maxLength={5} onChange={e=>setPayForm({...payForm,expiry:e.target.value})}/>
                  </div>
                  <div>
                    <label style={S.piLabel}>CVV</label>
                    <input style={{...S.piInput, marginBottom:0}} className="pay-input" value={payForm.cvv} placeholder="123" maxLength={3} type="password" onChange={e=>setPayForm({...payForm,cvv:e.target.value})}/>
                  </div>
                </div>
              </div>
              <div style={S.modalFooter}>
                <button style={{ flex:1, padding:10, background:'#fff', border:'1px solid #e5e7eb', color:'#6b7280', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:"'DM Sans', sans-serif" }} onClick={() => setShowPayModal(null)}>Anulo</button>
                <button style={{ flex:2, padding:10, background:'#15803d', border:'none', color:'#fff', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:"'DM Sans', sans-serif" }} onClick={payFine}>Paguaj tani</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default Dashboard