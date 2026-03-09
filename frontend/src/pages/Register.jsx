import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSignUp, useUser } from '@clerk/react'
import { useTranslation } from 'react-i18next'
import { Eye, EyeOff } from 'lucide-react'
import LanguageSwitcher from '../components/LanguageSwitcher'

const Register = () => {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { user } = useUser()
  const { signUp, isLoaded, setActive } = useSignUp()

  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    embg: '',
    idPhoto: null,
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [photoPreview, setPhotoPreview] = useState(null)
  const photoInputRef = useRef(null)

  const passwordRules = {
    minLength: form.password.length >= 8,
    hasUppercase: /[A-Z]/.test(form.password),
    hasLowercase: /[a-z]/.test(form.password),
    hasNumber: /[0-9]/.test(form.password),
    hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(form.password),
  }

  const allPasswordRulesMet = Object.values(passwordRules).every(rule => rule === true)
  const passwordsMatch = form.password === form.confirmPassword && form.password.length > 0

  const isFirstNameValid = form.firstName.trim().length >= 2
  const isLastNameValid = form.lastName.trim().length >= 2
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)
  const isEMBGValid = /^\d{13}$/.test(form.embg)
  const step1Complete = isFirstNameValid && isLastNameValid && isEmailValid && isEMBGValid

  const step2Complete = allPasswordRulesMet && passwordsMatch && photoPreview

  useEffect(() => {
    if (user) {
      console.log('👤 User already logged in, redirecting...')
      navigate('/dashboard')
    }
  }, [user, navigate])

  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      setError(`Fotografija shumë e madhe. Max 5MB.`)
      return
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      setError('Format fotografie jo i vlefshëm')
      return
    }

    const reader = new FileReader()
    reader.onload = (evt) => {
      setPhotoPreview(evt.target.result)
      setForm(prev => ({ ...prev, idPhoto: file }))
      setError('')
      console.log('✅ Photo loaded')
    }
    reader.readAsDataURL(file)
  }

  const handleStep1Submit = (e) => {
    e.preventDefault()
    if (!step1Complete) {
      setError('Plotëso të gjitha fushat sipas kërkesave')
      return
    }
    setError('')
    setStep(2)
  }

  const handleRegisterSubmit = async (e) => {
    e.preventDefault()
    console.log('📝 REGISTER SUBMIT')

    if (!step2Complete) {
      setError('Plotëso të gjitha kërkesat')
      return
    }

    setLoading(true)
    setError('')

    try {
      console.log('🔐 Attempting registration...')
      console.log('   signUp:', !!signUp)
      console.log('   signUp.create:', !!signUp?.create)

      if (!signUp || !signUp.create) {
        throw new Error('signUp hook not available')
      }

      console.log('📤 Calling signUp.create...')
      const response = await signUp.create({
        emailAddress: form.email.trim(),
        password: form.password,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
      })

      console.log('📥 FULL RESPONSE:', response)
      console.log('   Response.result:', response?.result)
      console.log('   Response.error:', response?.error)
      console.log('   Response keys:', Object.keys(response || {}))

      // Handle error response
      if (response?.error) {
        console.error('❌ Clerk error:', response.error)
        throw new Error(response.error.message || 'Registration failed')
      }

      // Handle success response
      if (response?.result) {
        console.log('✅ Registration successful!')
        console.log('   Result:', response.result)

        // Check verifications
        if (response.result.verifications) {
          console.log('   Verifications:', response.result.verifications)
        }

        // Try to activate session if we have createdSessionId
        if (response.result.createdSessionId) {
          console.log('✅ Activating session...')
          await setActive({ session: response.result.createdSessionId })
          console.log('✅ Session activated - redirecting to dashboard')
          navigate('/dashboard')
        } else {
          console.log('⚠️ No createdSessionId - might need email verification')
          setError('Regjistrimi u arrit! Kontrollo email-in tuaj për verifikim.')
          // Optionally redirect to verification page or login
          setTimeout(() => {
            navigate('/login', { state: { email: form.email } })
          }, 3000)
        }
      } else {
        console.log('⚠️ Response result is undefined')
        setError('Regjistrimi nuk u arrit - përgjigja jo e saktë')
      }
    } catch (err) {
      console.error('❌ Registration error:', err)
      console.error('   Message:', err.message)
      console.error('   Full error:', err)

      if (err.errors?.length > 0) {
        const firstError = err.errors[0]
        console.error('   First error:', firstError)
        setError(firstError.message || err.message)
      } else {
        setError(err.message || 'Regjistrimi dështoi')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        :root { --primary: #d84315; --dark: #1a1a18; --light-bg: #fafaf8; --white: #ffffff; --border: #e8e8e5; --text-gray: #666666; }
        body { font-family: 'Inter', sans-serif; background: var(--light-bg); color: var(--dark); min-height: 100vh; }
        .register-container { display: flex; min-height: 100vh; }
        .register-left { flex: 1; background: linear-gradient(135deg, #f4511e 0%, #d84315 100%); display: flex; align-items: center; justify-content: center; padding: 60px 40px; position: relative; overflow: hidden; color: white; }
        .register-left::before { content: ''; position: absolute; width: 300px; height: 300px; border-radius: 50%; background: rgba(255,255,255,0.1); top: -100px; right: -100px; z-index: 1; }
        .register-decoration { position: relative; z-index: 2; text-align: center; max-width: 420px; }
        .register-logo-box { width: 64px; height: 64px; background: rgba(255,255,255,0.15); border-radius: 16px; display: flex; align-items: center; justify-content: center; margin: 0 auto 40px; }
        .register-title { font-size: 44px; font-weight: 700; margin-bottom: 20px; }
        .register-subtitle { font-size: 15px; margin-bottom: 48px; opacity: 0.95; }
        .register-steps { display: flex; flex-direction: column; gap: 24px; text-align: left; }
        .register-step { display: flex; gap: 16px; opacity: 0.6; transition: opacity 0.3s; }
        .register-step.active { opacity: 1; }
        .register-step-icon { width: 40px; height: 40px; background: rgba(255,255,255,0.12); border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 18px; font-weight: 700; color: white; }
        .register-step-content h4 { font-size: 13px; font-weight: 600; margin-bottom: 4px; }
        .register-step-content p { font-size: 12px; opacity: 0.85; }
        .register-right { flex: 1; display: flex; align-items: center; justify-content: center; padding: 40px; background: var(--white); position: relative; }
        .register-header { position: absolute; top: 24px; right: 40px; display: flex; align-items: center; gap: 24px; z-index: 10; }
        .register-progress { display: flex; gap: 8px; }
        .register-progress-dot { width: 8px; height: 8px; background: var(--border); border-radius: 50%; transition: all 0.3s; }
        .register-progress-dot.active { background: var(--primary); width: 24px; border-radius: 4px; }
        .register-form-wrapper { width: 100%; max-width: 380px; }
        .register-branding { margin-bottom: 40px; }
        .register-logo { font-size: 28px; font-weight: 700; margin-bottom: 8px; }
        .register-form-subtitle { font-size: 13px; color: var(--text-gray); }
        .register-form { display: flex; flex-direction: column; gap: 24px; }
        .form-group { display: flex; flex-direction: column; gap: 8px; }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        label { font-size: 12px; font-weight: 600; text-transform: uppercase; }
        input[type="email"], input[type="password"], input[type="text"] { padding: 12px 14px; border: 1px solid var(--border); border-radius: 6px; font-size: 14px; width: 100%; }
        input:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 3px rgba(216,67,21,0.08); }
        input:disabled { background: #f5f5f5; cursor: not-allowed; opacity: 0.7; }
        .input-container { position: relative; }
        .toggle-password { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; color: var(--text-gray); cursor: pointer; padding: 4px 8px; display: flex; }
        .photo-upload { border: 2px dashed var(--border); border-radius: 6px; padding: 28px; text-align: center; cursor: pointer; background: #fafaf8; transition: all 0.2s; }
        .photo-upload:hover { border-color: var(--primary); background: #f5f5f3; }
        .photo-upload input { display: none; }
        .photo-preview { width: 100%; height: 180px; object-fit: cover; border-radius: 6px; margin-bottom: 12px; }
        .photo-text { font-size: 13px; color: var(--text-gray); margin-bottom: 6px; font-weight: 500; }
        .password-reqs { background: #fafaf8; border: 1px solid var(--border); border-radius: 6px; padding: 14px; display: flex; flex-direction: column; gap: 8px; }
        .req { display: flex; align-items: center; gap: 8px; font-size: 12px; color: var(--text-gray); }
        .req.valid { color: #22c55e; }
        .req-icon { width: 16px; height: 16px; border-radius: 50%; background: #e8e8e5; display: flex; align-items: center; justify-content: center; font-size: 10px; flex-shrink: 0; }
        .req.valid .req-icon { background: #dcfce7; color: #22c55e; }
        .btn-register { padding: 13px 24px; background: var(--primary); color: white; border: none; border-radius: 6px; font-size: 14px; font-weight: 600; cursor: pointer; text-transform: uppercase; display: flex; align-items: center; justify-content: center; gap: 8px; }
        .btn-register:not(:disabled):hover { background: #c23d0f; }
        .btn-register:disabled { opacity: 0.6; cursor: not-allowed; }
        .spinner { width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.3); border-top: 2px solid white; border-radius: 50%; animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .error-message { background: #fef2f2; color: #ef4444; padding: 12px 14px; border-radius: 6px; border: 1px solid #fecaca; font-size: 13px; margin-bottom: 16px; }
        .back-btn { margin-top: 16px; width: 100%; padding: 10px; background: none; border: none; color: var(--primary); font-size: 13px; font-weight: 600; cursor: pointer; text-align: center; }
        .register-footer { margin-top: 28px; padding-top: 24px; border-top: 1px solid var(--border); text-align: center; font-size: 13px; }
        .register-link { color: var(--primary); text-decoration: none; font-weight: 600; }
        @media (max-width: 1024px) { .register-container { flex-direction: column; } .register-left { min-height: 40vh; } .register-right { min-height: 60vh; } .form-row { grid-template-columns: 1fr; } }
        @media (max-width: 640px) { .register-left { display: none; } .register-right { min-height: 100vh; padding-top: 80px; } }
      `}</style>

      <div className="register-container">
        <div className="register-left">
          <div className="register-decoration">
            <div className="register-logo-box">G</div>
            <h1 className="register-title">Regjistrohuni në eGov</h1>
            <p className="register-subtitle">Siguroni qasjen tuaj në shërbimet qeveritare.</p>
            <div className="register-steps">
              <div className={`register-step ${step >= 1 ? 'active' : ''}`}>
                <div className="register-step-icon">1</div>
                <div className="register-step-content">
                  <h4>Informacioni personal</h4>
                  <p>Emri, email, EMBG</p>
                </div>
              </div>
              <div className={`register-step ${step >= 2 ? 'active' : ''}`}>
                <div className="register-step-icon">2</div>
                <div className="register-step-content">
                  <h4>Sigurimi dhe dokumenti</h4>
                  <p>Fjalëkalim dhe fotografi</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="register-right">
          <div className="register-header">
            <div className="register-progress">
              <div className={`register-progress-dot ${step >= 1 ? 'active' : ''}`} />
              <div className={`register-progress-dot ${step >= 2 ? 'active' : ''}`} />
            </div>
            <LanguageSwitcher />
          </div>

          <div className="register-form-wrapper">
            {step === 1 && (
              <>
                <div className="register-branding">
                  <div className="register-logo">e-Gov</div>
                  <p className="register-form-subtitle">Hapi 1 nga 2: Informacioni personal</p>
                </div>
                {error && <div className="error-message">⚠️ {error}</div>}
                <form className="register-form" onSubmit={handleStep1Submit}>
                  <div className="form-row">
                    <div className="form-group">
                      <label>EMRI</label>
                      <input
                        type="text"
                        placeholder="Emri juaj"
                        value={form.firstName}
                        onChange={(e) => { setForm({...form, firstName: e.target.value}); setError(''); }}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>MBIEMRI</label>
                      <input
                        type="text"
                        placeholder="Mbiemri juaj"
                        value={form.lastName}
                        onChange={(e) => { setForm({...form, lastName: e.target.value}); setError(''); }}
                        required
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>E-POSTA</label>
                    <input
                      type="email"
                      placeholder="emri@shembull.mk"
                      value={form.email}
                      onChange={(e) => { setForm({...form, email: e.target.value}); setError(''); }}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>NUMRI PERSONAL (EMBG)</label>
                    <input
                      type="text"
                      placeholder="XXXXXXXXXXXXX"
                      value={form.embg}
                      onChange={(e) => { const cleaned = e.target.value.replace(/\D/g, '').slice(0, 13); setForm({...form, embg: cleaned}); setError(''); }}
                      maxLength="13"
                      required
                    />
                  </div>
                  <button type="submit" className="btn-register" disabled={!step1Complete || loading}>
                    Vazhdo në hapin 2 →
                  </button>
                </form>
              </>
            )}

            {step === 2 && (
              <>
                <div className="register-branding">
                  <div className="register-logo">e-Gov</div>
                  <p className="register-form-subtitle">Hapi 2 nga 2: Fjalëkalim dhe dokumenti</p>
                </div>
                {error && <div className="error-message">⚠️ {error}</div>}
                <form className="register-form" onSubmit={handleRegisterSubmit}>
                  <div className="form-group">
                    <label>FJALËKALIM</label>
                    <div className="input-container">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={form.password}
                        onChange={(e) => { setForm({...form, password: e.target.value}); setError(''); }}
                        disabled={loading}
                        required
                      />
                      <button
                        type="button"
                        className="toggle-password"
                        onClick={(e) => { e.preventDefault(); setShowPassword(!showPassword); }}
                        disabled={loading}
                      >
                        {showPassword ? '🙈' : '👁️'}
                      </button>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>KONFIRMONI FJALËKALIMIN</label>
                    <div className="input-container">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={form.confirmPassword}
                        onChange={(e) => { setForm({...form, confirmPassword: e.target.value}); setError(''); }}
                        disabled={loading}
                        required
                      />
                      <button
                        type="button"
                        className="toggle-password"
                        onClick={(e) => { e.preventDefault(); setShowConfirmPassword(!showConfirmPassword); }}
                        disabled={loading}
                      >
                        {showConfirmPassword ? '🙈' : '👁️'}
                      </button>
                    </div>
                  </div>
                  <div className="password-reqs">
                    <div className={`req ${passwordRules.minLength ? 'valid' : ''}`}>
                      <div className="req-icon">{passwordRules.minLength ? '✓' : '-'}</div>
                      <span>Të paktën 8 karaktere</span>
                    </div>
                    <div className={`req ${passwordRules.hasUppercase ? 'valid' : ''}`}>
                      <div className="req-icon">{passwordRules.hasUppercase ? '✓' : '-'}</div>
                      <span>Një shkronjë e madhe (A-Z)</span>
                    </div>
                    <div className={`req ${passwordRules.hasLowercase ? 'valid' : ''}`}>
                      <div className="req-icon">{passwordRules.hasLowercase ? '✓' : '-'}</div>
                      <span>Një shkronjë e vogël (a-z)</span>
                    </div>
                    <div className={`req ${passwordRules.hasNumber ? 'valid' : ''}`}>
                      <div className="req-icon">{passwordRules.hasNumber ? '✓' : '-'}</div>
                      <span>Një numër (0-9)</span>
                    </div>
                    <div className={`req ${passwordRules.hasSpecial ? 'valid' : ''}`}>
                      <div className="req-icon">{passwordRules.hasSpecial ? '✓' : '-'}</div>
                      <span>Karakter special (!@#$%^&*)</span>
                    </div>
                    <div className={`req ${passwordsMatch ? 'valid' : ''}`}>
                      <div className="req-icon">{passwordsMatch ? '✓' : '-'}</div>
                      <span>Fjalëkalimet përputhen</span>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>FOTOGRAFIA E DOKUMENTIT</label>
                    <div className="photo-upload" onClick={() => photoInputRef.current?.click()}>
                      {photoPreview ? (
                        <>
                          <img src={photoPreview} alt="Preview" className="photo-preview" />
                          <p className="photo-text">✓ Fotografia ngarkuar</p>
                        </>
                      ) : (
                        <>
                          <p style={{fontSize: '24px', marginBottom: '8px'}}>📷</p>
                          <p className="photo-text">Ngarkoni fotografi të dokumentit</p>
                        </>
                      )}
                      <input
                        ref={photoInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handlePhotoSelect}
                        disabled={loading}
                      />
                    </div>
                  </div>
                  <div id="clerk-captcha" style={{marginBottom: '16px'}}></div>
                  <button
                    type="submit"
                    className="btn-register"
                    disabled={!step2Complete || loading}
                  >
                    {loading ? (<><span className="spinner" /> Duke u regjistruar...</>) : '✓ Përfundoni regjistrimin'}
                  </button>
                </form>
              </>
            )}

            {step > 1 && (
              <button type="button" className="back-btn" onClick={() => { setStep(1); setError(''); }} disabled={loading}>
                ← Kthehu mbrapa
              </button>
            )}
            <p className="register-footer">
              Tashmë keni llogari? <Link to="/login" className="register-link">Kyçuni këtu</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

export default Register