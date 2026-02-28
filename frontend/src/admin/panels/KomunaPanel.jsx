import { useState, useEffect } from 'react'
import API from '../../api/axios'
import { MapPin, Check, X, AlertCircle } from 'lucide-react'
import './KomunaPanel.css'

const KomunaPanel = () => {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading]           = useState(true)
  const [selected, setSelected]         = useState(null)
  const [form, setForm]                 = useState({ status: 'approved', admin_note: '', approved_date: '' })
  const [toast, setToast]               = useState(null)

  useEffect(() => { fetchAppts() }, [])

  const fetchAppts = async () => {
    try {
      const res = await API.get('/appointments?institution=Komuna')
      setAppointments(res.data.data || [])
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const update = async () => {
    try {
      await API.put(`/appointments/${selected.id}`, form)
      setSelected(null)
      fetchAppts()
      showToast('Termini u përditësua!')
    } catch { showToast('Gabim!', 'error') }
  }

  const statusBadge = (status) => {
    const map = {
      pending:  { label: 'Në pritje', cls: 'badge-pending'  },
      approved: { label: 'Aprovuar',  cls: 'badge-approved' },
      rejected: { label: 'Refuzuar',  cls: 'badge-rejected' },
    }
    const s = map[status] || map.pending
    return <span className={`badge ${s.cls}`}>{s.label}</span>
  }

  return (
    <div className="panel">
      {toast && (
        <div className={`panel-toast ${toast.type === 'error' ? 'toast-err' : 'toast-ok'}`}>
          {toast.type === 'error' ? <AlertCircle size={14} /> : <Check size={14} />}
          {toast.msg}
        </div>
      )}

      <div className="panel-header">
        <div>
          <h1>Terminë Komuna</h1>
          <p>Terminë komunale dhe administrative</p>
        </div>
        <div className="panel-badge-green">
          <MapPin size={14} /> {appointments.filter(a => a.status === 'pending').length} pending
        </div>
      </div>

      {loading ? (
        <div className="panel-loading"><div className="panel-spinner" /></div>
      ) : appointments.length === 0 ? (
        <div className="panel-empty">
          <MapPin size={40} style={{ opacity: 0.2 }} />
          <p>Nuk ka termine Komuna</p>
        </div>
      ) : (
        <div className="appt-table">
          <div className="appt-table-head">
            <span>QYTETARI</span>
            <span>SHËRBIMI</span>
            <span>DATA KËRKUAR</span>
            <span>STATUSI</span>
            <span>VEPRIME</span>
          </div>
          {appointments.map(a => (
            <div key={a.id} className="appt-table-row">
              <div>
                <div className="appt-name">{a.users?.first_name} {a.users?.last_name}</div>
                <div className="appt-embg">{a.users?.personal_id}</div>
              </div>
              <span className="appt-reason">{a.reason}</span>
              <span className="appt-date">
                {a.appointment_date ? new Date(a.appointment_date).toLocaleDateString('sq-AL') : '—'}
              </span>
              {statusBadge(a.status)}
              <button className="appt-btn-green" onClick={() => { setSelected(a); setForm({ status:'approved', admin_note:'', approved_date:'' }) }}>
                Menaxho
              </button>
            </div>
          ))}
        </div>
      )}

      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="appt-modal" onClick={e => e.stopPropagation()}>
            <div className="appt-modal-header">
              <h3>Menaxho — {selected.users?.first_name}</h3>
              <button onClick={() => setSelected(null)}><X size={18} /></button>
            </div>
            <div className="appt-modal-body">
              <div className="appt-modal-info">
                <span>📋 {selected.reason}</span>
                <span>👤 {selected.users?.email}</span>
              </div>
              <div className="form-group">
                <label>STATUSI</label>
                <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                  <option value="approved">Aprovo</option>
                  <option value="rejected">Refuzo</option>
                </select>
              </div>
              {form.status === 'approved' && (
                <div className="form-group">
                  <label>DATA E KONFIRMUAR</label>
                  <input type="datetime-local" value={form.approved_date}
                    onChange={e => setForm({ ...form, approved_date: e.target.value })} />
                </div>
              )}
              <div className="form-group">
                <label>SHËNIM</label>
                <input value={form.admin_note} placeholder="Shënim opsional..."
                  onChange={e => setForm({ ...form, admin_note: e.target.value })} />
              </div>
            </div>
            <div className="appt-modal-footer">
              <button className="btn-cancel-modal" onClick={() => setSelected(null)}>Anulo</button>
              <button className="btn-confirm-green" onClick={update}>Konfirmo ✓</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default KomunaPanel