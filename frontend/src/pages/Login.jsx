import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSignIn, useUser } from '@clerk/react'
import { useTranslation } from 'react-i18next'
import { Eye, EyeOff } from 'lucide-react'
import LanguageSwitcher from '../components/LanguageSwitcher'

const Login = () => {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { user } = useUser()
  const { signIn, isLoaded, setActive } = useSignIn()

  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)
  const isPasswordValid = form.password.length >= 8
  const isFormValid = isEmailValid && isPasswordValid

  // DEBUG: Log isLoaded state
  useEffect(() => {
    console.log('🔍 LOGIN COMPONENT:')
    console.log('  ✓ isLoaded:', isLoaded)
    console.log('  ✓ isFormValid:', isFormValid)
    console.log('  ✓ loading:', loading)
    console.log('  ✓ Button disabled:', loading || !isLoaded || !isFormValid)
  }, [isLoaded, isFormValid, loading])

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      console.log('👤 User already logged in, redirecting to dashboard...')
      navigate('/dashboard')
    }
  }, [user, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    console.log('🔐 LOGIN SUBMIT - Starting...')
    console.log('   signIn object:', signIn)
    console.log('   signIn.create:', signIn?.create)

    if (!isFormValid) {
      const msg = !isEmailValid ? 'Email nuk është valid' : 'Lozinka duhet të ketë të paktën 8 karaktere'
      setError(msg)
      console.error('❌ Validation failed:', msg)
      return
    }

    setLoading(true)
    setError('')

    try {
      console.log('📤 Sending login request...')
      
      if (!signIn) {
        throw new Error('signIn hook is not available - Clerk context issue')
      }
      
      if (!signIn.create) {
        throw new Error('signIn.create is not a function')
      }

      const response = await signIn.create({
        identifier: form.email.trim(),
        password: form.password,
      })

      console.log('📥 Response:', response)
      console.log('📥 Response status:', response?.status)

      if (response.status === 'complete') {
        console.log('✅ Login successful! Setting active session...')
        await setActive({ session: response.createdSessionId })
        console.log('✅ Session set, navigating to dashboard...')
        navigate('/dashboard')
      } else if (response.status === 'needs_second_factor') {
        setError('Duhet autentifikim me dy faktor')
        console.warn('⚠️ 2FA required')
      } else {
        setError(`Statusi: ${response.status}`)
        console.warn('⚠️ Unexpected status:', response.status)
      }
    } catch (err) {
      console.error('❌ Login error:', err)
      if (err.errors?.[0]) {
        const msg = err.errors[0].message
        console.error('   Error message:', msg)
        
        if (msg.includes('Password is incorrect')) {
          setError('Lozinka nuk është e saktë.')
        } else if (msg.includes('Identifier is not valid')) {
          setError('Email nuk u gjet. Kontrollo se e ke shkruar saktë.')
        } else if (msg.includes('not found')) {
          setError('Llogaria nuk ekziston.')
        } else {
          setError(msg)
        }
      } else {
        setError('Gabim në login. Provo përsëri.')
      }
    } finally {
      setLoading(false)
      console.log('🔄 Login attempt completed')
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        :root { --primary: #d84315; --dark: #1a1a18; --white: #ffffff; --border: #e8e8e5; --text-gray: #666666; }
        body { font-family: 'Inter', sans-serif; background: #fafaf8; min-height: 100vh; }
        .login-container { display: flex; min-height: 100vh; }
        .login-left { flex: 1; background: linear-gradient(135deg, #d84315 0%, #f4511e 100%); display: flex; align-items: center; justify-content: center; padding: 60px 40px; position: relative; overflow: hidden; }
        .login-left::before { content: ''; position: absolute; width: 300px; height: 300px; border-radius: 50%; background: rgba(255,255,255,0.1); top: -100px; right: -100px; z-index: 1; }
        .login-left::after { content: ''; position: absolute; width: 200px; height: 200px; border-radius: 50%; background: rgba(255,255,255,0.08); bottom: -50px; left: -50px; z-index: 1; }
        .login-decoration { position: relative; z-index: 2; text-align: center; color: white; max-width: 420px; }
        .login-logo-box { width: 64px; height: 64px; background: rgba(255,255,255,0.15); border-radius: 16px; display: flex; align-items: center; justify-content: center; margin: 0 auto 40px; border: 1px solid rgba(255,255,255,0.25); }
        .login-logo-box-icon { font-size: 32px; font-weight: 700; color: white; }
        .login-title { font-size: 44px; font-weight: 700; margin-bottom: 20px; line-height: 1.2; letter-spacing: -0.5px; }
        .login-subtitle { font-size: 15px; line-height: 1.6; opacity: 0.95; font-weight: 400; margin-bottom: 48px; }
        .login-features { display: flex; flex-direction: column; gap: 24px; text-align: left; }
        .login-feature { display: flex; gap: 16px; align-items: flex-start; }
        .login-feature-icon { width: 40px; height: 40px; background: rgba(255,255,255,0.12); border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; border: 1px solid rgba(255,255,255,0.15); color: white; font-size: 18px; }
        .login-feature-content h4 { font-size: 13px; font-weight: 600; margin-bottom: 4px; letter-spacing: 0.3px; }
        .login-feature-content p { font-size: 12px; opacity: 0.85; line-height: 1.5; }
        .login-right { flex: 1; display: flex; align-items: center; justify-content: center; padding: 40px; background: var(--white); position: relative; }
        .login-header { position: absolute; top: 24px; right: 40px; z-index: 10; }
        .login-form-wrapper { width: 100%; max-width: 380px; }
        .login-branding { margin-bottom: 40px; }
        .login-logo { font-size: 28px; font-weight: 700; color: var(--dark); margin-bottom: 8px; letter-spacing: -0.5px; }
        .login-form-subtitle { font-size: 13px; color: var(--text-gray); font-weight: 400; }
        .login-form { display: flex; flex-direction: column; gap: 24px; }
        .form-group { display: flex; flex-direction: column; gap: 8px; }
        label { font-size: 12px; font-weight: 600; color: var(--dark); text-transform: uppercase; letter-spacing: 0.5px; }
        .input-container { position: relative; }
        input[type="email"], input[type="password"] { padding: 12px 40px 12px 14px; border: 1px solid var(--border); border-radius: 6px; font-size: 14px; font-family: 'Inter', sans-serif; background: var(--white); color: var(--dark); transition: all 0.2s ease; width: 100%; }
        input[type="email"]:focus, input[type="password"]:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 3px rgba(216, 67, 21, 0.08); background: #fafafa; }
        input::placeholder { color: #aaa; }
        .toggle-password { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; color: var(--text-gray); cursor: pointer; padding: 4px 8px; display: flex; align-items: center; justify-content: center; transition: color 0.2s ease; }
        .toggle-password:hover { color: var(--primary); }
        .form-footer { display: flex; justify-content: space-between; align-items: center; gap: 12px; }
        .checkbox-group { display: flex; align-items: center; gap: 6px; cursor: pointer; }
        input[type="checkbox"] { width: 16px; height: 16px; cursor: pointer; accent-color: var(--primary); }
        .checkbox-label { font-size: 12px; color: var(--text-gray); cursor: pointer; margin: 0; font-weight: 400; }
        .forgot-link { font-size: 12px; color: var(--primary); text-decoration: none; font-weight: 500; transition: color 0.2s ease; cursor: pointer; border: none; background: none; padding: 0; }
        .forgot-link:hover { color: #c23d0f; text-decoration: underline; }
        .btn-login { padding: 13px 24px; background: var(--primary); color: white; border: none; border-radius: 6px; font-size: 14px; font-weight: 600; letter-spacing: 0.5px; cursor: pointer; transition: all 0.2s ease; text-transform: uppercase; display: flex; align-items: center; justify-content: center; gap: 8px; min-height: 44px; }
        .btn-login:not(:disabled):hover { background-color: #c23d0f; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(216, 67, 21, 0.25); }
        .btn-login:not(:disabled):active { transform: translateY(0); }
        .btn-login:disabled { opacity: 0.6; cursor: not-allowed; background-color: var(--primary); }
        .spinner { width: 14px; height: 14px; border: 2px solid rgba(255, 255, 255, 0.3); border-top-color: white; border-radius: 50%; animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .error-message { background: #fef2f2; color: #ef4444; padding: 12px 14px; border-radius: 6px; border: 1px solid #fecaca; font-size: 13px; margin-bottom: 16px; animation: slideDown 0.3s ease; }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        .register-section { margin-top: 28px; padding-top: 24px; border-top: 1px solid var(--border); text-align: center; font-size: 13px; color: var(--text-gray); }
        .register-link { color: var(--primary); text-decoration: none; font-weight: 600; transition: color 0.2s ease; cursor: pointer; }
        .register-link:hover { color: #c23d0f; text-decoration: underline; }
        @media (max-width: 1024px) { .login-container { flex-direction: column; } .login-left { padding: 40px; min-height: 40vh; } .login-right { padding: 40px; min-height: 60vh; } .login-header { position: relative; top: 0; right: 0; margin-bottom: 24px; } .login-title { font-size: 36px; } }
        @media (max-width: 640px) { .login-left { display: none; } .login-right { padding: 16px 12px; min-height: 100vh; justify-content: flex-start; padding-top: 80px; } .login-header { position: fixed; top: 12px; right: 12px; left: 12px; display: flex; justify-content: flex-end; z-index: 50; } }
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
                <div className="login-feature-icon">📅</div>
                <div className="login-feature-content">
                  <h4>Planifiko terminet kur të dosh</h4>
                  <p>Orar fleksibel sipas kërkesave tuaja</p>
                </div>
              </div>
              <div className="login-feature">
                <div className="login-feature-icon">🔒</div>
                <div className="login-feature-content">
                  <h4>Sigurimi i plotë i të dhënave</h4>
                  <p>I enkriptuar me teknologjinë më të avancuar</p>
                </div>
              </div>
              <div className="login-feature">
                <div className="login-feature-icon">⚡</div>
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
              <p className="login-form-subtitle">Portali privat për qytetarë</p>
            </div>

            {error && <div className="error-message">⚠️ {error}</div>}

            <form className="login-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="email">E-POSTA</label>
                <input
                  id="email"
                  type="email"
                  placeholder="juaji@shembull.mk"
                  value={form.email}
                  onChange={(e) => {
                    setForm({...form, email: e.target.value})
                    setError('')
                  }}
                  disabled={loading}
                  autoComplete="email"
                  autoFocus
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">FJALËKALIM</label>
                <div className="input-container">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={form.password}
                    onChange={(e) => {
                      setForm({...form, password: e.target.value})
                      setError('')
                    }}
                    disabled={loading}
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={(e) => {
                      e.preventDefault()
                      setShowPassword(!showPassword)
                    }}
                    disabled={loading}
                    title={showPassword ? 'Fshih fjalëkalimin' : 'Shfaq fjalëkalimin'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="form-footer">
                <div className="checkbox-group">
                  <input type="checkbox" id="remember" name="remember" disabled={loading} />
                  <label htmlFor="remember" className="checkbox-label">Më kujto</label>
                </div>
                <button type="button" className="forgot-link">Harrova fjalëkalimin?</button>
              </div>

              <button
                type="submit"
                className="btn-login"
                disabled={loading || !isFormValid}
                title={
                  !isFormValid ? 'Plotëso email dhe fjalëkalim saktë' :
                  loading ? 'Duke u kyçur...' :
                  'Kyçu në platformë'
                }
              >
                {loading ? (
                  <>
                    <span className="spinner" />
                    Duke u kyçur...
                  </>
                ) : (
                  'Kyçu'
                )}
              </button>
            </form>

            <p className="register-section">
              Nuk keni llogari? <Link to="/register" className="register-link">Regjistrohuni këtu</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

export default Login