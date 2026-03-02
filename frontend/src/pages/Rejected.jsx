import { useAuth } from '../context/AuthContext'
import { Building2, XCircle, LogOut, Phone, Mail } from 'lucide-react'

const Rejected = () => {
  const { logout } = useAuth()

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        *, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }

        body {
          font-family: 'DM Sans', sans-serif;
          background: #f8fafc;
          min-height: 100vh;
        }

        .rej-page {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          padding: 20px;
          font-family: 'DM Sans', sans-serif;
        }

        .rej-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 40px;
          font-size: 13px;
          font-weight: 700;
          color: #0f172a;
        }

        .rej-logo-icon {
          width: 36px; height: 36px;
          border-radius: 10px;
          background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
          display: flex; align-items: center; justify-content: center;
        }

        .rej-wrap {
          width: 100%;
          max-width: 460px;
          text-align: center;
        }

        .rej-icon {
          width: 72px; height: 72px;
          border-radius: 18px;
          background: #fef2f2;
          border: 1px solid #fecaca;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 24px;
        }

        .rej-wrap h1 {
          font-size: 22px; font-weight: 700; color: #0f172a;
          margin-bottom: 8px; letter-spacing: -0.5px;
        }

        .rej-wrap > p {
          font-size: 13px; color: #6b7280;
          margin-bottom: 28px; line-height: 1.7;
        }

        .rej-card {
          background: #fff;
          border-radius: 14px;
          box-shadow: 0 4px 24px rgba(0,0,0,0.06);
          border: 1px solid #e5e7eb;
          padding: 24px;
          margin-bottom: 16px;
          text-align: left;
        }

        .rej-card-title {
          font-size: 12px; font-weight: 700; color: #374151;
          text-transform: uppercase; letter-spacing: 0.06em;
          margin-bottom: 14px;
        }

        .rej-card p {
          font-size: 13px; color: #6b7280;
          line-height: 1.7; margin: 0;
        }

        .rej-contact {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-top: 14px;
        }

        .rej-contact-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 14px;
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          font-size: 13px;
          color: #374151;
          font-weight: 500;
        }

        .rej-logout {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          padding: 12px 16px;
          background: #0c1220;
          color: #fff;
          border: none;
          border-radius: 10px;
          font-size: 14px; font-weight: 600;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          transition: background 0.15s;
          margin-top: 8px;
        }

        .rej-logout:hover { background: #1a2540; }
      `}</style>

      <div className="rej-page">
        <div className="rej-logo">
          <div className="rej-logo-icon">
            <Building2 size={18} color="#fff" />
          </div>
          <span>eGov Portal</span>
        </div>

        <div className="rej-wrap">
          <div className="rej-icon">
            <XCircle size={36} color="#ef4444" />
          </div>

          <h1>Llogaria u refuzua</h1>
          <p>
            Dokumentet tuaja nuk mund të aprovohen.<br/>
            Kontaktoni support-in për më shumë informacion.
          </p>

          <div className="rej-card">
            <div className="rej-card-title">Çfarë mund të bëni?</div>
            <p>
              Nëse mendoni se ka ndodhur një gabim, ju lutem paraqituni
              personalisht në zyrën më të afërt qeveritare me dokumentet
              origjinale të identitetit.
            </p>
            <div className="rej-contact">
              <div className="rej-contact-item">
                <Phone size={14} color="#6b7280" />
                +389 2 XXX XXXX
              </div>
              <div className="rej-contact-item">
                <Mail size={14} color="#6b7280" />
                support@egov.mk
              </div>
            </div>
          </div>

          <button className="rej-logout" onClick={logout}>
            <LogOut size={15} />
            Dil nga llogaria
          </button>
        </div>
      </div>
    </>
  )
}

export default Rejected