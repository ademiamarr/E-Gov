import { useState, useEffect } from 'react'
import API from '../../api/axios'
import { UserCheck, Eye, Check, X, AlertCircle, Clock } from 'lucide-react'
import './RegistrationPanel.css'

const RegistrationPanel = () => {
  const [users, setUsers]         = useState([])
  const [loading, setLoading]     = useState(true)
  const [selected, setSelected]   = useState(null)
  const [rejectReason, setRejectReason] = useState('')
  const [toast, setToast]         = useState(null)

  useEffect(() => { fetchUsers() }, [])

  const fetchUsers = async () => {
    try {
      const res = await API.get('/users/pending')
      setUsers(res.data.data || [])
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const approve = async (id) => {
    try {
      await API.put(`/users/${id}/approve`)
      setSelected(null)
      fetchUsers()
      showToast('Useri u aprovua!')
    } catch { showToast('Gabim!', 'error') }
  }

  const reject = async (id) => {
    try {
      await API.put(`/users/${id}/reject`, { reason: rejectReason })
      setSelected(null)
      setRejectReason('')
      fetchUsers()
      showToast('Useri u refuzua.')
    } catch { showToast('Gabim!', 'error') }
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
          <h1>Regjistrime në pritje</h1>
          <p>{users.length} kërkesa aktive</p>
        </div>
        <div className="panel-badge">
          <Clock size={14} /> Pending
        </div>
      </div>

      {loading ? (
        <div className="panel-loading"><div className="panel-spinner" /></div>
      ) : users.length === 0 ? (
        <div className="panel-empty">
          <UserCheck size={40} style={{ opacity: 0.2 }} />
          <p>Nuk ka regjistrime në pritje</p>
        </div>
      ) : (
        <div className="reg-table">
          <div className="reg-table-head">
            <span>EMRI</span>
            <span>EMAIL</span>
            <span>EMBG</span>
            <span>DATA</span>
            <span>VEPRIME</span>
          </div>
          {users.map(u => (
            <div key={u.id} className="reg-table-row">
              <span className="reg-name">{u.first_name} {u.last_name}</span>
              <span className="reg-email">{u.email}</span>
              <span className="reg-embg">{u.personal_id}</span>
              <span className="reg-date">{new Date(u.created_at).toLocaleDateString('sq-AL')}</span>
              <div className="reg-actions">
                <button className="reg-btn-view"  onClick={() => setSelected(u)}>
                  <Eye size={13} /> Shiko
                </button>
                <button className="reg-btn-approve" onClick={() => approve(u.id)}>
                  <Check size={13} />
                </button>
                <button className="reg-btn-reject" onClick={() => { setSelected(u); }}>
                  <X size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="reg-modal" onClick={e => e.stopPropagation()}>
            <div className="reg-modal-header">
              <h3>{selected.first_name} {selected.last_name}</h3>
              <button onClick={() => setSelected(null)}><X size={18} /></button>
            </div>

            <div className="reg-modal-body">
              {selected.photo_signed_url && (
                <img src={selected.photo_signed_url} alt="ID" className="reg-photo" />
              )}
              <div className="reg-info-grid">
                {[
                  ['Email', selected.email],
                  ['EMBG', selected.personal_id],
                  ['Regjistruar', new Date(selected.created_at).toLocaleDateString('sq-AL')],
                ].map(([k, v]) => (
                  <div key={k} className="reg-info-item">
                    <span className="reg-info-label">{k}</span>
                    <span className="reg-info-value">{v}</span>
                  </div>
                ))}
              </div>

              <div className="form-group">
                <label>ARSYEJA E REFUZIMIT (opsionale)</label>
                <input value={rejectReason} placeholder="p.sh. Dokumenti nuk është i qartë..."
                  onChange={e => setRejectReason(e.target.value)} />
              </div>
            </div>

            <div className="reg-modal-footer">
              <button className="reg-reject-btn" onClick={() => reject(selected.id)}>
                <X size={14} /> Refuzo
              </button>
              <button className="reg-approve-btn" onClick={() => approve(selected.id)}>
                <Check size={14} /> Aprovo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default RegistrationPanel