import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSignIn } from '@clerk/clerk-react'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from '../../components/LanguageSwitcher'
import { Building2, Eye, EyeOff, AlertCircle, Lock, ChevronRight } from 'lucide-react'

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn, isLoaded, setActive } = useSignIn()
  const { t } = useTranslation()
  const navigate = useNavigate()

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
        // ✅ LET AUTHCONTEXT HANDLE REDIRECT
        // DON'T HARDCODE window.location.href
      }
    } catch (err) {
      setError(err.errors?.[0]?.message || t('fill_required'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      {/* Left Side */}
      <div className="login-left">
        <div className="login-left-grid" />
        <div className="login-left-glow1" />
        <div className="login-left-glow2" />

        <div className="login-left-logo">
          <div className="login-logo-icon">
            <Building2 size={20} color="#fff" />
          </div>
          <div>
            <div className="login-logo-title">eGov Portal</div>
            <div className="login-logo-sub">Maqedonia e Veriut</div>
          </div>
        </div>

        <div className="login-left-content">
          <h2 className="login-left-title">Shërbime Qeveritare në Një Vend</h2>
          <p className="login-left-desc">Aksesoni të gjitha shërbimet administrative me siguri dhe shpejtësi.</p>
          <div className="login-chips">
            {['Terminë', 'Gjoba', 'Leje'].map(s => (
              <div key={s} className="login-chip">{s}</div>
            ))}
          </div>
        </div>

        <div className="login-left-footer">© 2026 eGov Portal — Republika e Maqedonisë</div>
      </div>

      {/* Right Side */}
      <div className="login-right">
        <div className="login-right-header">
          <LanguageSwitcher />
        </div>

        <div className="login-container">
          <div className="login-box">
            <h1>{t('login')}</h1>
            <p>{t('login_subtitle')}</p>

            {error && (
              <div className="alert alert-danger">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-group">
                <label className="form-label">{t('email')}</label>
                <input
                  type="email"
                  value={form.email}
                  placeholder="email@example.com"
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  className="form-control"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">{t('password')}</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={form.password}
                    placeholder="••••••••"
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    className="form-control"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#9ca3af'
                    }}
                  >
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? '🔄 Loading...' : <>
                  {t('login')} <ChevronRight size={16} />
                </>}
              </button>
            </form>

            <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px' }}>
              {t('no_account')} <Link to="/register" style={{ color: '#2563eb', fontWeight: '700' }}>{t('register')}</Link>
            </p>

            <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '11px', color: '#9ca3af' }}>
              <Lock size={12} style={{ display: 'inline', marginRight: '4px' }} />
              {t('security_note')}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login