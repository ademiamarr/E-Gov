import { useState, useEffect } from 'react'
import API from '../../api/axios'
import { UserCheck, Eye, Check, X, AlertCircle, Clock, User, Mail, Hash, Calendar, Shield, Image, ZoomIn, ZoomOut, RotateCw } from 'lucide-react'

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
      showToast('Useri u aprovua me sukses!')
    } catch { showToast('Gabim gjatë aprovimit!', 'error') }
  }

  const reject = async (id) => {
    try {
      await API.put(`/users/${id}/reject`, { reason: rejectReason })
      setSelected(null)
      setRejectReason('')
      fetchUsers()
      showToast('Useri u refuzua.')
    } catch { showToast('Gabim gjatë refuzimit!', 'error') }
  }

  const openModal = (u) => {
    setSelected(u)
    setRejectReason('')
    setImgError(false)
    setLightbox(false)
    setZoom(1)
    setRotation(0)
  }

  const openLightbox = () => {
    setLightbox(true)
    setZoom(1)
    setRotation(0)
  }

  const closeLightbox = () => {
    setLightbox(false)
    setZoom(1)
    setRotation(0)
  }

  const zoomIn  = (e) => { e.stopPropagation(); setZoom(z => Math.min(z + 0.25, 4)) }
  const zoomOut = (e) => { e.stopPropagation(); setZoom(z => Math.max(z - 0.25, 0.5)) }
  const rotate  = (e) => { e.stopPropagation(); setRotation(r => (r + 90) % 360) }

  return (
    <>
      <style>{`
        /* TOAST */
        .rp-toast {
          position: fixed; top: 24px; right: 24px; z-index: 9999;
          display: flex; align-items: center; gap: 8px;
          padding: 12px 18px; border-radius: 12px;
          font-size: 13px; font-weight: 600; backdrop-filter: blur(12px);
          animation: rp-slide-in 0.25s ease;
        }
        .rp-toast--ok  { background:rgba(16,185,129,0.15); border:1px solid rgba(16,185,129,0.35); color:#34d399; }
        .rp-toast--err { background:rgba(239,68,68,0.15);  border:1px solid rgba(239,68,68,0.35);  color:#f87171; }
        @keyframes rp-slide-in { from{opacity:0;transform:translateY(-10px)} to{opacity:1;transform:translateY(0)} }

        /* HEADER */
        .rp-header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:28px; }
        .rp-header h1 { font-size:1.5rem; font-weight:800; color:#f0f4ff; margin:0; letter-spacing:-0.03em; }
        .rp-header p  { font-size:13px; color:rgba(255,255,255,0.35); margin-top:4px; }
        .rp-badge { display:flex; align-items:center; gap:6px; background:rgba(59,130,246,0.12); border:1px solid rgba(59,130,246,0.25); color:#60a5fa; padding:8px 16px; border-radius:20px; font-size:12px; font-weight:700; }

        /* LOADING / EMPTY */
        .rp-loading { display:flex; justify-content:center; padding:60px; }
        .rp-spinner { width:32px; height:32px; border:3px solid rgba(255,255,255,0.08); border-top-color:#60a5fa; border-radius:50%; animation:spin 0.7s linear infinite; }
        @keyframes spin { to{transform:rotate(360deg)} }
        .rp-empty { text-align:center; padding:80px 20px; color:rgba(255,255,255,0.25); }
        .rp-empty p { font-size:14px; margin-top:12px; }

        /* GRID */
        .rp-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(300px,1fr)); gap:16px; }
        .rp-card { background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:18px; overflow:hidden; transition:all 0.2s; }
        .rp-card:hover { border-color:rgba(96,165,250,0.3); background:rgba(255,255,255,0.06); transform:translateY(-2px); box-shadow:0 8px 32px rgba(0,0,0,0.3); }
        .rp-card-top { padding:20px 20px 0; display:flex; align-items:center; gap:14px; }
        .rp-avatar { width:56px; height:56px; border-radius:14px; overflow:hidden; flex-shrink:0; background:rgba(255,255,255,0.08); display:flex; align-items:center; justify-content:center; border:1px solid rgba(255,255,255,0.1); }
        .rp-avatar img { width:100%; height:100%; object-fit:cover; }
        .rp-avatar-placeholder { width:100%; height:100%; display:flex; align-items:center; justify-content:center; background:linear-gradient(135deg,rgba(79,70,229,0.3),rgba(124,58,237,0.2)); font-size:20px; font-weight:800; color:#a5b4fc; }
        .rp-card-name { font-size:15px; font-weight:700; color:#f0f4ff; }
        .rp-card-date { font-size:11px; color:rgba(255,255,255,0.3); margin-top:3px; }
        .rp-card-body { padding:14px 20px; display:flex; flex-direction:column; gap:8px; }
        .rp-info-row { display:flex; align-items:center; gap:8px; font-size:12px; color:rgba(255,255,255,0.5); }
        .rp-info-row svg { flex-shrink:0; color:rgba(255,255,255,0.25); }
        .rp-info-val { color:#e2e8f0; font-weight:500; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
        .rp-embg-val { font-family:'Courier New',monospace; font-size:13px; font-weight:700; color:#93c5fd; letter-spacing:1px; }
        .rp-card-footer { padding:0 20px 18px; display:flex; gap:8px; margin-top:4px; }
        .rp-btn-view { flex:1; display:flex; align-items:center; justify-content:center; gap:6px; background:rgba(99,102,241,0.15); border:1px solid rgba(99,102,241,0.3); color:#a5b4fc; padding:9px; border-radius:10px; font-size:12px; font-weight:700; cursor:pointer; transition:all 0.15s; font-family:inherit; }
        .rp-btn-view:hover { background:rgba(99,102,241,0.25); }
        .rp-btn-approve-quick { display:flex; align-items:center; justify-content:center; background:rgba(16,185,129,0.15); border:1px solid rgba(16,185,129,0.3); color:#34d399; padding:9px 12px; border-radius:10px; cursor:pointer; transition:all 0.15s; font-family:inherit; }
        .rp-btn-approve-quick:hover { background:rgba(16,185,129,0.25); }
        .rp-btn-reject-quick { display:flex; align-items:center; justify-content:center; background:rgba(239,68,68,0.12); border:1px solid rgba(239,68,68,0.25); color:#f87171; padding:9px 12px; border-radius:10px; cursor:pointer; transition:all 0.15s; font-family:inherit; }
        .rp-btn-reject-quick:hover { background:rgba(239,68,68,0.22); }

        /* MODAL */
        .rp-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.75); backdrop-filter:blur(6px); display:flex; align-items:center; justify-content:center; z-index:1000; padding:24px; }
        .rp-modal { background:#0d1b3e; border:1px solid rgba(255,255,255,0.1); border-radius:24px; width:100%; max-width:600px; box-shadow:0 32px 80px rgba(0,0,0,0.6); overflow:hidden; animation:rp-modal-in 0.2s ease; }
        @keyframes rp-modal-in { from{opacity:0;transform:scale(0.96)} to{opacity:1;transform:scale(1)} }
        .rp-modal-header { display:flex; align-items:center; justify-content:space-between; padding:22px 26px; border-bottom:1px solid rgba(255,255,255,0.07); background:rgba(255,255,255,0.03); }
        .rp-modal-header h3 { font-size:16px; font-weight:800; color:#f0f4ff; margin:0; }
        .rp-modal-close { background:rgba(255,255,255,0.08); border:none; border-radius:8px; color:rgba(255,255,255,0.5); padding:7px; cursor:pointer; display:flex; align-items:center; transition:all 0.15s; }
        .rp-modal-close:hover { background:rgba(255,255,255,0.14); color:#fff; }
        .rp-modal-body { padding:24px 26px; }
        .rp-modal-top { display:grid; grid-template-columns:160px 1fr; gap:20px; margin-bottom:20px; }

        /* FOTO klikueshme */
        .rp-modal-photo {
          width:160px; height:200px; border-radius:14px; overflow:hidden;
          border:2px solid rgba(255,255,255,0.1);
          background:rgba(255,255,255,0.05);
          display:flex; align-items:center; justify-content:center;
          position:relative; transition:all 0.2s;
        }
        .rp-modal-photo.clickable { cursor:pointer; }
        .rp-modal-photo.clickable:hover { border-color:rgba(99,102,241,0.6); box-shadow:0 0 0 3px rgba(99,102,241,0.15); }
        .rp-modal-photo.clickable:hover img { transform:scale(1.04); }
        .rp-modal-photo.clickable:hover .rp-photo-overlay { opacity:1; }
        .rp-modal-photo img { width:100%; height:100%; object-fit:cover; transition:transform 0.25s; }
        .rp-photo-overlay {
          position:absolute; inset:0;
          background:rgba(0,0,0,0.6);
          display:flex; flex-direction:column; align-items:center; justify-content:center; gap:8px;
          opacity:0; transition:opacity 0.2s; border-radius:12px;
        }
        .rp-photo-overlay-text { font-size:11px; font-weight:800; color:#fff; letter-spacing:0.08em; text-transform:uppercase; }
        .rp-modal-photo-placeholder { display:flex; flex-direction:column; align-items:center; gap:8px; color:rgba(255,255,255,0.2); font-size:11px; font-weight:600; }

        /* FIELDS */
        .rp-modal-fields { display:flex; flex-direction:column; gap:10px; }
        .rp-modal-field { background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.07); border-radius:12px; padding:11px 14px; }
        .rp-modal-field-label { font-size:10px; font-weight:700; color:rgba(255,255,255,0.3); text-transform:uppercase; letter-spacing:0.08em; display:flex; align-items:center; gap:5px; margin-bottom:3px; }
        .rp-modal-field-val { font-size:14px; font-weight:600; color:#f0f4ff; }
        .rp-embg-field-val { font-size:15px; font-weight:700; color:#93c5fd; font-family:'Courier New',monospace; letter-spacing:2px; }
        .rp-status-badge { display:inline-flex; align-items:center; gap:5px; background:rgba(245,158,11,0.15); border:1px solid rgba(245,158,11,0.3); color:#fbbf24; padding:4px 10px; border-radius:20px; font-size:11px; font-weight:700; }

        /* REJECT */
        .rp-reject-label { font-size:11px; font-weight:700; color:rgba(255,255,255,0.35); text-transform:uppercase; letter-spacing:0.07em; margin-bottom:8px; display:block; }
        .rp-reject-textarea { width:100%; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.1); border-radius:12px; color:#f0f4ff; font-size:13px; padding:12px 14px; resize:vertical; min-height:80px; font-family:inherit; outline:none; transition:border-color 0.2s; }
        .rp-reject-textarea:focus { border-color:rgba(239,68,68,0.4); }
        .rp-reject-textarea::placeholder { color:rgba(255,255,255,0.2); }

        /* MODAL FOOTER */
        .rp-modal-footer { display:flex; gap:10px; padding:0 26px 24px; }
        .rp-btn-cancel { flex:1; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.1); color:rgba(255,255,255,0.5); padding:12px; border-radius:12px; font-size:13px; font-weight:700; cursor:pointer; font-family:inherit; transition:all 0.15s; }
        .rp-btn-cancel:hover { background:rgba(255,255,255,0.1); color:#fff; }
        .rp-btn-reject-final { flex:1.5; display:flex; align-items:center; justify-content:center; gap:6px; background:rgba(239,68,68,0.15); border:1px solid rgba(239,68,68,0.35); color:#f87171; padding:12px; border-radius:12px; font-size:13px; font-weight:700; cursor:pointer; font-family:inherit; transition:all 0.15s; }
        .rp-btn-reject-final:hover { background:rgba(239,68,68,0.25); }
        .rp-btn-approve-final { flex:2; display:flex; align-items:center; justify-content:center; gap:6px; background:linear-gradient(135deg,#065f46,#10b981); border:none; color:#fff; padding:12px; border-radius:12px; font-size:13px; font-weight:800; cursor:pointer; font-family:inherit; transition:all 0.2s; box-shadow:0 4px 16px rgba(16,185,129,0.3); }
        .rp-btn-approve-final:hover { box-shadow:0 6px 24px rgba(16,185,129,0.5); transform:translateY(-1px); }

        /* ══════════════ LIGHTBOX ══════════════ */
        .rp-lightbox {
          position:fixed; inset:0; z-index:9000;
          background:rgba(0,0,0,0.93);
          backdrop-filter:blur(20px);
          display:flex; flex-direction:column;
          align-items:center; justify-content:center;
          animation:lb-fade 0.2s ease;
        }
        @keyframes lb-fade { from{opacity:0} to{opacity:1} }

        /* Toolbar */
        .rp-lb-toolbar {
          position:absolute; top:20px; left:50%; transform:translateX(-50%);
          display:flex; align-items:center; gap:6px;
          background:rgba(15,25,60,0.9);
          border:1px solid rgba(255,255,255,0.1);
          backdrop-filter:blur(12px);
          border-radius:50px; padding:8px 14px;
          box-shadow:0 8px 32px rgba(0,0,0,0.5);
          white-space:nowrap;
        }
        .rp-lb-name {
          font-size:13px; font-weight:700; color:#f0f4ff;
          padding-right:12px; border-right:1px solid rgba(255,255,255,0.12);
          margin-right:2px;
        }
        .rp-lb-divider { width:1px; height:20px; background:rgba(255,255,255,0.1); margin:0 2px; }
        .rp-lb-icon-btn {
          background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.12);
          color:#e2e8f0; width:34px; height:34px; border-radius:50%;
          cursor:pointer; display:flex; align-items:center; justify-content:center;
          transition:all 0.15s; font-family:inherit;
        }
        .rp-lb-icon-btn:hover { background:rgba(255,255,255,0.18); color:#fff; transform:scale(1.05); }
        .rp-lb-zoom-val {
          font-size:12px; font-weight:700; color:rgba(255,255,255,0.45);
          min-width:42px; text-align:center; font-family:'Courier New',monospace;
        }
        .rp-lb-close-btn {
          background:rgba(239,68,68,0.2); border:1px solid rgba(239,68,68,0.35);
          color:#f87171; width:34px; height:34px; border-radius:50%;
          cursor:pointer; display:flex; align-items:center; justify-content:center;
          transition:all 0.15s; margin-left:4px;
        }
        .rp-lb-close-btn:hover { background:rgba(239,68,68,0.4); color:#fff; transform:scale(1.05); }

        /* image */
        .rp-lb-stage {
          width:100%; height:100%;
          display:flex; align-items:center; justify-content:center;
          overflow:hidden;
          padding-top:80px; padding-bottom:50px;
        }
        .rp-lb-img {
          max-width:88vw; max-height:78vh;
          object-fit:contain;
          border-radius:10px;
          box-shadow:0 32px 100px rgba(0,0,0,0.9);
          user-select:none; pointer-events:none;
          transition:transform 0.3s cubic-bezier(0.34,1.56,0.64,1);
        }

        /* hint bar */
        .rp-lb-hint {
          position:absolute; bottom:18px; left:50%; transform:translateX(-50%);
          display:flex; align-items:center; gap:16px;
          font-size:11px; color:rgba(255,255,255,0.22);
          font-weight:500; letter-spacing:0.04em; white-space:nowrap;
        }
        .rp-lb-hint span { display:flex; align-items:center; gap:4px; }

        @media (max-width:640px) {
          .rp-modal-top { grid-template-columns:1fr; }
          .rp-modal-photo { width:100%; height:180px; }
          .rp-lb-name { display:none; }
        }
      `}</style>

      {/* TOAST */}
      {toast && (
        <div className={`rp-toast ${toast.type === 'error' ? 'rp-toast--err' : 'rp-toast--ok'}`}>
          {toast.type === 'error' ? <AlertCircle size={15}/> : <Check size={15}/>}
          {toast.msg}
        </div>
      )}

      {/* HEADER */}
      <div className="rp-header">
        <div>
          <h1>Regjistrime në pritje</h1>
          <p>{users.length} kërkesa aktive për aprovim</p>
        </div>
        <div className="rp-badge"><Clock size={13}/> {users.length} Pending</div>
      </div>

      {/* CONTENT */}
      {loading ? (
        <div className="rp-loading"><div className="rp-spinner"/></div>
      ) : users.length === 0 ? (
        <div className="rp-empty"><UserCheck size={48}/><p>Nuk ka regjistrime në pritje</p></div>
      ) : (
        <div className="rp-grid">
          {users.map(u => (
            <div key={u.id} className="rp-card">
              <div className="rp-card-top">
                <div className="rp-avatar">
                  {u.photo_signed_url
                    ? <img src={u.photo_signed_url} alt="ID" onError={e => e.target.style.display='none'}/>
                    : <div className="rp-avatar-placeholder">{u.first_name?.[0]}{u.last_name?.[0]}</div>
                  }
                </div>
                <div>
                  <div className="rp-card-name">{u.first_name} {u.last_name}</div>
                  <div className="rp-card-date">
                    {new Date(u.created_at).toLocaleDateString('sq-AL',{day:'2-digit',month:'short',year:'numeric'})}
                  </div>
                </div>
              </div>
              <div className="rp-card-body">
                <div className="rp-info-row"><Mail size={13}/><span className="rp-info-val">{u.email}</span></div>
                <div className="rp-info-row"><Hash size={13}/><span className="rp-info-val rp-embg-val">{u.personal_id}</span></div>
              </div>
              <div className="rp-card-footer">
                <button className="rp-btn-view" onClick={() => openModal(u)}><Eye size={13}/> Shiko detajet</button>
                <button className="rp-btn-approve-quick" onClick={() => approve(u.id)} title="Aprovo"><Check size={15}/></button>
                <button className="rp-btn-reject-quick" onClick={() => openModal(u)} title="Refuzo"><X size={15}/></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── MODAL ── */}
      {selected && !lightbox && (
        <div className="rp-overlay" onClick={() => setSelected(null)}>
          <div className="rp-modal" onClick={e => e.stopPropagation()}>

            <div className="rp-modal-header">
              <h3>👤 {selected.first_name} {selected.last_name}</h3>
              <button className="rp-modal-close" onClick={() => setSelected(null)}><X size={17}/></button>
            </div>

            <div className="rp-modal-body">
              <div className="rp-modal-top">

                {/* FOTO */}
                <div
                  className={`rp-modal-photo ${selected.photo_signed_url && !imgError ? 'clickable' : ''}`}
                  onClick={selected.photo_signed_url && !imgError ? openLightbox : undefined}
                >
                  {selected.photo_signed_url && !imgError ? (
                    <>
                      <img src={selected.photo_signed_url} alt="Dokument ID" onError={() => setImgError(true)}/>
                      <div className="rp-photo-overlay">
                        <ZoomIn size={26} color="#fff"/>
                        <span className="rp-photo-overlay-text">Shiko zmadhuar</span>
                      </div>
                    </>
                  ) : (
                    <div className="rp-modal-photo-placeholder">
                      <Image size={32} style={{opacity:0.3}}/>
                      <span>Foto nuk u gjet</span>
                    </div>
                  )}
                </div>

                {/* FIELDS */}
                <div className="rp-modal-fields">
                  <div className="rp-modal-field">
                    <div className="rp-modal-field-label"><User size={11}/> Emri i plotë</div>
                    <div className="rp-modal-field-val">{selected.first_name} {selected.last_name}</div>
                  </div>
                  <div className="rp-modal-field">
                    <div className="rp-modal-field-label"><Hash size={11}/> EMBG</div>
                    <div className="rp-embg-field-val">{selected.personal_id}</div>
                  </div>
                  <div className="rp-modal-field">
                    <div className="rp-modal-field-label"><Mail size={11}/> Email</div>
                    <div className="rp-modal-field-val" style={{fontSize:13}}>{selected.email}</div>
                  </div>
                  <div className="rp-modal-field">
                    <div className="rp-modal-field-label"><Calendar size={11}/> Regjistruar</div>
                    <div className="rp-modal-field-val">
                      {new Date(selected.created_at).toLocaleDateString('sq-AL',{day:'2-digit',month:'long',year:'numeric'})}
                    </div>
                  </div>
                  <div className="rp-modal-field">
                    <div className="rp-modal-field-label"><Shield size={11}/> Statusi</div>
                    <span className="rp-status-badge">⏳ Në pritje</span>
                  </div>
                </div>
              </div>

              <label className="rp-reject-label">Arsyeja e refuzimit (opsionale)</label>
              <textarea
                className="rp-reject-textarea"
                value={rejectReason}
                placeholder="p.sh. Dokumenti nuk është i qartë, Të dhënat nuk përputhen, etj..."
                onChange={e => setRejectReason(e.target.value)}
              />
            </div>

            <div className="rp-modal-footer">
              <button className="rp-btn-cancel" onClick={() => setSelected(null)}>Anulo</button>
              <button className="rp-btn-reject-final" onClick={() => reject(selected.id)}><X size={14}/> Refuzo</button>
              <button className="rp-btn-approve-final" onClick={() => approve(selected.id)}><Check size={14}/> Aprovo ✓</button>
            </div>
          </div>
        </div>
      )}

      {/* ── LIGHTBOX ── */}
      {lightbox && selected?.photo_signed_url && (
        <div className="rp-lightbox" onClick={closeLightbox}>

          {/* Toolbar */}
          <div className="rp-lb-toolbar" onClick={e => e.stopPropagation()}>
            <span className="rp-lb-name">📄 {selected.first_name} {selected.last_name}</span>

            <button className="rp-lb-icon-btn" onClick={zoomOut} title="Zvogëlo (-)">
              <ZoomOut size={15}/>
            </button>

            <span className="rp-lb-zoom-val">{Math.round(zoom * 100)}%</span>

            <button className="rp-lb-icon-btn" onClick={zoomIn} title="Zmadho (+)">
              <ZoomIn size={15}/>
            </button>

            <div className="rp-lb-divider"/>

            <button className="rp-lb-icon-btn" onClick={rotate} title="Rrotullo 90°">
              <RotateCw size={15}/>
            </button>

            <div className="rp-lb-divider"/>

            <button className="rp-lb-close-btn" onClick={closeLightbox} title="Mbyll">
              <X size={15}/>
            </button>
          </div>

          {/* Image */}
          <div className="rp-lb-stage" onClick={closeLightbox}>
            <img
              className="rp-lb-img"
              src={selected.photo_signed_url}
              alt="Dokument ID"
              style={{ transform: `scale(${zoom}) rotate(${rotation}deg)` }}
              draggable={false}
              onClick={e => e.stopPropagation()}
            />
          </div>

          {/* Hint */}
          <div className="rp-lb-hint">
            <span>🖱 Kliko jashtë për të mbyllur</span>
            <span>|</span>
            <span>🔍 Zoom: − / +</span>
            <span>|</span>
            <span>↻ Rrotullo 90°</span>
          </div>
        </div>
      )}
    </>
  )
}

export default RegistrationPanel