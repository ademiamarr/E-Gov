import { useAuth } from '../context/AuthContext'
import { Building2, Clock, Mail, LogOut } from 'lucide-react'

const Pending = () => {
  const { user, logout } = useAuth()

  return (
    <div className="status-page pending-page">
      <div className="status-logo">
        <div className="status-logo-icon"><Building2 size={18} color="#fff" /></div>
        <span>eGov Portal</span>
      </div>

      <div className="status-wrap">
        <div className="status-icon pending-icon">
          <Clock size={32} color="#f59e0b" />
        </div>
        <h1>Llogaria në pritje</h1>
        <p>Dokumentet tuaja janë duke u shqyrtuar nga ekipi ynë administrativ.</p>

        <div className="status-card">
          <div className="status-step">
            <div className="step-dot done" />
            <div className="step-info">
              <span className="step-title">Regjistrimi u krye ✓</span>
              <span className="step-sub">Llogaria u krijua me sukses</span>
            </div>
          </div>
          <div className="status-step">
            <div className="step-dot active" />
            <div className="step-info">
              <span className="step-title">Shqyrtim i dokumenteve</span>
              <span className="step-sub">Ekipi ynë po shqyrton dokumentet tuaja</span>
            </div>
          </div>
          <div className="status-step">
            <div className="step-dot" />
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

        <div className="status-time">⏱ Koha e pritjes: 1-2 ditë pune</div>

        <button className="status-logout" onClick={logout}>
          <LogOut size={14} /> Dil nga llogaria
        </button>
      </div>
    </div>
  )
}

export default Pending