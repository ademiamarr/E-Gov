import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSignUp } from '@clerk/clerk-react'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from '../components/LanguageSwitcher'
import { UserPlus, Lock, Clock, Check, Eye, EyeOff, Upload, X } from 'lucide-react'

const validateEMBG = (embg) => {
  if (!/^\d{13}$/.test(embg)) return false
  const d = embg.split('').map(Number)
  const rr = parseInt(embg.slice(7, 9))
  if (![41,42,43,44,45,46,47,48,49].includes(rr)) return false
  const sum = (7*(d[0]+d[6])+6*(d[1]+d[7])+5*(d[2]+d[8])+4*(d[3]+d[9])+3*(d[4]+d[10])+2*(d[5]+d[11])) % 11
  const k = (sum === 0 || sum === 1) ? 0 : 11 - sum
  return k === d[12]
}

const Register = () => {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({ first_name:'', last_name:'', personal_id:'', email:'', password:'', confirm_password:'' })
  const [photo, setPhoto] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [showPass, setShowPass] = useState(false)
  const [showPass2, setShowPass2] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signUp, isLoaded } = useSignUp()
  const { t } = useTranslation()
  const navigate = useNavigate()

  const isStep1Valid = form.first_name && form.last_name && form.personal_id && form.email && validateEMBG(form.personal_id)
  const isStep2Valid = form.password && form.confirm_password && form.password === form.confirm_password && form.password.length >= 8 && photoPreview

  const nextStep = () => {
    setError('')
    if (!form.first_name || !form.last_name || !form.personal_id || !form.email)
      return setError(t('fill_required') || 'Пополни ги сите полиња')
    if (!validateEMBG(form.personal_id))
      return setError('Број на документ мора да има 15 карактери')
    setStep(2)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handlePhoto = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { setError('Фајлот е превелик (макс. 5MB)'); return }
    setPhoto(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.password || !form.confirm_password) return setError('Пополни ги сите полиња')
    if (form.password.length < 8) return setError('Лозинката мора да има минимум 8 карактери')
    if (form.password !== form.confirm_password) return setError('Лозинките не се совпаѓаат')
    if (!isLoaded) return
    setLoading(true)
    try {
      const su = await signUp.create({
        emailAddress: form.email, password: form.password,
        firstName: form.first_name, lastName: form.last_name
      })
      window.__pendingRegister = {
        clerk_id: su.createdUserId, first_name: form.first_name,
        last_name: form.last_name, personal_id: form.personal_id,
        email: form.email, id_photo: photo
      }
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })
      navigate('/verify-email')
    } catch (err) {
      setError(err.errors?.[0]?.message || 'Грешка при регистрирање')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style>{`
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
          --success: #4caf50;
          --error: #f44336;
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

        /* Header */
        header {
          position: absolute;
          top: 0;
          right: 0;
          padding: 24px 40px;
          z-index: 100;
          display: flex;
          gap: 24px;
          align-items: center;
        }

        /* Main Container */
        .container {
          display: flex;
          min-height: 100vh;
          width: 100%;
        }

        /* Left Side - Decoration */
        .left-side {
          flex: 1;
          background: linear-gradient(135deg, #d84315 0%, #f4511e 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px;
          position: relative;
          overflow: hidden;
        }

        .decoration-content {
          position: relative;
          z-index: 2;
          text-align: center;
          color: white;
          max-width: 400px;
        }

        .decoration-icon {
          width: 80px;
          height: 80px;
          margin: 0 auto 32px;
          opacity: 0.95;
        }

        .decoration-icon svg {
          width: 100%;
          height: 100%;
          color: white;
        }

        .decoration-title {
          font-family: 'Playfair Display', serif;
          font-size: 48px;
          font-weight: 700;
          margin-bottom: 20px;
          line-height: 1.2;
        }

        .decoration-text {
          font-size: 15px;
          line-height: 1.6;
          opacity: 0.95;
          font-weight: 400;
        }

        .decoration-benefits {
          margin-top: 48px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .benefit-item {
          display: flex;
          align-items: flex-start;
          gap: 16px;
        }

        .benefit-icon {
          width: 24px;
          height: 24px;
          flex-shrink: 0;
          opacity: 0.9;
        }

        .benefit-icon svg {
          width: 100%;
          height: 100%;
          color: white;
        }

        .benefit-text {
          text-align: left;
          font-size: 13px;
          line-height: 1.5;
        }

        .shape-1 {
          position: absolute;
          width: 300px;
          height: 300px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.1);
          top: -100px;
          right: -100px;
          z-index: 1;
        }

        .shape-2 {
          position: absolute;
          width: 200px;
          height: 200px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.08);
          bottom: -50px;
          left: -50px;
          z-index: 1;
        }

        /* Right Side - Register Form */
        .right-side {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px;
          background: var(--white);
          overflow-y: auto;
          max-height: 100vh;
          position: relative;
        }

        .register-wrapper {
          width: 100%;
          max-width: 420px;
        }

        .register-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 32px;
          gap: 16px;
        }

        .register-header {
          flex: 1;
        }

        .register-logo {
          font-family: 'Playfair Display', serif;
          font-size: 28px;
          font-weight: 700;
          color: var(--dark);
          margin-bottom: 8px;
        }

        .register-subtitle {
          font-size: 13px;
          color: var(--text-gray);
          font-weight: 400;
        }

        .lang-switcher-wrapper {
          flex-shrink: 0;
        }

        /* Progress Indicator */
        .progress-container {
          margin-bottom: 32px;
        }

        .progress-steps {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 8px;
          margin-bottom: 16px;
        }

        .progress-step {
          flex: 1;
          height: 4px;
          background: var(--border);
          border-radius: 2px;
          transition: background-color 0.3s ease;
        }

        .progress-step.active {
          background: var(--primary);
        }

        .progress-step.completed {
          background: var(--success);
        }

        .progress-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0 8px;
          font-size: 12px;
          font-weight: 600;
          color: var(--text-gray);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .step-indicator.active {
          color: var(--primary);
        }

        /* Form */
        .register-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .form-step {
          display: none;
        }

        .form-step.active {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .form-step h2 {
          font-size: 18px;
          font-weight: 800;
          color: #0f1728;
          margin-bottom: 4px;
        }

        .form-step > p {
          font-size: 13px;
          color: #6b7280;
          margin-bottom: 20px;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .form-row.full {
          grid-template-columns: 1fr;
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

        input[type="text"],
        input[type="email"],
        input[type="password"],
        input[type="file"] {
          padding: 16px 16px;
          border: 1.5px solid var(--border);
          border-radius: 8px;
          font-size: 15px;
          font-family: 'Inter', sans-serif;
          background: #f9fafb;
          color: var(--dark);
          transition: all 0.2s ease;
          height: 48px;
          line-height: 1.5;
        }

        input[type="text"]:focus,
        input[type="email"]:focus,
        input[type="password"]:focus,
        input[type="file"]:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(216, 67, 21, 0.1);
          background: var(--white);
        }

        input::placeholder {
          color: #bbb;
          font-size: 15px;
        }

        /* File Upload */
        .file-upload-wrapper {
          position: relative;
        }

        .file-upload-label {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 40px 20px;
          border: 2px dashed var(--border);
          border-radius: 8px;
          cursor: pointer;
          background: #f9fafb;
          transition: all 0.3s ease;
          text-align: center;
          min-height: 140px;
        }

        .file-upload-label:hover {
          border-color: var(--primary);
          background-color: rgba(216, 67, 21, 0.03);
        }

        .file-upload-label.active {
          border-color: var(--primary);
          background-color: rgba(216, 67, 21, 0.08);
          border-style: solid;
        }

        .file-upload-icon {
          width: 32px;
          height: 32px;
          color: var(--primary);
        }

        .file-upload-icon svg {
          width: 100%;
          height: 100%;
        }

        .file-upload-text {
          font-size: 14px;
          color: var(--dark);
          font-weight: 600;
        }

        .file-upload-hint {
          font-size: 12px;
          color: var(--text-gray);
        }

        input[type="file"] {
          display: none;
        }

        .file-preview {
          position: relative;
          margin-top: 12px;
          border-radius: 8px;
          overflow: hidden;
          background: var(--light-bg);
        }

        .file-preview img {
          max-width: 100%;
          height: auto;
          display: block;
          width: 100%;
          max-height: 200px;
          object-fit: cover;
        }

        .file-preview-info {
          padding: 12px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: var(--light-bg);
          font-size: 12px;
          font-weight: 600;
          color: var(--success);
        }

        .file-remove {
          cursor: pointer;
          color: var(--error);
          background: none;
          border: none;
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
        }

        .file-remove svg {
          width: 18px;
          height: 18px;
        }

        .file-remove:hover {
          color: #d32f2f;
        }

        /* Password Input Container */
        .password-input-container {
          position: relative;
        }

        .password-toggle-btn {
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
        }

        .password-toggle-btn svg {
          width: 20px;
          height: 20px;
        }

        /* Password Strength */
        .password-strength {
          margin-top: 8px;
          height: 4px;
          background: var(--border);
          border-radius: 2px;
          overflow: hidden;
        }

        .password-strength-bar {
          height: 100%;
          width: 0;
          background: var(--error);
          transition: width 0.3s ease, background-color 0.3s ease;
        }

        .password-strength-bar.weak {
          width: 33%;
          background: var(--error);
        }

        .password-strength-bar.medium {
          width: 66%;
          background: #ff9800;
        }

        .password-strength-bar.strong {
          width: 100%;
          background: var(--success);
        }

        /* Agreement */
        .agreement-section {
          display: flex;
          gap: 10px;
          padding: 16px;
          background: #f9fafb;
          border-radius: 8px;
        }

        .checkbox-wrapper {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          cursor: pointer;
          flex: 1;
        }

        input[type="checkbox"] {
          width: 18px;
          height: 18px;
          cursor: pointer;
          accent-color: var(--primary);
          margin-top: 2px;
          flex-shrink: 0;
          border: 1.5px solid var(--border);
          border-radius: 4px;
        }

        .checkbox-label {
          font-size: 12px;
          color: var(--text-gray);
          cursor: pointer;
          margin: 0;
          font-weight: 400;
          line-height: 1.5;
        }

        .checkbox-label a {
          color: var(--primary);
          text-decoration: none;
          font-weight: 600;
        }

        .checkbox-label a:hover {
          text-decoration: underline;
        }

        /* Buttons */
        .button-group {
          display: flex;
          gap: 12px;
          margin-top: 20px;
        }

        .btn-back {
          flex: 1;
          padding: 16px 24px;
          background: #f9fafb;
          color: var(--dark);
          border: 1.5px solid var(--border);
          border-radius: 8px;
          font-size: 14px;
          font-weight: 700;
          letter-spacing: 0.5px;
          cursor: pointer;
          transition: all 0.2s ease;
          text-transform: uppercase;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .btn-back:hover {
          border-color: var(--primary);
          background: rgba(216, 67, 21, 0.03);
        }

        .btn-continue,
        .btn-register {
          flex: 1;
          padding: 16px 24px;
          background: var(--primary);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 700;
          letter-spacing: 0.5px;
          cursor: pointer;
          transition: background-color 0.2s ease;
          text-transform: uppercase;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .btn-continue:hover:not(:disabled),
        .btn-register:hover:not(:disabled) {
          background-color: #c23d0f;
        }

        .btn-continue:disabled,
        .btn-register:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* Login Link */
        .login-section {
          margin-top: 24px;
          padding-top: 20px;
          border-top: 1px solid var(--border);
          text-align: center;
          font-size: 13px;
          color: var(--text-gray);
        }

        .login-link {
          color: var(--primary);
          text-decoration: none;
          font-weight: 600;
          transition: color 0.2s ease;
          cursor: pointer;
        }

        .login-link:hover {
          color: #c23d0f;
        }

        /* Error Message */
        .error-msg {
          background: #fef2f2;
          color: var(--error);
          padding: 12px 14px;
          border-radius: 8px;
          border: 1.5px solid #fecaca;
          font-size: 13px;
          margin-bottom: 16px;
          font-weight: 500;
        }

        .back-button-header {
          position: absolute;
          top: 24px;
          left: 24px;
          background: var(--white);
          border: 1.5px solid var(--border);
          width: 40px;
          height: 40px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 20px;
          z-index: 101;
        }

        .back-button-header:hover {
          border-color: var(--primary);
          background: rgba(216, 67, 21, 0.03);
        }

        /* Responsive Design */
        @media (max-width: 1024px) {
          .container {
            flex-direction: column;
          }

          .left-side {
            padding: 40px;
            min-height: 35vh;
          }

          .right-side {
            padding: 40px;
            min-height: 65vh;
          }

          header {
            position: relative;
            justify-content: flex-end;
            padding: 16px 24px;
            background: var(--white);
          }
        }

        @media (max-width: 768px) {
          .container {
            flex-direction: column;
          }

          .left-side {
            padding: 30px 20px;
            min-height: 40vh;
          }

          .right-side {
            padding: 25px 20px;
            min-height: 60vh;
          }

          .register-logo {
            font-size: 24px;
          }

          .register-subtitle {
            font-size: 12px;
          }

          header {
            padding: 16px 20px;
          }

          input[type="text"],
          input[type="email"],
          input[type="password"] {
            font-size: 14px;
          }
        }

        @media (max-width: 640px) {
          .container {
            flex-direction: column;
            min-height: auto;
          }

          .left-side {
            padding: 25px 16px;
            min-height: 35vh;
          }

          .right-side {
            padding: 20px 16px;
            min-height: 65vh;
          }

          .decoration-icon {
            width: 50px;
            height: 50px;
            margin-bottom: 16px;
          }

          .decoration-title {
            font-size: 26px;
            margin-bottom: 12px;
            line-height: 1.3;
          }

          .decoration-text {
            font-size: 13px;
          }

          .register-wrapper {
            max-width: 100%;
          }

          .register-top {
            flex-direction: column;
            gap: 16px;
          }

          .register-header {
            flex: none;
          }

          .lang-switcher-wrapper {
            width: 100%;
          }

          .register-logo {
            font-size: 22px;
          }

          .register-subtitle {
            font-size: 12px;
            margin-top: 8px;
          }

          .form-row {
            grid-template-columns: 1fr;
          }

          label {
            font-size: 11px;
          }

          input[type="text"],
          input[type="email"],
          input[type="password"] {
            padding: 14px 16px;
            font-size: 14px;
            height: 44px;
          }

          .progress-container {
            margin-bottom: 24px;
          }

          .btn-continue,
          .btn-back,
          .btn-register {
            padding: 14px 20px;
            font-size: 13px;
            height: 44px;
          }

          .button-group {
            flex-direction: column;
          }

          .login-section {
            margin-top: 20px;
            padding-top: 16px;
            font-size: 12px;
          }

          header {
            padding: 12px 12px;
            right: 0;
          }

          .file-upload-label {
            padding: 30px 16px;
            min-height: 120px;
          }

          .agreement-section {
            padding: 12px;
          }

          .back-button-header {
            width: 36px;
            height: 36px;
            font-size: 18px;
            top: 20px;
            left: 20px;
          }
        }

        @media (max-width: 480px) {
          .left-side {
            padding: 20px 12px;
            min-height: 30vh;
          }

          .right-side {
            padding: 16px 12px;
          }

          .decoration-icon {
            width: 40px;
            height: 40px;
            margin-bottom: 12px;
          }

          .decoration-title {
            font-size: 22px;
            margin-bottom: 10px;
          }

          .register-logo {
            font-size: 20px;
          }

          .register-subtitle {
            font-size: 11px;
          }

          input[type="text"],
          input[type="email"],
          input[type="password"] {
            padding: 12px 14px;
            font-size: 14px;
            height: 40px;
          }

          .btn-continue,
          .btn-back,
          .btn-register {
            padding: 12px 16px;
            font-size: 12px;
            height: 40px;
          }

          .file-upload-label {
            padding: 25px 12px;
            gap: 10px;
            min-height: 100px;
          }

          .file-upload-icon {
            width: 28px;
            height: 28px;
          }

          .file-upload-text {
            font-size: 12px;
          }
        }
      `}</style>

      <div className="container">
        {/* Left Side - Decoration */}
        <div className="left-side">
          <div className="shape-1"></div>
          <div className="shape-2"></div>

          <div className="decoration-content">
            <div className="decoration-icon">
              <UserPlus />
            </div>
            <h1 className="decoration-title">Приклучи се сега</h1>
            <p className="decoration-text">
              Направи своја сметка и почни да управуваш со твои документи и термини.
            </p>

            <div className="decoration-benefits">
              <div className="benefit-item">
                <div className="benefit-icon">
                  <Lock />
                </div>
                <div className="benefit-text">Безбедна регистрација</div>
              </div>
              <div className="benefit-item">
                <div className="benefit-icon">
                  <Clock />
                </div>
                <div className="benefit-text">Брзо верифицирано</div>
              </div>
              <div className="benefit-item">
                <div className="benefit-icon">
                  <Check />
                </div>
                <div className="benefit-text">Веќе активна сметка</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Register Form */}
        <div className="right-side">
          {step === 2 && (
            <button 
              className="back-button-header"
              onClick={() => setStep(1)}
              aria-label="Go back"
            >
              ←
            </button>
          )}

          <div className="register-wrapper">
            <div className="register-top">
              <div className="register-header">
                <div className="register-logo">e-Gov</div>
                <div className="register-subtitle">Креирај нова сметка</div>
              </div>
              <div className="lang-switcher-wrapper">
                <LanguageSwitcher />
              </div>
            </div>

            {/* Progress Indicator */}
            <div className="progress-container">
              <div className="progress-steps">
                <div className={`progress-step ${step > 1 ? 'completed' : step === 1 ? 'active' : ''}`}></div>
                <div className={`progress-step ${step === 2 ? 'active' : ''}`}></div>
              </div>
              <div className="progress-info">
                <span className={step === 1 ? 'active' : ''}>Чекор 1</span>
                <span className={step === 2 ? 'active' : ''}>Чекор 2</span>
              </div>
            </div>

            {error && <div className="error-msg">{error}</div>}

            <form className="register-form" onSubmit={(e) => { e.preventDefault(); step === 1 ? nextStep() : handleSubmit(e) }}>
              {/* STEP 1: Personal Information */}
              <div className={`form-step ${step === 1 ? 'active' : ''}`}>
                <h2>Лични податоци</h2>
                <p>Пополни информациите за создавање на твоја сметка</p>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="firstName">Име</label>
                    <input
                      id="firstName"
                      type="text"
                      placeholder="Марко"
                      value={form.first_name}
                      onChange={e => setForm({...form, first_name: e.target.value})}
                      required
                      autoComplete="given-name"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="lastName">Мбиемер</label>
                    <input
                      id="lastName"
                      type="text"
                      placeholder="Петровски"
                      value={form.last_name}
                      onChange={e => setForm({...form, last_name: e.target.value})}
                      required
                      autoComplete="family-name"
                    />
                  </div>
                </div>

                <div className="form-group form-row full">
                  <label htmlFor="personalNumber">Број на личен документ</label>
                  <input
                    id="personalNumber"
                    type="text"
                    placeholder="ХХХХХХХХХХХХХХХ"
                    maxLength={15}
                    inputMode="numeric"
                    value={form.personal_id}
                    onChange={e => setForm({...form, personal_id: e.target.value.replace(/\D/g,'')})}
                    required
                  />
                </div>

                <div className="form-group form-row full">
                  <label htmlFor="email">Е-пошта</label>
                  <input
                    id="email"
                    type="email"
                    placeholder="email@пример.mk"
                    value={form.email}
                    onChange={e => setForm({...form, email: e.target.value})}
                    required
                    autoComplete="email"
                  />
                </div>

                <div className="button-group">
                  <button 
                    type="button"
                    className="btn-continue"
                    onClick={nextStep}
                    disabled={!isStep1Valid}
                  >
                    Продолжи →
                  </button>
                </div>

                <p className="login-section">
                  Веќе имаш сметка? <Link to="/login" className="login-link">Влези</Link>
                </p>
              </div>

              {/* STEP 2: Password & Document */}
              <div className={`form-step ${step === 2 ? 'active' : ''}`}>
                <h2>Лозинка и документ</h2>
                <p>Постави лозинка и нагрузи фото од документ</p>

                <div className="form-group form-row full">
                  <label htmlFor="password">Лозинка</label>
                  <div className="password-input-container">
                    <input
                      id="password"
                      type={showPass ? 'text' : 'password'}
                      placeholder="Минимум 8 карактери"
                      value={form.password}
                      onChange={e => setForm({...form, password: e.target.value})}
                      required
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowPass(!showPass)}
                      aria-label="Toggle password visibility"
                    >
                      {showPass ? <EyeOff /> : <Eye />}
                    </button>
                  </div>
                  <div className="password-strength">
                    <div className={`password-strength-bar ${form.password.length < 8 ? 'weak' : form.password.length < 12 ? 'medium' : 'strong'}`}></div>
                  </div>
                </div>

                <div className="form-group form-row full">
                  <label htmlFor="confirmPassword">Потврди лозинка</label>
                  <div className="password-input-container">
                    <input
                      id="confirmPassword"
                      type={showPass2 ? 'text' : 'password'}
                      placeholder="Повтори лозинка"
                      value={form.confirm_password}
                      onChange={e => setForm({...form, confirm_password: e.target.value})}
                      required
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowPass2(!showPass2)}
                      aria-label="Toggle password visibility"
                    >
                      {showPass2 ? <EyeOff /> : <Eye />}
                    </button>
                  </div>
                </div>

                <div className="form-group form-row full">
                  <label>Фото од документ</label>
                  <div className="file-upload-wrapper">
                    <label className={`file-upload-label ${photoPreview ? 'active' : ''}`}>
                      {photoPreview ? (
                        <div className="file-preview">
                          <img src={photoPreview} alt="Document Preview" />
                          <div className="file-preview-info">
                            <span>✓ Документ нагрузен</span>
                            <button
                              type="button"
                              className="file-remove"
                              onClick={() => { setPhoto(null); setPhotoPreview(null); }}
                              aria-label="Remove file"
                            >
                              <X />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="file-upload-icon">
                            <Upload />
                          </div>
                          <div className="file-upload-text">Нагрузи фото од документ</div>
                          <div className="file-upload-hint">PNG, JPG до 5MB</div>
                        </>
                      )}
                      <input type="file" accept="image/*" onChange={handlePhoto} />
                    </label>
                  </div>
                </div>

                <div className="agreement-section">
                  <div className="checkbox-wrapper">
                    <input type="checkbox" id="agreement" name="agreement" required />
                    <label htmlFor="agreement" className="checkbox-label">
                      Се согласувам со <a href="#" onClick={(e) => { e.preventDefault(); }}>условите на користење</a> и <a href="#" onClick={(e) => { e.preventDefault(); }}>политиката за приватност</a>
                    </label>
                  </div>
                </div>

                <div className="button-group">
                  <button type="button" className="btn-back" onClick={() => setStep(1)}>Назад</button>
                  <button type="submit" className="btn-register" disabled={!isStep2Valid || loading}>
                    {loading ? 'Обработка...' : 'Завршиме →'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}

export default Register