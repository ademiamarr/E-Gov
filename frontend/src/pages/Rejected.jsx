import { useAuth } from '../context/AuthContext'
import { Building2, XCircle, LogOut } from 'lucide-react'

const Rejected = () => {
  const { logout } = useAuth()

  return (
    <div className="status-page rejected-page">
      <div className="status-logo">
        <div className="status-logo-icon"><Building2 size={18} color="#fff" /></div>
        <span>eGov Portal</span>
      </div>

      <div className="status-wrap">
        <div className="status-icon rejected-icon">
          <XCircle size={32} color="#ef4444" />
        </div>
        <h1>Llogaria u refuzua</h1>
        <p>Dokumentet tuaja nuk mund të aprovohen. Kontaktoni support-in për më shumë informacion.</p>

        <div className="status-card">
          <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.7, margin: 0 }}>
            Nëse mendoni se ka ndodhur një gabim, ju lutem paraqituni personalisht në zyrën më të afërt qeveritare me dokumentet origjinale.
          </p>
        </div>

        <div className="rejected-contact">
          <span>📞 +389 2 XXX XXXX</span>
          <span>✉️ support@egov.mk</span>
        </div>

        <button className="status-logout" onClick={logout}>
          <LogOut size={14} /> Dil nga llogaria
        </button>
      </div>
    </div>
  )
}

export default Rejected