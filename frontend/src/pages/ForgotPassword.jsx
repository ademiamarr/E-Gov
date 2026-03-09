import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Eye, EyeOff, AlertCircle, Check } from 'lucide-react'
import API from '../api/axios'
import LanguageSwitcher from '../components/LanguageSwitcher'

const ResetPassword = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { t } = useTranslation()

  const email = searchParams.get('email') || ''
  const code = searchParams.get('code') || ''

  const [form, setForm] = useState({
    email: email,
    code: code,
    newPassword: '',
    confirmPassword: '',
  })

  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const passwordReqs = {
    length: form.newPassword.length >= 8,
    uppercase: /[A-Z]/.test(form.newPassword),
    number: /[0-9]/.test(form.newPassword),
    special: /[!@#$%^&*]/.test(form.newPassword),
    match: form.newPassword && form.confirmPassword && form.newPassword === form.confirmPassword,
  }

  const allValid = passwordReqs.length && passwordReqs.uppercase && passwordReqs.number && passwordReqs.special && passwordReqs.match

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!form.email || !form.code) {
      setError('Email dhe kodi janë të detyrueshëm')
      return
    }

    if (!allValid) {
      setError('Plotësoni të gjitha kërkesat e fjalëkalimit')
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await API.post('/auth/reset-password', {
        email: form.email,
        code: form.code,
        newPassword: form.newPassword,
      })

      if (res.data?.success) {
        setSuccess(true)
        setTimeout(() => navigate('/login'), 2000)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Gabim në rivendosjen e fjalëkalimit')
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

        body {
          font-family: 'Inter', sans-serif;
          background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .rp-container {
          width: 100%;
          max-width: 440px;
        }

        .rp-header {
          position: absolute;
          top: 24px;
          right: 24px;
          z-index: 10;
        }

        .rp-card {
          background: #ffffff;
          border-radius: 16px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          padding: 40px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .rp-icon {
          width: 64px;
          height: 64px;
          background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 32px;
          margin: 0 auto 24px;
        }

        .rp-title {
          font-size: 28px;
          font-weight: 700;
          color: #0f172a;
          text-align: center;
          margin-bottom: 8px;
          letter-spacing: -0.5px;
        }

        .rp-subtitle {
          font-size: 13px;
          color: #6b7280;
          text-align: center;
          margin-bottom: 28px;
          line-height: 1.6;
        }

        .rp-error {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 14px;
          background: #fef2f2;
          border: 1.5px solid #fecaca;
          border-radius: 8px;
          color: #dc2626;
          font-size: 13px;
          margin-bottom: 16px;
        }

        .rp-success {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 14px;
          background: #f0fdf4;
          border: 1.5px solid #bbf7d0;
          border-radius: 8px;
          color: #15803d;
          font-size: 13px;
          margin-bottom: 16px;
        }

        .rp-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        label {
          font-size: 12px;
          font-weight: 600;
          color: #0f172a;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .input-container {
          position: relative;
        }

        input[type="email"],
        input[type="text"],
        input[type="password"] {
          padding: 12px 40px 12px 14px;
          border: 1.5px solid #e5e7eb;
          border-radius: 8px;
          font-size: 14px;
          font-family: 'Inter', sans-serif;
          color: #0f172a;
          background: #f9fafb;
          outline: none;
          transition: border-color 0.2s ease, background 0.2s ease;
          width: 100%;
        }

        input[type="email"]:focus,
        input[type="text"]:focus,
        input[type="password"]:focus {
          border-color: #1e3a8a;
          background: #ffffff;
          box-shadow: 0 0 0 3px rgba(30, 58, 138, 0.08);
        }

        input::placeholder {
          color: #d1d5db;
        }

        input:disabled {
          opacity: 0.6;
        }

        .toggle-password {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #6b7280;
          cursor: pointer;
          padding: 4px 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 0.2s ease;
        }

        .toggle-password:hover {
          color: #1e3a8a;
        }

        .password-reqs {
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
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
          color: #6b7280;
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
          background: #e5e7eb;
          color: #9ca3af;
          font-size: 10px;
          font-weight: 600;
          flex-shrink: 0;
        }

        .req.valid .req-icon {
          background: #dcfce7;
          color: #22c55e;
        }

        .btn-reset {
          padding: 13px 24px;
          background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%);
          color: white;
          border: none;
          border-radius: 8px;
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
          font-family: 'Inter', sans-serif;
        }

        .btn-reset:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(30, 58, 138, 0.3);
        }

        .btn-reset:disabled {
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
          to {
            transform: rotate(360deg);
          }
        }

        .rp-footer {
          margin-top: 24px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          text-align: center;
          font-size: 13px;
          color: #6b7280;
        }

        .rp-footer a {
          color: #1e3a8a;
          text-decoration: none;
          font-weight: 600;
          transition: color 0.2s ease;
        }

        .rp-footer a:hover {
          color: #0f172a;
        }

        @media (max-width: 640px) {
          .rp-header {
            position: relative;
            top: 0;
            right: 0;
            margin-bottom: 24px;
          }

          .rp-card {
            padding: 28px 20px;
          }

          .rp-title {
            font-size: 24px;
          }

          .rp-subtitle {
            font-size: 12px;
          }

          input[type="email"],
          input[type="text"],
          input[type="password"] {
            padding: 13px 40px 13px 14px;
            font-size: 15px;
          }

          .btn-reset {
            padding: 12px 18px;
            font-size: 13px;
          }
        }
      `}</style>

      <div className="rp-header">
        <LanguageSwitcher />
      </div>

      <div className="rp-container">
        <div className="rp-card">
          <div className="rp-icon">🔐</div>
          <h1 className="rp-title">{t('password_reset') || 'Rivendosja e Fjalëkalimit'}</h1>
          <p className="rp-subtitle">
            {t('reset_subtitle') || 'Vendosni kodin nga emaili dhe zgjidhnini fjalëkalimin e ri'}
          </p>

          {error && (
            <div className="rp-error">
              <AlertCircle size={14} />
              {error}
            </div>
          )}

          {success && (
            <div className="rp-success">
              <Check size={14} />
              Fjalëkalimi u rivendos! Po jua ridrejtojmë në login...
            </div>
          )}

          <form className="rp-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                placeholder="juaji@shembull.mk"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                disabled={!!email}
              />
            </div>

            <div className="form-group">
              <label htmlFor="code">Kodi i Verifikimit</label>
              <input
                id="code"
                type="text"
                placeholder="Kodi 6-shifror nga emaili"
                value={form.code}
                maxLength="6"
                onChange={(e) => setForm({ ...form, code: e.target.value.replace(/\D/g, '') })}
                required
                disabled={!!code}
              />
            </div>

            <div className="form-group">
              <label htmlFor="newPassword">Fjalëkalimi i Ri</label>
              <div className="input-container">
                <input
                  id="newPassword"
                  type={showNew ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.newPassword}
                  onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                  required
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowNew(!showNew)}
                  title={showNew ? 'Fshih' : 'Shfaq'}
                >
                  {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Konfirmoni Fjalëkalimin</label>
              <div className="input-container">
                <input
                  id="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  required
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowConfirm(!showConfirm)}
                  title={showConfirm ? 'Fshih' : 'Shfaq'}
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="password-reqs">
              <div className={`req ${passwordReqs.length ? 'valid' : ''}`}>
                <div className="req-icon">{passwordReqs.length ? '✓' : '—'}</div>
                <span>Të paktën 8 karaktere</span>
              </div>
              <div className={`req ${passwordReqs.uppercase ? 'valid' : ''}`}>
                <div className="req-icon">{passwordReqs.uppercase ? '✓' : '—'}</div>
                <span>Një shkronjë e madhe</span>
              </div>
              <div className={`req ${passwordReqs.number ? 'valid' : ''}`}>
                <div className="req-icon">{passwordReqs.number ? '✓' : '—'}</div>
                <span>Një numër</span>
              </div>
              <div className={`req ${passwordReqs.special ? 'valid' : ''}`}>
                <div className="req-icon">{passwordReqs.special ? '✓' : '—'}</div>
                <span>Karakter special: !@#$%^&*</span>
              </div>
              <div className={`req ${passwordReqs.match ? 'valid' : ''}`}>
                <div className="req-icon">{passwordReqs.match ? '✓' : '—'}</div>
                <span>Fjalëkalimet përputhen</span>
              </div>
            </div>

            <button
              type="submit"
              className="btn-reset"
              disabled={loading || !allValid || !form.code}
            >
              {loading ? (
                <>
                  <span className="spinner" />
                  Duke rivendosur...
                </>
              ) : (
                '🔑 Rivendos Fjalëkalimin'
              )}
            </button>
          </form>

          <div className="rp-footer">
            Kujtohut fjalëkalimin? <Link to="/login">Kyçuni këtu</Link>
          </div>
        </div>
      </div>
    </>
  )
}

export default ResetPassword