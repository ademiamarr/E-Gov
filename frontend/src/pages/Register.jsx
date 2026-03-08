import { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSignUp } from '@clerk/react'
import { useTranslation } from 'react-i18next'
import { Eye, EyeOff } from 'lucide-react'
import LanguageSwitcher from '../components/LanguageSwitcher'

const Register = () => {
  const navigate = useNavigate()
  const { t } = useTranslation()
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
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [photoPreview, setPhotoPreview] = useState(null)
  const photoInputRef = useRef(null)
  const { signUp, isLoaded, setActive } = useSignUp()

  const passwordReqs = {
    length: form.password.length >= 8,
    uppercase: /[A-Z]/.test(form.password),
    number: /[0-9]/.test(form.password),
    special: /[!@#$%^&*]/.test(form.password),
    match: form.password && form.confirmPassword && form.password === form.confirmPassword,
  }

  const allValid = passwordReqs.length && passwordReqs.uppercase && passwordReqs.number && passwordReqs.special && passwordReqs.match

  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError(t('photo_size_error') || 'Fotografija duhet të jetë më e vogël se 5MB')
        return
      }
      const reader = new FileReader()
      reader.onload = (evt) => {
        setPhotoPreview(evt.target.result)
        setForm({ ...form, idPhoto: file })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleStep1Submit = (e) => {
    e.preventDefault()
    if (!form.firstName || !form.lastName || !form.email || !form.embg) {
      setError(t('fill_required') || 'Plotësoni të gjitha fushat')
      return
    }
    if (form.embg.length !== 13) {
      setError(t('embg_length_error') || 'EMBG duhet të ketë 13 shifra')
      return
    }
    setError('')
    setStep(2)
  }

  const handleRegisterSubmit = async (e) => {
    e.preventDefault()
    if (!isLoaded) return
    
    if (!photoPreview) {
      setError(t('photo_required') || 'Duhet të ngarkoni foto të dokumentit')
      return
    }
    if (!allValid) {
      setError(t('password_requirements') || 'Plotësoni të gjitha kërkesat për fjalëkalimin')
      return
    }

    setLoading(true)
    setError('')
    try {
      const response = await signUp.create({
        emailAddress: form.email,
        password: form.password,
        firstName: form.firstName,
        lastName: form.lastName,
        unsafeMetadata: {
          embg: form.embg,
        },
      })

      if (response.status === 'complete') {
        await setActive({ session: response.createdSessionId })
        navigate('/dashboard')
      } else if (response.status === 'missing_requirements') {
        setError(t('missing_requirements') || 'Plotësoni të gjitha kërkesat')
      }
    } catch (err) {
      setError(err.errors?.[0]?.message || t('register_error') || 'Gabim në regjistrimin')
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

        .register-container {
          display: flex;
          min-height: 100vh;
          width: 100%;
        }

        .register-left {
          flex: 1;
          background: linear-gradient(135deg, #f4511e 0%, #d84315 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 60px 40px;
          position: relative;
          overflow: hidden;
        }

        .register-left::before {
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

        .register-left::after {
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

        .register-decoration {
          position: relative;
          z-index: 2;
          text-align: center;
          color: white;
          max-width: 420px;
        }

        .register-logo-box {
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

        .register-logo-box-icon {
          font-size: 32px;
          font-weight: 700;
          color: white;
        }

        .register-title {
          font-size: 44px;
          font-weight: 700;
          margin-bottom: 20px;
          line-height: 1.2;
          letter-spacing: -0.5px;
        }

        .register-subtitle {
          font-size: 15px;
          line-height: 1.6;
          opacity: 0.95;
          font-weight: 400;
          margin-bottom: 48px;
        }

        .register-steps {
          display: flex;
          flex-direction: column;
          gap: 24px;
          text-align: left;
        }

        .register-step {
          display: flex;
          gap: 16px;
          align-items: flex-start;
        }

        .register-step-icon {
          width: 40px;
          height: 40px;
          background: rgba(255, 255, 255, 0.12);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          border: 1px solid rgba(255, 255, 255, 0.15);
          font-size: 18px;
          font-weight: 700;
          color: white;
          opacity: 0.7;
        }

        .register-step.active .register-step-icon {
          background: rgba(255, 255, 255, 0.25);
          opacity: 1;
        }

        .register-step-content h4 {
          font-size: 13px;
          font-weight: 600;
          margin-bottom: 4px;
          letter-spacing: 0.3px;
          opacity: 0.8;
        }

        .register-step.active .register-step-content h4 {
          opacity: 1;
        }

        .register-step-content p {
          font-size: 12px;
          opacity: 0.7;
          line-height: 1.5;
        }

        .register-right {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px;
          background: var(--white);
          position: relative;
        }

        .register-header {
          position: absolute;
          top: 24px;
          right: 40px;
          display: flex;
          align-items: center;
          gap: 16px;
          z-index: 10;
        }

        .register-progress {
          display: flex;
          gap: 8px;
        }

        .register-progress-bar {
          width: 50px;
          height: 3px;
          background: #e8e8e5;
          border-radius: 2px;
          transition: background-color 0.3s ease;
        }

        .register-progress-bar.active {
          background: var(--primary);
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

        .register-form-wrapper {
          width: 100%;
          max-width: 380px;
        }

        .register-branding {
          margin-bottom: 40px;
        }

        .register-logo {
          font-size: 28px;
          font-weight: 700;
          color: var(--dark);
          margin-bottom: 8px;
          letter-spacing: -0.5px;
        }

        .register-form-subtitle {
          font-size: 13px;
          color: var(--text-gray);
          font-weight: 400;
        }

        .register-form {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
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
        input[type="password"],
        input[type="text"] {
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
        input[type="password"]:focus,
        input[type="text"]:focus {
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

        .photo-upload {
          border: 2px dashed var(--border);
          border-radius: 6px;
          padding: 28px;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s ease;
          background: #fafaf8;
        }

        .photo-upload:hover {
          border-color: var(--primary);
          background: #f5f5f3;
        }

        .photo-upload input {
          display: none;
        }

        .photo-preview {
          width: 100%;
          height: 180px;
          object-fit: cover;
          border-radius: 6px;
          margin-bottom: 12px;
        }

        .photo-text {
          font-size: 13px;
          color: var(--text-gray);
          margin-bottom: 6px;
        }

        .photo-hint {
          font-size: 11px;
          color: #aaa;
        }

        .password-reqs {
          background: #fafaf8;
          border: 1px solid var(--border);
          border-radius: 6px;
          padding: 14px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .req {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: var(--text-gray);
        }

        .req.valid {
          color: #22c55e;
        }

        .req-icon {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #e8e8e5;
          color: #999;
          font-size: 10px;
          flex-shrink: 0;
          font-weight: 600;
        }

        .req.valid .req-icon {
          background: #dcfce7;
          color: #22c55e;
        }

        .btn-register {
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

        .btn-register:hover:not(:disabled) {
          background-color: #c23d0f;
        }

        .btn-register:disabled {
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

        .back-btn {
          margin-top: 16px;
          width: 100%;
          padding: 10px;
          background: none;
          border: none;
          color: var(--primary);
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: color 0.2s ease;
          text-align: center;
        }

        .back-btn:hover {
          color: #c23d0f;
        }

        .register-footer {
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
          .register-container {
            flex-direction: column;
          }

          .register-left {
            padding: 40px;
            min-height: 40vh;
          }

          .register-right {
            padding: 40px;
            min-height: 60vh;
          }

          .register-header {
            position: relative;
            top: 0;
            right: 0;
            margin-bottom: 24px;
          }

          .register-title {
            font-size: 36px;
          }
        }

        @media (max-width: 768px) {
          .register-left {
            padding: 30px 20px;
            min-height: 40vh;
          }

          .register-right {
            padding: 25px 20px;
            min-height: 60vh;
          }

          .register-title {
            font-size: 32px;
            margin-bottom: 16px;
          }

          .register-subtitle {
            font-size: 14px;
          }

          .register-logo {
            font-size: 24px;
            margin-bottom: 6px;
          }

          .register-form-subtitle {
            font-size: 12px;
          }

          .form-row {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 640px) {
          .register-left {
            display: none;
          }

          .register-right {
            padding: 16px 12px;
            min-height: 100vh;
            justify-content: flex-start;
            padding-top: 80px;
          }

          .register-header {
            position: fixed;
            top: 12px;
            right: 12px;
            left: 12px;
            display: flex;
            justify-content: flex-end;
            z-index: 50;
          }

          .register-progress {
            gap: 6px;
          }

          .register-progress-bar {
            width: 40px;
            height: 2px;
          }

          .lang-switcher-btn {
            padding: 6px 10px;
            font-size: 11px;
            gap: 4px;
          }

          .register-form-wrapper {
            width: 100%;
            max-width: 100%;
            margin-top: 20px;
          }

          .register-branding {
            margin-bottom: 28px;
          }

          .register-logo {
            font-size: 24px;
            margin-bottom: 6px;
          }

          .register-form {
            gap: 18px;
          }

          .form-group {
            gap: 6px;
          }

          label {
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 0.6px;
          }

          input[type="email"],
          input[type="password"],
          input[type="text"] {
            padding: 13px 40px 13px 14px;
            border: 1.5px solid #ddd;
            border-radius: 8px;
            font-size: 15px;
            background: #fafafa;
          }

          input[type="email"]:focus,
          input[type="password"]:focus,
          input[type="text"]:focus {
            background: #fff;
            border-color: var(--primary);
            box-shadow: 0 0 0 4px rgba(216, 67, 21, 0.1);
          }

          input::placeholder {
            color: #bbb;
          }

          .form-row {
            grid-template-columns: 1fr;
            gap: 14px;
          }

          .photo-upload {
            padding: 24px;
          }

          .photo-preview {
            height: 160px;
            margin-bottom: 10px;
          }

          .password-reqs {
            padding: 12px;
            gap: 6px;
          }

          .req {
            font-size: 11px;
            gap: 6px;
          }

          .req-icon {
            width: 14px;
            height: 14px;
            font-size: 8px;
          }

          .btn-register {
            padding: 13px 16px;
            font-size: 13px;
            margin-top: 12px;
          }

          .back-btn {
            padding: 8px;
            font-size: 12px;
            margin-top: 12px;
          }

          .register-footer {
            margin-top: 24px;
            padding-top: 16px;
            font-size: 12px;
          }

          .error-message {
            font-size: 12px;
            padding: 10px 12px;
            margin-bottom: 14px;
          }
        }

        @media (max-width: 480px) {
          .register-right {
            padding: 12px 10px;
            padding-top: 70px;
          }

          .register-header {
            top: 8px;
            right: 8px;
            left: 8px;
          }

          .register-progress {
            gap: 4px;
          }

          .register-progress-bar {
            width: 30px;
          }

          .lang-switcher-btn {
            padding: 5px 8px;
            font-size: 10px;
          }

          .register-logo {
            font-size: 22px;
          }

          .register-form {
            gap: 16px;
          }

          .form-group {
            gap: 5px;
          }

          label {
            font-size: 10px;
            font-weight: 700;
          }

          input[type="email"],
          input[type="password"],
          input[type="text"] {
            padding: 12px 38px 12px 12px;
            border: 1.5px solid #ddd;
            border-radius: 7px;
            font-size: 14px;
          }

          .photo-upload {
            padding: 20px;
          }

          .photo-preview {
            height: 140px;
          }

          .btn-register {
            padding: 12px 14px;
            font-size: 12px;
          }

          .register-footer {
            font-size: 11px;
            margin-top: 20px;
          }
        }
      `}</style>

      <div className="register-container">
        <div className="register-left">
          <div className="register-decoration">
            <div className="register-logo-box">
              <div className="register-logo-box-icon">G</div>
            </div>
            <h1 className="register-title">{t('register_title') || 'Regjistrohuni në eGov'}</h1>
            <p className="register-subtitle">
              {t('register_subtitle') || 'Siguroni qasjen tuaj në shërbimet qeveritare me dy hapa të thjeshtë.'}
            </p>

            <div className="register-steps">
              <div className={`register-step ${step >= 1 ? 'active' : ''}`}>
                <div className="register-step-icon">1</div>
                <div className="register-step-content">
                  <h4>{t('personal_info') || 'Informacioni personal'}</h4>
                  <p>{t('personal_info_desc') || 'Emri, email, EMBG'}</p>
                </div>
              </div>
              <div className={`register-step ${step >= 2 ? 'active' : ''}`}>
                <div className="register-step-icon">2</div>
                <div className="register-step-content">
                  <h4>{t('security_docs') || 'Sigurimi dhe dokumenti'}</h4>
                  <p>{t('security_docs_desc') || 'Fjalëkalim dhe fotografi'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="register-right">
          <div className="register-header">
            <div className="register-progress">
              <div className={`register-progress-bar ${step >= 1 ? 'active' : ''}`} />
              <div className={`register-progress-bar ${step >= 2 ? 'active' : ''}`} />
            </div>
            <LanguageSwitcher />
          </div>

          <div className="register-form-wrapper">
            {step === 1 && (
              <>
                <div className="register-branding">
                  <div className="register-logo">e-Gov</div>
                  <p className="register-form-subtitle">{t('step_1_of_2') || 'Hapi 1 nga 2: Informacioni personal'}</p>
                </div>

                {error && <div className="error-message">{error}</div>}

                <form className="register-form" onSubmit={handleStep1Submit}>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="firstName">{t('first_name') || 'Emri'}</label>
                      <input
                        id="firstName"
                        type="text"
                        placeholder={t('first_name_placeholder') || 'Emri juaj'}
                        value={form.firstName}
                        onChange={e => {
                          setForm({ ...form, firstName: e.target.value })
                          setError('')
                        }}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="lastName">{t('last_name') || 'Mbiemri'}</label>
                      <input
                        id="lastName"
                        type="text"
                        placeholder={t('last_name_placeholder') || 'Mbiemri juaj'}
                        value={form.lastName}
                        onChange={e => {
                          setForm({ ...form, lastName: e.target.value })
                          setError('')
                        }}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">{t('email') || 'Posta elektronike'}</label>
                    <input
                      id="email"
                      type="email"
                      placeholder={t('email_placeholder') || 'emri@shembull.mk'}
                      value={form.email}
                      onChange={e => {
                        setForm({ ...form, email: e.target.value })
                        setError('')
                      }}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="embg">{t('personal_id') || 'Numri personal (EMBG)'}</label>
                    <input
                      id="embg"
                      type="text"
                      placeholder="XXXXXXXXXXXXX"
                      value={form.embg}
                      onChange={e => {
                        setForm({
                          ...form,
                          embg: e.target.value.replace(/\D/g, '').slice(0, 13),
                        })
                        setError('')
                      }}
                      maxLength="13"
                      required
                    />
                  </div>

                  <button type="submit" className="btn-register">{t('next_step') || 'Vazhdo në hapin 2'}</button>
                </form>
              </>
            )}

            {step === 2 && (
              <>
                <div className="register-branding">
                  <div className="register-logo">e-Gov</div>
                  <p className="register-form-subtitle">{t('step_2_of_2') || 'Hapi 2 nga 2: Fjalëkalim dhe dokumenti'}</p>
                </div>

                {error && <div className="error-message">{error}</div>}

                <form className="register-form" onSubmit={handleRegisterSubmit}>
                  <div className="form-group">
                    <label htmlFor="password">{t('password') || 'Fjalëkalim'}</label>
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
                      />
                      <button
                        type="button"
                        className="toggle-password"
                        onClick={(e) => {
                          e.preventDefault()
                          setShowPass(!showPass)
                        }}
                        title={showPass ? 'Fshih' : 'Shfaq'}
                      >
                        {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="confirm">{t('confirm_password') || 'Konfirmoni fjalëkalimin'}</label>
                    <div className="input-container">
                      <input
                        id="confirm"
                        type={showConfirm ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={form.confirmPassword}
                        onChange={e => {
                          setForm({ ...form, confirmPassword: e.target.value })
                          setError('')
                        }}
                        required
                      />
                      <button
                        type="button"
                        className="toggle-password"
                        onClick={(e) => {
                          e.preventDefault()
                          setShowConfirm(!showConfirm)
                        }}
                        title={showConfirm ? 'Fshih' : 'Shfaq'}
                      >
                        {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div className="password-reqs">
                    <div className={`req ${passwordReqs.length ? 'valid' : ''}`}>
                      <div className="req-icon">{passwordReqs.length ? '✓' : '—'}</div>
                      <span>{t('min_8_chars') || 'Të paktën 8 karaktere'}</span>
                    </div>
                    <div className={`req ${passwordReqs.uppercase ? 'valid' : ''}`}>
                      <div className="req-icon">{passwordReqs.uppercase ? '✓' : '—'}</div>
                      <span>{t('one_uppercase') || 'Një shkronjë e madhe'}</span>
                    </div>
                    <div className={`req ${passwordReqs.number ? 'valid' : ''}`}>
                      <div className="req-icon">{passwordReqs.number ? '✓' : '—'}</div>
                      <span>{t('one_number') || 'Një numër'}</span>
                    </div>
                    <div className={`req ${passwordReqs.special ? 'valid' : ''}`}>
                      <div className="req-icon">{passwordReqs.special ? '✓' : '—'}</div>
                      <span>{t('one_special') || 'Karakter special: !@#$%^&*'}</span>
                    </div>
                    <div className={`req ${passwordReqs.match ? 'valid' : ''}`}>
                      <div className="req-icon">{passwordReqs.match ? '✓' : '—'}</div>
                      <span>{t('passwords_match') || 'Fjalëkalimet përputhen'}</span>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>{t('upload_photo') || 'Fotografia e dokumentit'}</label>
                    <div className="photo-upload" onClick={() => photoInputRef.current?.click()}>
                      {photoPreview ? (
                        <>
                          <img src={photoPreview} alt="Preview" className="photo-preview" />
                          <p className="photo-text">{t('click_to_change') || 'Klikoni për të ndryshuar'}</p>
                        </>
                      ) : (
                        <>
                          <p className="photo-text">{t('upload_document_photo') || 'Ngarkoni fotografi të dokumentit'}</p>
                          <p className="photo-hint">{t('photo_formats') || 'PNG, JPG deri në 5MB'}</p>
                        </>
                      )}
                      <input
                        ref={photoInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoSelect}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn-register"
                    disabled={loading || !isLoaded || !allValid || !photoPreview}
                  >
                    {loading ? (
                      <>
                        <span className="spinner" />
                        {t('registering') || 'Duke u regjistruar...'}
                      </>
                    ) : (
                      t('complete_registration') || 'Përfundoni regjistrimin'
                    )}
                  </button>
                </form>
              </>
            )}

            {step > 1 && (
              <button
                type="button"
                className="back-btn"
                onClick={() => {
                  setStep(step - 1)
                  setError('')
                }}
              >
                ← {t('back') || 'Kthehu mbrapa'}
              </button>
            )}

            <p className="register-footer">
              {t('have_account') || 'Tashmë keni llogari?'} <Link to="/login" className="register-link">{t('login_here') || 'Kyçuni këtu'}</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

export default Register