import { useState, useEffect } from 'react'
import API from '../../api/axios'
import { AlertTriangle, Plus, Check, X, AlertCircle } from 'lucide-react'

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
      const [f, u] = await Promise.all([API.get('/fines'), API.get('/users')])
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
    if (!form.user_id || !form.amount) return showToast('Plotëso fushat e detyruara.', 'error')
    try {
      await API.post('/fines', { ...form, amount: parseFloat(form.amount) })
      setShowAdd(false)
      setForm({ user_id:'', type:'Traffic Violation', amount:'', fine_date:'', description:'' })
      fetchAll()
      showToast('Gjoba u shtua me sukses.')
    } catch { showToast('Gabim gjatë shtimit.', 'error') }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        .gj-root { font-family: 'DM Sans', sans-serif; }

        .gj-toast {
          position: fixed; top: 20px; right: 20px; z-index: 9999;
          display: flex; align-items: center; gap: 8px;
          padding: 11px 16px; border-radius: 8px;
          font-size: 13px; font-weight: 500;
          box-shadow: 0 4px 16px rgba(0,0,0,0.08);
          border: 1px solid; font-family: 'DM Sans', sans-serif;
        }
        .gj-toast.ok  { background: #f0fdf4; border-color: #bbf7d0; color: #15803d; }
        .gj-toast.err { background: #fef2f2; border-color: #fecaca; color: #dc2626; }

        .gj-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
        .gj-header h1 { font-size: 18px; font-weight: 700; color: #0c1220; letter-spacing: -0.02em; }
        .gj-header p { font-size: 13px; color: #8a929e; margin-top: 2px; }

        .gj-add-btn {
          display: flex; align-items: center; gap: 6px;
          background: #0c1220; color: #fff;
          border: none; border-radius: 8px;
          padding: 9px 16px; font-size: 13px; font-weight: 600;
          cursor: pointer; font-family: 'DM Sans', sans-serif;
          transition: background 0.1s;
        }
        .gj-add-btn:hover { background: #1a2540; }

        .gj-loading { display: flex; justify-content: center; padding: 80px 0; }
        .gj-spinner {
          width: 24px; height: 24px;
          border: 2px solid #e5e7eb; border-top-color: #0c1220;
          border-radius: 50%; animation: gj-spin 0.6s linear infinite;
        }
        @keyframes gj-spin { to { transform: rotate(360deg); } }

        .gj-empty {
          background: #fff; border: 1px solid #e5e7eb; border-radius: 12px;
          padding: 64px; text-align: center;
        }
        .gj-empty-icon {
          width: 48px; height: 48px; border-radius: 12px;
          background: #f5f6f8; display: flex; align-items: center; justify-content: center;
          margin: 0 auto 16px; color: #9ca3af;
        }
        .gj-empty h3 { font-size: 15px; font-weight: 600; color: #374151; margin-bottom: 6px; }
        .gj-empty p  { font-size: 13px; color: #9ca3af; }

        .gj-table { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; }

        .gj-table-head {
          display: grid;
          grid-template-columns: 1fr 1fr 120px 120px 100px;
          gap: 12px; padding: 11px 20px;
          background: #f9fafb; border-bottom: 1px solid #e5e7eb;
        }
        .gj-th { font-size: 11px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; }

        .gj-row {
          display: grid;
          grid-template-columns: 1fr 1fr 120px 120px 100px;
          gap: 12px; align-items: center;
          padding: 13px 20px;
          border-bottom: 1px solid #f3f4f6;
          transition: background 0.1s;
        }
        .gj-row:last-child { border-bottom: none; }
        .gj-row:hover { background: #fafbfc; }

        .gj-user-name  { font-size: 13px; font-weight: 600; color: #111827; }
        .gj-user-email { font-size: 11px; color: #9ca3af; margin-top: 2px; }
        .gj-type       { font-size: 13px; color: #374151; font-weight: 500; }
        .gj-amount     { font-size: 13px; font-weight: 700; color: #0c1220; }
        .gj-date       { font-size: 12px; color: #6b7280; }

        .gj-badge-paid    { display: inline-flex; align-items: center; gap: 5px; background: #f0fdf4; border: 1px solid #bbf7d0; color: #15803d; border-radius: 20px; padding: 3px 10px; font-size: 11px; font-weight: 600; }
        .gj-badge-unpaid  { display: inline-flex; align-items: center; gap: 5px; background: #fffbeb; border: 1px solid #fde68a; color: #92400e; border-radius: 20px; padding: 3px 10px; font-size: 11px; font-weight: 600; }
        .gj-dot-g { width: 5px; height: 5px; border-radius: 50%; background: #22c55e; }
        .gj-dot-y { width: 5px; height: 5px; border-radius: 50%; background: #f59e0b; }

        /* Modal */
        .gj-overlay {
          position: fixed; inset: 0;
          background: rgba(12,18,32,0.5); backdrop-filter: blur(2px);
          display: flex; align-items: center; justify-content: center;
          z-index: 1000; padding: 24px;
        }
        .gj-modal {
          background: #fff; border: 1px solid #e5e7eb; border-radius: 14px;
          width: 100%; max-width: 480px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.12);
        }
        .gj-modal-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 18px 22px; border-bottom: 1px solid #f3f4f6;
        }
        .gj-modal-header h3 { font-size: 15px; font-weight: 700; color: #0c1220; }
        .gj-modal-close {
          background: #f5f6f8; border: none; border-radius: 6px;
          color: #6b7280; padding: 6px; cursor: pointer; display: flex;
          transition: background 0.1s;
        }
        .gj-modal-close:hover { background: #eaecf0; }

        .gj-modal-body { padding: 22px; display: flex; flex-direction: column; gap: 14px; }

        .gj-form-group { display: flex; flex-direction: column; gap: 5px; }
        .gj-form-label { font-size: 11px; font-weight: 600; color: #374151; text-transform: uppercase; letter-spacing: 0.04em; }

        .gj-select, .gj-input {
          width: 100%;
          padding: 10px 12px;
          font-size: 13px; font-family: 'DM Sans', sans-serif;
          color: #111827;
          background: #f9fafb;
          border: 1.5px solid #e5e7eb;
          border-radius: 8px; outline: none;
          transition: border-color 0.15s, background 0.15s;
          appearance: none;
        }
        .gj-select:focus, .gj-input:focus { border-color: #0c1220; background: #fff; }
        .gj-input::placeholder { color: #d1d5db; }

        .gj-row2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

        .gj-modal-footer {
          display: flex; gap: 8px; padding: 16px 22px;
          border-top: 1px solid #f3f4f6;
        }
        .gj-btn-cancel {
          flex: 1; padding: 10px; background: #fff; border: 1px solid #e5e7eb;
          color: #6b7280; border-radius: 8px; font-size: 13px; font-weight: 600;
          cursor: pointer; font-family: 'DM Sans', sans-serif; transition: background 0.1s;
        }
        .gj-btn-cancel:hover { background: #f9fafb; }
        .gj-btn-confirm {
          flex: 2; display: flex; align-items: center; justify-content: center; gap: 6px;
          padding: 10px; background: #0c1220; border: none;
          color: #fff; border-radius: 8px; font-size: 13px; font-weight: 600;
          cursor: pointer; font-family: 'DM Sans', sans-serif; transition: background 0.1s;
        }
        .gj-btn-confirm:hover { background: #1a2540; }
      `}</style>

      <div className="gj-root">
        {toast && (
          <div className={`gj-toast ${toast.type === 'error' ? 'err' : 'ok'}`}>
            {toast.type === 'error' ? <AlertCircle size={14}/> : <Check size={14}/>}
            {toast.msg}
          </div>
        )}

        <div className="gj-header">
          <div>
            <h1>Gjoba</h1>
            <p>Menaxhoni gjobat e qytetarëve</p>
          </div>
          <button className="gj-add-btn" onClick={() => setShowAdd(true)}>
            <Plus size={15}/> Shto gjobë
          </button>
        </div>

        {loading ? (
          <div className="gj-loading"><div className="gj-spinner"/></div>
        ) : fines.length === 0 ? (
          <div className="gj-empty">
            <div className="gj-empty-icon"><AlertTriangle size={22}/></div>
            <h3>Nuk ka gjoba</h3>
            <p>Nuk janë regjistruar gjoba ende.</p>
          </div>
        ) : (
          <div className="gj-table">
            <div className="gj-table-head">
              <div className="gj-th">Qytetari</div>
              <div className="gj-th">Lloji</div>
              <div className="gj-th">Shuma</div>
              <div className="gj-th">Data</div>
              <div className="gj-th">Statusi</div>
            </div>
            {fines.map(f => (
              <div key={f.id} className="gj-row">
                <div>
                  <div className="gj-user-name">{f.users?.first_name} {f.users?.last_name}</div>
                  <div className="gj-user-email">{f.users?.email}</div>
                </div>
                <div className="gj-type">{f.type}</div>
                <div className="gj-amount">{f.amount} MKD</div>
                <div className="gj-date">{f.fine_date ? new Date(f.fine_date).toLocaleDateString('sq-AL') : '—'}</div>
                <div>
                  {f.status === 'paid'
                    ? <span className="gj-badge-paid"><div className="gj-dot-g"/>Paguar</span>
                    : <span className="gj-badge-unpaid"><div className="gj-dot-y"/>Pa paguar</span>
                  }
                </div>
              </div>
            ))}
          </div>
        )}

        {showAdd && (
          <div className="gj-overlay" onClick={() => setShowAdd(false)}>
            <div className="gj-modal" onClick={e => e.stopPropagation()}>
              <div className="gj-modal-header">
                <h3>Shto gjobë të re</h3>
                <button className="gj-modal-close" onClick={() => setShowAdd(false)}><X size={16}/></button>
              </div>
              <div className="gj-modal-body">
                <div className="gj-form-group">
                  <label className="gj-form-label">Qytetari *</label>
                  <select className="gj-select" value={form.user_id} onChange={e => setForm({...form, user_id: e.target.value})}>
                    <option value="">Zgjidhni qytetarin</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.first_name} {u.last_name} — {u.personal_id}</option>
                    ))}
                  </select>
                </div>
                <div className="gj-form-group">
                  <label className="gj-form-label">Lloji i gjobës *</label>
                  <select className="gj-select" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                    {FINE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="gj-row2">
                  <div className="gj-form-group">
                    <label className="gj-form-label">Shuma (MKD) *</label>
                    <input className="gj-input" type="number" placeholder="0.00" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})}/>
                  </div>
                  <div className="gj-form-group">
                    <label className="gj-form-label">Data e gjobës</label>
                    <input className="gj-input" type="date" value={form.fine_date} onChange={e => setForm({...form, fine_date: e.target.value})}/>
                  </div>
                </div>
                <div className="gj-form-group">
                  <label className="gj-form-label">Përshkrim</label>
                  <input className="gj-input" placeholder="Detaje shtesë (opsionale)" value={form.description} onChange={e => setForm({...form, description: e.target.value})}/>
                </div>
              </div>
              <div className="gj-modal-footer">
                <button className="gj-btn-cancel" onClick={() => setShowAdd(false)}>Anulo</button>
                <button className="gj-btn-confirm" onClick={addFine}><Plus size={14}/> Shto gjobën</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default GjobaPanel