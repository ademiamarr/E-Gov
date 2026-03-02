import React, { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useSocket } from '../../context/SocketContext'
import API from '../../api/axios'
import {
  LayoutDashboard, Calendar, AlertTriangle,
  CreditCard, User, LogOut, Bell, X, CheckCircle,
  Clock, XCircle, Plus, ChevronRight, Building2
} from 'lucide-react'

// ── Shërbimet bazë ─────────────────────────────────────────────
const SERVICES = {
  MVR: [
    'Pasaportë',
    'Letërnjoftim (ID)',
    'Licencë drejtimi',
    'Regjistrim automjeti',
    'Leje qëndrimi',
  ],
  Komuna: [
    'Certifikatë lindjeje',
    'Certifikatë martese',
    'Regjistrim adrese',
    'Vërtetim vendbanimi',
    'Leje ndërtimi',
  ],
}

// 10 ditët e ardhshme të punës (pa fundjavë)
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

const TIME_SLOTS = [
  '08:30','09:00','09:30','10:00','10:30','11:00',
  '12:00','13:00','13:30','14:00','14:30','15:00',
]

const Dashboard = () => {
  const { user, logout }        = useAuth()
  const { liveNotif }           = useSocket()
  const [activeTab, setActiveTab]       = useState('overview')
  const [appointments, setAppointments] = useState([])
  const [fines, setFines]               = useState([])
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading]           = useState(true)
  const [showApptModal, setShowApptModal] = useState(false)
  const [showPayModal, setShowPayModal]   = useState(null)
  const [toast, setToast]               = useState(null)

  // Appointment wizard
  const [step, setStep]                   = useState(1)
  const [apptInstitution, setApptInstitution] = useState('')
  const [apptService, setApptService]     = useState('')
  const [apptDate, setApptDate]           = useState(null)
  const [apptTime, setApptTime]           = useState('')

  // Pay form
  const [payForm, setPayForm] = useState({ card_number:'', card_holder:'', expiry:'', cvv:'' })

  const workDays = getWorkDays()

  // ── Fetch ────────────────────────────────────────────────────
  useEffect(() => { fetchAll() }, [])
  useEffect(() => { if (liveNotif) showToast(liveNotif.message, liveNotif.type) }, [liveNotif])

  const fetchAll = async () => {
    try {
      const [a, f] = await Promise.all([
        API.get('/appointments/my'),
        API.get('/fines/my'),
      ])
      setAppointments(a.data.data || [])
      setFines(f.data.data || [])
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // ── Appointment actions ───────────────────────────────────────
  const resetForm = () => {
    setStep(1); setApptInstitution(''); setApptService(''); setApptDate(null); setApptTime('')
  }

  const openModal = () => { resetForm(); setShowApptModal(true) }

  const bookAppointment = async () => {
    try {
      const dt = new Date(apptDate)
      const [h, m] = apptTime.split(':')
      dt.setHours(+h, +m, 0, 0)
      await API.post('/appointments', {
        institution: apptInstitution,
        reason: apptService,
        appointment_date: dt.toISOString(),
      })
      setShowApptModal(false)
      resetForm()
      fetchAll()
      showToast('Termini u rezervua me sukses!')
    } catch (e) { showToast(e.response?.data?.message || 'Gabim!', 'error') }
  }

  // ── Pay ───────────────────────────────────────────────────────
  const payFine = async () => {
    try {
      await API.post('/payments/pay', { fine_id: showPayModal, ...payForm })
      setShowPayModal(null)
      setPayForm({ card_number:'', card_holder:'', expiry:'', cvv:'' })
      fetchAll()
      showToast('Pagesa u krye me sukses!')
    } catch (e) { showToast(e.response?.data?.message || 'Pagesa dështoi!', 'error') }
  }

  // ── Helpers ───────────────────────────────────────────────────
  const canNext = () => {
    if (step === 1) return !!apptInstitution
    if (step === 2) return !!apptService
    if (step === 3) return !!apptDate
    if (step === 4) return !!apptTime
  }

  const Badge = ({ status }) => {
    const map = {
      pending:  ['Në pritje','#fbbf24','rgba(245,158,11,0.15)'],
      approved: ['Aprovuar', '#34d399','rgba(16,185,129,0.15)'],
      rejected: ['Refuzuar', '#f87171','rgba(239,68,68,0.15)'],
      unpaid:   ['Pa paguar','#fbbf24','rgba(245,158,11,0.15)'],
      paid:     ['Paguar',   '#34d399','rgba(16,185,129,0.15)'],
    }
    const [label, color, bg] = map[status] || ['—','#94a3b8','rgba(148,163,184,0.1)']
    return (
      <span style={{ background:bg, color, border:`1px solid ${color}40`, padding:'3px 9px', borderRadius:'20px', fontSize:'11px', fontWeight:700, whiteSpace:'nowrap' }}>
        {label}
      </span>
    )
  }

  const unpaid  = fines.filter(f => f.status === 'unpaid')
  const active  = appointments.filter(a => a.status !== 'cancelled')

  if (loading) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#0a1628' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ width:32, height:32, border:'3px solid rgba(255,255,255,0.08)', borderTopColor:'#3b82f6', borderRadius:'50%', animation:'spin .7s linear infinite' }}/>
    </div>
  )

  return (
    <>
      <style>{`
        @keyframes spin    { to { transform:rotate(360deg) } }
        @keyframes fadeIn  { from { opacity:0 } to { opacity:1 } }
        @keyframes slideUp { from { opacity:0; transform:translateY(18px) scale(.97) } to { opacity:1; transform:translateY(0) scale(1) } }

        /* ── WIZARD ───────────────────────────── */
        .wz-steps { display:flex; align-items:center; margin-bottom:22px; }
        .wz-dot {
          width:26px; height:26px; border-radius:50%; border:2px solid rgba(255,255,255,0.12);
          display:flex; align-items:center; justify-content:center;
          font-size:11px; font-weight:800; color:rgba(255,255,255,0.3);
          transition:all .2s; flex-shrink:0;
        }
        .wz-dot.done   { background:rgba(16,185,129,.2); border-color:#10b981; color:#34d399; }
        .wz-dot.active { background:linear-gradient(135deg,#1d4ed8,#3b82f6); border-color:#3b82f6; color:#fff; box-shadow:0 0 0 3px rgba(59,130,246,.2); }
        .wz-line { flex:1; height:2px; background:rgba(255,255,255,.07); margin:0 6px; transition:background .2s; }
        .wz-line.done { background:#10b981; }

        /* Institution cards */
        .inst-grid { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
        .inst-card {
          border:2px solid rgba(255,255,255,.08); border-radius:14px;
          padding:20px 12px; text-align:center; cursor:pointer;
          background:rgba(255,255,255,.03); transition:all .18s;
        }
        .inst-card:hover { border-color:rgba(59,130,246,.4); background:rgba(59,130,246,.07); }
        .inst-card.sel   { border-color:#3b82f6; background:rgba(59,130,246,.14); box-shadow:0 0 0 3px rgba(59,130,246,.15); }
        .inst-emoji { font-size:30px; display:block; margin-bottom:8px; }
        .inst-name  { font-size:14px; font-weight:800; color:#f0f4ff; }
        .inst-sub   { font-size:11px; color:rgba(255,255,255,.35); margin-top:3px; }

        /* Service list */
        .svc-list { border:1px solid rgba(255,255,255,.08); border-radius:12px; overflow:hidden; }
        .svc-item {
          display:flex; align-items:center; gap:10px;
          padding:12px 16px; font-size:13px; font-weight:500;
          color:rgba(255,255,255,.65); cursor:pointer; transition:all .14s;
          border-bottom:1px solid rgba(255,255,255,.05);
        }
        .svc-item:last-child { border-bottom:none; }
        .svc-item:hover { background:rgba(255,255,255,.04); color:#f0f4ff; }
        .svc-item.sel   { background:rgba(59,130,246,.13); color:#93c5fd; font-weight:700; }
        .svc-radio {
          width:15px; height:15px; border-radius:50%;
          border:2px solid rgba(255,255,255,.2); flex-shrink:0;
          display:flex; align-items:center; justify-content:center; transition:all .14s;
        }
        .svc-item.sel .svc-radio { border-color:#3b82f6; background:#3b82f6; }
        .svc-dot { width:6px; height:6px; border-radius:50%; background:#fff; }

        /* Date grid */
        .date-grid { display:grid; grid-template-columns:repeat(5,1fr); gap:8px; }
        .date-card {
          border:1px solid rgba(255,255,255,.08); border-radius:10px;
          padding:10px 6px; text-align:center; cursor:pointer;
          background:rgba(255,255,255,.03); transition:all .14s;
        }
        .date-card:hover { border-color:rgba(59,130,246,.4); background:rgba(59,130,246,.07); }
        .date-card.sel   { border-color:#3b82f6; background:rgba(59,130,246,.15); box-shadow:0 0 0 2px rgba(59,130,246,.2); }
        .date-wd  { font-size:9px; font-weight:700; color:rgba(255,255,255,.3); text-transform:uppercase; letter-spacing:.05em; margin-bottom:4px; }
        .date-num { font-size:17px; font-weight:800; color:#f0f4ff; line-height:1; }
        .date-mo  { font-size:10px; color:rgba(255,255,255,.35); margin-top:3px; }
        .date-card.sel .date-wd  { color:#60a5fa; }
        .date-card.sel .date-num { color:#93c5fd; }

        /* Time grid */
        .time-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:8px; margin-top:16px; }
        .time-btn {
          border:1px solid rgba(255,255,255,.08); border-radius:9px;
          padding:9px 4px; text-align:center; cursor:pointer;
          background:rgba(255,255,255,.03); font-size:13px; font-weight:700;
          color:rgba(255,255,255,.55); font-family:inherit; transition:all .14s;
        }
        .time-btn:hover { border-color:rgba(59,130,246,.4); background:rgba(59,130,246,.07); color:#f0f4ff; }
        .time-btn.sel   { border-color:#3b82f6; background:rgba(59,130,246,.2); color:#93c5fd; }

        /* Summary strip */
        .summary {
          background:rgba(59,130,246,.08); border:1px solid rgba(59,130,246,.18);
          border-radius:11px; padding:12px 16px; margin-bottom:14px;
          display:flex; flex-direction:column; gap:6px;
        }
        .sum-row { display:flex; justify-content:space-between; font-size:12px; }
        .sum-key { color:rgba(255,255,255,.4); }
        .sum-val { color:#f0f4ff; font-weight:600; text-align:right; }

        /* Pay inputs */
        .pi { background:rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.1); color:#f0f4ff; border-radius:10px; padding:10px 14px; font-size:13px; outline:none; font-family:inherit; width:100%; transition:all .2s; margin-bottom:12px; }
        .pi:focus { border-color:rgba(59,130,246,.5); }
        .pi-label { font-size:10px; font-weight:700; color:rgba(255,255,255,.3); text-transform:uppercase; letter-spacing:.07em; display:block; margin-bottom:5px; }
      `}</style>

      <div style={{ display:'flex', minHeight:'100vh', background:'#0a1628' }}>

        {/* ── TOAST ── */}
        {toast && (
          <div style={{
            position:'fixed', top:20, right:20, zIndex:9999,
            display:'flex', alignItems:'center', gap:8,
            padding:'11px 16px', borderRadius:10, fontSize:13, fontWeight:600,
            ...(toast.type==='error'
              ? { background:'rgba(239,68,68,.15)', border:'1px solid rgba(239,68,68,.3)', color:'#f87171' }
              : { background:'rgba(16,185,129,.15)', border:'1px solid rgba(16,185,129,.3)', color:'#34d399' })
          }}>
            {toast.type==='error' ? <XCircle size={15}/> : <CheckCircle size={15}/>}
            {toast.msg}
          </div>
        )}

        {/* ── SIDEBAR ── */}
        <aside style={{ width:230, flexShrink:0, background:'rgba(10,22,40,.97)', borderRight:'1px solid rgba(255,255,255,.06)', display:'flex', flexDirection:'column', padding:'24px 14px', position:'sticky', top:0, height:'100vh' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, paddingBottom:22, borderBottom:'1px solid rgba(255,255,255,.06)', marginBottom:18 }}>
            <div style={{ width:34, height:34, borderRadius:9, background:'linear-gradient(135deg,#1d4ed8,#3b82f6)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Building2 size={17} color="#fff"/>
            </div>
            <div>
              <div style={{ fontSize:13, fontWeight:700, color:'#f0f4ff' }}>eGov Portal</div>
              <div style={{ fontSize:10, color:'rgba(255,255,255,.3)', textTransform:'uppercase', letterSpacing:'.06em' }}>Republika e MV</div>
            </div>
          </div>

          <nav style={{ flex:1, display:'flex', flexDirection:'column', gap:3 }}>
            {[
              { id:'overview',     icon:LayoutDashboard, label:'Pasqyrë' },
              { id:'appointments', icon:Calendar,        label:'Terminë' },
              { id:'fines',        icon:AlertTriangle,   label:'Gjoba' },
              { id:'payments',     icon:CreditCard,      label:'Pagesa' },
              { id:'profile',      icon:User,            label:'Profili' },
            ].map(({ id, icon:Icon, label }) => (
              <button key={id}
                style={{
                  display:'flex', alignItems:'center', gap:10, padding:'9px 11px',
                  borderRadius:9, border:'none', fontFamily:'inherit',
                  fontSize:13, fontWeight:500, cursor:'pointer', textAlign:'left',
                  transition:'all .15s',
                  background: activeTab===id ? 'linear-gradient(135deg,rgba(29,78,216,.5),rgba(59,130,246,.3))' : 'transparent',
                  color: activeTab===id ? '#93c5fd' : 'rgba(255,255,255,.4)',
                  boxShadow: activeTab===id ? '0 0 0 1px rgba(59,130,246,.2)' : 'none',
                }}
                onClick={() => setActiveTab(id)}>
                <Icon size={17}/>
                <span>{label}</span>
                {id==='fines' && unpaid.length > 0 &&
                  <span style={{ marginLeft:'auto', background:'#ef4444', color:'#fff', fontSize:10, fontWeight:700, padding:'2px 6px', borderRadius:10 }}>{unpaid.length}</span>}
              </button>
            ))}
          </nav>

          <button onClick={logout} style={{ display:'flex', alignItems:'center', gap:8, padding:'9px 11px', borderRadius:9, border:'1px solid rgba(255,255,255,.08)', background:'transparent', color:'rgba(255,255,255,.3)', fontSize:13, cursor:'pointer', fontFamily:'inherit', marginTop:14 }}>
            <LogOut size={16}/> Dil
          </button>
        </aside>

        {/* ── MAIN ── */}
        <main style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
          {/* Topbar */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'26px 30px 0' }}>
            <div>
              <h2 style={{ fontSize:'1.35rem', fontWeight:800, color:'#f0f4ff', letterSpacing:'-.02em', margin:0 }}>
                { activeTab==='overview'     && 'Pasqyrë' }
                { activeTab==='appointments' && 'Terminët e mia' }
                { activeTab==='fines'        && 'Gjobat e mia' }
                { activeTab==='payments'     && 'Pagesat e mia' }
                { activeTab==='profile'      && 'Profili im' }
              </h2>
              <p style={{ fontSize:12, color:'rgba(255,255,255,.3)', margin:'3px 0 0' }}>Mirë se erdhët, {user?.first_name}!</p>
            </div>
            <div style={{ width:38, height:38, borderRadius:'50%', background:'linear-gradient(135deg,#1d4ed8,#3b82f6)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700, color:'#fff' }}>
              {user?.first_name?.[0]}{user?.last_name?.[0]}
            </div>
          </div>

          <div style={{ flex:1, padding:'22px 30px 30px', overflowY:'auto' }}>

            {/* OVERVIEW */}
            {activeTab==='overview' && (
              <>
                {/* Stats */}
                <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14, marginBottom:20 }}>
                  {[
                    { label:'Terminë aktive',  val:active.length,  icon:Calendar,      color:'#3b82f6' },
                    { label:'Gjoba pa paguar', val:unpaid.length,  icon:AlertTriangle, color:'#f59e0b' },
                    { label:'Pagesa totale',   val:fines.filter(f=>f.status==='paid').length, icon:CreditCard, color:'#10b981' },
                  ].map(({ label, val, icon:Icon, color }) => (
                    <div key={label} style={{ background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.08)', borderRadius:14, padding:18, display:'flex', alignItems:'center', gap:14 }}>
                      <div style={{ width:42, height:42, borderRadius:11, background:`${color}20`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                        <Icon size={19} color={color}/>
                      </div>
                      <div>
                        <div style={{ fontSize:'1.4rem', fontWeight:800, color:'#f0f4ff', lineHeight:1 }}>{val}</div>
                        <div style={{ fontSize:11, color:'rgba(255,255,255,.4)', marginTop:4 }}>{label}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Recent */}
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                  {[
                    { title:'Terminët e fundit', data:appointments.slice(0,3), tab:'appointments', emptyMsg:'Nuk keni terminë', getTitle:a=>a.institution, getSub:a=>a.reason, getStatus:a=>a.status },
                    { title:'Gjobat e fundit',   data:fines.slice(0,3),        tab:'fines',        emptyMsg:'Nuk keni gjoba',   getTitle:f=>f.type,        getSub:f=>`${f.amount} MKD`, getStatus:f=>f.status },
                  ].map(({ title, data, tab, emptyMsg, getTitle, getSub, getStatus }) => (
                    <div key={title} style={{ background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.08)', borderRadius:14, padding:18 }}>
                      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14, fontSize:13, fontWeight:700, color:'rgba(255,255,255,.7)' }}>
                        {title}
                        <button onClick={() => setActiveTab(tab)} style={{ background:'none', border:'none', color:'#60a5fa', fontSize:11, fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', gap:3, fontFamily:'inherit' }}>
                          Shiko të gjitha <ChevronRight size={13}/>
                        </button>
                      </div>
                      {data.length === 0
                        ? <p style={{ textAlign:'center', color:'rgba(255,255,255,.25)', fontSize:13, padding:16 }}>{emptyMsg}</p>
                        : data.map(item => (
                          <div key={item.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'9px 0', borderBottom:'1px solid rgba(255,255,255,.04)' }}>
                            <div>
                              <div style={{ fontSize:13, fontWeight:600, color:'#f0f4ff' }}>{getTitle(item)}</div>
                              <div style={{ fontSize:11, color:'rgba(255,255,255,.4)', marginTop:2 }}>{getSub(item)}</div>
                            </div>
                            <Badge status={getStatus(item)}/>
                          </div>
                        ))}
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* APPOINTMENTS */}
            {activeTab==='appointments' && (
              <>
                <button onClick={openModal} style={{ display:'flex', alignItems:'center', gap:6, background:'linear-gradient(135deg,#1d4ed8,#3b82f6)', color:'#fff', border:'none', padding:'10px 18px', borderRadius:10, fontSize:13, fontWeight:700, marginBottom:16, cursor:'pointer', fontFamily:'inherit', boxShadow:'0 4px 14px rgba(59,130,246,.3)' }}>
                  <Plus size={15}/> Rezervo termin të ri
                </button>
                <div style={{ background:'rgba(255,255,255,.03)', border:'1px solid rgba(255,255,255,.07)', borderRadius:14, overflow:'hidden' }}>
                  {appointments.length === 0
                    ? <p style={{ textAlign:'center', color:'rgba(255,255,255,.3)', padding:32, fontSize:13 }}>Nuk keni terminë</p>
                    : appointments.map(a => (
                      <div key={a.id} style={{ display:'flex', alignItems:'center', gap:14, padding:'13px 18px', borderBottom:'1px solid rgba(255,255,255,.04)' }}>
                        <div style={{ width:40, height:40, borderRadius:10, background:'#3b82f620', display:'flex', alignItems:'center', justifyContent:'center' }}>
                          <Calendar size={16} color="#3b82f6"/>
                        </div>
                        <div style={{ flex:1 }}>
                          <div style={{ fontSize:13, fontWeight:600, color:'#f0f4ff' }}>{a.institution}</div>
                          <div style={{ fontSize:11, color:'rgba(255,255,255,.45)', marginTop:2 }}>{a.reason}</div>
                        </div>
                        <Badge status={a.status}/>
                      </div>
                    ))}
                </div>
              </>
            )}

            {/* FINES */}
            {activeTab==='fines' && (
              <div style={{ background:'rgba(255,255,255,.03)', border:'1px solid rgba(255,255,255,.07)', borderRadius:14, overflow:'hidden' }}>
                {fines.length === 0
                  ? <p style={{ textAlign:'center', color:'rgba(255,255,255,.3)', padding:32, fontSize:13 }}>Nuk keni gjoba</p>
                  : fines.map(f => (
                    <div key={f.id} style={{ display:'flex', alignItems:'center', gap:14, padding:'13px 18px', borderBottom:'1px solid rgba(255,255,255,.04)' }}>
                      <div style={{ width:40, height:40, borderRadius:10, background:'#f59e0b20', display:'flex', alignItems:'center', justifyContent:'center' }}>
                        <AlertTriangle size={16} color="#f59e0b"/>
                      </div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:13, fontWeight:600, color:'#f0f4ff' }}>{f.type}</div>
                        <div style={{ fontSize:11, color:'rgba(255,255,255,.45)', marginTop:2 }}>{f.amount} MKD</div>
                      </div>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <Badge status={f.status}/>
                        {f.status==='unpaid' && (
                          <button onClick={() => setShowPayModal(f.id)} style={{ background:'rgba(59,130,246,.15)', border:'1px solid rgba(59,130,246,.3)', color:'#60a5fa', borderRadius:7, padding:'5px 10px', fontSize:11, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>
                            Paguaj
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            )}

            {/* PAYMENTS */}
            {activeTab==='payments' && (
              <div style={{ background:'rgba(255,255,255,.03)', border:'1px solid rgba(255,255,255,.07)', borderRadius:14, overflow:'hidden' }}>
                {fines.filter(f=>f.status==='paid').length === 0
                  ? <p style={{ textAlign:'center', color:'rgba(255,255,255,.3)', padding:32, fontSize:13 }}>Nuk keni pagesa</p>
                  : fines.filter(f=>f.status==='paid').map(f => (
                    <div key={f.id} style={{ display:'flex', alignItems:'center', gap:14, padding:'13px 18px', borderBottom:'1px solid rgba(255,255,255,.04)' }}>
                      <div style={{ width:40, height:40, borderRadius:10, background:'#10b98120', display:'flex', alignItems:'center', justifyContent:'center' }}>
                        <CheckCircle size={16} color="#10b981"/>
                      </div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:13, fontWeight:600, color:'#f0f4ff' }}>{f.type}</div>
                        <div style={{ fontSize:11, color:'rgba(255,255,255,.45)', marginTop:2 }}>{f.amount} MKD</div>
                      </div>
                      <Badge status="paid"/>
                    </div>
                  ))}
              </div>
            )}

            {/* PROFILE */}
            {activeTab==='profile' && (
              <div style={{ maxWidth:400, background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.08)', borderRadius:18, padding:28, display:'flex', flexDirection:'column', alignItems:'center' }}>
                <div style={{ width:64, height:64, borderRadius:'50%', background:'linear-gradient(135deg,#1d4ed8,#3b82f6)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, fontWeight:800, color:'#fff', marginBottom:12 }}>
                  {user?.first_name?.[0]}{user?.last_name?.[0]}
                </div>
                <h2 style={{ fontSize:'1.1rem', fontWeight:800, color:'#f0f4ff', margin:'0 0 16px', letterSpacing:'-.02em' }}>
                  {user?.first_name} {user?.last_name}
                </h2>
                <div style={{ width:'100%' }}>
                  {[['Email',user?.email],['EMBG',user?.personal_id],['Roli',user?.role],['Statusi',user?.verification_status]].map(([k,v]) => (
                    <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'11px 0', borderBottom:'1px solid rgba(255,255,255,.06)' }}>
                      <span style={{ fontSize:11, color:'rgba(255,255,255,.35)', fontWeight:700, textTransform:'uppercase', letterSpacing:'.06em' }}>{k}</span>
                      <span style={{ fontSize:13, color:'#f0f4ff', fontWeight:500 }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>

        {/* ══════════════════════════════════════
            MODAL — TERMIN (4 hapa)
        ══════════════════════════════════════ */}
        {showApptModal && (
          <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.72)', backdropFilter:'blur(5px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:24, animation:'fadeIn .18s ease' }}
               onClick={() => setShowApptModal(false)}>
            <div style={{ background:'#0f1f50', border:'1px solid rgba(255,255,255,.1)', borderRadius:20, width:'100%', maxWidth:440, boxShadow:'0 24px 64px rgba(0,0,0,.6)', animation:'slideUp .22s cubic-bezier(.22,.68,0,1.1)' }}
                 onClick={e => e.stopPropagation()}>

              {/* Header */}
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'18px 22px', borderBottom:'1px solid rgba(255,255,255,.07)' }}>
                <div>
                  <h3 style={{ fontSize:15, fontWeight:800, color:'#f0f4ff', margin:0 }}>📅 Rezervo Termin</h3>
                  <p style={{ fontSize:11, color:'rgba(255,255,255,.35)', margin:'3px 0 0' }}>
                    Hapi {step} / 4
                  </p>
                </div>
                <button onClick={() => setShowApptModal(false)} style={{ background:'rgba(255,255,255,.08)', border:'none', borderRadius:8, color:'rgba(255,255,255,.5)', padding:6, cursor:'pointer', display:'flex', alignItems:'center' }}>
                  <X size={17}/>
                </button>
              </div>

              <div style={{ padding:'18px 22px' }}>

                {/* Step dots */}
                <div className="wz-steps">
                  {[1,2,3,4].map((n,i) => (
                    <React.Fragment key={n}>
                      <div className={`wz-dot ${step>n?'done':step===n?'active':''}`}>
                        {step > n ? '✓' : n}
                      </div>
                      {i < 3 && <div className={`wz-line ${step>n?'done':''}`}/>}
                    </React.Fragment>
                  ))}
                </div>

                {/* HAPI 1 — Institucioni */}
                {step === 1 && (
                  <div className="inst-grid">
                    {[
                      { id:'MVR',    emoji:'🏛', name:'MVR', sub:'Ministria e Brendshme' },
                      { id:'Komuna', emoji:'🏢', name:'Komuna', sub:'Shërbime Komunale' },
                    ].map(inst => (
                      <div key={inst.id}
                        className={`inst-card ${apptInstitution===inst.id?'sel':''}`}
                        onClick={() => { setApptInstitution(inst.id); setApptService('') }}>
                        <span className="inst-emoji">{inst.emoji}</span>
                        <div className="inst-name">{inst.name}</div>
                        <div className="inst-sub">{inst.sub}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* HAPI 2 — Shërbimi */}
                {step === 2 && (
                  <div className="svc-list">
                    {SERVICES[apptInstitution].map(svc => (
                      <div key={svc}
                        className={`svc-item ${apptService===svc?'sel':''}`}
                        onClick={() => setApptService(svc)}>
                        <div className="svc-radio">
                          {apptService===svc && <div className="svc-dot"/>}
                        </div>
                        {svc}
                      </div>
                    ))}
                  </div>
                )}

                {/* HAPI 3 — Data */}
                {step === 3 && (
                  <div className="date-grid">
                    {workDays.map((d, i) => {
                      const sel = apptDate && d.toDateString() === apptDate.toDateString()
                      return (
                        <div key={i} className={`date-card ${sel?'sel':''}`} onClick={() => setApptDate(d)}>
                          <div className="date-wd">{d.toLocaleDateString('sq-AL',{weekday:'short'})}</div>
                          <div className="date-num">{d.getDate()}</div>
                          <div className="date-mo">{d.toLocaleDateString('sq-AL',{month:'short'})}</div>
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* HAPI 4 — Ora */}
                {step === 4 && (
                  <>
                    <div className="summary">
                      <div style={{ fontSize:10, fontWeight:800, color:'rgba(255,255,255,.3)', textTransform:'uppercase', letterSpacing:'.07em', marginBottom:8 }}>Përmbledhje</div>
                      {[
                        ['Institucioni', apptInstitution],
                        ['Shërbimi',     apptService],
                        ['Data',         apptDate?.toLocaleDateString('sq-AL',{weekday:'long',day:'2-digit',month:'long'})],
                      ].map(([k,v]) => (
                        <div key={k} className="sum-row">
                          <span className="sum-key">{k}</span>
                          <span className="sum-val">{v}</span>
                        </div>
                      ))}
                    </div>
                    <div className="time-grid">
                      {TIME_SLOTS.map(t => (
                        <button key={t} className={`time-btn ${apptTime===t?'sel':''}`} onClick={() => setApptTime(t)}>
                          {t}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Footer */}
              <div style={{ display:'flex', gap:10, padding:'0 22px 18px' }}>
                <button
                  style={{ flex:1, background:'rgba(255,255,255,.06)', border:'1px solid rgba(255,255,255,.1)', color:'rgba(255,255,255,.6)', padding:'10px', borderRadius:10, fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}
                  onClick={() => step > 1 ? setStep(s=>s-1) : setShowApptModal(false)}>
                  {step > 1 ? '← Kthehu' : 'Anulo'}
                </button>

                {step < 4 ? (
                  <button
                    style={{ flex:2, background: canNext() ? 'linear-gradient(135deg,#1d4ed8,#3b82f6)' : 'rgba(255,255,255,.06)', border:'none', color: canNext() ? '#fff' : 'rgba(255,255,255,.3)', padding:'10px', borderRadius:10, fontSize:13, fontWeight:700, cursor: canNext() ? 'pointer' : 'not-allowed', fontFamily:'inherit', transition:'all .2s', boxShadow: canNext() ? '0 4px 14px rgba(59,130,246,.3)' : 'none' }}
                    onClick={() => canNext() && setStep(s=>s+1)}>
                    Vazhdo →
                  </button>
                ) : (
                  <button
                    style={{ flex:2, background: canNext() ? 'linear-gradient(135deg,#065f46,#10b981)' : 'rgba(255,255,255,.06)', border:'none', color: canNext() ? '#fff' : 'rgba(255,255,255,.3)', padding:'10px', borderRadius:10, fontSize:13, fontWeight:800, cursor: canNext() ? 'pointer' : 'not-allowed', fontFamily:'inherit', boxShadow: canNext() ? '0 4px 14px rgba(16,185,129,.3)' : 'none' }}
                    onClick={() => canNext() && bookAppointment()}>
                    ✓ Konfirmo Terminin
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── PAY MODAL ── */}
        {showPayModal && (
          <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.7)', backdropFilter:'blur(4px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:24 }}
               onClick={() => setShowPayModal(null)}>
            <div style={{ background:'#0f1f50', border:'1px solid rgba(255,255,255,.1)', borderRadius:20, width:'100%', maxWidth:400, boxShadow:'0 24px 64px rgba(0,0,0,.5)' }}
                 onClick={e => e.stopPropagation()}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'18px 22px' }}>
                <h3 style={{ fontSize:15, fontWeight:800, color:'#f0f4ff', margin:0 }}>Paguaj gjobën</h3>
                <button onClick={() => setShowPayModal(null)} style={{ background:'rgba(255,255,255,.08)', border:'none', borderRadius:8, color:'rgba(255,255,255,.5)', padding:6, cursor:'pointer', display:'flex' }}><X size={17}/></button>
              </div>
              <div style={{ padding:'0 22px 18px' }}>
                <div style={{ fontSize:22, fontWeight:800, color:'#f0f4ff', textAlign:'center', padding:'14px', background:'rgba(59,130,246,.1)', borderRadius:10, marginBottom:16 }}>
                  💰 {fines.find(f=>f.id===showPayModal)?.amount} MKD
                </div>
                <label className="pi-label">Numri i kartës</label>
                <input className="pi" value={payForm.card_number} placeholder="1234 5678 9012 3456" maxLength={19} onChange={e=>setPayForm({...payForm,card_number:e.target.value})}/>
                <label className="pi-label">Emri në kartë</label>
                <input className="pi" value={payForm.card_holder} placeholder="EMRI MBIEMRI" onChange={e=>setPayForm({...payForm,card_holder:e.target.value.toUpperCase()})}/>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                  <div>
                    <label className="pi-label">Data skadimit</label>
                    <input className="pi" value={payForm.expiry} placeholder="MM/YY" maxLength={5} onChange={e=>setPayForm({...payForm,expiry:e.target.value})}/>
                  </div>
                  <div>
                    <label className="pi-label">CVV</label>
                    <input className="pi" value={payForm.cvv} placeholder="123" maxLength={3} type="password" onChange={e=>setPayForm({...payForm,cvv:e.target.value})}/>
                  </div>
                </div>
                <p style={{ fontSize:11, color:'rgba(255,255,255,.3)', textAlign:'center', margin:'8px 0 14px' }}>🔒 Lidhje e sigurt SSL</p>
                <div style={{ display:'flex', gap:10 }}>
                  <button onClick={() => setShowPayModal(null)} style={{ flex:1, background:'rgba(255,255,255,.06)', border:'1px solid rgba(255,255,255,.1)', color:'rgba(255,255,255,.5)', padding:10, borderRadius:10, fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>Anulo</button>
                  <button onClick={payFine} style={{ flex:2, background:'linear-gradient(135deg,#1d4ed8,#3b82f6)', border:'none', color:'#fff', padding:10, borderRadius:10, fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit', boxShadow:'0 4px 14px rgba(59,130,246,.3)' }}>Paguaj tani ✓</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default Dashboard