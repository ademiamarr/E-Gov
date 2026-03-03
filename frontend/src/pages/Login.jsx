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
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }
        body { font-family:'Plus Jakarta Sans',sans-serif; background:#f4f6fb; }

        .lg { min-height:100dvh; display:flex; flex-direction:column; background:#f4f6fb; }

        .lg-top {
          display:flex; align-items:center; justify-content:space-between;
          padding:16px 20px; background:#fff; border-bottom:1px solid #eaecf0;
        }
        .lg-brand { display:flex; align-items:center; gap:9px; }
        .lg-brand-icon {
          width:34px; height:34px; background:#1e3a8a; border-radius:9px;
          display:flex; align-items:center; justify-content:center;
        }
        .lg-brand-name { font-size:14px; font-weight:800; color:#1e3a8a; letter-spacing:-0.02em; }

        .lg-hero {
          background:linear-gradient(135deg,#1e3a8a 0%,#2563eb 100%);
          padding:32px 20px 52px;
        }
        .lg-hero-flag {
          display:inline-flex; align-items:center; gap:6px;
          background:rgba(255,255,255,0.12); border:1px solid rgba(255,255,255,0.2);
          border-radius:20px; padding:5px 12px;
          font-size:11px; font-weight:600; color:rgba(255,255,255,0.85);
          letter-spacing:0.02em; margin-bottom:16px;
        }
        .lg-hero-title {
          font-size:30px; font-weight:800; color:#fff;
          letter-spacing:-0.03em; line-height:1.15; margin-bottom:6px;
        }
        .lg-hero-sub { font-size:13px; color:rgba(255,255,255,0.6); font-weight:500; }

        .lg-card {
          background:#fff; margin:-20px 16px 0;
          border-radius:20px; padding:24px 20px 28px;
          box-shadow:0 4px 24px rgba(0,0,0,0.09);
          position:relative; z-index:2;
        }

        .lg-error {
          display:flex; align-items:center; gap:8px;
          padding:11px 13px; background:#fef2f2; border:1.5px solid #fecaca;
          border-radius:10px; color:#dc2626; font-size:13px; font-weight:600;
          margin-bottom:16px;
        }

        .lg-form { display:flex; flex-direction:column; gap:14px; }
        .lg-group { display:flex; flex-direction:column; gap:5px; }
        .lg-label { font-size:11px; font-weight:700; color:#1e3a8a; letter-spacing:0.04em; text-transform:uppercase; }

        .lg-input-wrap { position:relative; }
        .lg-input {
          width:100%; padding:13px 14px;
          font-size:15px; font-family:'Plus Jakarta Sans',sans-serif;
          color:#0f1728; background:#f7f9fc;
          border:1.5px solid #e5e7eb; border-radius:12px;
          outline:none; transition:border-color 0.15s, background 0.15s;
          -webkit-appearance:none;
        }
        .lg-input::placeholder { color:#c4c9d4; }
        .lg-input:focus { border-color:#1e3a8a; background:#fff; }
        .lg-input-pr { padding-right:46px; }

        .lg-eye {
          position:absolute; right:14px; top:50%; transform:translateY(-50%);
          background:none; border:none; color:#9ca3af; cursor:pointer;
          padding:4px; display:flex; align-items:center; font-size:17px;
          -webkit-tap-highlight-color:transparent;
        }

        .lg-submit {
          width:100%; padding:14px; background:#1e3a8a; color:#fff;
          border:none; border-radius:12px; font-size:15px; font-weight:700;
          font-family:'Plus Jakarta Sans',sans-serif; cursor:pointer;
          display:flex; align-items:center; justify-content:center; gap:8px;
          transition:transform 0.1s; -webkit-appearance:none; margin-top:4px;
          letter-spacing:-0.01em;
        }
        .lg-submit:active { transform:scale(0.98); }
        .lg-submit:disabled { opacity:0.55; cursor:not-allowed; }

        .lg-spinner {
          width:16px; height:16px;
          border:2px solid rgba(255,255,255,0.3); border-top-color:#fff;
          border-radius:50%; animation:lgspin 0.6s linear infinite;
        }
        @keyframes lgspin { to { transform:rotate(360deg); } }

        .lg-divider { display:flex; align-items:center; gap:10px; margin:20px 0; }
        .lg-divider-line { flex:1; height:1px; background:#e5e7eb; }
        .lg-divider-text { font-size:11px; color:#9ca3af; font-weight:600; }

        .lg-footer { text-align:center; font-size:14px; color:#6b7280; }
        .lg-footer a { color:#1e3a8a; font-weight:700; text-decoration:none; }

        .lg-trust {
          display:flex; justify-content:center; gap:28px;
          padding:20px 20px 16px;
        }
        .lg-trust-item { display:flex; flex-direction:column; align-items:center; gap:4px; }
        .lg-trust-icon { font-size:20px; }
        .lg-trust-label { font-size:10px; font-weight:600; color:#94a3b8; letter-spacing:0.02em; }
      `}</style>

      <div className="lg">
        <div className="lg-top">
          <div className="lg-brand">
            <div className="lg-brand-icon">
              <svg viewBox="0 0 24 24" fill="none" width={18} height={18}>
                <path d="M3 22V10L12 3L21 10V22H15V16H9V22H3Z" fill="#fff"/>
              </svg>
            </div>
            <span className="lg-brand-name">eGov Portal</span>
          </div>
          <LanguageSwitcher />
        </div>

        <div className="lg-hero">
          <div className="lg-hero-flag">🇲🇰 Republika e Maqedonisë së Veriut</div>
          <h1 className="lg-hero-title">Mirë se<br/>erdhët</h1>
          <p className="lg-hero-sub">Kyçuni në llogarinë tuaj qeveritare</p>
        </div>

        <div className="lg-card">
          {error && (
            <div className="lg-error">
              <span>⚠</span><span>{error}</span>
            </div>
          )}
          <form className="lg-form" onSubmit={handleSubmit}>
            <div className="lg-group">
              <label className="lg-label">Email</label>
              <div className="lg-input-wrap">
                <input
                  type="email" className="lg-input"
                  placeholder="emri@shembull.mk"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  required autoComplete="email"
                />
              </div>
            </div>
            <div className="lg-group">
              <label className="lg-label">Fjalëkalim</label>
              <div className="lg-input-wrap">
                <input
                  type={showPass ? 'text' : 'password'}
                  className="lg-input lg-input-pr"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  required autoComplete="current-password"
                />
                <button type="button" className="lg-eye" onClick={() => setShowPass(!showPass)}>
                  {showPass ? '🙈' : '👁'}
                </button>
              </div>
            </div>
            <button type="submit" className="lg-submit" disabled={loading || !isLoaded}>
              {loading ? <><div className="lg-spinner"/>Duke u kyçur...</> : 'Kyçu →'}
            </button>
          </form>

          <div className="lg-divider">
            <div className="lg-divider-line"/>
            <span className="lg-divider-text">ose</span>
            <div className="lg-divider-line"/>
          </div>

          <p className="lg-footer">
            Nuk keni llogari? <Link to="/register">Regjistrohuni falas</Link>
          </p>
        </div>

        <div className="lg-trust">
          <div className="lg-trust-item">
            <span className="lg-trust-icon">🔒</span>
            <span className="lg-trust-label">SSL 256-bit</span>
          </div>
          <div className="lg-trust-item">
            <span className="lg-trust-icon">🏛️</span>
            <span className="lg-trust-label">Zyrtar</span>
          </div>
          <div className="lg-trust-item">
            <span className="lg-trust-icon">⚡</span>
            <span className="lg-trust-label">24/7</span>
          </div>
        </div>
      </div>
    </>
  )
}

export default Login