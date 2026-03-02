import { useState, useEffect } from 'react'
import API from '../../api/axios'
import { UserCheck, Eye, Check, X, AlertCircle, Clock, User, Mail, Hash, Calendar, Shield, Image, ZoomIn, ZoomOut, RotateCw, ChevronDown } from 'lucide-react'

const RegistrationPanel = () => {
  const [users, setUsers]               = useState([])
  const [loading, setLoading]           = useState(true)
  const [selected, setSelected]         = useState(null)
  const [rejectReason, setRejectReason] = useState('')
  const [toast, setToast]               = useState(null)
  const [imgError, setImgError]         = useState(false)
  const [lightbox, setLightbox]         = useState(false)
  const [zoom, setZoom]                 = useState(1)
  const [rotation, setRotation]         = useState(0)

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
      showToast('Useri u aprovua me sukses.')
    } catch { showToast('Gabim gjatë aprovimit.', 'error') }
  }

  const reject = async (id) => {
    try {
      await API.put(`/users/${id}/reject`, { reason: rejectReason })
      setSelected(null)
      setRejectReason('')
      fetchUsers()
      showToast('Kërkesa u refuzua.')
    } catch { showToast('Gabim gjatë refuzimit.', 'error') }
  }

  const openModal = (u) => {
    setSelected(u); setRejectReason(''); setImgError(false); setLightbox(false); setZoom(1); setRotation(0)
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');

        .rp-root { font-family: 'DM Sans', sans-serif; }

        /* Toast */
        .rp-toast {
          position: fixed; top: 20px; right: 20px; z-index: 9999;
          display: flex; align-items: center; gap: 8px;
          padding: 11px 16px; border-radius: 8px;
          font-size: 13px; font-weight: 500; font-family: 'DM Sans', sans-serif;
          box-shadow: 0 4px 16px rgba(0,0,0,0.1);
          border: 1px solid;
        }
        .rp-toast.ok  { background: #f0fdf4; border-color: #bbf7d0; color: #15803d; }
        .rp-toast.err { background: #fef2f2; border-color: #fecaca; color: #dc2626; }

        /* Header */
        .rp-header {
          display: flex; justify-content: space-between; align-items: center;
          margin-bottom: 24px;
        }
        .rp-header-left h1 { font-size: 18px; font-weight: 700; color: #1e3a8a; letter-spacing: -0.02em; }
        .rp-header-left p { font-size: 13px; color: #8a929e; margin-top: 2px; }

        .rp-count-badge {
          display: flex; align-items: center; gap: 6px;
          background: #fff; border: 1px solid #e5e7eb;
          border-radius: 20px; padding: 6px 14px;
          font-size: 12px; font-weight: 600; color: #374151;
        }
        .rp-count-dot {
          width: 7px; height: 7px; border-radius: 50%; background: #f59e0b;
        }

        /* Loading / Empty */
        .rp-loading { display: flex; justify-content: center; align-items: center; padding: 80px 0; }
        .rp-spinner {
          width: 24px; height: 24px;
          border: 2px solid #e5e7eb; border-top-color: #1e3a8a;
          border-radius: 50%; animation: rp-spin 0.6s linear infinite;
        }
        @keyframes rp-spin { to { transform: rotate(360deg); } }

        .rp-empty {
          background: #fff; border: 1px solid #e5e7eb; border-radius: 12px;
          padding: 64px; text-align: center;
        }
        .rp-empty-icon {
          width: 48px; height: 48px; border-radius: 12px;
          background: #f5f6f8; display: flex; align-items: center; justify-content: center;
          margin: 0 auto 16px; color: #9ca3af;
        }
        .rp-empty h3 { font-size: 15px; font-weight: 600; color: #374151; margin-bottom: 6px; }
        .rp-empty p  { font-size: 13px; color: #9ca3af; }

        /* Table */
        .rp-table {
          background: #fff;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          overflow: hidden;
        }

        .rp-table-head {
          display: grid;
          grid-template-columns: 1fr 1fr 140px 100px 120px;
          gap: 12px;
          padding: 11px 20px;
          background: #f9fafb;
          border-bottom: 1px solid #e5e7eb;
        }
        .rp-th {
          font-size: 11px; font-weight: 600; color: #6b7280;
          text-transform: uppercase; letter-spacing: 0.05em;
        }

        .rp-table-row {
          display: grid;
          grid-template-columns: 1fr 1fr 140px 100px 120px;
          gap: 12px;
          align-items: center;
          padding: 14px 20px;
          border-bottom: 1px solid #f3f4f6;
          transition: background 0.1s;
        }
        .rp-table-row:last-child { border-bottom: none; }
        .rp-table-row:hover { background: #fafbfc; }

        .rp-user-cell { display: flex; align-items: center; gap: 10px; }
        .rp-avatar {
          width: 34px; height: 34px; border-radius: 8px;
          background: #f5f6f8; border: 1px solid #e5e7eb;
          overflow: hidden; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          font-size: 12px; font-weight: 700; color: #1e3a8a;
        }
        .rp-avatar img { width: 100%; height: 100%; object-fit: cover; }

        .rp-user-name { font-size: 13px; font-weight: 600; color: #111827; }
        .rp-user-date { font-size: 11px; color: #9ca3af; margin-top: 1px; }

        .rp-email { font-size: 13px; color: #6b7280; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .rp-embg  { font-size: 12px; font-weight: 600; color: #1e3a8a; font-family: monospace; letter-spacing: 0.05em; }

        .rp-badge-pending {
          display: inline-flex; align-items: center; gap: 5px;
          background: #fffbeb; border: 1px solid #fde68a;
          color: #92400e; border-radius: 20px;
          padding: 3px 10px; font-size: 11px; font-weight: 600;
        }
        .rp-badge-dot { width: 5px; height: 5px; border-radius: 50%; background: #f59e0b; }

        .rp-action-cell { display: flex; gap: 6px; }

        .rp-btn {
          display: flex; align-items: center; gap: 4px;
          padding: 6px 12px; border-radius: 6px;
          font-size: 12px; font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          border: 1px solid; cursor: pointer; transition: all 0.1s;
        }
        .rp-btn-view   { background: #fff; border-color: #e5e7eb; color: #1e3a8a; }
        .rp-btn-view:hover { background: #eff6ff; border-color: #bfdbfe; }
        .rp-btn-approve { background: #f0fdf4; border-color: #bbf7d0; color: #15803d; }
        .rp-btn-approve:hover { background: #dcfce7; }
        .rp-btn-reject  { background: #fef2f2; border-color: #fecaca; color: #dc2626; }
        .rp-btn-reject:hover { background: #fee2e2; }

        /* Modal overlay */
        .rp-overlay {
          position: fixed; inset: 0;
          background: rgba(30,58,138,0.5);
          backdrop-filter: blur(2px);
          display: flex; align-items: center; justify-content: center;
          z-index: 1000; padding: 24px;
        }

        .rp-modal {
          background: #fff;
          border: 1px solid #e5e7eb;
          border-radius: 14px;
          width: 100%; max-width: 580px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.15);
          overflow: hidden;
        }

        .rp-modal-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 18px 22px;
          border-bottom: 1px solid #f3f4f6;
        }
        .rp-modal-header h3 { font-size: 15px; font-weight: 700; color: #1e3a8a; }
        .rp-modal-close {
          background: #f5f6f8; border: none; border-radius: 6px;
          color: #6b7280; padding: 6px; cursor: pointer;
          display: flex; align-items: center;
          transition: background 0.1s;
        }
        .rp-modal-close:hover { background: #eaecf0; }

        .rp-modal-body { padding: 22px; }

        .rp-modal-grid { display: grid; grid-template-columns: 150px 1fr; gap: 20px; margin-bottom: 20px; }

        .rp-modal-photo {
          width: 150px; height: 190px; border-radius: 10px;
          border: 1px solid #e5e7eb; overflow: hidden;
          background: #f9fafb; display: flex; align-items: center; justify-content: center;
          position: relative; cursor: pointer;
        }
        .rp-modal-photo img { width: 100%; height: 100%; object-fit: cover; }
        .rp-photo-hover {
          position: absolute; inset: 0; background: rgba(30,58,138,0.45);
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          gap: 6px; opacity: 0; transition: opacity 0.15s; border-radius: 10px;
          color: #fff;
        }
        .rp-modal-photo:hover .rp-photo-hover { opacity: 1; }
        .rp-photo-hover span { font-size: 11px; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; }
        .rp-photo-empty { display: flex; flex-direction: column; align-items: center; gap: 6px; color: #d1d5db; font-size: 11px; }

        .rp-modal-fields { display: flex; flex-direction: column; gap: 10px; }

        .rp-field {
          background: #f9fafb; border: 1px solid #f3f4f6;
          border-radius: 8px; padding: 10px 13px;
        }
        .rp-field-label {
          font-size: 10px; font-weight: 600; color: #9ca3af;
          text-transform: uppercase; letter-spacing: 0.06em;
          display: flex; align-items: center; gap: 4px; margin-bottom: 2px;
        }
        .rp-field-val { font-size: 14px; font-weight: 600; color: #111827; }
        .rp-field-embg { font-family: monospace; letter-spacing: 0.08em; color: #1e3a8a; }
        .rp-field-status {
          display: inline-flex; align-items: center; gap: 5px;
          background: #fffbeb; border: 1px solid #fde68a;
          color: #92400e; border-radius: 20px;
          padding: 3px 10px; font-size: 11px; font-weight: 600;
        }

        .rp-reject-section { margin-top: 4px; }
        .rp-reject-label { font-size: 12px; font-weight: 600; color: #1e3a8a; display: block; margin-bottom: 6px; }
        .rp-reject-input {
          width: 100%; background: #f9fafb; border: 1.5px solid #e5e7eb;
          border-radius: 8px; color: #111827; font-size: 13px;
          padding: 10px 13px; resize: vertical; min-height: 72px;
          font-family: 'DM Sans', sans-serif; outline: none;
          transition: border-color 0.15s;
        }
        .rp-reject-input:focus { border-color: #1e3a8a; }
        .rp-reject-input::placeholder { color: #d1d5db; }

        .rp-modal-footer {
          display: flex; gap: 8px; padding: 16px 22px;
          border-top: 1px solid #f3f4f6;
        }

        .rp-mf-cancel {
          flex: 1; padding: 10px; background: #fff; border: 1px solid #e5e7eb;
          color: #6b7280; border-radius: 8px; font-size: 13px; font-weight: 600;
          cursor: pointer; font-family: 'DM Sans', sans-serif;
          transition: all 0.1s;
        }
        .rp-mf-cancel:hover { background: #f9fafb; }

        .rp-mf-reject {
          flex: 1.5; display: flex; align-items: center; justify-content: center; gap: 6px;
          padding: 10px; background: #fef2f2; border: 1px solid #fecaca;
          color: #dc2626; border-radius: 8px; font-size: 13px; font-weight: 600;
          cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.1s;
        }
        .rp-mf-reject:hover { background: #fee2e2; }

        .rp-mf-approve {
          flex: 2; display: flex; align-items: center; justify-content: center; gap: 6px;
          padding: 10px; background: #1e3a8a; border: none;
          color: #fff; border-radius: 8px; font-size: 13px; font-weight: 600;
          cursor: pointer; font-family: 'DM Sans', sans-serif; transition: background 0.1s;
        }
        .rp-mf-approve:hover { background: #1d4ed8; }

        /* Lightbox */
        .rp-lightbox {
          position: fixed; inset: 0; z-index: 9000;
          background: rgba(0,0,0,0.9);
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
        }

        .rp-lb-toolbar {
          position: absolute; top: 20px; left: 50%; transform: translateX(-50%);
          display: flex; align-items: center; gap: 6px;
          background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.15);
          backdrop-filter: blur(12px);
          border-radius: 50px; padding: 7px 14px;
        }
        .rp-lb-name { font-size: 13px; font-weight: 600; color: #fff; padding-right: 12px; border-right: 1px solid rgba(255,255,255,0.15); margin-right: 4px; }
        .rp-lb-btn {
          background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.15);
          color: #e5e7eb; width: 32px; height: 32px; border-radius: 50%;
          cursor: pointer; display: flex; align-items: center; justify-content: center;
          transition: background 0.15s;
        }
        .rp-lb-btn:hover { background: rgba(255,255,255,0.2); }
        .rp-lb-zoom { font-size: 12px; font-weight: 600; color: rgba(255,255,255,0.4); min-width: 40px; text-align: center; font-family: monospace; }
        .rp-lb-div { width: 1px; height: 18px; background: rgba(255,255,255,0.12); margin: 0 2px; }
        .rp-lb-close { background: rgba(239,68,68,0.2); border: 1px solid rgba(239,68,68,0.3); color: #fca5a5; }
        .rp-lb-close:hover { background: rgba(239,68,68,0.35); }

        .rp-lb-img {
          max-width: 85vw; max-height: 78vh; object-fit: contain;
          border-radius: 8px; box-shadow: 0 24px 80px rgba(0,0,0,0.8);
          pointer-events: none; user-select: none;
          transition: transform 0.25s cubic-bezier(0.34,1.56,0.64,1);
        }

        .rp-lb-hint {
          position: absolute; bottom: 16px; left: 50%; transform: translateX(-50%);
          font-size: 11px; color: rgba(255,255,255,0.2); white-space: nowrap;
          display: flex; gap: 12px;
        }
      `}</style>

      <div className="rp-root">
        {/* Toast */}
        {toast && (
          <div className={`rp-toast ${toast.type === 'error' ? 'err' : 'ok'}`}>
            {toast.type === 'error' ? <AlertCircle size={14}/> : <Check size={14}/>}
            {toast.msg}
          </div>
        )}

        {/* Header */}
        <div className="rp-header">
          <div className="rp-header-left">
            <h1>Regjistrime në pritje</h1>
            <p>Shqyrtoni dhe aprovoni kërkesat e qytetarëve</p>
          </div>
          <div className="rp-count-badge">
            <div className="rp-count-dot" />
            {users.length} kërkesa aktive
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="rp-loading"><div className="rp-spinner"/></div>
        ) : users.length === 0 ? (
          <div className="rp-empty">
            <div className="rp-empty-icon"><UserCheck size={22}/></div>
            <h3>Asnjë kërkesë në pritje</h3>
            <p>Të gjitha kërkesat janë trajtuar.</p>
          </div>
        ) : (
          <div className="rp-table">
            <div className="rp-table-head">
              <div className="rp-th">Qytetari</div>
              <div className="rp-th">Email</div>
              <div className="rp-th">EMBG</div>
              <div className="rp-th">Statusi</div>
              <div className="rp-th">Veprime</div>
            </div>
            {users.map(u => (
              <div key={u.id} className="rp-table-row">
                <div className="rp-user-cell">
                  <div className="rp-avatar">
                    {u.photo_signed_url
                      ? <img src={u.photo_signed_url} alt="" onError={e => e.target.style.display='none'} />
                      : <>{u.first_name?.[0]}{u.last_name?.[0]}</>
                    }
                  </div>
                  <div>
                    <div className="rp-user-name">{u.first_name} {u.last_name}</div>
                    <div className="rp-user-date">{new Date(u.created_at).toLocaleDateString('sq-AL',{day:'2-digit',month:'short',year:'numeric'})}</div>
                  </div>
                </div>
                <div className="rp-email">{u.email}</div>
                <div className="rp-embg">{u.personal_id}</div>
                <div>
                  <span className="rp-badge-pending"><div className="rp-badge-dot"/>Në pritje</span>
                </div>
                <div className="rp-action-cell">
                  <button className="rp-btn rp-btn-view" onClick={() => openModal(u)}><Eye size={13}/> Shiko</button>
                  <button className="rp-btn rp-btn-approve" onClick={() => approve(u.id)}><Check size={13}/></button>
                  <button className="rp-btn rp-btn-reject" onClick={() => openModal(u)}><X size={13}/></button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {selected && !lightbox && (
          <div className="rp-overlay" onClick={() => setSelected(null)}>
            <div className="rp-modal" onClick={e => e.stopPropagation()}>
              <div className="rp-modal-header">
                <h3>{selected.first_name} {selected.last_name}</h3>
                <button className="rp-modal-close" onClick={() => setSelected(null)}><X size={16}/></button>
              </div>

              <div className="rp-modal-body">
                <div className="rp-modal-grid">
                  <div className="rp-modal-photo" onClick={selected.photo_signed_url && !imgError ? () => setLightbox(true) : undefined}>
                    {selected.photo_signed_url && !imgError ? (
                      <>
                        <img src={selected.photo_signed_url} alt="ID" onError={() => setImgError(true)} />
                        <div className="rp-photo-hover"><ZoomIn size={22}/><span>Zmadho</span></div>
                      </>
                    ) : (
                      <div className="rp-photo-empty"><Image size={28}/><span>Pa foto</span></div>
                    )}
                  </div>

                  <div className="rp-modal-fields">
                    <div className="rp-field">
                      <div className="rp-field-label"><User size={10}/> Emri i plotë</div>
                      <div className="rp-field-val">{selected.first_name} {selected.last_name}</div>
                    </div>
                    <div className="rp-field">
                      <div className="rp-field-label"><Hash size={10}/> EMBG</div>
                      <div className="rp-field-val rp-field-embg">{selected.personal_id}</div>
                    </div>
                    <div className="rp-field">
                      <div className="rp-field-label"><Mail size={10}/> Email</div>
                      <div className="rp-field-val" style={{fontSize:12}}>{selected.email}</div>
                    </div>
                    <div className="rp-field">
                      <div className="rp-field-label"><Calendar size={10}/> Regjistruar më</div>
                      <div className="rp-field-val" style={{fontSize:13}}>{new Date(selected.created_at).toLocaleDateString('sq-AL',{day:'2-digit',month:'long',year:'numeric'})}</div>
                    </div>
                    <div className="rp-field">
                      <div className="rp-field-label"><Shield size={10}/> Statusi</div>
                      <span className="rp-field-status"><div className="rp-badge-dot"/>Në pritje</span>
                    </div>
                  </div>
                </div>

                <div className="rp-reject-section">
                  <label className="rp-reject-label">Arsyeja e refuzimit (opsionale)</label>
                  <textarea
                    className="rp-reject-input"
                    value={rejectReason}
                    placeholder="Shënoni arsyen nëse do ta refuzoni këtë kërkesë..."
                    onChange={e => setRejectReason(e.target.value)}
                  />
                </div>
              </div>

              <div className="rp-modal-footer">
                <button className="rp-mf-cancel" onClick={() => setSelected(null)}>Anulo</button>
                <button className="rp-mf-reject" onClick={() => reject(selected.id)}><X size={14}/> Refuzo</button>
                <button className="rp-mf-approve" onClick={() => approve(selected.id)}><Check size={14}/> Aprovo</button>
              </div>
            </div>
          </div>
        )}

        {/* Lightbox */}
        {lightbox && selected?.photo_signed_url && (
          <div className="rp-lightbox" onClick={() => setLightbox(false)}>
            <div className="rp-lb-toolbar" onClick={e => e.stopPropagation()}>
              <span className="rp-lb-name">{selected.first_name} {selected.last_name}</span>
              <button className="rp-lb-btn" onClick={() => setZoom(z => Math.max(z-0.25, 0.5))}><ZoomOut size={13}/></button>
              <span className="rp-lb-zoom">{Math.round(zoom*100)}%</span>
              <button className="rp-lb-btn" onClick={() => setZoom(z => Math.min(z+0.25, 4))}><ZoomIn size={13}/></button>
              <div className="rp-lb-div"/>
              <button className="rp-lb-btn" onClick={() => setRotation(r => (r+90)%360)}><RotateCw size={13}/></button>
              <div className="rp-lb-div"/>
              <button className="rp-lb-btn rp-lb-close" onClick={() => setLightbox(false)}><X size={13}/></button>
            </div>
            <img
              className="rp-lb-img"
              src={selected.photo_signed_url}
              alt="ID"
              style={{ transform: `scale(${zoom}) rotate(${rotation}deg)` }}
              onClick={e => e.stopPropagation()}
              draggable={false}
            />
            <div className="rp-lb-hint">
              <span>Kliko jashtë për të mbyllur</span>
              <span>·</span>
              <span>Zoom: − / +</span>
              <span>·</span>
              <span>Rrotullo 90°</span>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default RegistrationPanel