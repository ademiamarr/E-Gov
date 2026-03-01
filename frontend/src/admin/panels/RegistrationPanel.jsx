import { useState, useEffect } from 'react'
import API from '../../api/axios'
import { UserCheck, Eye, Check, X, AlertCircle, Clock } from 'lucide-react'

const RegistrationPanel = () => {
  const [users, setUsers]               = useState([])
  const [loading, setLoading]           = useState(true)
  const [selected, setSelected]         = useState(null)
  const [rejectReason, setRejectReason] = useState('')
  const [toast, setToast]               = useState(null)

  useEffect(() => { fetchUsers() })

  const fetchUsers = async () => {
    try {
      const res = await API.get('/users/pending')
      setUsers(res.data.data || [])
    } catch (err) { 
      console.error(err)
      showToast('Gabim në ngarkim!', 'error')
    }
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
      showToast('Useri u aprovua me sukses! ✓')
    } catch (err) { 
      showToast(err.response?.data?.message || 'Gabim!', 'error') 
    }
  }

  const reject = async (id) => {
    if (!rejectReason.trim()) {
      showToast('Shkruani arsyen e refuzimit!', 'error')
      return
    }
    try {
      await API.put(`/users/${id}/reject`, { reason: rejectReason })
      setSelected(null)
      setRejectReason('')
      fetchUsers()
      showToast('Useri u refuzua.')
    } catch (err) { 
      showToast(err.response?.data?.message || 'Gabim!', 'error') 
    }
  }

  return (
    <>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }

        .reg-panel { width: 100%; }

        .reg-panel-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 28px;
          padding-bottom: 20px;
          border-bottom: 1px solid rgba(255,255,255,0.08);
        }

        .reg-panel-header h1 {
          font-size: 1.4rem;
          font-weight: 800;
          color: #f0f4ff;
          margin: 0;
          letter-spacing: -0.02em;
        }

        .reg-panel-header p {
          font-size: 12px;
          color: rgba(255,255,255,0.35);
          margin-top: 4px;
        }

        .reg-panel-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(59,130,246,0.15);
          border: 1px solid rgba(59,130,246,0.3);
          color: #60a5fa;
          padding: 8px 14px;
          border-radius: 10px;
          font-size: 12px;
          font-weight: 600;
        }

        .reg-loading {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 80px 20px;
        }

        .reg-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(255,255,255,0.1);
          border-top-color: #a5b4fc;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .reg-empty {
          text-align: center;
          padding: 60px 20px;
          color: rgba(255,255,255,0.3);
        }

        .reg-empty svg {
          margin-bottom: 12px;
          opacity: 0.5;
        }

        .reg-table {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px;
          overflow: hidden;
        }

        .reg-table-head {
          display: grid;
          grid-template-columns: 150px 180px 140px 140px 120px;
          gap: 16px;
          padding: 16px 20px;
          background: rgba(0,0,0,0.2);
          border-bottom: 1px solid rgba(255,255,255,0.07);
          font-size: 11px;
          font-weight: 700;
          color: rgba(255,255,255,0.4);
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }

        .reg-table-row {
          display: grid;
          grid-template-columns: 150px 180px 140px 140px 120px;
          gap: 16px;
          align-items: center;
          padding: 16px 20px;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          transition: background 0.15s;
        }

        .reg-table-row:hover {
          background: rgba(255,255,255,0.02);
        }

        .reg-name {
          color: #f0f4ff;
          font-weight: 600;
          font-size: 13px;
        }

        .reg-email {
          color: rgba(255,255,255,0.5);
          font-size: 12px;
        }

        .reg-embg {
          color: rgba(255,255,255,0.5);
          font-size: 12px;
          font-family: 'Courier New', monospace;
        }

        .reg-date {
          color: rgba(255,255,255,0.4);
          font-size: 12px;
        }

        .reg-actions {
          display: flex;
          gap: 8px;
        }

        .reg-btn-view {
          background: rgba(59,130,246,0.15);
          border: 1px solid rgba(59,130,246,0.3);
          color: #60a5fa;
          border-radius: 7px;
          padding: 7px 12px;
          font-size: 11px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 4px;
          transition: all 0.15s;
          font-family: inherit;
        }

        .reg-btn-view:hover {
          background: rgba(59,130,246,0.25);
          border-color: rgba(59,130,246,0.5);
        }

        .reg-btn-approve {
          background: rgba(16,185,129,0.15);
          border: 1px solid rgba(16,185,129,0.3);
          color: #34d399;
          padding: 7px 10px;
          border-radius: 7px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.15s;
          font-family: inherit;
        }

        .reg-btn-approve:hover {
          background: rgba(16,185,129,0.25);
          border-color: rgba(16,185,129,0.5);
        }

        .reg-btn-reject {
          background: rgba(239,68,68,0.15);
          border: 1px solid rgba(239,68,68,0.3);
          color: #f87171;
          padding: 7px 10px;
          border-radius: 7px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.15s;
          font-family: inherit;
        }

        .reg-btn-reject:hover {
          background: rgba(239,68,68,0.25);
          border-color: rgba(239,68,68,0.5);
        }

        .reg-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.8);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 24px;
        }

        .reg-modal {
          background: linear-gradient(135deg, #0f1f50 0%, #1a2a60 100%);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 24px;
          width: 100%;
          max-width: 680px;
          box-shadow: 0 24px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          max-height: 90vh;
          overflow-y: auto;
        }

        .reg-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 28px 32px;
          border-bottom: 1px solid rgba(255,255,255,0.08);
          background: rgba(0,0,0,0.2);
          flex-shrink: 0;
        }

        .reg-modal-header h3 {
          font-size: 18px;
          font-weight: 700;
          color: #f0f4ff;
          margin: 0;
          letter-spacing: -0.3px;
        }

        .reg-modal-close {
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          color: rgba(255,255,255,0.5);
          padding: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.15s;
          font-family: inherit;
        }

        .reg-modal-close:hover {
          background: rgba(255,255,255,0.12);
          color: #f0f4ff;
        }

        .reg-modal-body {
          padding: 32px;
          flex: 1;
          overflow-y: auto;
        }

        .reg-photo {
          width: 100%;
          height: 280px;
          object-fit: cover;
          border-radius: 12px;
          margin-bottom: 24px;
          border: 1px solid rgba(255,255,255,0.1);
        }

        .reg-info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 18px;
          margin-bottom: 28px;
        }

        .reg-info-item {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .reg-info-label {
          font-size: 10px;
          font-weight: 700;
          color: rgba(255,255,255,0.3);
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .reg-info-value {
          font-size: 14px;
          font-weight: 600;
          color: #f0f4ff;
        }

        .reg-divider {
          height: 1px;
          background: rgba(255,255,255,0.08);
          margin: 24px 0;
        }

        .reg-form-group {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 18px;
        }

        .reg-form-group label {
          font-size: 11px;
          font-weight: 700;
          color: rgba(255,255,255,0.35);
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .reg-form-input {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          color: #f0f4ff;
          padding: 12px 14px;
          font-size: 13px;
          font-family: inherit;
          outline: none;
          transition: all 0.2s;
          min-height: 100px;
          resize: vertical;
        }

        .reg-form-input:focus {
          border-color: rgba(59,130,246,0.5);
          background: rgba(255,255,255,0.08);
          box-shadow: 0 0 0 3px rgba(59,130,246,0.1);
        }

        .reg-modal-footer {
          display: flex;
          gap: 12px;
          padding: 20px 32px;
          border-top: 1px solid rgba(255,255,255,0.08);
          background: rgba(0,0,0,0.2);
          flex-shrink: 0;
        }

        .reg-btn-cancel {
          flex: 1;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.1);
          color: #f0f4ff;
          padding: 12px 18px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          font-family: inherit;
        }

        .reg-btn-cancel:hover {
          background: rgba(255,255,255,0.12);
          border-color: rgba(255,255,255,0.15);
        }

        .reg-reject-btn {
          flex: 1;
          background: linear-gradient(135deg, rgba(239,68,68,0.8), rgba(220,38,38,0.8));
          border: 1px solid rgba(239,68,68,0.3);
          color: #fff;
          padding: 12px 18px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          font-family: inherit;
        }

        .reg-reject-btn:hover {
          background: linear-gradient(135deg, rgba(220,38,38,1), rgba(190,24,24,1));
          box-shadow: 0 8px 20px rgba(239,68,68,0.3);
        }

        .reg-approve-btn {
          flex: 1;
          background: linear-gradient(135deg, rgba(16,185,129,0.8), rgba(5,150,105,0.8));
          border: 1px solid rgba(16,185,129,0.3);
          color: #fff;
          padding: 12px 18px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          font-family: inherit;
        }

        .reg-approve-btn:hover {
          background: linear-gradient(135deg, rgba(5,150,105,1), rgba(4,120,87,1));
          box-shadow: 0 8px 20px rgba(16,185,129,0.3);
        }

        .reg-toast {
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 9999;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 14px 20px;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 600;
          animation: slideIn 0.3s ease;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(100px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .reg-toast--ok {
          background: rgba(16,185,129,0.2);
          border: 1px solid rgba(16,185,129,0.3);
          color: #34d399;
        }

        .reg-toast--err {
          background: rgba(239,68,68,0.2);
          border: 1px solid rgba(239,68,68,0.3);
          color: #f87171;
        }

        @media (max-width: 768px) {
          .reg-table-head,
          .reg-table-row {
            grid-template-columns: 1fr;
          }

          .reg-modal {
            max-width: 95vw;
          }

          .reg-info-grid {
            grid-template-columns: 1fr;
          }

          .reg-modal-footer {
            flex-direction: column;
          }
        }
      `}</style>

      {toast && (
        <div className={`reg-toast ${toast.type === 'error' ? 'reg-toast--err' : 'reg-toast--ok'}`}>
          {toast.type === 'error' ? <AlertCircle size={14} /> : <Check size={14} />}
          {toast.msg}
        </div>
      )}

      <div className="reg-panel">
        <div className="reg-panel-header">
          <div>
            <h1>Regjistrime në pritje</h1>
            <p>{users.length} kërkesa aktive për aprovim</p>
          </div>
          <div className="reg-panel-badge">
            <Clock size={14} /> Pending
          </div>
        </div>

        {loading ? (
          <div className="reg-loading">
            <div className="reg-spinner" />
          </div>
        ) : users.length === 0 ? (
          <div className="reg-empty">
            <UserCheck size={40} />
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
                  <button className="reg-btn-view" onClick={() => setSelected(u)}>
                    <Eye size={13} /> Shiko
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {selected && (
          <div className="reg-overlay" onClick={() => setSelected(null)}>
            <div className="reg-modal" onClick={e => e.stopPropagation()}>
              <div className="reg-modal-header">
                <h3>{selected.first_name} {selected.last_name}</h3>
                <button className="reg-modal-close" onClick={() => setSelected(null)}>
                  <X size={18} />
                </button>
              </div>

              <div className="reg-modal-body">
                {selected.photo_signed_url && (
                  <img src={selected.photo_signed_url} alt="ID Document" className="reg-photo" />
                )}

                <div className="reg-info-grid">
                  <div className="reg-info-item">
                    <span className="reg-info-label">Email</span>
                    <span className="reg-info-value">{selected.email}</span>
                  </div>
                  <div className="reg-info-item">
                    <span className="reg-info-label">EMBG</span>
                    <span className="reg-info-value">{selected.personal_id}</span>
                  </div>
                  <div className="reg-info-item">
                    <span className="reg-info-label">Regjistruar</span>
                    <span className="reg-info-value">{new Date(selected.created_at).toLocaleDateString('sq-AL')}</span>
                  </div>
                  <div className="reg-info-item">
                    <span className="reg-info-label">Statusi</span>
                    <span className="reg-info-value" style={{ color: '#f59e0b' }}>⏳ Në pritje</span>
                  </div>
                </div>

                <div className="reg-divider"></div>

                <div className="reg-form-group">
                  <label>ARSYEJA E REFUZIMIT (nëse refuzoni)</label>
                  <textarea
                    className="reg-form-input"
                    placeholder="p.sh. Dokumenti nuk është i qartë, Të dhënat nuk përputhen, etj..."
                    value={rejectReason}
                    onChange={e => setRejectReason(e.target.value)}
                  />
                </div>
              </div>

              <div className="reg-modal-footer">
                <button className="reg-btn-cancel" onClick={() => setSelected(null)}>
                  Anulo
                </button>
                <button className="reg-reject-btn" onClick={() => reject(selected.id)}>
                  <X size={16} /> Refuzo
                </button>
                <button className="reg-approve-btn" onClick={() => approve(selected.id)}>
                  <Check size={16} /> Aprovo
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default RegistrationPanel