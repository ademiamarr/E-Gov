import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useSignIn } from '@clerk/clerk-react'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from '../components/LanguageSwitcher'

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
        password: form.password 
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

        html {
          scroll-behavior: smooth;
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
          padding: 40px;
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
          max-width: 400px;
        }

        .login-icon {
          font-size: 48px;
          margin-bottom: 32px;
          opacity: 0.95;
        }

        .login-title {
          font-family: 'Playfair Display', serif;
          font-size: 48px;
          font-weight: 700;
          margin-bottom: 20px;
          line-height: 1.2;
        }

        .login-subtitle {
          font-size: 15px;
          line-height: 1.6;
          opacity: 0.95;
          font-weight: 400;
        }

        .login-features {
          margin-top: 48px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .login-feature {
          display: flex;
          align-items: flex-start;
          gap: 16px;
        }

        .login-feature-icon {
          font-size: 20px;
          flex-shrink: 0;
          opacity: 0.9;
        }

        .login-feature-text {
          text-align: left;
          font-size: 13px;
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
        }

        .login-form-wrapper {
          width: 100%;
          max-width: 380px;
        }

        .login-branding {
          margin-bottom: 40px;
        }

        .login-logo {
          font-family: 'Playfair Display', serif;
          font-size: 28px;
          font-weight: 700;
          color: var(--dark);
          margin-bottom: 8px;
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
          padding: 12px 14px;
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
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          font-size: 18px;
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
            padding: 25px 16px;
            min-height: 35vh;
          }

          .login-right {
            padding: 20px 16px;
            min-height: 65vh;
          }

          .login-icon {
            font-size: 36px;
            margin-bottom: 16px;
          }

          .login-title {
            font-size: 26px;
            margin-bottom: 12px;
            line-height: 1.3;
          }

          .login-subtitle {
            font-size: 13px;
            line-height: 1.5;
          }

          .login-features {
            margin-top: 24px;
            gap: 14px;
          }

          .login-feature {
            gap: 12px;
          }

          .login-feature-icon {
            font-size: 16px;
          }

          .login-feature-text {
            font-size: 11px;
          }

          .login-form-wrapper {
            max-width: 100%;
          }

          .login-branding {
            margin-bottom: 24px;
          }

          .login-logo {
            font-size: 22px;
            margin-bottom: 6px;
          }

          .login-form {
            gap: 16px;
          }

          .form-group {
            gap: 6px;
          }

          label {
            font-size: 11px;
          }

          input[type="email"],
          input[type="password"] {
            padding: 10px 12px;
            font-size: 13px;
          }

          .form-footer {
            flex-direction: column;
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
        }

        @media (max-width: 480px) {
          .login-left {
            padding: 20px 12px;
            min-height: 30vh;
          }

          .login-right {
            padding: 16px 12px;
          }

          .login-icon {
            font-size: 28px;
            margin-bottom: 12px;
          }

          .login-title {
            font-size: 22px;
            margin-bottom: 10px;
          }

          .login-subtitle {
            font-size: 12px;
          }

          .login-features {
            margin-top: 20px;
            gap: 12px;
          }

          .login-feature {
            gap: 10px;
          }

          .login-feature-icon {
            font-size: 14px;
          }

          .login-feature-text {
            font-size: 10px;
          }

          .login-logo {
            font-size: 20px;
          }

          input[type="email"],
          input[type="password"] {
            padding: 9px 10px;
            font-size: 14px;
          }

          .btn-login {
            padding: 10px 16px;
            font-size: 12px;
          }

          .register-section {
            font-size: 11px;
          }
        }
      `}</style>

      <div className="login-container">
        <div className="login-left">
          <div className="login-decoration">
            <div className="login-icon">📄</div>
            <h1 className="login-title">Управувајте со документите лесно</h1>
            <p className="login-subtitle">
              Безбедна платформа за онлајн термине и управување со вашите официјални документи.
            </p>

            <div className="login-features">
              <div className="login-feature">
                <div className="login-feature-icon">📅</div>
                <div className="login-feature-text">Направи термин кога сакаш</div>
              </div>
              <div className="login-feature">
                <div className="login-feature-icon">🔒</div>
                <div className="login-feature-text">Целосна безбедност на твои податоци</div>
              </div>
              <div className="login-feature">
                <div className="login-feature-icon">✓</div>
                <div className="login-feature-text">Брз и лесен процес</div>
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
              <p className="login-form-subtitle">Приватен портал за граѓани</p>
            </div>

            {error && <div className="error-message">{error}</div>}

            <form className="login-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="email">Е-пошта</label>
                <input
                  id="email"
                  type="email"
                  placeholder="вашата.пошта@пример.mk"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  required
                  autoComplete="email"
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Лозинка</label>
                <div className="input-container">
                  <input
                    id="password"
                    type={showPass ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowPass(!showPass)}
                    aria-label="Toggle password visibility"
                  >
                    {showPass ? '🙈' : '👁'}
                  </button>
                </div>
              </div>

              <div className="form-footer">
                <div className="checkbox-group">
                  <input type="checkbox" id="remember" name="remember" />
                  <label htmlFor="remember" className="checkbox-label">Запомни ме</label>
                </div>
                <button type="button" className="forgot-link">Заборави лозинка?</button>
              </div>

              <button type="submit" className="btn-login" disabled={loading || !isLoaded}>
                {loading ? (
                  <>
                    <span className="spinner" />
                    Се логира...
                  </>
                ) : (
                  'Влез'
                )}
              </button>
            </form>

            <p className="register-section">
              Немаш профил? <Link to="/register" className="register-link">Регистрирај се</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

export default Login