import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSignUp, useUser } from '@clerk/react'
import { useTranslation } from 'react-i18next'
import { Eye, EyeOff, Upload, CheckCircle2, AlertCircle } from 'lucide-react'
import LanguageSwitcher from '../components/LanguageSwitcher'

const Register = () => {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { user } = useUser()
  const { signUp, isLoaded, setActive } = useSignUp()

  // State Management
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
  const [clerkReady, setClerkReady] = useState(false)
  const photoInputRef = useRef(null)

  // Validation Rules
  const passwordRules = {
    minLength: form.password.length >= 8,
    hasUppercase: /[A-Z]/.test(form.password),
    hasLowercase: /[a-z]/.test(form.password),
    hasNumber: /[0-9]/.test(form.password),
    hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(form.password),
  }

  const allPasswordRulesMet = Object.values(passwordRules).every(rule => rule === true)
  const passwordsMatch = form.password === form.confirmPassword && form.password.length > 0

  // Step 1 Validation
  const isFirstNameValid = form.firstName.trim().length >= 2
  const isLastNameValid = form.lastName.trim().length >= 2
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)
  const isEMBGValid = /^\d{13}$/.test(form.embg)
  const step1Complete = isFirstNameValid && isLastNameValid && isEmailValid && isEMBGValid

  // Step 2 Validation
  const step2Complete = allPasswordRulesMet && passwordsMatch && photoPreview

  // Debug Logging
  useEffect(() => {
    console.log('🔍 Register Component Debug Info (Step', step, '):')
    console.log('  - isLoaded (Clerk):', isLoaded)
    console.log('  - clerkReady:', clerkReady)
    console.log('  - user:', user)
    console.log('  - Step 1 valid:', step1Complete)
    console.log('  - Step 2 valid:', step2Complete)
    console.log('  - Photo preview:', photoPreview ? 'Yes' : 'No')
    console.log('  - Loading:', loading)
  }, [step, isLoaded, clerkReady, form, step1Complete, step2Complete, photoPreview, loading, user])

  // Clerk Ready Check
  useEffect(() => {
    if (isLoaded) {
      console.log('✅ Clerk is loaded and ready')
      setClerkReady(true)
    } else {
      console.log('⏳ Waiting for Clerk to load...')
      setClerkReady(false)
    }
  }, [isLoaded])

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      console.log('👤 User already logged in, redirecting to dashboard...')
      navigate('/dashboard')
    }
  }, [user, navigate])

  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    console.log('📸 Photo selected:', file.name, 'Size:', file.size, 'bytes')

    // Validation
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      const sizeInMB = (file.size / (1024 * 1024)).toFixed(2)
      const errorMsg = `Fotografija është shumë e madhe (${sizeInMB}MB). Max 5MB.`
      setError(errorMsg)
      console.error('❌', errorMsg)
      return
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      const errorMsg = 'Format fotografie jo i vlefshëm. Përdor JPG, PNG, ose WEBP.'
      setError(errorMsg)
      console.error('❌', errorMsg)
      return
    }

    const reader = new FileReader()
    reader.onload = (evt) => {
      setPhotoPreview(evt.target.result)
      setForm(prev => ({ ...prev, idPhoto: file }))
      setError('')
      console.log('✅ Photo loaded successfully')
    }
    reader.onerror = () => {
      setError('Gabim në leximin e fotografisë. Provo përsëri.')
      console.error('❌ FileReader error')
    }
    reader.readAsDataURL(file)
  }

  const handleStep1Submit = (e) => {
    e.preventDefault()
    console.log('📋 Step 1 form submitted')

    if (!step1Complete) {
      let errorMsg = 'Plotëso të gjitha fushat sipas kërkesave:'
      if (!isFirstNameValid) errorMsg += '\n- Emri duhet të ketë të paktën 2 karaktere'
      if (!isLastNameValid) errorMsg += '\n- Mbiemri duhet të ketë të paktën 2 karaktere'
      if (!isEmailValid) errorMsg += '\n- Email nuk është valid'
      if (!isEMBGValid) errorMsg += '\n- EMBG duhet të ketë saktësisht 13 shifra'

      setError(errorMsg)
      console.error('❌ Step 1 validation failed:', errorMsg)
      return
    }

    setError('')
    setStep(2)
    console.log('✅ Step 1 completed, moving to Step 2')
  }

  const handleRegisterSubmit = async (e) => {
    e.preventDefault()
    console.log('📝 Register form submitted')

    // Validation
    if (!step2Complete) {
      let errorMsg = 'Plotëso të gjitha kërkesat:'
      if (!allPasswordRulesMet) errorMsg += '\n- Fjalëkalimi nuk plotëson të gjitha kërkesat'
      if (!passwordsMatch) errorMsg += '\n- Fjalëkalimet nuk përputhen'
      if (!photoPreview) errorMsg += '\n- Duhet të ngarkosh fotografinë e dokumentit'

      setError(errorMsg)
      console.error('❌ Step 2 validation failed:', errorMsg)
      return
    }

    if (!clerkReady || !isLoaded) {
      setError('Clerk nuk është gati, prit një moment...')
      console.error('❌ Clerk not ready')
      return
    }

    setLoading(true)
    setError('')

    try {
      console.log('📤 Creating Clerk user...')
      console.log('   Name:', form.firstName, form.lastName)
      console.log('   Email:', form.email)
      console.log('   EMBG:', form.embg)

      const response = await signUp.create({
        emailAddress: form.email.trim(),
        password: form.password,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        unsafeMetadata: {
          embg: form.embg,
          registrationDate: new Date().toISOString(),
        },
      })

      console.log('📥 Clerk response status:', response.status)
      console.log('📥 Full response:', response)

      if (response.status === 'complete') {
        console.log('✅ Clerk registration complete!')
        await setActive({ session: response.createdSessionId })
        console.log('✅ Active session set, redirecting...')
        navigate('/dashboard')
      } else if (response.status === 'missing_requirements') {
        console.log('⚠️ Missing requirements for registration')
        setError('Plotëso të gjitha fushat dhe provo përsëri.')
      } else if (response.status === 'unverified_email') {
        console.log('⚠️ Email verification required')
        setError('Kontrollo email-in tuaj për të verifikuar adresën.')
        // Optional: Navigate to verification page
        // navigate('/register/verify-email', { state: { email: form.email } })
      } else {
        console.warn('⚠️ Unexpected Clerk status:', response.status)
        setError(`Gjendja: ${response.status}. Kontaktoni suportin.`)
      }
    } catch (err) {
      console.error('❌ Registration error caught:', err)
      console.error('   Error message:', err.message)
      console.error('   Error errors:', err.errors)

      if (err.errors && err.errors.length > 0) {
        const errorMessage = err.errors[0].message
        console.error('   First error:', errorMessage)

        if (errorMessage.includes('already exists')) {
          setError('Kjo adresë email është regjistruar tashmë. Kyçu këtu.')
        } else if (errorMessage.includes('invalid_password')) {
          setError('Fjalëkalimi nuk plotëson kërkesat e sigurisë.')
        } else if (errorMessage.includes('invalid_email')) {
          setError('Adresa email nuk është e vlefshme.')
        } else {
          setError(errorMessage)
        }
      } else {
        setError('Gabim në regjistrimin. Provo përsëri pas pak çastesh.')
      }
    } finally {
      setLoading(false)
      console.log('🔄 Registration process completed')
    }
  }

  const handleInputChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
    setError('')
    console.log(`📝 ${field} changed`)
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
          --success: #22c55e;
          --success-light: #dcfce7;
          --success-border: #bbf7d0;
          --error: #ef4444;
          --error-light: #fef2f2;
          --error-border: #fecaca;
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
          opacity: 0.6;
          transition: opacity 0.3s ease;
        }

        .register-step.active {
          opacity: 1;
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
        }

        .register-step.active .register-step-icon {
          background: rgba(255, 255, 255, 0.25);
        }

        .register-step-content h4 {
          font-size: 13px;
          font-weight: 600;
          margin-bottom: 4px;
          letter-spacing: 0.3px;
        }

        .register-step-content p {
          font-size: 12px;
          opacity: 0.85;
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
          gap: 24px;
          z-index: 10;
        }

        .register-progress {
          display: flex;
          gap: 8px;
        }

        .register-progress-dot {
          width: 8px;
          height: 8px;
          background: var(--border);
          border-radius: 50%;
          transition: all 0.3s ease;
        }

        .register-progress-dot.active {
          background: var(--primary);
          width: 24px;
          border-radius: 4px;
        }

        .register-form-wrapper {
          width: 100%;
          max-width: 380px;
          animation: fadeIn 0.4s ease;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
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
          transition: all 0.2s ease;
          width: 100%;
        }

        input[type="email"]:focus,
        input[type="password"]:focus,
        input[type="text"]:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(216, 67, 21, 0.08);
          background: #fafafa;
        }

        input:disabled {
          background: #f5f5f5;
          cursor: not-allowed;
          opacity: 0.7;
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

        .toggle-password:hover:not(:disabled) {
          color: var(--primary);
        }

        .toggle-password:disabled {
          cursor: not-allowed;
          opacity: 0.5;
        }

        .photo-upload {
          border: 2px dashed var(--border);
          border-radius: 6px;
          padding: 28px;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s ease;
          background: #fafaf8;
          position: relative;
        }

        .photo-upload:hover:not(.loading) {
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
          border: 1px solid var(--border);
        }

        .photo-text {
          font-size: 13px;
          color: var(--text-gray);
          margin-bottom: 6px;
          font-weight: 500;
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
          transition: color 0.2s ease;
        }

        .req.valid {
          color: var(--success);
        }

        .req-icon {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #e8e8e5;
          color: transparent;
          font-size: 10px;
          flex-shrink: 0;
          font-weight: 600;
          transition: all 0.2s ease;
        }

        .req.valid .req-icon {
          background: var(--success-light);
          color: var(--success);
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
          transition: all 0.2s ease;
          text-transform: uppercase;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          min-height: 44px;
        }

        .btn-register:not(:disabled):hover {
          background-color: #c23d0f;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(216, 67, 21, 0.25);
        }

        .btn-register:not(:disabled):active {
          transform: translateY(0);
        }

        .btn-register:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          background-color: var(--primary);
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
          background: var(--error-light);
          color: var(--error);
          padding: 12px 14px;
          border-radius: 6px;
          border: 1px solid var(--error-border);
          font-size: 13px;
          margin-bottom: 16px;
          white-space: pre-wrap;
          word-break: break-word;
          animation: slideDown 0.3s ease;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
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

        .back-btn:hover:not(:disabled) {
          color: #c23d0f;
          text-decoration: underline;
        }

        .back-btn:disabled {
          cursor: not-allowed;
          opacity: 0.5;
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
          text-decoration: underline;
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
            gap: 16px;
            margin-bottom: 24px;
          }

          .register-title {
            font-size: 36px;
          }

          .form-row {
            grid-template-columns: 1fr;
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

          .register-logo {
            font-size: 24px;
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
            gap: 12px;
          }

          .register-progress-dot {
            width: 6px;
            height: 6px;
          }

          .register-progress-dot.active {
            width: 20px;
          }

          input[type="email"],
          input[type="password"],
          input[type="text"] {
            padding: 13px 40px 13px 14px;
            border: 1.5px solid #ddd;
            border-radius: 8px;
            font-size: 15px;
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

          .register-form {
            gap: 16px;
          }

          .form-group {
            gap: 5px;
          }

          label {
            font-size: 10px;
          }

          input[type="email"],
          input[type="password"],
          input[type="text"] {
            padding: 12px 38px 12px 12px;
            font-size: 14px;
          }

          .photo-upload {
            padding: 20px;
          }

          .photo-preview {
            height: 140px;
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
            <h1 className="register-title">Regjistrohuni në eGov</h1>
            <p className="register-subtitle">
              Siguroni qasjen tuaj në shërbimet qeveritare me dy hapa të thjeshtë dhe të sigurtë.
            </p>

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
                      <label htmlFor="firstName">EMRI</label>
                      <input
                        id="firstName"
                        type="text"
                        placeholder="Emri juaj"
                        value={form.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        disabled={loading}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="lastName">MBIEMRI</label>
                      <input
                        id="lastName"
                        type="text"
                        placeholder="Mbiemri juaj"
                        value={form.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        disabled={loading}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">E-POSTA</label>
                    <input
                      id="email"
                      type="email"
                      placeholder="emri@shembull.mk"
                      value={form.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      disabled={loading}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="embg">NUMRI PERSONAL (EMBG)</label>
                    <input
                      id="embg"
                      type="text"
                      placeholder="XXXXXXXXXXXXX"
                      value={form.embg}
                      onChange={(e) => {
                        const cleaned = e.target.value.replace(/\D/g, '').slice(0, 13)
                        handleInputChange('embg', cleaned)
                      }}
                      disabled={loading}
                      maxLength="13"
                      inputMode="numeric"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn-register"
                    disabled={!step1Complete || loading}
                    title={!step1Complete ? 'Plotëso të gjitha fushat si duhet' : 'Vazhdo në hapin 2'}
                  >
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
                    <label htmlFor="password">FJALËKALIM</label>
                    <div className="input-container">
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={form.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        disabled={loading}
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

                  <div className="form-group">
                    <label htmlFor="confirmPassword">KONFIRMONI FJALËKALIMIN</label>
                    <div className="input-container">
                      <input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={form.confirmPassword}
                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                        disabled={loading}
                        required
                      />
                      <button
                        type="button"
                        className="toggle-password"
                        onClick={(e) => {
                          e.preventDefault()
                          setShowConfirmPassword(!showConfirmPassword)
                        }}
                        disabled={loading}
                        title={showConfirmPassword ? 'Fshih fjalëkalimin' : 'Shfaq fjalëkalimin'}
                      >
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div className="password-reqs">
                    <div className={`req ${passwordRules.minLength ? 'valid' : ''}`}>
                      <div className="req-icon">{passwordRules.minLength ? '✓' : '—'}</div>
                      <span>Të paktën 8 karaktere</span>
                    </div>
                    <div className={`req ${passwordRules.hasUppercase ? 'valid' : ''}`}>
                      <div className="req-icon">{passwordRules.hasUppercase ? '✓' : '—'}</div>
                      <span>Një shkronjë e madhe (A-Z)</span>
                    </div>
                    <div className={`req ${passwordRules.hasLowercase ? 'valid' : ''}`}>
                      <div className="req-icon">{passwordRules.hasLowercase ? '✓' : '—'}</div>
                      <span>Një shkronjë e vogël (a-z)</span>
                    </div>
                    <div className={`req ${passwordRules.hasNumber ? 'valid' : ''}`}>
                      <div className="req-icon">{passwordRules.hasNumber ? '✓' : '—'}</div>
                      <span>Një numër (0-9)</span>
                    </div>
                    <div className={`req ${passwordRules.hasSpecial ? 'valid' : ''}`}>
                      <div className="req-icon">{passwordRules.hasSpecial ? '✓' : '—'}</div>
                      <span>Karakter special (!@#$%^&*)</span>
                    </div>
                    <div className={`req ${passwordsMatch ? 'valid' : ''}`}>
                      <div className="req-icon">{passwordsMatch ? '✓' : '—'}</div>
                      <span>Fjalëkalimet përputhen</span>
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="photo">FOTOGRAFIA E DOKUMENTIT</label>
                    <div
                      className="photo-upload"
                      onClick={() => photoInputRef.current?.click()}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          photoInputRef.current?.click()
                        }
                      }}
                    >
                      {photoPreview ? (
                        <>
                          <img src={photoPreview} alt="Preview" className="photo-preview" />
                          <p className="photo-text">✓ Fotografia ngarkuar</p>
                          <p className="photo-hint">Klikoni për të ndryshuar</p>
                        </>
                      ) : (
                        <>
                          <p style={{ fontSize: '24px', marginBottom: '8px' }}>📷</p>
                          <p className="photo-text">Ngarkoni fotografi të dokumentit</p>
                          <p className="photo-hint">PNG, JPG, WEBP deri në 5MB</p>
                        </>
                      )}
                      <input
                        ref={photoInputRef}
                        id="photo"
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handlePhotoSelect}
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn-register"
                    disabled={!step2Complete || loading || !clerkReady}
                    title={
                      !clerkReady ? 'Clerk po ngarkohet...' :
                      !allPasswordRulesMet ? 'Fjalëkalimi nuk plotëson kërkesat' :
                      !passwordsMatch ? 'Fjalëkalimet nuk përputhen' :
                      !photoPreview ? 'Duhet të ngarkosh fotografinë' :
                      loading ? 'Duke u regjistruar...' :
                      'Përfundoni regjistrimin'
                    }
                  >
                    {loading ? (
                      <>
                        <span className="spinner" />
                        Duke u regjistruar...
                      </>
                    ) : (
                      '✓ Përfundoni regjistrimin'
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
                disabled={loading}
              >
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