import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSignUp } from '@clerk/clerk-react'
import { Building2, AlertCircle, Mail, Check } from 'lucide-react'
import API from '../api/axios'

const VerifyEmail = () => {
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [debugInfo, setDebugInfo] = useState('')
  const { signUp, isLoaded } = useSignUp()
  const navigate = useNavigate()

  const handleVerify = async (e) => {
    e?.preventDefault()
    
    if (!isLoaded) {
      setError('Aplikacioni po ngarkohet, prit...')
      return
    }

    if (code.length !== 6) {
      setError('Kodi duhet të ketë 6 shifra')
      return
    }

    setLoading(true)
    setError('')
    setDebugInfo('Verifikon kodin...')
    console.log('🔄 Verifying email code:', code)

    try {
      // ✅ Step 1: Verify Clerk email
      console.log('📧 Step 1: Verifying with Clerk...')
      const result = await signUp.attemptEmailAddressVerification({ code })
      console.log('✅ Clerk verification result:', result.status)

      if (result.status !== 'complete') {
        setError('Kodi nuk është i saktë ose ka skaduar')
        setDebugInfo(`Status: ${result.status}`)
        setLoading(false)
        return
      }

      const clerkUserId = result.createdUserId
      console.log('✅ Clerk user ID:', clerkUserId)
      setDebugInfo(`Clerk: ✓ User created: ${clerkUserId}`)

      // ✅ Step 2: Get pending registration data
      console.log('📝 Step 2: Getting pending registration data...')
      const pending = window.__pendingRegister

      if (!pending) {
        setError('Të dhënat e regjistrimit nuk u gjetën. Provoni të regjistrohet përsëri.')
        setDebugInfo('❌ No pending registration data')
        setLoading(false)
        return
      }

      console.log('✅ Pending data found:', {
        email: pending.email,
        first_name: pending.first_name,
        personal_id: pending.personal_id
      })
      setDebugInfo(`Clerk: ✓\nData: ✓ ${pending.first_name} ${pending.last_name}`)

      // ✅ Step 3: Register in backend
      console.log('📤 Step 3: Registering in backend...')
      
      const formData = new FormData()
      formData.append('clerk_id', clerkUserId)
      formData.append('first_name', pending.first_name)
      formData.append('last_name', pending.last_name)
      formData.append('personal_id', pending.personal_id)
      formData.append('email', pending.email)
      if (pending.id_photo) {
        formData.append('id_photo', pending.id_photo)
        console.log('📸 Photo attached:', pending.id_photo.name)
      }

      const apiUrl = `${import.meta.env.VITE_API_URL}/api/auth/register`
      console.log('🌐 API URL:', apiUrl)

      const res = await fetch(apiUrl, {
        method: 'POST',
        body: formData
      })

      console.log('📥 Backend response status:', res.status)
      const data = await res.json()
      console.log('📥 Backend response data:', data)

      if (!res.ok) {
        setError(data.message || 'Gabim në backend')
        setDebugInfo(`❌ Backend error: ${data.message}`)
        setLoading(false)
        return
      }

      console.log('✅ Backend registration successful')
      setDebugInfo(`Clerk: ✓\nData: ✓\nBackend: ✓`)

      // ✅ Clear pending data
      delete window.__pendingRegister
      console.log('🧹 Cleared pending registration data')

      // ✅ Redirect to pending page
      setTimeout(() => {
        console.log('➡️ Redirecting to /pending')
        navigate('/pending', { replace: true })
      }, 1500)

    } catch (err) {
      console.error('❌ Verification error:', err)
      setError(err.message || 'Gabim gjatë verifikimit')
      setDebugInfo(`❌ Error: ${err.message}`)
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

        .verify-page {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          padding: 20px;
        }

        .verify-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 40px;
          font-size: 13px;
          font-weight: 700;
          color: #0f172a;
        }

        .verify-logo-icon {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .verify-wrap {
          width: 100%;
          max-width: 480px;
        }

        .verify-icon-wrap {
          width: 64px;
          height: 64px;
          border-radius: 16px;
          background: linear-gradient(135deg, #2563eb15 0%, #1d4ed815 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 24px;
          border: 1px solid rgba(37, 99, 235, 0.2);
        }

        .verify-wrap h1 {
          font-size: 24px;
          font-weight: 700;
          color: #0f172a;
          text-align: center;
          margin-bottom: 8px;
          letter-spacing: -0.5px;
        }

        .verify-wrap > p {
          text-align: center;
          font-size: 13px;
          color: #6b7280;
          margin-bottom: 24px;
          line-height: 1.6;
        }

        .verify-card {
          background: #ffffff;
          border-radius: 16px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
          padding: 32px;
        }

        .verify-error {
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

        .verify-error svg {
          flex-shrink: 0;
        }

        .verify-debug {
          padding: 12px 14px;
          background: #f0f4ff;
          border: 1px solid #bfdbfe;
          border-radius: 8px;
          color: #1e40af;
          font-size: 11px;
          font-family: 'Courier New', monospace;
          margin-bottom: 16px;
          line-height: 1.6;
          white-space: pre-wrap;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 16px;
        }

        .form-label {
          font-size: 12px;
          font-weight: 600;
          color: #374151;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .verify-input {
          padding: 14px 16px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 18px;
          color: #0f172a;
          font-family: 'Courier New', monospace;
          letter-spacing: 8px;
          text-align: center;
          transition: all 0.2s;
          background: #fafbfc;
        }

        .verify-input:focus {
          outline: none;
          border-color: #2563eb;
          background: #ffffff;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }

        .verify-input::placeholder {
          color: #d1d5db;
          letter-spacing: 0;
        }

        .btn-primary {
          width: 100%;
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

        .btn-primary:hover:not(:disabled) {
          background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%);
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
        }

        .btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-spinner {
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

        .verify-info {
          margin-top: 20px;
          padding: 14px;
          background: #fef3c7;
          border: 1px solid #fbbf24;
          border-radius: 8px;
          font-size: 12px;
          color: #92400e;
          text-align: center;
        }

        @media (max-width: 480px) {
          .verify-card {
            padding: 24px;
          }

          .verify-wrap h1 {
            font-size: 20px;
          }

          .verify-input {
            font-size: 16px;
          }
        }
      `}</style>

      <div className="verify-page">
        <div className="verify-logo">
          <div className="verify-logo-icon"><Building2 size={18} color="#fff" /></div>
          <span>eGov Portal</span>
        </div>

        <div className="verify-wrap">
          <div className="verify-icon-wrap">
            <Mail size={28} color="#2563eb" />
          </div>

          <h1>Verifiko emailin</h1>
          <p>Kemi dërguar kodin 6-shifror në emailin tuaj. Vendoseni më poshtë për të përfunduar regjistrimin.</p>

          <div className="verify-card">
            {error && (
              <div className="verify-error">
                <AlertCircle size={14} />
                <span>{error}</span>
              </div>
            )}

            {debugInfo && (
              <div className="verify-debug">{debugInfo}</div>
            )}

            <form onSubmit={handleVerify}>
              <div className="form-group">
                <label className="form-label">Kodi i verifikimit</label>
                <input
                  type="text"
                  className="verify-input"
                  value={code}
                  placeholder="000000"
                  maxLength={6}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  disabled={loading}
                  autoFocus
                />
              </div>

              <button
                type="submit"
                className="btn-primary"
                disabled={loading || code.length !== 6}
              >
                {loading ? (
                  <>
                    <div className="btn-spinner" />
                    Duke verifikuar...
                  </>
                ) : (
                  <>
                    <Check size={16} />
                    Verifiko emailin
                  </>
                )}
              </button>
            </form>

            <div className="verify-info">
              💡 Nëse nuk keni marrë kodin, kontrolloni klasën e spam-it ose kërkoni të përsëndatat.
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default VerifyEmail