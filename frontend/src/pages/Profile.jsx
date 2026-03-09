import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTranslation } from 'react-i18next'
import { Eye, EyeOff, LogOut, Check, AlertCircle } from 'lucide-react'
import API from '../api/axios'

const Profile = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { t } = useTranslation()

  const [activeTab, setActiveTab] = useState('info')
  const [changePass, setChangePass] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [showCurrentPass, setShowCurrentPass] = useState(false)
  const [showNewPass, setShowNewPass] = useState(false)
  const [showConfirmPass, setShowConfirmPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const passwordReqs = {
    length: changePass.newPassword.length >= 8,
    uppercase: /[A-Z]/.test(changePass.newPassword),
    number: /[0-9]/.test(changePass.newPassword),
    special: /[!@#$%^&*]/.test(changePass.newPassword),
    match: changePass.newPassword && changePass.confirmPassword && changePass.newPassword === changePass.confirmPassword,
  }

  const allValid = passwordReqs.length && passwordReqs.uppercase && passwordReqs.number && passwordReqs.special && passwordReqs.match

  const handleChangePassword = async (e) => {
    e.preventDefault()
    if (!allValid) {
      showToast('Plotësoni të gjitha kërkesat e fjalëkalimit', 'error')
      return
    }

    setLoading(true)
    try {
      const res = await API.post('/auth/change-password', {
        currentPassword: changePass.currentPassword,
        newPassword: changePass.newPassword,
      })

      if (res.data?.success) {
        showToast('Fjalëkalimi u ndryshua me sukses!')
        setChangePass({ currentPassword: '', newPassword: '', confirmPassword: '' })
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Gabim në ndryshimin e fjalëkalimit', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        *, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }
        body { font-family: 'DM Sans', sans-serif; background: #f4f6fb; }

        .prof { min-height: 100vh; background: #f4f6fb; padding-bottom: 80px; }

        .prof-header {
          background: #fff;
          padding: 14px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid #eaecf0;
          position: sticky;
          top: 0;
          z-index: 50;
        }

        .prof-back {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          border: 1.5px solid #eaecf0;
          background: none;
          cursor: pointer;
          font-size: 16px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .prof-title {
          font-size: 17px;
          font-weight: 800;
          color: #0f1728;
          letter-spacing: -0.02em;
        }

        .prof-content { padding: 20px; }

        .prof-avatar-section {
          text-align: center;
          margin-bottom: 28px;
        }

        .prof-avatar {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 32px;
          font-weight: 800;
          color: #fff;
          margin: 0 auto 12px;
        }

        .prof-name { font-size: 18px; font-weight: 700; color: #0f1728; margin-bottom: 4px; }
        .prof-email { font-size: 13px; color: #6b7280; }

        .prof-tabs {
          display: flex;
          gap: 8px;
          margin-bottom: 16px;
          padding-bottom: 14px;
          border-bottom: 1px solid #eaecf0;
        }

        .prof-tab {
          padding: 8px 14px;
          border: none;
          background: none;
          color: #6b7280;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          border-bottom: 2px solid transparent;
          font-family: 'DM Sans', sans-serif;
        }

        .prof-tab.active {
          color: #1e3a8a;
          border-bottom-color: #1e3a8a;
        }

        .prof-card {
          background: #fff;
          border-radius: 14px;
          border: 1.5px solid #eaecf0;
          padding: 16px;
          margin-bottom: 12px;
        }

        .prof-field { display: flex; flex-direction: column; gap: 5px; margin-bottom: 12px; }
        .prof-field:last-child { margin-bottom: 0; }
        .prof-label { font-size: 11px; font-weight: 600; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.04em; }
        .prof-value { font-size: 13px; font-weight: 600; color: #0f1728; }

        .prof-form { display: flex; flex-direction: column; gap: 14px; }
        .form-group { display: flex; flex-direction: column; gap: 6px; }
        .form-label { font-size: 12px; font-weight: 700; color: #1e3a8a; text-transform: uppercase; letter-spacing: 0.05em; }

        .input-container { position: relative; }
        input[type="password"],
        input[type="text"] {
          padding: 12px 40px 12px 14px;
          border: 1.5px solid #e5e7eb;
          border-radius: 8px;
          font-size: 13px;
          font-family: 'DM Sans', sans-serif;
          color: #0f1728;
          background: #f9fafb;
          outline: none;
          transition: border-color 0.15s, background 0.15s;
          width: 100%;
        }

        input[type="password"]:focus,
        input[type="text"]:focus {
          border-color: #1e3a8a;
          background: #fff;
        }

        input::placeholder { color: #d1d5db; }

        .toggle-pass {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #6b7280;
          cursor: pointer;
          padding: 4px 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 0.15s;
        }

        .toggle-pass:hover { color: #1e3a8a; }

        .password-reqs {
          background: #f9fafb;
          border: 1px solid #f3f4f6;
          border-radius: 8px;
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .req {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          color: #9ca3af;
        }

        .req.valid { color: #22c55e; }

        .req-icon {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #e5e7eb;
          color: #9ca3af;
          font-size: 8px;
          font-weight: 700;
          flex-shrink: 0;
        }

        .req.valid .req-icon {
          background: #dcfce7;
          color: #22c55e;
        }

        .btn-submit {
          padding: 12px;
          background: #1e3a8a;
          color: #fff;
          border: none;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          transition: background 0.15s;
        }

        .btn-submit:hover:not(:disabled) { background: #1d4ed8; }
        .btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }

        .btn-logout {
          width: 100%;
          padding: 12px;
          background: #fef2f2;
          border: 1.5px solid #fecaca;
          color: #ef4444;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          transition: background 0.15s;
          margin-top: 16px;
        }

        .btn-logout:active { background: #fee2e2; }

        .prof-toast {
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 9999;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 11px 16px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 500;
          box-shadow: 0 4px 16px rgba(0,0,0,0.08);
          border: 1px solid;
          font-family: 'DM Sans', sans-serif;
        }

        .prof-toast.ok { background: #f0fdf4; border-color: #bbf7d0; color: #15803d; }
        .prof-toast.err { background: #fef2f2; border-color: #fecaca; color: #dc2626; }

        .prof-nav {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: #fff;
          border-top: 1px solid #eaecf0;
          display: flex;
          padding: 8px 0 env(safe-area-inset-bottom, 0);
          z-index: 100;
        }

        .prof-nav-item {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 3px;
          padding: 6px 0;
          cursor: pointer;
          text-decoration: none;
          -webkit-tap-highlight-color: transparent;
        }

        .prof-nav-icon { font-size: 20px; }
        .prof-nav-label { font-size: 9px; font-weight: 700; color: #94a3b8; letter-spacing: 0.02em; text-transform: uppercase; }
        .prof-nav-item.active .prof-nav-label { color: #1e3a8a; }
        .prof-nav-dot { width: 4px; height: 4px; border-radius: 50%; background: #1e3a8a; display: none; }
        .prof-nav-item.active .prof-nav-dot { display: block; }
      `}</style>

      <div className="prof">
        {toast && (
          <div className={`prof-toast ${toast.type === 'error' ? 'err' : 'ok'}`}>
            {toast.type === 'error' ? <AlertCircle size={14} /> : <Check size={14} />}
            {toast.msg}
          </div>
        )}

        <header className="prof-header">
          <button className="prof-back" onClick={() => navigate(-1)}>←</button>
          <h1 className="prof-title">{t('profile') || 'Profili Im'}</h1>
          <div style={{ width: '36px' }} />
        </header>

        <div className="prof-content">
          <div className="prof-avatar-section">
            <div className="prof-avatar">
              {user?.first_name?.[0]}{user?.last_name?.[0]}
            </div>
            <p className="prof-name">{user?.first_name} {user?.last_name}</p>
            <p className="prof-email">{user?.email}</p>
          </div>

          <div className="prof-tabs">
            <button
              className={`prof-tab ${activeTab === 'info' ? 'active' : ''}`}
              onClick={() => setActiveTab('info')}
            >
              Të dhënat
            </button>
            <button
              className={`prof-tab ${activeTab === 'password' ? 'active' : ''}`}
              onClick={() => setActiveTab('password')}
            >
              Fjalëkalim
            </button>
          </div>

          {activeTab === 'info' && (
            <div className="prof-card">
              <div className="prof-field">
                <span className="prof-label">Emri i parë</span>
                <span className="prof-value">{user?.first_name}</span>
              </div>
              <div className="prof-field">
                <span className="prof-label">Mbiemri</span>
                <span className="prof-value">{user?.last_name}</span>
              </div>
              <div className="prof-field">
                <span className="prof-label">Email</span>
                <span className="prof-value">{user?.email}</span>
              </div>
              <div className="prof-field">
                <span className="prof-label">EMBG</span>
                <span className="prof-value">{user?.personal_id}</span>
              </div>
              <div className="prof-field">
                <span className="prof-label">Statusi</span>
                <span className="prof-value">{user?.verification_status}</span>
              </div>
            </div>
          )}

          {activeTab === 'password' && (
            <div className="prof-card">
              <form className="prof-form" onSubmit={handleChangePassword}>
                <div className="form-group">
                  <label className="form-label">Fjalëkalimi aktual</label>
                  <div className="input-container">
                    <input
                      type={showCurrentPass ? 'text' : 'password'}
                      placeholder="Fjalëkalimi aktual"
                      value={changePass.currentPassword}
                      onChange={(e) => {
                        setChangePass({ ...changePass, currentPassword: e.target.value })
                        setToast(null)
                      }}
                      required
                    />
                    <button
                      type="button"
                      className="toggle-pass"
                      onClick={() => setShowCurrentPass(!showCurrentPass)}
                    >
                      {showCurrentPass ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Fjalëkalimi i ri</label>
                  <div className="input-container">
                    <input
                      type={showNewPass ? 'text' : 'password'}
                      placeholder="Fjalëkalimi i ri"
                      value={changePass.newPassword}
                      onChange={(e) => setChangePass({ ...changePass, newPassword: e.target.value })}
                      required
                    />
                    <button
                      type="button"
                      className="toggle-pass"
                      onClick={() => setShowNewPass(!showNewPass)}
                    >
                      {showNewPass ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Konfirmoni fjalëkalimin</label>
                  <div className="input-container">
                    <input
                      type={showConfirmPass ? 'text' : 'password'}
                      placeholder="Përsëriteni fjalëkalimin"
                      value={changePass.confirmPassword}
                      onChange={(e) => setChangePass({ ...changePass, confirmPassword: e.target.value })}
                      required
                    />
                    <button
                      type="button"
                      className="toggle-pass"
                      onClick={() => setShowConfirmPass(!showConfirmPass)}
                    >
                      {showConfirmPass ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                </div>

                <div className="password-reqs">
                  <div className={`req ${passwordReqs.length ? 'valid' : ''}`}>
                    <div className="req-icon">{passwordReqs.length ? '✓' : '—'}</div>
                    <span>Të paktën 8 karaktere</span>
                  </div>
                  <div className={`req ${passwordReqs.uppercase ? 'valid' : ''}`}>
                    <div className="req-icon">{passwordReqs.uppercase ? '✓' : '—'}</div>
                    <span>Një shkronjë e madhe</span>
                  </div>
                  <div className={`req ${passwordReqs.number ? 'valid' : ''}`}>
                    <div className="req-icon">{passwordReqs.number ? '✓' : '—'}</div>
                    <span>Një numër</span>
                  </div>
                  <div className={`req ${passwordReqs.special ? 'valid' : ''}`}>
                    <div className="req-icon">{passwordReqs.special ? '✓' : '—'}</div>
                    <span>Karakter special (!@#$%^&*)</span>
                  </div>
                  <div className={`req ${passwordReqs.match ? 'valid' : ''}`}>
                    <div className="req-icon">{passwordReqs.match ? '✓' : '—'}</div>
                    <span>Fjalëkalimet përputhen</span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn-submit"
                  disabled={loading || !allValid}
                >
                  {loading ? '⏳ Duke ndryshua...' : '🔐 Ndrysho Fjalëkalimin'}
                </button>
              </form>
            </div>
          )}

          <button className="btn-logout" onClick={logout}>
            <LogOut size={14} />
            Dil nga llogaria
          </button>
        </div>

        <nav className="prof-nav">
          {[
            { icon: '🏠', label: 'Kryesorja', to: '/dashboard' },
            { icon: '📅', label: 'Terminet', to: '/my-appointments' },
            { icon: '💳', label: 'Gjobat', to: '/fines' },
            { icon: '👤', label: 'Profili', to: '/profile' },
          ].map((n) => (
            <a
              key={n.to}
              href={n.to}
              className={`prof-nav-item${location.pathname === n.to ? ' active' : ''}`}
            >
              <span className="prof-nav-icon">{n.icon}</span>
              <span className="prof-nav-label">{n.label}</span>
              <div className="prof-nav-dot" />
            </a>
          ))}
        </nav>
      </div>
    </>
  )
}

export default Profile