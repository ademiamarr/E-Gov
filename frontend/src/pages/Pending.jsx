import { useAuth } from '../context/AuthContext'

const Pending = () => {
  const { user, logout } = useAuth()

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }
        body { font-family:'Plus Jakarta Sans',sans-serif; background:#f4f6fb; }

        .pd { min-height:100dvh; display:flex; flex-direction:column; background:#f4f6fb; }

        .pd-top {
          display:flex; align-items:center; gap:10px;
          padding:16px 20px; background:#fff; border-bottom:1px solid #eaecf0;
        }
        .pd-brand { display:flex; align-items:center; gap:8px; }
        .pd-brand-icon {
          width:32px; height:32px; background:#1e3a8a; border-radius:8px;
          display:flex; align-items:center; justify-content:center;
        }
        .pd-brand-name { font-size:14px; font-weight:800; color:#1e3a8a; letter-spacing:-0.02em; }

        .pd-body {
          flex:1; display:flex; flex-direction:column;
          padding:28px 20px 40px;
        }

        /* Status icon */
        .pd-icon-wrap {
          width:76px; height:76px; border-radius:50%;
          background:linear-gradient(135deg,#fef9c3,#fde68a);
          border:2px solid #fbbf24;
          display:flex; align-items:center; justify-content:center;
          font-size:34px; margin:0 auto 20px;
        }

        .pd-title {
          font-size:24px; font-weight:800; color:#0f1728;
          letter-spacing:-0.03em; text-align:center; margin-bottom:6px;
        }
        .pd-sub {
          font-size:13px; color:#6b7280; text-align:center;
          line-height:1.6; margin-bottom:28px;
        }

        /* Steps card */
        .pd-card {
          background:#fff; border-radius:18px; border:1.5px solid #eaecf0;
          overflow:hidden; margin-bottom:14px;
        }
        .pd-step {
          display:flex; align-items:flex-start; gap:12px;
          padding:16px; border-bottom:1px solid #f1f5f9;
        }
        .pd-step:last-child { border-bottom:none; }

        .pd-step-dot {
          width:28px; height:28px; border-radius:50%; flex-shrink:0;
          display:flex; align-items:center; justify-content:center;
          font-size:12px; font-weight:800;
        }
        .pd-step-dot.done { background:#1e3a8a; color:#fff; }
        .pd-step-dot.active {
          background:#f59e0b; color:#fff;
          box-shadow:0 0 0 4px rgba(245,158,11,0.2);
          animation:pdpulse 2s infinite;
        }
        .pd-step-dot.pending { background:#e5e7eb; color:#9ca3af; }
        @keyframes pdpulse {
          0%,100% { box-shadow:0 0 0 0 rgba(245,158,11,0.4); }
          50% { box-shadow:0 0 0 8px rgba(245,158,11,0); }
        }

        .pd-step-info { flex:1; }
        .pd-step-title { font-size:14px; font-weight:700; color:#0f1728; display:block; margin-bottom:2px; }
        .pd-step-sub { font-size:12px; color:#6b7280; display:block; }

        /* Info chips */
        .pd-chips { display:flex; flex-direction:column; gap:8px; margin-bottom:20px; }
        .pd-chip {
          display:flex; align-items:center; gap:9px;
          padding:12px 14px; border-radius:12px;
          font-size:13px; font-weight:600;
        }
        .pd-chip.blue { background:#eff6ff; border:1.5px solid #bfdbfe; color:#1e40af; }
        .pd-chip.amber { background:#fffbeb; border:1.5px solid #fde68a; color:#92400e; }

        /* Logout */
        .pd-logout {
          width:100%; padding:14px; border-radius:14px;
          background:#fff; border:1.5px solid #fecaca;
          color:#ef4444; font-size:14px; font-weight:800;
          font-family:'Plus Jakarta Sans',sans-serif; cursor:pointer;
          display:flex; align-items:center; justify-content:center; gap:8px;
          -webkit-tap-highlight-color:transparent; transition:background 0.12s;
          -webkit-appearance:none;
        }
        .pd-logout:active { background:#fef2f2; }
      `}</style>

      <div className="pd">
        <div className="pd-top">
          <div className="pd-brand">
            <div className="pd-brand-icon">
              <svg viewBox="0 0 24 24" fill="none" width={16} height={16}>
                <path d="M3 22V10L12 3L21 10V22H15V16H9V22H3Z" fill="#fff"/>
              </svg>
            </div>
            <span className="pd-brand-name">eGov Portal</span>
          </div>
        </div>

        <div className="pd-body">
          <div className="pd-icon-wrap">⏳</div>
          <h1 className="pd-title">Llogaria në pritje</h1>
          <p className="pd-sub">
            Dokumentet tuaja janë duke u shqyrtuar nga ekipi administrativ.
          </p>

          {/* Steps */}
          <div className="pd-card">
            <div className="pd-step">
              <div className="pd-step-dot done">✓</div>
              <div className="pd-step-info">
                <span className="pd-step-title">Regjistrimi u krye</span>
                <span className="pd-step-sub">Llogaria u krijua me sukses</span>
              </div>
            </div>
            <div className="pd-step">
              <div className="pd-step-dot active">•</div>
              <div className="pd-step-info">
                <span className="pd-step-title">Shqyrtim i dokumenteve</span>
                <span className="pd-step-sub">Ekipi ynë po shqyrton dokumentet tuaja</span>
              </div>
            </div>
            <div className="pd-step">
              <div className="pd-step-dot pending">3</div>
              <div className="pd-step-info">
                <span className="pd-step-title">Aktivizim i llogarisë</span>
                <span className="pd-step-sub">Do të njoftoheni me email</span>
              </div>
            </div>
          </div>

          {/* Info chips */}
          <div className="pd-chips">
            {user?.email && (
              <div className="pd-chip blue">
                <span>📧</span>
                <span>Njoftimi te: <strong>{user.email}</strong></span>
              </div>
            )}
            <div className="pd-chip amber">
              <span>⏱</span>
              <span>Koha e pritjes: <strong>1-2 ditë pune</strong></span>
            </div>
          </div>

          <button className="pd-logout" onClick={logout}>
            🚪 Dil nga llogaria
          </button>
        </div>
      </div>
    </>
  )
}

export default Pending