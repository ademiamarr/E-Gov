import { useState, useEffect } from 'react'
import API from '../../api/axios'
import { MapPin, Check, X, AlertCircle } from 'lucide-react'

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
      showToast('Termini u përditësua.')
    } catch { showToast('Gabim.', 'error') }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        .ko-root { font-family: 'DM Sans', sans-serif; }

        .ko-toast {
          position: fixed; top: 20px; right: 20px; z-index: 9999;
          display: flex; align-items: center; gap: 8px;
          padding: 11px 16px; border-radius: 8px;
          font-size: 13px; font-weight: 500;
          box-shadow: 0 4px 16px rgba(0,0,0,0.08);
          border: 1px solid; font-family: 'DM Sans', sans-serif;
        }
        .ko-toast.ok  { background: #f0fdf4; border-color: #bbf7d0; color: #15803d; }
        .ko-toast.err { background: #fef2f2; border-color: #fecaca; color: #dc2626; }

        .ko-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
        .ko-header h1 { font-size: 18px; font-weight: 700; color: #1e3a8a; letter-spacing: -0.02em; }
        .ko-header p  { font-size: 13px; color: #8a929e; margin-top: 2px; }

        .ko-count-badge {
          display: flex; align-items: center; gap: 6px;
          background: #fff; border: 1px solid #e5e7eb;
          border-radius: 20px; padding: 6px 14px;
          font-size: 12px; font-weight: 600; color: #374151;
        }
        .ko-count-dot { width: 7px; height: 7px; border-radius: 50%; background: #f59e0b; }

        .ko-loading { display: flex; justify-content: center; padding: 80px 0; }
        .ko-spinner {
          width: 24px; height: 24px;
          border: 2px solid #e5e7eb; border-top-color: #1e3a8a;
          border-radius: 50%; animation: ko-spin 0.6s linear infinite;
        }
        @keyframes ko-spin { to { transform: rotate(360deg); } }

        .ko-empty {
          background: #fff; border: 1px solid #e5e7eb; border-radius: 12px;
          padding: 64px; text-align: center;
        }
        .ko-empty-icon {
          width: 48px; height: 48px; border-radius: 12px;
          background: #f5f6f8; display: flex; align-items: center; justify-content: center;
          margin: 0 auto 16px; color: #9ca3af;
        }
        .ko-empty h3 { font-size: 15px; font-weight: 600; color: #374151; margin-bottom: 6px; }
        .ko-empty p  { font-size: 13px; color: #9ca3af; }

        .ko-table { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; }

        .ko-table-head {
          display: grid;
          grid-template-columns: 1fr 1fr 130px 110px 100px;
          gap: 12px; padding: 11px 20px;
          background: #f9fafb; border-bottom: 1px solid #e5e7eb;
        }
        .ko-th { font-size: 11px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; }

        .ko-row {
          display: grid;
          grid-template-columns: 1fr 1fr 130px 110px 100px;
          gap: 12px; align-items: center;
          padding: 13px 20px;
          border-bottom: 1px solid #f3f4f6;
          transition: background 0.1s;
        }
        .ko-row:last-child { border-bottom: none; }
        .ko-row:hover { background: #fafbfc; }

        .ko-user-name { font-size: 13px; font-weight: 600; color: #111827; }
        .ko-user-sub  { font-size: 11px; color: #9ca3af; margin-top: 1px; }
        .ko-reason    { font-size: 13px; color: #374151; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .ko-date      { font-size: 12px; color: #6b7280; }

        .ko-badge-pending  { display: inline-flex; align-items: center; gap: 5px; background: #fffbeb; border: 1px solid #fde68a; color: #92400e; border-radius: 20px; padding: 3px 10px; font-size: 11px; font-weight: 600; }
        .ko-badge-approved { display: inline-flex; align-items: center; gap: 5px; background: #f0fdf4; border: 1px solid #bbf7d0; color: #15803d; border-radius: 20px; padding: 3px 10px; font-size: 11px; font-weight: 600; }
        .ko-badge-rejected { display: inline-flex; align-items: center; gap: 5px; background: #fef2f2; border: 1px solid #fecaca; color: #dc2626; border-radius: 20px; padding: 3px 10px; font-size: 11px; font-weight: 600; }
        .ko-dot-y { width: 5px; height: 5px; border-radius: 50%; background: #f59e0b; }
        .ko-dot-g { width: 5px; height: 5px; border-radius: 50%; background: #22c55e; }
        .ko-dot-r { width: 5px; height: 5px; border-radius: 50%; background: #ef4444; }

        .ko-btn-manage {
          background: #f5f6f8; border: 1px solid #e5e7eb;
          color: #1e3a8a; border-radius: 6px;
          padding: 6px 12px; font-size: 12px; font-weight: 600;
          cursor: pointer; font-family: 'DM Sans', sans-serif;
          transition: all 0.1s;
        }
        .ko-btn-manage:hover { background: #eff6ff; border-color: #bfdbfe; }

        .ko-overlay {
          position: fixed; inset: 0;
          background: rgba(30,58,138,0.5); backdrop-filter: blur(2px);
          display: flex; align-items: center; justify-content: center;
          z-index: 1000; padding: 24px;
        }
        .ko-modal {
          background: #fff; border: 1px solid #e5e7eb; border-radius: 14px;
          width: 100%; max-width: 440px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.12);
        }
        .ko-modal-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 18px 22px; border-bottom: 1px solid #f3f4f6;
        }
        .ko-modal-header h3 { font-size: 15px; font-weight: 700; color: #1e3a8a; }
        .ko-modal-close {
          background: #f5f6f8; border: none; border-radius: 6px;
          color: #6b7280; padding: 6px; cursor: pointer; display: flex;
          transition: background 0.1s;
        }
        .ko-modal-close:hover { background: #eaecf0; }

        .ko-modal-body { padding: 22px; display: flex; flex-direction: column; gap: 14px; }

        .ko-modal-info {
          background: #f9fafb; border: 1px solid #f3f4f6; border-radius: 8px;
          padding: 12px 14px; display: flex; flex-direction: column; gap: 6px;
        }
        .ko-modal-info span { font-size: 13px; color: #1e3a8a; }

        .ko-form-group { display: flex; flex-direction: column; gap: 5px; }
        .ko-form-label { font-size: 11px; font-weight: 600; color: #1e3a8a; text-transform: uppercase; letter-spacing: 0.04em; }

        .ko-select, .ko-input {
          width: 100%; padding: 10px 12px;
          font-size: 13px; font-family: 'DM Sans', sans-serif;
          color: #111827; background: #f9fafb;
          border: 1.5px solid #e5e7eb; border-radius: 8px; outline: none;
          transition: border-color 0.15s, background 0.15s;
          appearance: none;
        }
        .ko-select:focus, .ko-input:focus { border-color: #1e3a8a; background: #fff; }
        .ko-input::placeholder { color: #d1d5db; }

        .ko-modal-footer {
          display: flex; gap: 8px; padding: 16px 22px; border-top: 1px solid #f3f4f6;
        }
        .ko-btn-cancel {
          flex: 1; padding: 10px; background: #fff; border: 1px solid #e5e7eb;
          color: #6b7280; border-radius: 8px; font-size: 13px; font-weight: 600;
          cursor: pointer; font-family: 'DM Sans', sans-serif; transition: background 0.1s;
        }
        .ko-btn-cancel:hover { background: #f9fafb; }
        .ko-btn-confirm {
          flex: 2; display: flex; align-items: center; justify-content: center; gap: 6px;
          padding: 10px; background: #1e3a8a; border: none;
          color: #fff; border-radius: 8px; font-size: 13px; font-weight: 600;
          cursor: pointer; font-family: 'DM Sans', sans-serif; transition: background 0.1s;
        }
        .ko-btn-confirm:hover { background: #1d4ed8; }
      `}</style>

      <div className="ko-root">
        {toast && (
          <div className={`ko-toast ${toast.type === 'error' ? 'err' : 'ok'}`}>
            {toast.type === 'error' ? <AlertCircle size={14}/> : <Check size={14}/>}
            {toast.msg}
          </div>
        )}

        <div className="ko-header">
          <div>
            <h1>Terminë Komuna</h1>
            <p>Shërbime komunale dhe administrative</p>
          </div>
          <div className="ko-count-badge">
            <div className="ko-count-dot"/>
            {appointments.filter(a => a.status === 'pending').length} në pritje
          </div>
        </div>

        {loading ? (
          <div className="ko-loading"><div className="ko-spinner"/></div>
        ) : appointments.length === 0 ? (
          <div className="ko-empty">
            <div className="ko-empty-icon"><MapPin size={22}/></div>
            <h3>Nuk ka termine Komuna</h3>
            <p>Nuk janë regjistruar termine ende.</p>
          </div>
        ) : (
          <div className="ko-table">
            <div className="ko-table-head">
              <div className="ko-th">Qytetari</div>
              <div className="ko-th">Shërbimi</div>
              <div className="ko-th">Data kërkuar</div>
              <div className="ko-th">Statusi</div>
              <div className="ko-th">Veprime</div>
            </div>
            {appointments.map(a => (
              <div key={a.id} className="ko-row">
                <div>
                  <div className="ko-user-name">{a.users?.first_name} {a.users?.last_name}</div>
                  <div className="ko-user-sub">{a.users?.personal_id}</div>
                </div>
                <div className="ko-reason">{a.reason}</div>
                <div className="ko-date">{a.appointment_date ? new Date(a.appointment_date).toLocaleDateString('sq-AL') : '—'}</div>
                <div>
                  {a.status === 'pending'  && <span className="ko-badge-pending"><div className="ko-dot-y"/>Në pritje</span>}
                  {a.status === 'approved' && <span className="ko-badge-approved"><div className="ko-dot-g"/>Aprovuar</span>}
                  {a.status === 'rejected' && <span className="ko-badge-rejected"><div className="ko-dot-r"/>Refuzuar</span>}
                </div>
                <button className="ko-btn-manage" onClick={() => { setSelected(a); setForm({ status:'approved', admin_note:'', approved_date:'' }) }}>
                  Menaxho
                </button>
              </div>
            ))}
          </div>
        )}

        {selected && (
          <div className="ko-overlay" onClick={() => setSelected(null)}>
            <div className="ko-modal" onClick={e => e.stopPropagation()}>
              <div className="ko-modal-header">
                <h3>Menaxho termin</h3>
                <button className="ko-modal-close" onClick={() => setSelected(null)}><X size={16}/></button>
              </div>
              <div className="ko-modal-body">
                <div className="ko-modal-info">
                  <span><strong>Qytetari:</strong> {selected.users?.first_name} {selected.users?.last_name}</span>
                  <span><strong>Shërbimi:</strong> {selected.reason}</span>
                  <span><strong>Email:</strong> {selected.users?.email}</span>
                </div>
                <div className="ko-form-group">
                  <label className="ko-form-label">Vendimi</label>
                  <select className="ko-select" value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                    <option value="approved">Aprovo termin</option>
                    <option value="rejected">Refuzo termin</option>
                  </select>
                </div>
                {form.status === 'approved' && (
                  <div className="ko-form-group">
                    <label className="ko-form-label">Data e konfirmuar</label>
                    <input type="datetime-local" className="ko-input" value={form.approved_date} onChange={e => setForm({...form, approved_date: e.target.value})}/>
                  </div>
                )}
                <div className="ko-form-group">
                  <label className="ko-form-label">Shënim (opsionale)</label>
                  <input className="ko-input" placeholder="Shënim për qytetarin..." value={form.admin_note} onChange={e => setForm({...form, admin_note: e.target.value})}/>
                </div>
              </div>
              <div className="ko-modal-footer">
                <button className="ko-btn-cancel" onClick={() => setSelected(null)}>Anulo</button>
                <button className="ko-btn-confirm" onClick={update}><Check size={14}/> Konfirmo</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default KomunaPanel