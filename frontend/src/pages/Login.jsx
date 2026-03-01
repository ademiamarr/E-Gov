import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useSignIn } from '@clerk/clerk-react'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from '../components/LanguageSwitcher'
import { Mail, Lock, AlertCircle, Eye, EyeOff, ArrowRight } from 'lucide-react'

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn, isLoaded, setActive } = useSignIn()
  const { t } = useTranslation()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!isLoaded) return
    setLoading(true)
    setError('')

    try {
      const result = await signIn.create({
        identifier: form.email,
        password: form.password,
      })
      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId })
      }
    } catch (err) {
      setError(err.errors?.[0]?.message || t('fill_required'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body, html {
          width: 100%;
          height: 100%;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
        }

        .login-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }

        .login-bg-decoration {
          position: absolute;
          width: 500px;
          height: 500px;
          border-radius: 50%;
          opacity: 0.05;
          pointer-events: none;
        }

        .login-bg-decoration:nth-child(1) {
          background: radial-gradient(circle, #3b82f6, transparent);
          top: -200px;
          left: -200px;
        }

        .login-bg-decoration:nth-child(2) {
          background: radial-gradient(circle, #8b5cf6, transparent);
          bottom: -300px;
          right: -200px;
        }

        .login-container {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 440px;
          padding: 20px;
        }

        .login-card {
          background: rgba(30, 41, 59, 0.8);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          padding: 48px 40px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }

        .login-header {
          margin-bottom: 36px;
          text-align: center;
        }

        .login-logo {
          font-size: 32px;
          font-weight: 800;
          background: linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 12px;
          letter-spacing: -0.8px;
        }

        .login-title {
          font-size: 20px;
          font-weight: 700;
          color: #f1f5f9;
          margin-bottom: 6px;
          letter-spacing: -0.3px;
        }

        .login-subtitle {
          font-size: 13px;
          color: #94a3b8;
          line-height: 1.5;
        }

        .login-lang-switcher {
          display: flex;
          justify-content: center;
          margin-bottom: 28px;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 18px;
          margin-bottom: 24px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-label {
          font-size: 11px;
          font-weight: 700;
          color: #cbd5e1;
          text-transform: uppercase;
          letter-spacing: 0.6px;
        }

        .form-input-wrapper {
          position: relative;
        }

        .form-input {
          width: 100%;
          padding: 12px 14px 12px 38px;
          background: rgba(71, 85, 105, 0.4);
          border: 1px solid rgba(148, 163, 184, 0.2);
          border-radius: 10px;
          color: #f1f5f9;
          font-size: 14px;
          font-family: inherit;
          transition: all 0.2s ease;
          backdrop-filter: blur(4px);
        }

        .form-input::placeholder {
          color: #64748b;
        }

        .form-input:focus {
          outline: none;
          background: rgba(71, 85, 105, 0.6);
          border-color: rgba(59, 130, 246, 0.4);
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .form-input-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #64748b;
          pointer-events: none;
        }

        .form-icon-btn {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #64748b;
          cursor: pointer;
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 0.2s ease;
        }

        .form-icon-btn:hover {
          color: #94a3b8;
        }

        .error-alert {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 14px;
          background: rgba(220, 38, 38, 0.1);
          border: 1px solid rgba(220, 38, 38, 0.2);
          border-radius: 10px;
          color: #fca5a5;
          font-size: 13px;
          margin-bottom: 16px;
        }

        .error-alert svg {
          flex-shrink: 0;
        }

        .btn-submit {
          width: 100%;
          padding: 13px 16px;
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: #ffffff;
          border: none;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          letter-spacing: 0.3px;
        }

        .btn-submit:hover:not(:disabled) {
          background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
          box-shadow: 0 8px 24px rgba(59, 130, 246, 0.3);
          transform: translateY(-2px);
        }

        .btn-submit:active:not(:disabled) {
          transform: translateY(0);
        }

        .btn-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .loader {
          width: 14px;
          height: 14px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: #ffffff;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .login-footer {
          text-align: center;
          font-size: 13px;
          color: #94a3b8;
          padding-top: 20px;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }

        .login-footer a {
          color: #60a5fa;
          text-decoration: none;
          font-weight: 600;
          transition: color 0.2s ease;
        }

        .login-footer a:hover {
          color: #93c5fd;
        }

        .login-security {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          font-size: 12px;
          color: #64748b;
          margin-top: 16px;
        }

        @media (max-width: 480px) {
          .login-card {
            padding: 32px 24px;
          }

          .login-logo {
            font-size: 28px;
          }

          .login-title {
            font-size: 18px;
          }

          .form-input {
            padding: 11px 12px 11px 36px;
            font-size: 16px;
          }

          .btn-submit {
            padding: 12px 14px;
            font-size: 13px;
          }
        }
      `}</style>

      <div className="login-page">
        <div className="login-bg-decoration"></div>
        <div className="login-bg-decoration"></div>

        <div className="login-container">
          <div className="login-card">
            <div className="login-lang-switcher">
              <LanguageSwitcher />
            </div>

            <div className="login-header">
              <div className="login-logo">eGov</div>
              <div className="login-title">{t('login')}</div>
              <div className="login-subtitle">Qasni shërbimet qeveritare me siguri</div>
            </div>

            {error && (
              <div className="error-alert">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-group">
                <label className="form-label">{t('email')}</label>
                <div className="form-input-wrapper">
                  <Mail size={16} className="form-input-icon" />
                  <input
                    type="email"
                    className="form-input"
                    placeholder="admin@egov.mk"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">{t('password')}</label>
                <div className="form-input-wrapper">
                  <Lock size={16} className="form-input-icon" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    className="form-input"
                    placeholder="••••••••••"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required
                  />
                  <button
                    type="button"
                    className="form-icon-btn"
                    onClick={() => setShowPass(!showPass)}
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="btn-submit"
                disabled={loading || !isLoaded}
              >
                {loading ? (
                  <>
                    <div className="loader" />
                    {t('loading')}
                  </>
                ) : (
                  <>
                    {t('login')}
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            <div className="login-footer">
              {t('no_account')} <Link to="/register">{t('register')}</Link>
            </div>

            <div className="login-security">
              🔐 Lidhje e sigurt SSL
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Login