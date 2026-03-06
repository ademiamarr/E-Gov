import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSignIn } from '@clerk/clerk-react'
import { useTranslation } from 'react-i18next'
import { Eye, EyeOff, Calendar, Lock, Zap, Globe } from 'lucide-react'
import LanguageSwitcher from '../components/LanguageSwitcher'

const Login = () => {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn, isLoaded, setActive } = useSignIn()

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
        navigate('/dashboard')
      }
    } catch (err) {
      setError(err.errors?.[0]?.message || t('login_error') || 'Email ose lozinka nuk janë të sakta')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        :root {
          --primary: #d84315;
          --dark: #1a1a18;
          --light-bg: #fafaf8;
          --white: #ffffff;
          --border: #e8e8e5;
          --text-gray: #666666;
        }

        body {
          font-family: 'Inter', sans-serif;
          background: var(--light-bg);
          color: var(--dark);
          min-height: 100vh;
          overflow-x: hidden;
        }

        .login-container {
          display: flex;
          min-height: 100vh;
          width: 100%;
        }

        .login-left {
          flex: 1;
          background: linear-gradient(135deg, #d84315 0%, #f4511e 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 60px 40px;
          position: relative;
          overflow: hidden;
        }

        .login-left::before {
          content: '';
          position: absolute;
          width: 300px;
          height: 300px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.1);
          top: -100px;
          right: -100px;
          z-index: 1;
        }

        .login-left::after {
          content: '';
          position: absolute;
          width: 200px;
          height: 200px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.08);
          bottom: -50px;
          left: -50px;
          z-index: 1;
        }

        .login-decoration {
          position: relative;
          z-index: 2;
          text-align: center;
          color: white;
          max-width: 420px;
        }

        .login-logo-box {
          width: 64px;
          height: 64px;
          background: rgba(255, 255, 255, 0.15);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 40px;
          border: 1px solid rgba(255, 255, 255, 0.25);
        }

        .login-logo-box-icon {
          font-size: 32px;
          font-weight: 700;
          color: white;
        }

        .login-title {
          font-size: 44px;
          font-weight: 700;
          margin-bottom: 20px;
          line-height: 1.2;
          letter-spacing: -0.5px;
        }

        .login-subtitle {
          font-size: 15px;
          line-height: 1.6;
          opacity: 0.95;
          font-weight: 400;
          margin-bottom: 48px;
        }

        .login-features {
          display: flex;
          flex-direction: column;
          gap: 24px;
          text-align: left;
        }

        .login-feature {
          display: flex;
          gap: 16px;
          align-items: flex-start;
        }

        .login-feature-icon {
          width: 40px;
          height: 40px;
          background: rgba(255, 255, 255, 0.12);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          border: 1px solid rgba(255, 255, 255, 0.15);
          color: white;
        }

        .login-feature-content h4 {
          font-size: 13px;
          font-weight: 600;
          margin-bottom: 4px;
          letter-spacing: 0.3px;
        }

        .login-feature-content p {
          font-size: 12px;
          opacity: 0.85;
          line-height: 1.5;
        }

        .login-right {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px;
          background: var(--white);
          position: relative;
        }

        .login-header {
          position: absolute;
          top: 24px;
          right: 40px;
          z-index: 10;
        }

        .login-form-wrapper {
          width: 100%;
          max-width: 380px;
        }

        .login-branding {
          margin-bottom: 40px;
        }

        .login-logo {
          font-size: 28px;
          font-weight: 700;
          color: var(--dark);
          margin-bottom: 8px;
          letter-spacing: -0.5px;
        }

        .login-form-subtitle {
          font-size: 13px;
          color: var(--text-gray);
          font-weight: 400;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        label {
          font-size: 12px;
          font-weight: 600;
          color: var(--dark);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .input-container {
          position: relative;
        }

        input[type="email"],
        input[type="password"] {
          padding: 12px 40px 12px 14px;
          border: 1px solid var(--border);
          border-radius: 6px;
          font-size: 14px;
          font-family: 'Inter', sans-serif;
          background: var(--white);
          color: var(--dark);
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
          width: 100%;
        }

        input[type="email"]:focus,
        input[type="password"]:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(216, 67, 21, 0.08);
        }

        input::placeholder {
          color: #aaa;
        }

        .toggle-password {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: var(--text-gray);
          cursor: pointer;
          padding: 4px 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 0.2s ease;
        }

        .toggle-password:hover {
          color: var(--primary);
        }

        .form-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
        }

        .checkbox-group {
          display: flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
        }

        input[type="checkbox"] {
          width: 16px;
          height: 16px;
          cursor: pointer;
          accent-color: var(--primary);
        }

        .checkbox-label {
          font-size: 12px;
          color: var(--text-gray);
          cursor: pointer;
          margin: 0;
          font-weight: 400;
        }

        .forgot-link {
          font-size: 12px;
          color: var(--primary);
          text-decoration: none;
          font-weight: 500;
          transition: color 0.2s ease;
          cursor: pointer;
          border: none;
          background: none;
          padding: 0;
        }

        .forgot-link:hover {
          color: #c23d0f;
        }

        .btn-login {
          padding: 13px 24px;
          background: var(--primary);
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 600;
          letter-spacing: 0.5px;
          cursor: pointer;
          transition: background-color 0.2s ease;
          text-transform: uppercase;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .btn-login:hover:not(:disabled) {
          background-color: #c23d0f;
        }

        .btn-login:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        .spinner {
          width: 14px;
          height: 14px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .error-message {
          background: #fef2f2;
          color: #ef4444;
          padding: 12px 14px;
          border-radius: 6px;
          border: 1px solid #fecaca;
          font-size: 13px;
          margin-bottom: 16px;
        }

        .register-section {
          margin-top: 28px;
          padding-top: 24px;
          border-top: 1px solid var(--border);
          text-align: center;
          font-size: 13px;
          color: var(--text-gray);
        }

        .register-link {
          color: var(--primary);
          text-decoration: none;
          font-weight: 600;
          transition: color 0.2s ease;
          cursor: pointer;
        }

        .register-link:hover {
          color: #c23d0f;
        }

        /* Language Switcher Overrides */
        .lang-switcher-wrapper {
          position: relative;
        }

        .lang-switcher-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 12px;
          background: var(--white);
          border: 1.5px solid var(--border);
          border-radius: 8px;
          color: var(--dark);
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: 'Inter', sans-serif;
        }

        .lang-switcher-btn:hover {
          border-color: var(--primary);
          background: #f9f9f9;
        }

        .lang-switcher-btn.active {
          background: #eff6ff;
          border-color: var(--primary);
          color: var(--primary);
        }

        @media (max-width: 1024px) {
          .login-container {
            flex-direction: column;
          }

          .login-left {
            padding: 40px;
            min-height: 40vh;
          }

          .login-right {
            padding: 40px;
            min-height: 60vh;
          }

          .login-header {
            position: relative;
            top: 0;
            right: 0;
            margin-bottom: 24px;
          }

          .login-title {
            font-size: 36px;
          }
        }

        @media (max-width: 768px) {
          .login-left {
            padding: 30px 20px;
            min-height: 40vh;
          }

          .login-right {
            padding: 25px 20px;
            min-height: 60vh;
          }

          .login-title {
            font-size: 32px;
            margin-bottom: 16px;
          }

          .login-subtitle {
            font-size: 14px;
          }

          .login-logo {
            font-size: 24px;
            margin-bottom: 6px;
          }

          .login-form-subtitle {
            font-size: 12px;
          }
        }

        @media (max-width: 640px) {
          .login-left {
            display: none;
          }

          .login-right {
            padding: 16px 12px;
            min-height: 100vh;
            justify-content: flex-start;
            padding-top: 80px;
          }

          .login-header {
            position: fixed;
            top: 12px;
            right: 12px;
            left: 12px;
            display: flex;
            justify-content: flex-end;
            z-index: 50;
          }

          .lang-switcher-btn {
            padding: 6px 10px;
            font-size: 11px;
            gap: 4px;
          }

          .login-form-wrapper {
            width: 100%;
            max-width: 100%;
            margin-top: 20px;
          }

          .login-branding {
            margin-bottom: 24px;
          }

          .login-logo {
            font-size: 22px;
            margin-bottom: 6px;
          }

          .login-form {
            gap: 18px;
          }

          label {
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 0.6px;
          }

          input[type="email"],
          input[type="password"] {
            padding: 13px 40px 13px 14px;
            border: 1.5px solid #ddd;
            border-radius: 8px;
            font-size: 15px;
            background: #fafafa;
          }

          input[type="email"]:focus,
          input[type="password"]:focus {
            background: #fff;
            border-color: var(--primary);
            box-shadow: 0 0 0 4px rgba(216, 67, 21, 0.1);
          }

          input::placeholder {
            color: #bbb;
          }

          .form-footer {
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
          }

          .checkbox-label {
            font-size: 11px;
          }

          .forgot-link {
            font-size: 11px;
          }

          .btn-login {
            padding: 12px 20px;
            font-size: 13px;
          }

          .register-section {
            margin-top: 20px;
            padding-top: 16px;
            font-size: 12px;
          }

          .form-group {
            gap: 6px;
          }
        }

        @media (max-width: 480px) {
          .login-right {
            padding: 12px 12px;
            padding-top: 70px;
          }

          .login-header {
            top: 8px;
            right: 8px;
            left: 8px;
          }

          .lang-switcher-btn {
            padding: 5px 8px;
            font-size: 10px;
          }

          .login-logo-box {
            width: 56px;
            height: 56px;
            margin-bottom: 24px;
          }

          .login-logo-box-icon {
            font-size: 28px;
          }

          .login-title {
            font-size: 22px;
            margin-bottom: 12px;
          }

          .login-subtitle {
            font-size: 12px;
            margin-bottom: 24px;
          }

          .login-features {
            gap: 12px;
          }

          .login-feature {
            gap: 10px;
          }

          .login-feature-content h4 {
            font-size: 11px;
          }

          .login-feature-content p {
            font-size: 10px;
          }

          .login-logo {
            font-size: 20px;
          }

          input[type="email"],
          input[type="password"] {
            padding: 12px 38px 12px 12px;
            font-size: 14px;
          }

          .btn-login {
            padding: 11px 18px;
            font-size: 12px;
          }

          .register-section {
            font-size: 11px;
            margin-top: 16px;
          }

          .form-group {
            gap: 5px;
          }

          label {
            font-size: 10px;
          }
        }
      `}</style>

      <div className="login-container">
        <div className="login-left">
          <div className="login-decoration">
            <div className="login-logo-box">
              <div className="login-logo-box-icon">G</div>
            </div>
            <h1 className="login-title">Menaxhoni dokumentet lehtë</h1>
            <p className="login-subtitle">
              Platformë e sigurt për termina online dhe menaxhimin e dokumenteve zyrtare tuaja.
            </p>

            <div className="login-features">
              <div className="login-feature">
                <div className="login-feature-icon">
                  <Calendar size={20} color="white" />
                </div>
                <div className="login-feature-content">
                  <h4>Planifiko terminet kur të dosh</h4>
                  <p>Orar fleksibel sipas kërkesave tuaja</p>
                </div>
              </div>
              <div className="login-feature">
                <div className="login-feature-icon">
                  <Lock size={20} color="white" />
                </div>
                <div className="login-feature-content">
                  <h4>Sigurimi i plotë i të dhënave</h4>
                  <p>I enkriptuar me teknologjinë më të avancuar</p>
                </div>
              </div>
              <div className="login-feature">
                <div className="login-feature-icon">
                  <Zap size={20} color="white" />
                </div>
                <div className="login-feature-content">
                  <h4>Proces i shpejtë dhe i thjeshtë</h4>
                  <p>Përfundoni në disa klikime</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="login-right">
          <div className="login-header">
            <LanguageSwitcher />
          </div>

          <div className="login-form-wrapper">
            <div className="login-branding">
              <div className="login-logo">e-Gov</div>
              <p className="login-form-subtitle">{t('login_subtitle') || 'Portali privat për qytetarë'}</p>
            </div>

            {error && <div className="error-message">{error}</div>}

            <form className="login-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="email">{t('email') || 'E-Poshta'}</label>
                <input
                  id="email"
                  type="email"
                  placeholder="juaji@shembull.mk"
                  value={form.email}
                  onChange={e => {
                    setForm({ ...form, email: e.target.value })
                    setError('')
                  }}
                  required
                  autoComplete="email"
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">{t('password') || 'Lozinka'}</label>
                <div className="input-container">
                  <input
                    id="password"
                    type={showPass ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={form.password}
                    onChange={e => {
                      setForm({ ...form, password: e.target.value })
                      setError('')
                    }}
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={(e) => {
                      e.preventDefault()
                      setShowPass(!showPass)
                    }}
                    aria-label="Toggle password visibility"
                  >
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="form-footer">
                <div className="checkbox-group">
                  <input type="checkbox" id="remember" name="remember" />
                  <label htmlFor="remember" className="checkbox-label">{t('remember_me') || 'Më kujto'}</label>
                </div>
                <button type="button" className="forgot-link">{t('forgot_password') || 'Harrova lozinkën?'}</button>
              </div>

              <button type="submit" className="btn-login" disabled={loading || !isLoaded}>
                {loading ? (
                  <>
                    <span className="spinner" />
                    {t('signing_in') || 'Duke u kyçur...'}
                  </>
                ) : (
                  t('login') || 'Kyçu'
                )}
              </button>
            </form>

            <p className="register-section">
              {t('no_account') || 'Nuk keni llogari?'} <Link to="/register" className="register-link">{t('register_here') || 'Regjistrohuni këtu'}</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

export default Login