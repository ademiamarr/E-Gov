import { useState, useEffect } from 'react'
import API from '../../../api/axios'
import { AlertTriangle, Plus, Check, X, AlertCircle } from 'lucide-react'
import './GjobaPanel.css'

const FINE_TYPES = ['Traffic Violation','Parking Violation','Administrative Fine','Environmental Violation','Other']

const GjobaPanel = () => {
  const [fines, setFines]     = useState([])
  const [users, setUsers]     = useState([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [toast, setToast]     = useState(null)
  const [form, setForm]       = useState({ user_id:'', type:'Traffic Violation', amount:'', fine_date:'', description:'' })

  useEffect(() => { fetchAll() }, [])

  const fetchAll = async () => {
    try {
      const [f, u] = await Promise.all([
        API.get('/fines'),
        API.get('/users'),
      ])
      setFines(f.data.data || [])
      setUsers(u.data.data || [])
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const addFine = async () => {
    if (!form.user_id || !form.amount) return showToast('Plotëso fushat e detyruara!', 'error')
    try {
      await API.post('/fines', { ...form, amount: parseFloat(form.amount) })
      setShowAdd(false)
      setForm({ user_id:'', type:'Traffic Violation', amount:'', fine_date:'', description:'' })
      fetchAll()
      showToast('Gjoba u shtua me sukses!')
    } catch { showToast('Gabim!', 'error') }
  }

  const statusBadge = (status) => (
    <span className={status === 'paid' ? 'gjb-badge-approved' : 'gjb-badge-pending'}>
      {status === 'paid' ? 'Paguar' : 'Pa paguar'}
    </span>
  )

  return (
    <div>
      {toast && (
        <div className={`gjb-toast ${toast.type === 'error' ? 'gjb-toast--err' : 'gjb-toast--ok'}`}>
          {toast.type === 'error' ? <AlertCircle size={14} /> : <Check size={14} />}
          {toast.msg}
        </div>
      )}

      <div className="gjb-panel-header">
        <div>
          <h1>Gjoba</h1>
          <p>Menaxho gjobat e qytetarëve</p>
        </div>
        <button className="gjb-add-btn" onClick={() => setShowAdd(true)}>
          <Plus size={15} /> Shto gjobë
        </button>
      </div>

      {loading ? (
        <div className="gjb-loading"><div className="gjb-spinner" /></div>
      ) : fines.length === 0 ? (
        <div className="gjb-empty">
          <AlertTriangle size={40} style={{ opacity: 0.2 }} />
          <p>Nuk ka gjoba të regjistruara</p>
        </div>
      ) : (
        <div className="gjb-table">
          <div className="gjb-table-head">
            <span>QYTETARI</span><span>LLOJI</span>
            <span>SHUMA</span><span>DATA</span><span>STATUSI</span>
          </div>
          {fines.map(f => (
            <div key={f.id} className="gjb-table-row">
              <div>
                <div className="gjb-name">{f.users?.first_name} {f.users?.last_name}</div>
                <div className="gjb-email">{f.users?.email}</div>
              </div>
              <span className="gjb-type">{f.type}</span>
              <span className="gjb-amount">{f.amount} MKD</span>
              <span className="gjb-date">
                {f.fine_date ? new Date(f.fine_date).toLocaleDateString('sq-AL') : '—'}
              </span>
              {statusBadge(f.status)}
            </div>
          ))}
        </div>
      )}

      {showAdd && (
        <div className="gjb-overlay" onClick={() => setShowAdd(false)}>
          <div className="gjb-modal" onClick={e => e.stopPropagation()}>
            <div className="gjb-modal-header">
              <h3>Shto gjobë të re</h3>
              <button onClick={() => setShowAdd(false)}><X size={18} /></button>
            </div>
            <div className="gjb-modal-body">
              <div className="gjb-form-group">
                <label>QYTETARI *</label>
                <select value={form.user_id}
                  onChange={e => setForm({ ...form, user_id: e.target.value })}>
                  <option value="">Zgjidhni qytetarin</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.first_name} {u.last_name} — {u.personal_id}
                    </option>
                  ))}
                </select>
              </div>
              <div className="gjb-form-group">
                <label>LLOJI I GJOBËS *</label>
                <select value={form.type}
                  onChange={e => setForm({ ...form, type: e.target.value })}>
                  {FINE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="gjb-modal-row">
                <div className="gjb-form-group">
                  <label>SHUMA (MKD) *</label>
                  <input type="number" value={form.amount} placeholder="0.00"
                    onChange={e => setForm({ ...form, amount: e.target.value })} />
                </div>
                <div className="gjb-form-group">
                  <label>DATA E GJOBËS</label>
                  <input type="date" value={form.fine_date}
                    onChange={e => setForm({ ...form, fine_date: e.target.value })} />
                </div>
              </div>
              <div className="gjb-form-group">
                <label>PËRSHKRIM (opsionale)</label>
                <input value={form.description} placeholder="Detaje shtesë..."
                  onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
            </div>
            <div className="gjb-modal-footer">
              <button className="gjb-btn-cancel" onClick={() => setShowAdd(false)}>Anulo</button>
              <button className="gjb-btn-confirm" onClick={addFine}>
                <Plus size={14} /> Shto gjobën
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default GjobaPanel