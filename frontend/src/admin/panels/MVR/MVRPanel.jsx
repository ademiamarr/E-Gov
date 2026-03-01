import { useState, useEffect } from 'react'
import API from '../../../api/axios'
import { Calendar, Check, X, Clock, AlertCircle } from 'lucide-react'
import './MVRPanel.css'

const MVRPanel = () => {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading]           = useState(true)
  const [selected, setSelected]         = useState(null)
  const [form, setForm]                 = useState({ status: 'approved', admin_note: '', approved_date: '' })
  const [toast, setToast]               = useState(null)

  useEffect(() => { fetchAppts() }, [])

  const fetchAppts = async () => {
    try {
      const res = await API.get('/appointments?institution=MVR')
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
      pending:  <span className="mvr-badge-pending">Në pritje</span>,
      approved: <span className="mvr-badge-approved">Aprovuar</span>,
      rejected: <span className="mvr-badge-rejected">Refuzuar</span>,
    }
    return map[status] || map.pending
  }

  return (
    <div>
      {toast && (
        <div className={`mvr-toast ${toast.type === 'error' ? 'mvr-toast--err' : 'mvr-toast--ok'}`}>
          {toast.type === 'error' ? <AlertCircle size={14} /> : <Check size={14} />}
          {toast.msg}
        </div>
      )}

      <div className="mvr-panel-header">
        <div>
          <h1>Terminë MVR</h1>
          <p>Ministria e Punëve të Brendshme</p>
        </div>
        <div className="mvr-panel-badge">
          <Calendar size={14} /> {appointments.filter(a => a.status === 'pending').length} pending
        </div>
      </div>

      {loading ? (
        <div className="mvr-loading"><div className="mvr-spinner" /></div>
      ) : appointments.length === 0 ? (
        <div className="mvr-empty">
          <Calendar size={40} style={{ opacity: 0.2 }} />
          <p>Nuk ka termine MVR</p>
        </div>
      ) : (
        <div className="mvr-table">
          <div className="mvr-table-head">
            <span>QYTETARI</span><span>SHËRBIMI</span>
            <span>DATA KËRKUAR</span><span>STATUSI</span><span>VEPRIME</span>
          </div>
          {appointments.map(a => (
            <div key={a.id} className="mvr-table-row">
              <div>
                <div className="mvr-name">{a.users?.first_name} {a.users?.last_name}</div>
                <div className="mvr-embg">{a.users?.personal_id}</div>
              </div>
              <span className="mvr-reason">{a.reason}</span>
              <span className="mvr-date">
                {a.appointment_date ? new Date(a.appointment_date).toLocaleDateString('sq-AL') : '—'}
              </span>
              {statusBadge(a.status)}
              <button className="mvr-btn" onClick={() => {
                setSelected(a)
                setForm({ status: 'approved', admin_note: '', approved_date: '' })
              }}>
                Menaxho
              </button>
            </div>
          ))}
        </div>
      )}

      {selected && (
        <div className="mvr-overlay" onClick={() => setSelected(null)}>
          <div className="mvr-modal" onClick={e => e.stopPropagation()}>
            <div className="mvr-modal-header">
              <h3>Menaxho termin — {selected.users?.first_name}</h3>
              <button onClick={() => setSelected(null)}><X size={18} /></button>
            </div>
            <div className="mvr-modal-body">
              <div className="mvr-modal-info">
                <span>📋 {selected.reason}</span>
                <span>👤 {selected.users?.email}</span>
              </div>
              <div className="mvr-form-group">
                <label>STATUSI</label>
                <select value={form.status}
                  onChange={e => setForm({ ...form, status: e.target.value })}>
                  <option value="approved">Aprovo</option>
                  <option value="rejected">Refuzo</option>
                </select>
              </div>
              {form.status === 'approved' && (
                <div className="mvr-form-group">
                  <label>DATA E KONFIRMUAR</label>
                  <input type="datetime-local" value={form.approved_date}
                    onChange={e => setForm({ ...form, approved_date: e.target.value })} />
                </div>
              )}
              <div className="mvr-form-group">
                <label>SHËNIM (opsionale)</label>
                <input value={form.admin_note} placeholder="Shënim për qytetarin..."
                  onChange={e => setForm({ ...form, admin_note: e.target.value })} />
              </div>
            </div>
            <div className="mvr-modal-footer">
              <button className="mvr-btn-cancel" onClick={() => setSelected(null)}>Anulo</button>
              <button className="mvr-btn-confirm" onClick={update}>Konfirmo ✓</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MVRPanel