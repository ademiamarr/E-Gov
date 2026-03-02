import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useSignIn } from '@clerk/clerk-react'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from '../components/LanguageSwitcher'
import { Mail, Lock, Eye, EyeOff, AlertCircle, ArrowRight } from 'lucide-react'

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
      const result = await signIn.create({ identifier: form.email, password: form.password })
      if (result.status === 'complete') await setActive({ session: result.createdSessionId })
    } catch (err) {
      setError(err.errors?.[0]?.message || t('fill_required'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display&display=swap');

        *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

        .login-root {
          min-height: 100vh;
          display: grid;
          grid-template-columns: 1fr 1fr;
          font-family: 'DM Sans', sans-serif;
          background: #fff;
        }

        /* Left panel */
        .login-left {
          background: #1e3a8a;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 48px 56px;
          position: relative;
          overflow: hidden;
        }

        .login-left::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: repeating-linear-gradient(
            0deg,
            transparent,
            transparent 79px,
            rgba(255,255,255,0.025) 79px,
            rgba(255,255,255,0.025) 80px
          ),
          repeating-linear-gradient(
            90deg,
            transparent,
            transparent 79px,
            rgba(255,255,255,0.025) 79px,
            rgba(255,255,255,0.025) 80px
          );
          pointer-events: none;
        }

        .login-left-brand {
          position: relative;
          z-index: 2;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .login-left-logo {
          width: 36px;
          height: 36px;
          background: #fff;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .login-left-logo svg {
          width: 20px;
          height: 20px;
        }

        .login-left-name {
          font-size: 15px;
          font-weight: 600;
          color: #fff;
          letter-spacing: -0.01em;
        }

        .login-left-content {
          position: relative;
          z-index: 2;
        }

        .login-left-tag {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.12);
          color: rgba(255,255,255,0.6);
          font-size: 11px;
          font-weight: 500;
          padding: 5px 12px;
          border-radius: 20px;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          margin-bottom: 24px;
        }

        .login-left-title {
          font-family: 'DM Serif Display', serif;
          font-size: 2.6rem;
          color: #fff;
          line-height: 1.15;
          letter-spacing: -0.02em;
          margin-bottom: 20px;
        }

        .login-left-title em {
          color: rgba(255,255,255,0.4);
          font-style: italic;
        }

        .login-left-desc {
          font-size: 14px;
          color: rgba(255,255,255,0.4);
          line-height: 1.7;
          max-width: 340px;
        }

        .login-left-stats {
          position: relative;
          z-index: 2;
          display: flex;
          gap: 32px;
          padding-top: 32px;
          border-top: 1px solid rgba(255,255,255,0.08);
        }

        .login-stat-item {}
        .login-stat-num {
          font-size: 22px;
          font-weight: 700;
          color: #fff;
          letter-spacing: -0.03em;
        }
        .login-stat-label {
          font-size: 11px;
          color: rgba(255,255,255,0.35);
          margin-top: 2px;
          letter-spacing: 0.02em;
        }

        /* Right panel */
        .login-right {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 48px 72px;
          background: #fff;
        }

        .login-right-inner {
          width: 100%;
          max-width: 380px;
        }

        .login-right-top {
          display: flex;
          justify-content: flex-end;
          margin-bottom: 48px;
        }

        .login-heading {
          font-size: 24px;
          font-weight: 700;
          color: #1e3a8a;
          letter-spacing: -0.03em;
          margin-bottom: 6px;
        }

        .login-subheading {
          font-size: 13px;
          color: #8a929e;
          margin-bottom: 36px;
          line-height: 1.5;
        }

        .login-error {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 14px;
          background: #fef2f2;
          border: 1px solid #fde8e8;
          border-radius: 8px;
          color: #c0392b;
          font-size: 13px;
          margin-bottom: 20px;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .lf-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .lf-label {
          font-size: 12px;
          font-weight: 600;
          color: #1e3a8a;
          letter-spacing: 0.02em;
        }

        .lf-input-wrap {
          position: relative;
        }

        .lf-icon {
          position: absolute;
          left: 13px;
          top: 50%;
          transform: translateY(-50%);
          color: #b0b8c4;
          pointer-events: none;
        }

        .lf-input {
          width: 100%;
          padding: 11px 13px 11px 38px;
          font-size: 14px;
          font-family: 'DM Sans', sans-serif;
          color: #1e3a8a;
          background: #f7f8fa;
          border: 1.5px solid #e8eaee;
          border-radius: 8px;
          outline: none;
          transition: border-color 0.15s, background 0.15s;
        }

        .lf-input::placeholder { color: #b0b8c4; }

        .lf-input:focus {
          background: #fff;
          border-color: #1e3a8a;
        }

        .lf-eye {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #b0b8c4;
          cursor: pointer;
          padding: 2px;
          display: flex;
          align-items: center;
        }

        .lf-eye:hover { color: #2563eb; }

        .lf-submit {
          margin-top: 8px;
          width: 100%;
          padding: 12px 16px;
          background: #1e3a8a;
          color: #fff;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          letter-spacing: -0.01em;
          transition: background 0.15s;
        }

        .lf-submit:hover:not(:disabled) { background: #1d4ed8; }
        .lf-submit:disabled { opacity: 0.5; cursor: not-allowed; }

        .lf-spinner {
          width: 14px;
          height: 14px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: lf-spin 0.6s linear infinite;
        }
        @keyframes lf-spin { to { transform: rotate(360deg); } }

        .login-footer {
          margin-top: 24px;
          text-align: center;
          font-size: 13px;
          color: #8a929e;
        }

        .login-footer a {
          color: #1e3a8a;
          font-weight: 600;
          text-decoration: none;
        }
        .login-footer a:hover { text-decoration: underline; }

        .login-secure {
          margin-top: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          font-size: 11px;
          color: #c4c9d4;
        }

        @media (max-width: 900px) {
          .login-root { grid-template-columns: 1fr; }
          .login-left { display: none; }
          .login-right { padding: 40px 24px; }
        }
      `}</style>

      <div className="login-root">
        {/* Left decorative panel */}
        <div className="login-left">
          <div className="login-left-brand">
            <div className="login-left-logo">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 22V10L12 3L21 10V22H15V16H9V22H3Z" fill="#1e3a8a"/>
              </svg>
            </div>
            <span className="login-left-name">eGov Portal</span>
          </div>

          <div className="login-left-content">
            <div className="login-left-tag">
              <span>🇲🇰</span>
              Republika e Maqedonisë së Veriut
            </div>
            <h2 className="login-left-title">
              Shërbime<br/>
              qeveritare<br/>
              <em>online.</em>
            </h2>
            <p className="login-left-desc">
              Aksesoni gjitha shërbimet administrative nga një vend — me siguri, shpejtësi dhe transparencë.
            </p>
          </div>

          <div className="login-left-stats">
            <div className="login-stat-item">
              <div className="login-stat-num">24/7</div>
              <div className="login-stat-label">Shërbim i vazhdueshëm</div>
            </div>
            <div className="login-stat-item">
              <div className="login-stat-num">SSL</div>
              <div className="login-stat-label">Lidhje e enkriptuar</div>
            </div>
            <div className="login-stat-item">
              <div className="login-stat-num">100%</div>
              <div className="login-stat-label">Qeveritar zyrtar</div>
            </div>
          </div>
        </div>

        {/* Right form panel */}
        <div className="login-right">
          <div className="login-right-inner">
            <div className="login-right-top">
              <LanguageSwitcher />
            </div>

            <h1 className="login-heading">Mirë se erdhët</h1>
            <p className="login-subheading">Kyçuni në llogarinë tuaj qeveritare</p>

            {error && (
              <div className="login-error">
                <AlertCircle size={15} />
                <span>{error}</span>
              </div>
            )}

            <form className="login-form" onSubmit={handleSubmit}>
              <div className="lf-group">
                <label className="lf-label">Email</label>
                <div className="lf-input-wrap">
                  <Mail size={15} className="lf-icon" />
                  <input
                    type="email"
                    className="lf-input"
                    placeholder="emri@shembull.mk"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="lf-group">
                <label className="lf-label">Fjalëkalim</label>
                <div className="lf-input-wrap">
                  <Lock size={15} className="lf-icon" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    className="lf-input"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    required
                  />
                  <button type="button" className="lf-eye" onClick={() => setShowPass(!showPass)}>
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <button type="submit" className="lf-submit" disabled={loading || !isLoaded}>
                {loading ? (
                  <><div className="lf-spinner" /> Duke u kyçur...</>
                ) : (
                  <>Kyçu <ArrowRight size={15} /></>
                )}
              </button>
            </form>

            <p className="login-footer">
              Nuk keni llogari? <Link to="/register">Regjistrohuni</Link>
            </p>

            <div className="login-secure">
              <Lock size={11} />
              <span>Lidhje e sigurt me enkriptim 256-bit</span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Login