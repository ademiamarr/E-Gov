import { useState, useEffect } from 'react'
import API from '../../../api/axios'
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
      pending:  <span className="kom-badge-pending">Në pritje</span>,
      approved: <span className="kom-badge-approved">Aprovuar</span>,
      rejected: <span className="kom-badge-rejected">Refuzuar</span>,
    }
    return map[status] || map.pending
  }

  return (
    <div>
      {toast && (
        <div className={`kom-toast ${toast.type === 'error' ? 'kom-toast--err' : 'kom-toast--ok'}`}>
          {toast.type === 'error' ? <AlertCircle size={14} /> : <Check size={14} />}
          {toast.msg}
        </div>
      )}

      <div className="kom-panel-header">
        <div>
          <h1>Terminë Komuna</h1>
          <p>Terminë komunale dhe administrative</p>
        </div>
        <div className="kom-panel-badge">
          <MapPin size={14} /> {appointments.filter(a => a.status === 'pending').length} pending
        </div>
      </div>

      {loading ? (
        <div className="kom-loading"><div className="kom-spinner" /></div>
      ) : appointments.length === 0 ? (
        <div className="kom-empty">
          <MapPin size={40} style={{ opacity: 0.2 }} />
          <p>Nuk ka termine Komuna</p>
        </div>
      ) : (
        <div className="kom-table">
          <div className="kom-table-head">
            <span>QYTETARI</span><span>SHËRBIMI</span>
            <span>DATA KËRKUAR</span><span>STATUSI</span><span>VEPRIME</span>
          </div>
          {appointments.map(a => (
            <div key={a.id} className="kom-table-row">
              <div>
                <div className="kom-name">{a.users?.first_name} {a.users?.last_name}</div>
                <div className="kom-embg">{a.users?.personal_id}</div>
              </div>
              <span className="kom-reason">{a.reason}</span>
              <span className="kom-date">
                {a.appointment_date ? new Date(a.appointment_date).toLocaleDateString('sq-AL') : '—'}
              </span>
              {statusBadge(a.status)}
              <button className="kom-btn-green" onClick={() => {
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
        <div className="kom-overlay" onClick={() => setSelected(null)}>
          <div className="kom-modal" onClick={e => e.stopPropagation()}>
            <div className="kom-modal-header">
              <h3>Menaxho — {selected.users?.first_name}</h3>
              <button onClick={() => setSelected(null)}><X size={18} /></button>
            </div>
            <div className="kom-modal-body">
              <div className="kom-modal-info">
                <span>📋 {selected.reason}</span>
                <span>👤 {selected.users?.email}</span>
              </div>
              <div className="kom-form-group">
                <label>STATUSI</label>
                <select value={form.status}
                  onChange={e => setForm({ ...form, status: e.target.value })}>
                  <option value="approved">Aprovo</option>
                  <option value="rejected">Refuzo</option>
                </select>
              </div>
              {form.status === 'approved' && (
                <div className="kom-form-group">
                  <label>DATA E KONFIRMUAR</label>
                  <input type="datetime-local" value={form.approved_date}
                    onChange={e => setForm({ ...form, approved_date: e.target.value })} />
                </div>
              )}
              <div className="kom-form-group">
                <label>SHËNIM</label>
                <input value={form.admin_note} placeholder="Shënim opsional..."
                  onChange={e => setForm({ ...form, admin_note: e.target.value })} />
              </div>
            </div>
            <div className="kom-modal-footer">
              <button className="kom-btn-cancel" onClick={() => setSelected(null)}>Anulo</button>
              <button className="kom-btn-confirm-green" onClick={update}>Konfirmo ✓</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default KomunaPanel