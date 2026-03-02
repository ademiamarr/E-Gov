import { useState, useEffect } from 'react'
import API from '../../api/axios'
import { Calendar, Check, X, AlertCircle } from 'lucide-react'

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
      showToast('Termini u përditësua.')
    } catch { showToast('Gabim.', 'error') }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        .ap-root { font-family: 'DM Sans', sans-serif; }

        .ap-toast {
          position: fixed; top: 20px; right: 20px; z-index: 9999;
          display: flex; align-items: center; gap: 8px;
          padding: 11px 16px; border-radius: 8px;
          font-size: 13px; font-weight: 500;
          box-shadow: 0 4px 16px rgba(0,0,0,0.08);
          border: 1px solid; font-family: 'DM Sans', sans-serif;
        }
        .ap-toast.ok  { background: #f0fdf4; border-color: #bbf7d0; color: #15803d; }
        .ap-toast.err { background: #fef2f2; border-color: #fecaca; color: #dc2626; }

        .ap-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
        .ap-header h1 { font-size: 18px; font-weight: 700; color: #0c1220; letter-spacing: -0.02em; }
        .ap-header p { font-size: 13px; color: #8a929e; margin-top: 2px; }

        .ap-count-badge {
          display: flex; align-items: center; gap: 6px;
          background: #fff; border: 1px solid #e5e7eb;
          border-radius: 20px; padding: 6px 14px;
          font-size: 12px; font-weight: 600; color: #374151;
        }
        .ap-count-dot { width: 7px; height: 7px; border-radius: 50%; background: #f59e0b; }

        .ap-loading { display: flex; justify-content: center; padding: 80px 0; }
        .ap-spinner {
          width: 24px; height: 24px;
          border: 2px solid #e5e7eb; border-top-color: #0c1220;
          border-radius: 50%; animation: ap-spin 0.6s linear infinite;
        }
        @keyframes ap-spin { to { transform: rotate(360deg); } }

        .ap-empty {
          background: #fff; border: 1px solid #e5e7eb; border-radius: 12px;
          padding: 64px; text-align: center;
        }
        .ap-empty-icon {
          width: 48px; height: 48px; border-radius: 12px;
          background: #f5f6f8; display: flex; align-items: center; justify-content: center;
          margin: 0 auto 16px; color: #9ca3af;
        }
        .ap-empty h3 { font-size: 15px; font-weight: 600; color: #374151; margin-bottom: 6px; }
        .ap-empty p  { font-size: 13px; color: #9ca3af; }

        .ap-table { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; }

        .ap-table-head {
          display: grid;
          grid-template-columns: 1fr 1fr 130px 110px 100px;
          gap: 12px; padding: 11px 20px;
          background: #f9fafb; border-bottom: 1px solid #e5e7eb;
        }
        .ap-th { font-size: 11px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; }

        .ap-row {
          display: grid;
          grid-template-columns: 1fr 1fr 130px 110px 100px;
          gap: 12px; align-items: center;
          padding: 13px 20px;
          border-bottom: 1px solid #f3f4f6;
          transition: background 0.1s;
        }
        .ap-row:last-child { border-bottom: none; }
        .ap-row:hover { background: #fafbfc; }

        .ap-user-name { font-size: 13px; font-weight: 600; color: #111827; }
        .ap-user-sub  { font-size: 11px; color: #9ca3af; margin-top: 1px; }
        .ap-reason    { font-size: 13px; color: #374151; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .ap-date      { font-size: 12px; color: #6b7280; }

        .ap-badge-pending  { display: inline-flex; align-items: center; gap: 5px; background: #fffbeb; border: 1px solid #fde68a; color: #92400e; border-radius: 20px; padding: 3px 10px; font-size: 11px; font-weight: 600; }
        .ap-badge-approved { display: inline-flex; align-items: center; gap: 5px; background: #f0fdf4; border: 1px solid #bbf7d0; color: #15803d; border-radius: 20px; padding: 3px 10px; font-size: 11px; font-weight: 600; }
        .ap-badge-rejected { display: inline-flex; align-items: center; gap: 5px; background: #fef2f2; border: 1px solid #fecaca; color: #dc2626; border-radius: 20px; padding: 3px 10px; font-size: 11px; font-weight: 600; }
        .ap-dot-y { width: 5px; height: 5px; border-radius: 50%; background: #f59e0b; }
        .ap-dot-g { width: 5px; height: 5px; border-radius: 50%; background: #22c55e; }
        .ap-dot-r { width: 5px; height: 5px; border-radius: 50%; background: #ef4444; }

        .ap-btn-manage {
          background: #f5f6f8; border: 1px solid #e5e7eb;
          color: #374151; border-radius: 6px;
          padding: 6px 12px; font-size: 12px; font-weight: 600;
          cursor: pointer; font-family: 'DM Sans', sans-serif;
          transition: all 0.1s;
        }
        .ap-btn-manage:hover { background: #eaecf0; border-color: #d1d5db; }

        /* Modal */
        .ap-overlay {
          position: fixed; inset: 0;
          background: rgba(12,18,32,0.5); backdrop-filter: blur(2px);
          display: flex; align-items: center; justify-content: center;
          z-index: 1000; padding: 24px;
        }
        .ap-modal {
          background: #fff; border: 1px solid #e5e7eb; border-radius: 14px;
          width: 100%; max-width: 440px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.12);
        }
        .ap-modal-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 18px 22px; border-bottom: 1px solid #f3f4f6;
        }
        .ap-modal-header h3 { font-size: 15px; font-weight: 700; color: #0c1220; }
        .ap-modal-close {
          background: #f5f6f8; border: none; border-radius: 6px;
          color: #6b7280; padding: 6px; cursor: pointer; display: flex;
          transition: background 0.1s;
        }
        .ap-modal-close:hover { background: #eaecf0; }

        .ap-modal-body { padding: 22px; display: flex; flex-direction: column; gap: 14px; }

        .ap-modal-info {
          background: #f9fafb; border: 1px solid #f3f4f6; border-radius: 8px;
          padding: 12px 14px; display: flex; flex-direction: column; gap: 6px;
        }
        .ap-modal-info span { font-size: 13px; color: #374151; display: flex; align-items: center; gap: 6px; }

        .ap-form-group { display: flex; flex-direction: column; gap: 5px; }
        .ap-form-label { font-size: 11px; font-weight: 600; color: #374151; text-transform: uppercase; letter-spacing: 0.04em; }

        .ap-select, .ap-input {
          width: 100%; padding: 10px 12px;
          font-size: 13px; font-family: 'DM Sans', sans-serif;
          color: #111827; background: #f9fafb;
          border: 1.5px solid #e5e7eb; border-radius: 8px; outline: none;
          transition: border-color 0.15s, background 0.15s;
          appearance: none;
        }
        .ap-select:focus, .ap-input:focus { border-color: #0c1220; background: #fff; }
        .ap-input::placeholder { color: #d1d5db; }

        .ap-modal-footer {
          display: flex; gap: 8px; padding: 16px 22px; border-top: 1px solid #f3f4f6;
        }
        .ap-btn-cancel {
          flex: 1; padding: 10px; background: #fff; border: 1px solid #e5e7eb;
          color: #6b7280; border-radius: 8px; font-size: 13px; font-weight: 600;
          cursor: pointer; font-family: 'DM Sans', sans-serif; transition: background 0.1s;
        }
        .ap-btn-cancel:hover { background: #f9fafb; }
        .ap-btn-confirm {
          flex: 2; display: flex; align-items: center; justify-content: center; gap: 6px;
          padding: 10px; background: #0c1220; border: none;
          color: #fff; border-radius: 8px; font-size: 13px; font-weight: 600;
          cursor: pointer; font-family: 'DM Sans', sans-serif; transition: background 0.1s;
        }
        .ap-btn-confirm:hover { background: #1a2540; }
      `}</style>

      <div className="ap-root">
        {toast && (
          <div className={`ap-toast ${toast.type === 'error' ? 'err' : 'ok'}`}>
            {toast.type === 'error' ? <AlertCircle size={14}/> : <Check size={14}/>}
            {toast.msg}
          </div>
        )}

        <div className="ap-header">
          <div>
            <h1>Terminë MVR</h1>
            <p>Ministria e Punëve të Brendshme</p>
          </div>
          <div className="ap-count-badge">
            <div className="ap-count-dot"/>
            {appointments.filter(a => a.status === 'pending').length} në pritje
          </div>
        </div>

        {loading ? (
          <div className="ap-loading"><div className="ap-spinner"/></div>
        ) : appointments.length === 0 ? (
          <div className="ap-empty">
            <div className="ap-empty-icon"><Calendar size={22}/></div>
            <h3>Nuk ka termine MVR</h3>
            <p>Nuk janë regjistruar termine ende.</p>
          </div>
        ) : (
          <div className="ap-table">
            <div className="ap-table-head">
              <div className="ap-th">Qytetari</div>
              <div className="ap-th">Shërbimi</div>
              <div className="ap-th">Data kërkuar</div>
              <div className="ap-th">Statusi</div>
              <div className="ap-th">Veprime</div>
            </div>
            {appointments.map(a => (
              <div key={a.id} className="ap-row">
                <div>
                  <div className="ap-user-name">{a.users?.first_name} {a.users?.last_name}</div>
                  <div className="ap-user-sub">{a.users?.personal_id}</div>
                </div>
                <div className="ap-reason">{a.reason}</div>
                <div className="ap-date">{a.appointment_date ? new Date(a.appointment_date).toLocaleDateString('sq-AL') : '—'}</div>
                <div>
                  {a.status === 'pending'  && <span className="ap-badge-pending"><div className="ap-dot-y"/>Në pritje</span>}
                  {a.status === 'approved' && <span className="ap-badge-approved"><div className="ap-dot-g"/>Aprovuar</span>}
                  {a.status === 'rejected' && <span className="ap-badge-rejected"><div className="ap-dot-r"/>Refuzuar</span>}
                </div>
                <button className="ap-btn-manage" onClick={() => { setSelected(a); setForm({ status:'approved', admin_note:'', approved_date:'' }) }}>
                  Menaxho
                </button>
              </div>
            ))}
          </div>
        )}

        {selected && (
          <div className="ap-overlay" onClick={() => setSelected(null)}>
            <div className="ap-modal" onClick={e => e.stopPropagation()}>
              <div className="ap-modal-header">
                <h3>Menaxho termin</h3>
                <button className="ap-modal-close" onClick={() => setSelected(null)}><X size={16}/></button>
              </div>
              <div className="ap-modal-body">
                <div className="ap-modal-info">
                  <span><strong>Qytetari:</strong> {selected.users?.first_name} {selected.users?.last_name}</span>
                  <span><strong>Shërbimi:</strong> {selected.reason}</span>
                  <span><strong>Email:</strong> {selected.users?.email}</span>
                </div>
                <div className="ap-form-group">
                  <label className="ap-form-label">Vendimi</label>
                  <select className="ap-select" value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                    <option value="approved">Aprovo termin</option>
                    <option value="rejected">Refuzo termin</option>
                  </select>
                </div>
                {form.status === 'approved' && (
                  <div className="ap-form-group">
                    <label className="ap-form-label">Data e konfirmuar</label>
                    <input type="datetime-local" className="ap-input" value={form.approved_date} onChange={e => setForm({...form, approved_date: e.target.value})}/>
                  </div>
                )}
                <div className="ap-form-group">
                  <label className="ap-form-label">Shënim (opsionale)</label>
                  <input className="ap-input" placeholder="Shënim për qytetarin..." value={form.admin_note} onChange={e => setForm({...form, admin_note: e.target.value})}/>
                </div>
              </div>
              <div className="ap-modal-footer">
                <button className="ap-btn-cancel" onClick={() => setSelected(null)}>Anulo</button>
                <button className="ap-btn-confirm" onClick={update}><Check size={14}/> Konfirmo</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default MVRPanel