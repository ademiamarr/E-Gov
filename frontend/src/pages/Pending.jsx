import { useAuth } from '../context/AuthContext'
import { Building2, Clock, Mail, LogOut } from 'lucide-react'

const Pending = () => {
  const { user, logout } = useAuth()

  return (
    <>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #ffffff 100%);
          min-height: 100vh;
        }

        .status-page {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          padding: 20px;
        }

        .status-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 40px;
          font-size: 13px;
          font-weight: 700;
          color: #0f172a;
        }

        .status-logo-icon {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .status-wrap {
          width: 100%;
          max-width: 480px;
          text-align: center;
        }

        .status-icon {
          width: 80px;
          height: 80px;
          border-radius: 20px;
          background: linear-gradient(135deg, #f5931415 0%, #f0b61a15 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 24px;
          border: 1px solid rgba(245, 147, 20, 0.2);
        }

        .status-wrap h1 {
          font-size: 24px;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 8px;
          letter-spacing: -0.5px;
        }

        .status-wrap > p {
          font-size: 13px;
          color: #6b7280;
          margin-bottom: 28px;
          line-height: 1.6;
        }

        .status-card {
          background: #ffffff;
          border-radius: 16px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
          padding: 32px;
          margin-bottom: 20px;
        }

        .status-step {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 16px 0;
          border-bottom: 1px solid #e5e7eb;
        }

        .status-step:last-child {
          border-bottom: none;
        }

        .step-dot {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #e5e7eb;
          border: 2px solid #ffffff;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          margin-top: 2px;
        }

        .step-dot.done {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: #ffffff;
          font-weight: 700;
        }

        .step-dot.active {
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
          color: #ffffff;
          font-weight: 700;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.4); }
          50% { box-shadow: 0 0 0 8px rgba(245, 158, 11, 0); }
        }

        .step-info {
          flex: 1;
        }

        .step-title {
          display: block;
          font-size: 13px;
          font-weight: 600;
          color: #0f172a;
          margin-bottom: 4px;
        }

        .step-sub {
          display: block;
          font-size: 12px;
          color: #6b7280;
        }

        .status-email {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px 16px;
          background: #f0f4ff;
          border: 1px solid #bfdbfe;
          border-radius: 8px;
          font-size: 12px;
          color: #1e40af;
          margin-bottom: 20px;
        }

        .status-time {
          padding: 12px 16px;
          background: #fef3c7;
          border: 1px solid #fbbf24;
          border-radius: 8px;
          font-size: 12px;
          color: #92400e;
          font-weight: 500;
          margin-bottom: 20px;
        }

        .status-logout {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          padding: 12px 16px;
          background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
          color: #ffffff;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          font-family: inherit;
        }

        .status-logout:hover {
          background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%);
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
        }

        @media (max-width: 480px) {
          .status-card {
            padding: 24px;
          }

          .status-wrap h1 {
            font-size: 20px;
          }
        }
      `}</style>

      <div className="status-page">
        <div className="status-logo">
          <div className="status-logo-icon"><Building2 size={18} color="#fff" /></div>
          <span>eGov Portal</span>
        </div>

        <div className="status-wrap">
          <div className="status-icon">
            <Clock size={40} color="#f59e0b" />
          </div>

          <h1>Llogaria në pritje</h1>
          <p>Dokumentet tuaja janë duke u shqyrtuar nga ekipi ynë administrativ.</p>

          <div className="status-card">
            <div className="status-step">
              <div className="step-dot done">✓</div>
              <div className="step-info">
                <span className="step-title">Regjistrimi u krye</span>
                <span className="step-sub">Llogaria u krijua me sukses</span>
              </div>
            </div>

            <div className="status-step">
              <div className="step-dot active">•</div>
              <div className="step-info">
                <span className="step-title">Shqyrtim i dokumenteve</span>
                <span className="step-sub">Ekipi ynë po shqyrton dokumentet tuaja</span>
              </div>
            </div>

            <div className="status-step">
              <div className="step-dot">3</div>
              <div className="step-info">
                <span className="step-title">Aktivizim i llogarisë</span>
                <span className="step-sub">Do të njoftoheni me email</span>
              </div>
            </div>
          </div>

          {user?.email && (
            <div className="status-email">
              <Mail size={14} />
              <span>Njoftimi do të dërgohet te: <strong>{user.email}</strong></span>
            </div>
          )}

          <div className="status-time">
            ⏱ Koha e pritjes: 1-2 ditë pune
          </div>

          <button className="status-logout" onClick={logout}>
            <LogOut size={16} />
            Dil nga llogaria
          </button>
        </div>
      </div>
    </>
  )
}

export default Pending