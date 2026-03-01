import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSignUp } from '@clerk/clerk-react'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from '../components/LanguageSwitcher'
import { AlertCircle, Eye, EyeOff, Upload, User, Mail, Lock, FileText, ArrowRight, ArrowLeft } from 'lucide-react'

const validateEMBG = (embg) => {
  if (!/^\d{13}$/.test(embg)) return false
  const d = embg.split('').map(Number)
  const rr = parseInt(embg.slice(7, 9))
  if (![41, 42, 43, 44, 45, 46, 47, 48, 49].includes(rr)) return false
  const sum = (7 * (d[0] + d[6]) + 6 * (d[1] + d[7]) + 5 * (d[2] + d[8]) + 4 * (d[3] + d[9]) + 3 * (d[4] + d[10]) + 2 * (d[5] + d[11])) % 11
  const k = (sum === 0 || sum === 1) ? 0 : 11 - sum
  return k === d[12]
}

const Register = () => {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    personal_id: '',
    email: '',
    password: '',
    confirm_password: ''
  })
  const [photo, setPhoto] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [showPass, setShowPass] = useState(false)
  const [showPass2, setShowPass2] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signUp, isLoaded } = useSignUp()
  const { t } = useTranslation()
  const navigate = useNavigate()

  const nextStep = () => {
    setError('')
    if (!form.first_name || !form.last_name || !form.personal_id || !form.email) {
      return setError(t('fill_required'))
    }
    if (!validateEMBG(form.personal_id)) {
      return setError('EMBG i pavlefshëm')
    }
    setStep(2)
  }

  const handlePhoto = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      setError('Fotoja duhet të jetë më e vogël se 5MB')
      return
    }
    setPhoto(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    if (!form.password || !form.confirm_password) {
      return setError(t('fill_required'))
    }
    
    if (form.password.length < 8) {
      return setError('Fjalëkalimi duhet të ketë min. 8 karaktere')
    }
    
    if (form.password !== form.confirm_password) {
      return setError(t('passwords_no_match'))
    }
    
    if (!isLoaded) return
    
    setLoading(true)
    console.log('🔄 Starting registration process...')

    try {
      console.log('📝 Creating Clerk user...')
      const su = await signUp.create({
        emailAddress: form.email,
        password: form.password,
        firstName: form.first_name,
        lastName: form.last_name,
      })

      console.log('✅ Clerk user created:', su.createdUserId)

      // Store data in window for VerifyEmail page
      window.__pendingRegister = {
        clerk_id: su.createdUserId,
        first_name: form.first_name,
        last_name: form.last_name,
        personal_id: form.personal_id,
        email: form.email,
        id_photo: photo,
      }

      console.log('📧 Preparing email verification...')
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })
      
      console.log('✅ Email verification prepared - navigating to verify page')
      navigate('/verify-email')
    } catch (err) {
      console.error('❌ Registration error:', err)
      setError(err.errors?.[0]?.message || 'Gabim gjatë regjistrimit')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #ffffff 100%);
          min-height: 100vh;
        }

        .register-page {
          display: flex;
          min-height: 100vh;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .register-wrapper {
          width: 100%;
          max-width: 480px;
        }

        .register-header-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
          padding-bottom: 20px;
          border-bottom: 1px solid #e5e7eb;
        }

        .register-logo {
          font-size: 18px;
          font-weight: 700;
          background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: -0.5px;
        }

        .register-card {
          background: #ffffff;
          border-radius: 16px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
          padding: 40px;
        }

        .register-title {
          font-size: 24px;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 8px;
          letter-spacing: -0.5px;
        }

        .register-step-info {
          font-size: 13px;
          color: #6b7280;
          margin-bottom: 24px;
        }

        .register-steps {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin-bottom: 32px;
        }

        .step-indicator {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #e5e7eb;
          color: #9ca3af;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          font-weight: 600;
          transition: all 0.2s;
        }

        .step-indicator.active {
          background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
          color: #ffffff;
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
        }

        .step-line {
          width: 40px;
          height: 2px;
          background: #e5e7eb;
          transition: all 0.2s;
        }

        .step-line.active {
          background: linear-gradient(90deg, #2563eb 0%, #1d4ed8 100%);
        }

        .register-form {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-label {
          font-size: 12px;
          font-weight: 600;
          color: #374151;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .form-input-wrapper {
          position: relative;
        }

        .form-input {
          width: 100%;
          padding: 12px 14px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 14px;
          color: #0f172a;
          font-family: inherit;
          transition: all 0.2s;
          background: #fafbfc;
        }

        .form-input:focus {
          outline: none;
          border-color: #2563eb;
          background: #ffffff;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }

        .form-input::placeholder {
          color: #d1d5db;
        }

        .form-input-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #9ca3af;
          pointer-events: none;
        }

        .form-icon-btn {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #6b7280;
          cursor: pointer;
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 0.2s;
        }

        .form-icon-btn:hover {
          color: #2563eb;
        }

        .photo-upload-box {
          border: 2px dashed #d1d5db;
          border-radius: 8px;
          padding: 24px;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s;
          background: #fafbfc;
        }

        .photo-upload-box:hover {
          border-color: #2563eb;
          background: #f0f4ff;
        }

        .photo-preview-img {
          width: 100%;
          height: 120px;
          object-fit: cover;
          border-radius: 8px;
        }

        .error-message {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 14px;
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 8px;
          color: #dc2626;
          font-size: 13px;
          margin-bottom: 16px;
        }

        .error-message svg {
          flex-shrink: 0;
        }

        .form-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-top: 24px;
        }

        .btn-back {
          padding: 12px 16px;
          background: #f3f4f6;
          color: #374151;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          font-family: inherit;
        }

        .btn-back:hover {
          background: #e5e7eb;
          border-color: #9ca3af;
        }

        .btn-next, .btn-submit {
          grid-column: 1 / -1;
          padding: 12px 16px;
          background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
          color: #ffffff;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-family: inherit;
        }

        .btn-next:hover, .btn-submit:hover {
          background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%);
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
          transform: translateY(-1px);
        }

        .btn-next:disabled, .btn-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-loader {
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

        .register-footer {
          margin-top: 24px;
          text-align: center;
          font-size: 13px;
          color: #6b7280;
        }

        .register-footer a {
          color: #2563eb;
          text-decoration: none;
          font-weight: 600;
          transition: color 0.2s;
        }

        .register-footer a:hover {
          color: #1d4ed8;
        }

        @media (max-width: 480px) {
          .register-card {
            padding: 32px 24px;
          }

          .register-title {
            font-size: 20px;
          }

          .form-row {
            grid-template-columns: 1fr;
          }

          .form-input {
            padding: 11px 12px;
            font-size: 16px;
          }
        }
      `}</style>

      <div className="register-page">
        <div className="register-wrapper">
          <div className="register-header-bar">
            <div className="register-logo">eGov Portal</div>
            <LanguageSwitcher />
          </div>

          <div className="register-card">
            <h1 className="register-title">{t('register')}</h1>
            <p className="register-step-info">{t('step')} {step}/2</p>

            <div className="register-steps">
              <div className={`step-indicator ${step >= 1 ? 'active' : ''}`}>1</div>
              <div className={`step-line ${step >= 2 ? 'active' : ''}`} />
              <div className={`step-indicator ${step >= 2 ? 'active' : ''}`}>2</div>
            </div>

            {error && (
              <div className="error-message">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            {step === 1 && (
              <form className="register-form" onSubmit={(e) => { e.preventDefault(); nextStep(); }}>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">{t('first_name')}</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Emri"
                      value={form.first_name}
                      onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t('last_name')}</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Mbiemri"
                      value={form.last_name}
                      onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">{t('personal_id')}</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="0000000000000"
                    maxLength={13}
                    value={form.personal_id}
                    onChange={(e) => setForm({ ...form, personal_id: e.target.value.replace(/\D/g, '') })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">{t('email')}</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="email@example.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                  />
                </div>

                <button type="submit" className="btn-next">
                  {t('next')}
                  <ArrowRight size={16} />
                </button>
              </form>
            )}

            {step === 2 && (
              <form className="register-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">{t('password')}</label>
                  <div className="form-input-wrapper">
                    <Lock size={16} className="form-input-icon" />
                    <input
                      type={showPass ? 'text' : 'password'}
                      className="form-input"
                      style={{ paddingRight: '38px' }}
                      placeholder="Min. 8 karaktere"
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

                <div className="form-group">
                  <label className="form-label">{t('confirm_password')}</label>
                  <div className="form-input-wrapper">
                    <Lock size={16} className="form-input-icon" />
                    <input
                      type={showPass2 ? 'text' : 'password'}
                      className="form-input"
                      style={{ paddingRight: '38px' }}
                      placeholder="••••••••••"
                      value={form.confirm_password}
                      onChange={(e) => setForm({ ...form, confirm_password: e.target.value })}
                      required
                    />
                    <button
                      type="button"
                      className="form-icon-btn"
                      onClick={() => setShowPass2(!showPass2)}
                    >
                      {showPass2 ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">{t('upload_photo')}</label>
                  <label className="photo-upload-box">
                    {photoPreview ? (
                      <img src={photoPreview} alt="preview" className="photo-preview-img" />
                    ) : (
                      <div>
                        <Upload size={20} style={{ color: '#9ca3af', margin: '0 auto 8px' }} />
                        <p style={{ fontSize: '13px', color: '#6b7280' }}>Kliko për të ngarkuar dokumentin</p>
                      </div>
                    )}
                    <input type="file" accept="image/*" onChange={handlePhoto} hidden />
                  </label>
                </div>

                <div className="form-actions">
                  <button type="button" className="btn-back" onClick={() => setStep(1)}>
                    <ArrowLeft size={16} />
                    {t('back')}
                  </button>
                  <button type="submit" className="btn-submit" disabled={loading}>
                    {loading && <div className="btn-loader" />}
                    {loading ? t('loading') : t('register')}
                  </button>
                </div>
              </form>
            )}

            <div className="register-footer">
              {t('have_account')} <Link to="/login">{t('login')}</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Register