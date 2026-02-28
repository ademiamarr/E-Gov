import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useSignIn } from '@clerk/clerk-react'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from '../../components/LanguageSwitcher'
import { Building2, Eye, EyeOff, AlertCircle, Lock, ChevronRight } from 'lucide-react'
import './Login.css'

const Login = () => {
  const [form, setForm]             = useState({ email: '', password: '' })
  const [showPass, setShowPass]     = useState(false)
  const [error, setError]           = useState('')
  const [loading, setLoading]       = useState(false)
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
        await new Promise(r => setTimeout(r, 800))
        window.location.href = '/dashboard'
      }
    } catch (err) {
      setError(err.errors?.[0]?.message || t('fill_required'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-left">
        <div className="login-left-grid" />
        <div className="login-left-glow1" />
        <div className="login-left-glow2" />

        <div className="login-left-logo">
          <div className="login-logo-icon"><Building2 size={20} color="#fff" /></div>
          <div>
            <div className="login-logo-title">eGov Portal</div>
            <div className="login-logo-sub">Republika e MV</div>
          </div>
        </div>

        <div className="login-left-content">
          <div className="login-badge">🔒 Portal Qeveritar i Sigurt</div>
          <h2 className="login-left-title">Shërbime qeveritare në një vend</h2>
          <p className="login-left-desc">Aksesoni të gjitha shërbimet administrative me siguri dhe shpejtësi.</p>
          <div className="login-chips">
            {['Terminë', 'Gjoba', 'Leje'].map(s => (
              <div key={s} className="login-chip">{s}</div>
            ))}
          </div>
        </div>

        <div className="login-left-footer">© 2026 eGov Portal — Republika e Maqedonisë së Veriut</div>
      </div>

      <div className="login-right">
        <div className="login-right-top">
          <div className="login-hidden-logo">
            <div className="login-logo-icon-sm"><Building2 size={16} color="#fff" /></div>
            <span>eGov Portal</span>
          </div>
          <LanguageSwitcher />
        </div>

        <div className="login-form-wrap">
          <div className="login-heading">
            <h1>{t('login')}</h1>
            <p>{t('login_subtitle')}</p>
          </div>

          <div className="login-card">
            {error && (
              <div className="login-error">
                <AlertCircle size={15} /> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={form.email} placeholder="email@example.com"
                  onChange={e => setForm({ ...form, email: e.target.value })} required />
              </div>

              <div className="form-group">
                <label>{t('password')}</label>
                <div className="input-icon-wrap">
                  <input type={showPass ? 'text' : 'password'} value={form.password}
                    placeholder="Password"
                    onChange={e => setForm({ ...form, password: e.target.value })} required />
                  <button type="button" className="input-icon-btn" onClick={() => setShowPass(!showPass)}>
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <button type="submit" className="btn-primary" disabled={loading || !isLoaded}>
                {loading ? <><span className="btn-spinner" />{t('loading')}</> : <>{t('login')} <ChevronRight size={16} /></>}
              </button>
            </form>
          </div>

          <p className="login-register-link">
            {t('no_account')} <Link to="/register">{t('register')}</Link>
          </p>

          <div className="login-secure">
            <Lock size={12} /> {t('security_note')}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login