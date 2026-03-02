import React, { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useSocket } from '../../context/SocketContext'
import { useUser } from '@clerk/clerk-react'   // ← FIX: useUser instead of useClerk
import API from '../../api/axios'
import LanguageSwitcher from '../../components/LanguageSwitcher'
import { useTranslation } from 'react-i18next'
import {
  LayoutDashboard, Calendar, AlertTriangle,
  CreditCard, User, LogOut, CheckCircle,
  XCircle, Plus, ChevronRight, Check, X,
  Clock, Mail, Hash, Shield, Eye, EyeOff,
  Lock, KeyRound, BadgeCheck, AlertCircle
} from 'lucide-react'

const SERVICES = {
  MVR:    ['Pasaportë','Letërnjoftim (ID)','Licencë drejtimi','Regjistrim automjeti','Leje qëndrimi'],
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
  const { t }                   = useTranslation()
  const { liveNotif }           = useSocket()

  // ── FIX: useUser() gives us a stable `user` object with updatePassword ──
  const { user: clerkUser, isLoaded: clerkLoaded } = useUser()

  const [activeTab, setActiveTab]         = useState('overview')
  const [appointments, setAppointments]   = useState([])
  const [fines, setFines]                 = useState([])
  const [loading, setLoading]             = useState(true)
  const [showApptModal, setShowApptModal] = useState(false)
  const [showPayModal, setShowPayModal]   = useState(null)
  const [toast, setToast]                 = useState(null)

  // Appointment wizard
  const [step, setStep]                       = useState(1)
  const [apptInstitution, setApptInstitution] = useState('')
  const [apptService, setApptService]         = useState('')
  const [apptDate, setApptDate]               = useState(null)
  const [apptTime, setApptTime]               = useState('')
  const [payForm, setPayForm] = useState({ card_number:'', card_holder:'', expiry:'', cvv:'' })

  // Password change state
  const [pwForm, setPwForm]       = useState({ current: '', next: '', confirm: '' })
  const [pwShow, setPwShow]       = useState({ current: false, next: false, confirm: false })
  const [pwLoading, setPwLoading] = useState(false)
  const [pwError, setPwError]     = useState('')
  const [pwSuccess, setPwSuccess] = useState(false)

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
      showToast(t('appt_success'))
    } catch (e) { showToast(e.response?.data?.message || t('appt_error'), 'error') }
  }

  const payFine = async () => {
    try {
      await API.post('/payments/pay', { fine_id: showPayModal, ...payForm })
      setShowPayModal(null)
      setPayForm({ card_number:'', card_holder:'', expiry:'', cvv:'' })
      fetchAll()
      showToast(t('pay_success'))
    } catch (e) { showToast(e.response?.data?.message || t('pay_failed'), 'error') }
  }

  // ── FIXED password change using useUser() ──────────────────────────────
  const changePassword = async () => {
    setPwError('')
    setPwSuccess(false)

    if (!pwForm.current || !pwForm.next || !pwForm.confirm) {
      return setPwError(t('fill_required'))
    }
    if (pwForm.next.length < 8) {
      return setPwError(t('password_too_short'))
    }
    if (pwForm.next !== pwForm.confirm) {
      return setPwError(t('password_mismatch'))
    }
    if (!clerkLoaded || !clerkUser) {
      return setPwError('Sesioni nuk është gati. Provo të kyçesh përsëri.')
    }

    setPwLoading(true)
    try {
      await clerkUser.updatePassword({
        currentPassword: pwForm.current,
        newPassword:     pwForm.next,
        signOutOfOtherSessions: false,
      })
      setPwSuccess(true)
      setPwForm({ current: '', next: '', confirm: '' })
      showToast(t('password_success'))
      setTimeout(() => setPwSuccess(false), 4000)
    } catch (err) {
      // Clerk returns errors array
      const msg =
        err?.errors?.[0]?.longMessage ||
        err?.errors?.[0]?.message     ||
        err?.message                  ||
        'Gabim gjatë ndryshimit të fjalëkalimit'
      setPwError(msg)
    } finally {
      setPwLoading(false)
    }
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
      pending:  { bg:'#fffbeb', border:'#fde68a', color:'#92400e', dot:'#f59e0b', label: t('pending')  },
      approved: { bg:'#f0fdf4', border:'#bbf7d0', color:'#15803d', dot:'#22c55e', label: t('approved') },
      rejected: { bg:'#fef2f2', border:'#fecaca', color:'#dc2626', dot:'#ef4444', label: t('rejected') },
      unpaid:   { bg:'#fffbeb', border:'#fde68a', color:'#92400e', dot:'#f59e0b', label: t('unpaid')   },
      paid:     { bg:'#f0fdf4', border:'#bbf7d0', color:'#15803d', dot:'#22c55e', label: t('paid')     },
    }
    const c = cfg[status] || { bg:'#f5f6f8', border:'#e5e7eb', color:'#6b7280', dot:'#9ca3af', label: status }
    return (
      <span style={{ display:'inline-flex', alignItems:'center', gap:5, background:c.bg, border:`1px solid ${c.border}`, color:c.color, borderRadius:20, padding:'3px 10px', fontSize:11, fontWeight:600, whiteSpace:'nowrap' }}>
        <span style={{ width:5, height:5, borderRadius:'50%', background:c.dot, flexShrink:0, display:'inline-block' }}/>
        {c.label}
      </span>
    )
  }

  if (loading) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#f5f6f8' }}>
      <div style={{ width:24, height:24, border:'2px solid #e5e7eb', borderTopColor:'#1e3a8a', borderRadius:'50%', animation:'spin .6s linear infinite' }}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  const S = {
    root: { display:'flex', minHeight:'100vh', background:'#f5f6f8', fontFamily:"'DM Sans', sans-serif" },
    sidebar: { width:220, flexShrink:0, background:'#fff', borderRight:'1px solid #eaecf0', display:'flex', flexDirection:'column', height:'100vh', position:'sticky', top:0 },
    sidebarHeader: { padding:'20px 16px 16px', borderBottom:'1px solid #eaecf0', display:'flex', alignItems:'center', gap:10 },
    logoBox: { width:30, height:30, background:'#1e3a8a', borderRadius:7, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 },
    brandName: { fontSize:13, fontWeight:700, color:'#1e3a8a', letterSpacing:'-0.01em' },
    brandSub: { fontSize:10, color:'#8a929e' },
    nav: { flex:1, padding:'10px 8px', display:'flex', flexDirection:'column', gap:2 },
    navBtn: (isAct) => ({ display:'flex', alignItems:'center', gap:8, padding:'8px 10px', borderRadius:7, border:'none', background: isAct ? '#eff6ff' : 'transparent', cursor:'pointer', fontFamily:"'DM Sans', sans-serif", transition:'background .1s', textAlign:'left', width:'100%', position:'relative' }),
    navIcon: (isAct) => ({ width:28, height:28, borderRadius:6, display:'flex', alignItems:'center', justifyContent:'center', background: isAct ? '#1e3a8a' : '#f5f6f8', color: isAct ? '#fff' : '#6b7280', flexShrink:0 }),
    navLabel: (isAct) => ({ fontSize:13, fontWeight:600, color: isAct ? '#1e3a8a' : '#374151', display:'block' }),
    navBadge: { position:'absolute', right:10, background:'#ef4444', color:'#fff', fontSize:10, fontWeight:700, padding:'1px 6px', borderRadius:10 },
    sidebarFooter: { padding:'12px 14px', borderTop:'1px solid #eaecf0', display:'flex', alignItems:'center', gap:10 },
    userAvatar: { width:32, height:32, borderRadius:'50%', background:'#1e3a8a', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, color:'#fff', flexShrink:0 },
    userName: { fontSize:13, fontWeight:600, color:'#1e3a8a', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', display:'block' },
    userRole: { fontSize:10, color:'#8a929e', display:'block' },
    logoutBtn: { background:'none', border:'none', color:'#9ca3af', cursor:'pointer', padding:4, borderRadius:6, display:'flex', alignItems:'center', transition:'color .1s' },
    main: { flex:1, display:'flex', flexDirection:'column', minWidth:0 },
    topbar: { background:'#fff', borderBottom:'1px solid #eaecf0', padding:'0 24px', height:52, display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 },
    topbarLeft: { display:'flex', alignItems:'center', gap:10 },
    topbarRight: { display:'flex', alignItems:'center', gap:10 },
    pageTitle: { fontSize:15, fontWeight:700, color:'#1e3a8a', letterSpacing:'-0.01em' },
    topbarAvatar: { width:32, height:32, borderRadius:'50%', background:'#1e3a8a', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, color:'#fff' },
    content: { flex:1, padding:'24px', overflowY:'auto' },
    statsGrid: { display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:20 },
    statCard: { background:'#fff', border:'1px solid #e5e7eb', borderRadius:10, padding:16, display:'flex', alignItems:'center', gap:12 },
    statIcon: (color) => ({ width:38, height:38, borderRadius:9, background:`${color}15`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }),
    statNum: { fontSize:'1.4rem', fontWeight:800, color:'#1e3a8a', lineHeight:1, letterSpacing:'-0.03em' },
    statLabel: { fontSize:11, color:'#8a929e', marginTop:3 },
    card: { background:'#fff', border:'1px solid #e5e7eb', borderRadius:10, overflow:'hidden' },
    cardHeader: { display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 18px', borderBottom:'1px solid #f3f4f6' },
    cardTitle: { fontSize:13, fontWeight:700, color:'#1e3a8a' },
    cardLink: { display:'flex', alignItems:'center', gap:3, background:'none', border:'none', color:'#1e3a8a', fontSize:11, fontWeight:600, cursor:'pointer', fontFamily:"'DM Sans', sans-serif" },
    tableRow: { display:'flex', alignItems:'center', justifyContent:'space-between', padding:'11px 18px', borderBottom:'1px solid #f9fafb' },
    tableRowTitle: { fontSize:13, fontWeight:600, color:'#111827' },
    tableRowSub: { fontSize:11, color:'#9ca3af', marginTop:1 },
    emptyMsg: { textAlign:'center', color:'#9ca3af', fontSize:13, padding:'28px 0' },
    overlay: { position:'fixed', inset:0, background:'rgba(30,58,138,0.45)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:24 },
    modal: { background:'#fff', border:'1px solid #e5e7eb', borderRadius:14, width:'100%', maxWidth:440, boxShadow:'0 20px 60px rgba(0,0,0,.12)', overflow:'hidden' },
    modalHeader: { display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 20px', borderBottom:'1px solid #f3f4f6' },
    modalTitle: { fontSize:15, fontWeight:700, color:'#1e3a8a' },
    modalClose: { background:'#f5f6f8', border:'none', borderRadius:6, color:'#6b7280', padding:6, cursor:'pointer', display:'flex' },
    modalBody: { padding:'18px 20px' },
    modalFooter: { display:'flex', gap:8, padding:'14px 20px', borderTop:'1px solid #f3f4f6' },
    wzSteps: { display:'flex', alignItems:'center', marginBottom:18, gap:0 },
    wzDot: (state) => ({ width:24, height:24, borderRadius:'50%', border:'1.5px solid', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:700, flexShrink:0, ...(state==='done'?{background:'#1e3a8a',borderColor:'#1e3a8a',color:'#fff'}:state==='active'?{background:'#fff',borderColor:'#1e3a8a',color:'#1e3a8a'}:{background:'#f5f6f8',borderColor:'#e5e7eb',color:'#9ca3af'}) }),
    wzLine: (done) => ({ flex:1, height:1.5, background: done ? '#1e3a8a' : '#e5e7eb', margin:'0 4px' }),
    instGrid: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 },
    instCard: (sel) => ({ border:`1.5px solid ${sel?'#1e3a8a':'#e5e7eb'}`, borderRadius:10, padding:'16px 12px', textAlign:'center', cursor:'pointer', background: sel?'#1e3a8a':'#fff', transition:'all .1s' }),
    instIcon: { fontSize:24, display:'block', marginBottom:8 },
    instName: (sel) => ({ fontSize:13, fontWeight:700, color: sel?'#fff':'#111827' }),
    instSub: (sel) => ({ fontSize:11, color: sel?'rgba(255,255,255,.5)':'#9ca3af', marginTop:2 }),
    svcList: { border:'1px solid #e5e7eb', borderRadius:9, overflow:'hidden' },
    svcItem: (sel) => ({ display:'flex', alignItems:'center', gap:10, padding:'11px 14px', fontSize:13, fontWeight:500, color: sel?'#1e3a8a':'#6b7280', background: sel?'#eff6ff':'#fff', cursor:'pointer', transition:'background .1s', borderBottom:'1px solid #f3f4f6' }),
    svcRadio: (sel) => ({ width:14, height:14, borderRadius:'50%', border:`1.5px solid ${sel?'#1e3a8a':'#d1d5db'}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }),
    dateGrid: { display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:6 },
    dateCard: (sel) => ({ border:`1.5px solid ${sel?'#1e3a8a':'#e5e7eb'}`, borderRadius:8, padding:'9px 4px', textAlign:'center', cursor:'pointer', background: sel?'#1e3a8a':'#fff', transition:'all .1s' }),
    dateDW: (sel) => ({ fontSize:9, fontWeight:700, color: sel?'rgba(255,255,255,.5)':'#9ca3af', textTransform:'uppercase', letterSpacing:'.05em', marginBottom:3 }),
    dateNum: (sel) => ({ fontSize:16, fontWeight:800, color: sel?'#fff':'#111827', lineHeight:1 }),
    dateMo: (sel) => ({ fontSize:9, color: sel?'rgba(255,255,255,.5)':'#9ca3af', marginTop:2 }),
    summary: { background:'#f9fafb', border:'1px solid #f3f4f6', borderRadius:8, padding:'12px 14px', marginBottom:14 },
    sumRow: { display:'flex', justifyContent:'space-between', fontSize:12, marginBottom:6 },
    sumKey: { color:'#9ca3af' },
    sumVal: { color:'#111827', fontWeight:600, textAlign:'right' },
    timeGrid: { display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:7 },
    timeBtn: (sel) => ({ border:`1.5px solid ${sel?'#1e3a8a':'#e5e7eb'}`, borderRadius:7, padding:'8px 4px', textAlign:'center', cursor:'pointer', background: sel?'#1e3a8a':'#fff', fontSize:13, fontWeight:600, color: sel?'#fff':'#374151', fontFamily:"'DM Sans', sans-serif", transition:'all .1s' }),
    piLabel: { fontSize:11, fontWeight:600, color:'#1e3a8a', textTransform:'uppercase', letterSpacing:'.04em', display:'block', marginBottom:5 },
    piInput: { width:'100%', background:'#f9fafb', border:'1.5px solid #e5e7eb', color:'#111827', borderRadius:8, padding:'10px 12px', fontSize:13, outline:'none', fontFamily:"'DM Sans', sans-serif", marginBottom:12, transition:'border .15s' },
  }

  const navItems = [
    { id:'overview',     icon:LayoutDashboard, label: t('nav_overview')      },
    { id:'appointments', icon:Calendar,        label: t('nav_appointments')  },
    { id:'fines',        icon:AlertTriangle,   label: t('nav_fines')         },
    { id:'payments',     icon:CreditCard,      label: t('nav_payments')      },
    { id:'profile',      icon:User,            label: t('nav_profile')       },
  ]

  const pageTitles = {
    overview:     t('page_overview'),
    appointments: t('page_appointments'),
    fines:        t('page_fines'),
    payments:     t('page_payments'),
    profile:      t('page_profile'),
  }

  const initials = `${user?.first_name?.[0] || ''}${user?.last_name?.[0] || ''}`

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes fadeIn  { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        * { margin:0; padding:0; box-sizing:border-box; }
        .dash-logout-btn:hover { color: #ef4444 !important; }
        .dash-card-link:hover  { opacity: 0.7; }

        /* Language Switcher overrides for light topbar */
        .dash-topbar .lang-switcher-btn {
          background: #f5f6f8 !important; border: 1px solid #e5e7eb !important;
          color: #374151 !important; font-size: 12px !important; padding: 6px 10px !important;
        }
        .dash-topbar .lang-switcher-btn:hover  { background: #eaecf0 !important; border-color: #d1d5db !important; }
        .dash-topbar .lang-switcher-btn.active { background: #eff6ff !important; border-color: #bfdbfe !important; color: #1e40af !important; }
        .dash-topbar .lang-dropdown            { background: #fff !important; border: 1px solid #e5e7eb !important; box-shadow: 0 8px 24px rgba(0,0,0,.10) !important; }
        .dash-topbar .lang-dropdown-item       { color: #374151 !important; }
        .dash-topbar .lang-dropdown-item:hover { background: #f5f6f8 !important; color: #111827 !important; }
        .dash-topbar .lang-dropdown-item.active{ background: #eff6ff !important; color: #1e40af !important; }
        .dash-topbar .lang-country   { color: #9ca3af !important; }
        .dash-topbar .lang-checkmark { color: #1e40af !important; }

        /* Profile */
        .profile-hero {
          background: linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 60%, #2563eb 100%);
          border-radius: 14px; padding: 28px 28px 0;
          position: relative; overflow: hidden; margin-bottom: 0;
        }
        .profile-hero::before {
          content:''; position:absolute; inset:0;
          background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
          pointer-events:none;
        }
        .profile-avatar-wrap  { display:flex; align-items:flex-end; gap:20px; position:relative; z-index:2; }
        .profile-avatar-circle {
          width:72px; height:72px; border-radius:50%;
          background:rgba(255,255,255,0.15); border:3px solid rgba(255,255,255,0.3);
          display:flex; align-items:center; justify-content:center;
          font-size:24px; font-weight:800; color:#fff; letter-spacing:-0.02em;
          flex-shrink:0; backdrop-filter:blur(4px);
        }
        .profile-hero-info    { padding-bottom:20px; }
        .profile-hero-name    { font-size:18px; font-weight:700; color:#fff; letter-spacing:-0.02em; margin-bottom:4px; }
        .profile-hero-sub     { font-size:12px; color:rgba(255,255,255,0.55); display:flex; align-items:center; gap:6px; }
        .profile-status-pill  { display:inline-flex; align-items:center; gap:5px; background:rgba(34,197,94,0.2); border:1px solid rgba(34,197,94,0.35); color:#4ade80; border-radius:20px; padding:3px 10px; font-size:11px; font-weight:600; }
        .profile-status-dot   { width:5px; height:5px; border-radius:50%; background:#4ade80; }
        .profile-info-grid    { display:grid; grid-template-columns:1fr 1fr; gap:10px; padding:20px 0 0; animation:fadeIn 0.3s ease; }
        .profile-info-card    { background:#fff; border:1px solid #e5e7eb; border-radius:10px; padding:14px 16px; display:flex; align-items:flex-start; gap:12px; }
        .profile-info-icon    { width:32px; height:32px; border-radius:8px; background:#eff6ff; display:flex; align-items:center; justify-content:center; flex-shrink:0; color:#1e3a8a; }
        .profile-info-label   { font-size:10px; font-weight:600; color:#9ca3af; text-transform:uppercase; letter-spacing:0.06em; display:block; margin-bottom:3px; }
        .profile-info-value   { font-size:13px; font-weight:600; color:#111827; display:block; }
        .profile-info-value.mono { font-family:'Courier New',monospace; letter-spacing:0.04em; color:#1e3a8a; }

        /* Password section */
        .pw-section { background:#fff; border:1px solid #e5e7eb; border-radius:12px; overflow:hidden; animation:fadeIn 0.3s ease; }
        .pw-section-header { padding:16px 20px; border-bottom:1px solid #f3f4f6; display:flex; align-items:center; gap:10px; }
        .pw-section-icon   { width:32px; height:32px; border-radius:8px; background:#fef3c7; display:flex; align-items:center; justify-content:center; color:#d97706; }
        .pw-section-title  { font-size:14px; font-weight:700; color:#1e3a8a; }
        .pw-section-sub    { font-size:11px; color:#9ca3af; margin-top:1px; }
        .pw-section-body   { padding:20px; display:flex; flex-direction:column; gap:14px; }
        .pw-group          { display:flex; flex-direction:column; gap:5px; }
        .pw-label          { font-size:11px; font-weight:600; color:#1e3a8a; text-transform:uppercase; letter-spacing:0.04em; }
        .pw-input-wrap     { position:relative; }
        .pw-input {
          width:100%; padding:10px 38px 10px 12px;
          font-size:14px; font-family:'DM Sans',sans-serif;
          color:#111827; background:#f9fafb;
          border:1.5px solid #e5e7eb; border-radius:8px; outline:none;
          transition:border-color 0.15s,background 0.15s;
        }
        .pw-input:focus       { border-color:#1e3a8a; background:#fff; }
        .pw-input::placeholder{ color:#d1d5db; }
        .pw-eye {
          position:absolute; right:10px; top:50%; transform:translateY(-50%);
          background:none; border:none; color:#9ca3af; cursor:pointer;
          display:flex; align-items:center; padding:2px;
        }
        .pw-eye:hover { color:#1e3a8a; }
        .pw-error   { display:flex; align-items:center; gap:8px; padding:10px 13px; background:#fef2f2; border:1px solid #fecaca; border-radius:8px; color:#dc2626; font-size:13px; }
        .pw-success { display:flex; align-items:center; gap:8px; padding:10px 13px; background:#f0fdf4; border:1px solid #bbf7d0; border-radius:8px; color:#15803d; font-size:13px; }
        .pw-btn {
          display:flex; align-items:center; justify-content:center; gap:7px;
          width:100%; padding:11px 16px;
          background:#1e3a8a; border:none; color:#fff;
          border-radius:9px; font-size:13px; font-weight:600;
          font-family:'DM Sans',sans-serif; cursor:pointer; transition:background 0.15s;
        }
        .pw-btn:hover:not(:disabled) { background:#1d4ed8; }
        .pw-btn:disabled { opacity:0.5; cursor:not-allowed; }
        .pw-spinner { width:13px; height:13px; border:2px solid rgba(255,255,255,0.3); border-top-color:#fff; border-radius:50%; animation:spin 0.6s linear infinite; }
        .pw-strength { display:flex; gap:4px; margin-top:4px; }
        .pw-strength-bar { height:3px; flex:1; border-radius:3px; transition:background 0.2s; }
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
              <div style={S.brandName}>{t('egov_portal')}</div>
              <div style={S.brandSub}>{t('gov_gateway')}</div>
            </div>
          </div>

          <nav style={S.nav}>
            {navItems.map(({ id, icon: Icon, label }) => {
              const isAct = activeTab === id
              return (
                <button key={id} style={S.navBtn(isAct)} onClick={() => setActiveTab(id)}>
                  <div style={S.navIcon(isAct)}><Icon size={14}/></div>
                  <span style={S.navLabel(isAct)}>{label}</span>
                  {id === 'fines' && unpaid.length > 0 && <span style={S.navBadge}>{unpaid.length}</span>}
                </button>
              )
            })}
          </nav>

          <div style={S.sidebarFooter}>
            <div style={S.userAvatar}>{initials}</div>
            <div style={{ flex:1, overflow:'hidden' }}>
              <span style={S.userName}>{user?.first_name} {user?.last_name}</span>
              <span style={S.userRole}>{t('citizen')}</span>
            </div>
            <button className="dash-logout-btn" style={S.logoutBtn} onClick={logout} title={t('logout')}><LogOut size={14}/></button>
          </div>
        </aside>

        {/* MAIN */}
        <main style={S.main}>
          <div className="dash-topbar" style={S.topbar}>
            <div style={S.topbarLeft}>
              <div style={S.pageTitle}>{pageTitles[activeTab]}</div>
            </div>
            <div style={S.topbarRight}>
              <LanguageSwitcher />
              <div style={S.topbarAvatar}>{initials}</div>
            </div>
          </div>

          <div style={S.content}>

            {/* ── OVERVIEW ── */}
            {activeTab === 'overview' && (
              <>
                <div style={S.statsGrid}>
                  {[
                    { label: t('active_appointments'), val:active.length,                            icon:Calendar,       color:'#1e3a8a' },
                    { label: t('unpaid_fines'),         val:unpaid.length,                            icon:AlertTriangle,  color:'#d97706' },
                    { label: t('total_payments'),       val:fines.filter(f=>f.status==='paid').length, icon:CreditCard,    color:'#16a34a' },
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
                    { title: t('recent_appointments_title'), data:appointments.slice(0,4), tab:'appointments', getTitle:a=>a.institution, getSub:a=>a.reason,     getStatus:a=>a.status, empty: t('no_appointments_registered') },
                    { title: t('recent_fines'),              data:fines.slice(0,4),        tab:'fines',        getTitle:f=>f.type,        getSub:f=>`${f.amount} MKD`, getStatus:f=>f.status, empty: t('no_fines_registered') },
                  ].map(({ title, data, tab, getTitle, getSub, getStatus, empty }) => (
                    <div key={title} style={S.card}>
                      <div style={S.cardHeader}>
                        <span style={S.cardTitle}>{title}</span>
                        <button className="dash-card-link" style={S.cardLink} onClick={() => setActiveTab(tab)}>
                          {t('view_all')} <ChevronRight size={12}/>
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
                  style={{ display:'flex', alignItems:'center', gap:6, background:'#1e3a8a', color:'#fff', border:'none', padding:'9px 16px', borderRadius:8, fontSize:13, fontWeight:600, marginBottom:16, cursor:'pointer', fontFamily:"'DM Sans', sans-serif" }}
                >
                  <Plus size={14}/> {t('book_new_appointment')}
                </button>
                <div style={S.card}>
                  {appointments.length === 0
                    ? <div style={S.emptyMsg}>{t('no_appointments_registered')}</div>
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
                  ? <div style={S.emptyMsg}>{t('no_fines_registered')}</div>
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
                            {t('pay')}
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
                  ? <div style={S.emptyMsg}>{t('no_payments_registered')}</div>
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
              <div style={{ maxWidth:560, display:'flex', flexDirection:'column', gap:16 }}>

                {/* Hero */}
                <div className="profile-hero">
                  <div className="profile-avatar-wrap">
                    <div className="profile-avatar-circle">{initials}</div>
                    <div className="profile-hero-info">
                      <div className="profile-hero-name">{user?.first_name} {user?.last_name}</div>
                      <div className="profile-hero-sub">
                        <span>{t('profile_registered_citizen')}</span>
                        <span style={{ opacity:0.3 }}>·</span>
                        <span className="profile-status-pill">
                          <span className="profile-status-dot"/>
                          {t('profile_active')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="profile-info-grid">
                    {[
                      { icon: Mail,       label: t('email'),       value: user?.email,              mono: false },
                      { icon: Hash,       label: t('personal_id'), value: user?.personal_id,        mono: true  },
                      { icon: BadgeCheck, label: t('profile_role'),value: user?.role || 'user',     mono: false },
                      { icon: Shield,     label: t('status'),      value: user?.verification_status,mono: false },
                    ].map(({ icon: Icon, label, value, mono }) => (
                      <div key={label} className="profile-info-card">
                        <div className="profile-info-icon"><Icon size={14}/></div>
                        <div>
                          <span className="profile-info-label">{label}</span>
                          <span className={`profile-info-value ${mono ? 'mono' : ''}`}>{value || '—'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{ padding:'14px 0 18px', display:'flex', alignItems:'center', gap:6, position:'relative', zIndex:2 }}>
                    <Clock size={12} color="rgba(255,255,255,0.3)"/>
                    <span style={{ fontSize:11, color:'rgba(255,255,255,0.35)' }}>
                      {t('profile_registered_on')}:{' '}
                      {user?.created_at
                        ? new Date(user.created_at).toLocaleDateString('sq-AL', { day:'2-digit', month:'long', year:'numeric' })
                        : '—'}
                    </span>
                  </div>
                </div>

                {/* Password Change */}
                <div className="pw-section">
                  <div className="pw-section-header">
                    <div className="pw-section-icon"><KeyRound size={15}/></div>
                    <div>
                      <div className="pw-section-title">{t('password_change_title')}</div>
                      <div className="pw-section-sub">{t('password_change_subtitle')}</div>
                    </div>
                  </div>

                  <div className="pw-section-body">
                    {pwError && (
                      <div className="pw-error">
                        <AlertCircle size={13}/>
                        <span>{pwError}</span>
                      </div>
                    )}
                    {pwSuccess && (
                      <div className="pw-success">
                        <CheckCircle size={13}/>
                        <span>{t('password_success')}</span>
                      </div>
                    )}

                    {/* Current */}
                    <div className="pw-group">
                      <label className="pw-label">{t('password_current')}</label>
                      <div className="pw-input-wrap">
                        <input
                          type={pwShow.current ? 'text' : 'password'}
                          className="pw-input"
                          placeholder={t('password_current_placeholder')}
                          value={pwForm.current}
                          onChange={e => { setPwError(''); setPwForm(p => ({...p, current: e.target.value})) }}
                        />
                        <button type="button" className="pw-eye" onClick={() => setPwShow(s => ({...s, current: !s.current}))}>
                          {pwShow.current ? <EyeOff size={14}/> : <Eye size={14}/>}
                        </button>
                      </div>
                    </div>

                    {/* New */}
                    <div className="pw-group">
                      <label className="pw-label">{t('password_new')}</label>
                      <div className="pw-input-wrap">
                        <input
                          type={pwShow.next ? 'text' : 'password'}
                          className="pw-input"
                          placeholder={t('password_new_placeholder')}
                          value={pwForm.next}
                          onChange={e => { setPwError(''); setPwForm(p => ({...p, next: e.target.value})) }}
                        />
                        <button type="button" className="pw-eye" onClick={() => setPwShow(s => ({...s, next: !s.next}))}>
                          {pwShow.next ? <EyeOff size={14}/> : <Eye size={14}/>}
                        </button>
                      </div>
                      {pwForm.next && (
                        <div className="pw-strength">
                          {[1,2,3,4].map(i => {
                            const len      = pwForm.next.length
                            const hasUpper = /[A-Z]/.test(pwForm.next)
                            const hasNum   = /[0-9]/.test(pwForm.next)
                            const hasSpec  = /[^A-Za-z0-9]/.test(pwForm.next)
                            const score    = (len >= 8 ? 1 : 0) + (hasUpper ? 1 : 0) + (hasNum ? 1 : 0) + (hasSpec ? 1 : 0)
                            const color    = score >= i
                              ? score <= 1 ? '#ef4444' : score === 2 ? '#f59e0b' : score === 3 ? '#3b82f6' : '#22c55e'
                              : '#e5e7eb'
                            return <div key={i} className="pw-strength-bar" style={{ background: color }}/>
                          })}
                        </div>
                      )}
                    </div>

                    {/* Confirm */}
                    <div className="pw-group">
                      <label className="pw-label">{t('password_confirm_new')}</label>
                      <div className="pw-input-wrap">
                        <input
                          type={pwShow.confirm ? 'text' : 'password'}
                          className="pw-input"
                          placeholder={t('password_confirm_placeholder')}
                          value={pwForm.confirm}
                          onChange={e => { setPwError(''); setPwForm(p => ({...p, confirm: e.target.value})) }}
                          style={pwForm.confirm && pwForm.confirm !== pwForm.next ? { borderColor:'#fca5a5' } : {}}
                        />
                        <button type="button" className="pw-eye" onClick={() => setPwShow(s => ({...s, confirm: !s.confirm}))}>
                          {pwShow.confirm ? <EyeOff size={14}/> : <Eye size={14}/>}
                        </button>
                      </div>
                      {pwForm.confirm && pwForm.confirm !== pwForm.next && (
                        <span style={{ fontSize:11, color:'#ef4444', marginTop:3 }}>{t('password_mismatch')}</span>
                      )}
                    </div>

                    <button
                      className="pw-btn"
                      onClick={changePassword}
                      disabled={pwLoading || !pwForm.current || !pwForm.next || !pwForm.confirm}
                    >
                      {pwLoading
                        ? <><div className="pw-spinner"/> {t('password_changing')}</>
                        : <><Lock size={13}/> {t('password_change_btn')}</>
                      }
                    </button>
                  </div>
                </div>

              </div>
            )}
          </div>
        </main>

        {/* ── APPOINTMENT MODAL ── */}
        {showApptModal && (
          <div style={S.overlay} onClick={() => setShowApptModal(false)}>
            <div style={S.modal} onClick={e => e.stopPropagation()}>
              <div style={S.modalHeader}>
                <div>
                  <div style={S.modalTitle}>{t('appt_wizard_title')}</div>
                  <div style={{ fontSize:11, color:'#8a929e', marginTop:2 }}>{t('step')} {step} / 4</div>
                </div>
                <button style={S.modalClose} onClick={() => setShowApptModal(false)}><X size={15}/></button>
              </div>
              <div style={S.modalBody}>
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
                {step === 1 && (
                  <div style={S.instGrid}>
                    {[
                      { id:'MVR',    emoji:'🏛', name: t('appt_institution_mvr'),    sub: t('appt_institution_mvr_sub')    },
                      { id:'Komuna', emoji:'🏢', name: t('appt_institution_komuna'), sub: t('appt_institution_komuna_sub') },
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
                {step === 2 && (
                  <div style={S.svcList}>
                    {SERVICES[apptInstitution].map(svc => {
                      const sel = apptService === svc
                      return (
                        <div key={svc} style={S.svcItem(sel)} onClick={() => setApptService(svc)}>
                          <div style={S.svcRadio(sel)}>
                            {sel && <div style={{ width:6, height:6, borderRadius:'50%', background:'#1e3a8a' }}/>}
                          </div>
                          {svc}
                        </div>
                      )
                    })}
                  </div>
                )}
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
                {step === 4 && (
                  <>
                    <div style={S.summary}>
                      <div style={{ fontSize:10, fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'.07em', marginBottom:8 }}>{t('appt_summary')}</div>
                      {[
                        [t('appt_institution_label'), apptInstitution],
                        [t('appt_service_label'),     apptService],
                        [t('appt_date_label'),        apptDate?.toLocaleDateString('sq-AL',{weekday:'long',day:'2-digit',month:'long'})],
                      ].map(([k,v]) => (
                        <div key={k} style={S.sumRow}>
                          <span style={S.sumKey}>{k}</span>
                          <span style={S.sumVal}>{v}</span>
                        </div>
                      ))}
                    </div>
                    <div style={S.timeGrid}>
                      {TIME_SLOTS.map(ts => (
                        <button key={ts} style={S.timeBtn(apptTime === ts)} onClick={() => setApptTime(ts)}>{ts}</button>
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
                  {step > 1 ? `← ${t('back')}` : t('cancel')}
                </button>
                {step < 4 ? (
                  <button
                    style={{ flex:2, padding:10, background: canNext()?'#1e3a8a':'#f5f6f8', border:'none', color: canNext()?'#fff':'#9ca3af', borderRadius:8, fontSize:13, fontWeight:600, cursor: canNext()?'pointer':'not-allowed', fontFamily:"'DM Sans', sans-serif" }}
                    onClick={() => canNext() && setStep(s=>s+1)}
                  >
                    {t('next')} →
                  </button>
                ) : (
                  <button
                    style={{ flex:2, padding:10, background: canNext()?'#15803d':'#f5f6f8', border:'none', color: canNext()?'#fff':'#9ca3af', borderRadius:8, fontSize:13, fontWeight:600, cursor: canNext()?'pointer':'not-allowed', fontFamily:"'DM Sans', sans-serif" }}
                    onClick={() => canNext() && bookAppointment()}
                  >
                    {t('appt_confirm')}
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
                <div style={S.modalTitle}>{t('pay_fine_title')}</div>
                <button style={S.modalClose} onClick={() => setShowPayModal(null)}><X size={15}/></button>
              </div>
              <div style={S.modalBody}>
                <div style={{ background:'#f9fafb', border:'1px solid #f3f4f6', borderRadius:8, padding:14, textAlign:'center', marginBottom:16 }}>
                  <div style={{ fontSize:11, color:'#9ca3af', marginBottom:4 }}>{t('pay_total')}</div>
                  <div style={{ fontSize:'1.5rem', fontWeight:800, color:'#1e3a8a', letterSpacing:'-0.03em' }}>
                    {fines.find(f=>f.id===showPayModal)?.amount} MKD
                  </div>
                </div>
                <label style={S.piLabel}>{t('card_number')}</label>
                <input style={S.piInput} value={payForm.card_number} placeholder="1234 5678 9012 3456" maxLength={19} onChange={e=>setPayForm({...payForm,card_number:e.target.value})}/>
                <label style={S.piLabel}>{t('card_holder')}</label>
                <input style={S.piInput} value={payForm.card_holder} placeholder="EMRI MBIEMRI" onChange={e=>setPayForm({...payForm,card_holder:e.target.value.toUpperCase()})}/>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                  <div>
                    <label style={S.piLabel}>{t('expiry')}</label>
                    <input style={{...S.piInput, marginBottom:0}} value={payForm.expiry} placeholder="MM/YY" maxLength={5} onChange={e=>setPayForm({...payForm,expiry:e.target.value})}/>
                  </div>
                  <div>
                    <label style={S.piLabel}>{t('cvv')}</label>
                    <input style={{...S.piInput, marginBottom:0}} value={payForm.cvv} placeholder="123" maxLength={3} type="password" onChange={e=>setPayForm({...payForm,cvv:e.target.value})}/>
                  </div>
                </div>
              </div>
              <div style={S.modalFooter}>
                <button style={{ flex:1, padding:10, background:'#fff', border:'1px solid #e5e7eb', color:'#6b7280', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:"'DM Sans', sans-serif" }} onClick={() => setShowPayModal(null)}>{t('cancel')}</button>
                <button style={{ flex:2, padding:10, background:'#15803d', border:'none', color:'#fff', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:"'DM Sans', sans-serif" }} onClick={payFine}>{t('pay_now')}</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default Dashboard