import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSignUp } from '@clerk/clerk-react'
import { Building2, AlertCircle, Mail, Check } from 'lucide-react'

const VerifyEmail = () => {
  const [code, setCode]       = useState('')
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone]       = useState(false)
  const { signUp, isLoaded }  = useSignUp()
  const navigate              = useNavigate()

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

    try {
      // Step 1: Verifiko me Clerk
      const result = await signUp.attemptEmailAddressVerification({ code })

      if (result.status !== 'complete') {
        setError('Kodi nuk është i saktë ose ka skaduar')
        setLoading(false)
        return
      }

      const clerkUserId = result.createdUserId

      // Step 2: Merr të dhënat e regjistrimit
      const pending = window.__pendingRegister

      if (!pending) {
        setError('Të dhënat e regjistrimit nuk u gjetën. Provoni të regjistroheni përsëri.')
        setLoading(false)
        return
      }

      // Step 3: Regjistro në backend
      const formData = new FormData()
      formData.append('clerk_id',    clerkUserId)
      formData.append('first_name',  pending.first_name)
      formData.append('last_name',   pending.last_name)
      formData.append('personal_id', pending.personal_id)
      formData.append('email',       pending.email)
      if (pending.id_photo) {
        formData.append('id_photo', pending.id_photo)
      }

      const res  = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
        method: 'POST',
        body:   formData,
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.message || 'Gabim gjatë regjistrimit')
        setLoading(false)
        return
      }

      // Step 4: Pastro dhe redirect
      delete window.__pendingRegister
      setDone(true)

      setTimeout(() => navigate('/pending', { replace: true }), 1500)

    } catch (err) {
      setError(err.errors?.[0]?.message || err.message || 'Gabim gjatë verifikimit')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        *, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }

        body {
          font-family: 'DM Sans', sans-serif;
          background: #f8fafc;
          min-height: 100vh;
        }

        .vf-page {
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          min-height: 100vh; padding: 20px;
          font-family: 'DM Sans', sans-serif;
        }

        .vf-logo {
          display: flex; align-items: center; gap: 10px;
          margin-bottom: 40px;
          font-size: 13px; font-weight: 700; color: #0f172a;
        }

        .vf-logo-icon {
          width: 36px; height: 36px; border-radius: 10px;
          background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
          display: flex; align-items: center; justify-content: center;
        }

        .vf-wrap { width: 100%; max-width: 420px; }

        .vf-icon-wrap {
          width: 64px; height: 64px; border-radius: 16px;
          background: #eff6ff; border: 1px solid #bfdbfe;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 24px;
        }

        .vf-icon-wrap.done { background: #f0fdf4; border-color: #bbf7d0; }

        .vf-wrap h1 {
          font-size: 22px; font-weight: 700; color: #0f172a;
          text-align: center; margin-bottom: 8px; letter-spacing: -0.5px;
        }

        .vf-wrap > p {
          text-align: center; font-size: 13px; color: #6b7280;
          margin-bottom: 28px; line-height: 1.6;
        }

        .vf-card {
          background: #fff;
          border-radius: 14px;
          box-shadow: 0 4px 24px rgba(0,0,0,0.06);
          border: 1px solid #e5e7eb;
          padding: 28px;
        }

        .vf-error {
          display: flex; align-items: center; gap: 8px;
          padding: 11px 13px;
          background: #fef2f2; border: 1px solid #fecaca;
          border-radius: 8px; color: #dc2626; font-size: 13px;
          margin-bottom: 16px;
        }

        .vf-success {
          display: flex; align-items: center; gap: 8px;
          padding: 11px 13px;
          background: #f0fdf4; border: 1px solid #bbf7d0;
          border-radius: 8px; color: #15803d; font-size: 13px;
          margin-bottom: 16px;
        }

        .vf-label {
          font-size: 11px; font-weight: 600; color: #374151;
          text-transform: uppercase; letter-spacing: 0.05em;
          display: block; margin-bottom: 8px;
        }

        .vf-input {
          width: 100%; padding: 14px 16px;
          border: 1.5px solid #e5e7eb; border-radius: 8px;
          font-size: 20px; font-family: 'Courier New', monospace;
          letter-spacing: 10px; text-align: center;
          color: #0f172a; background: #f9fafb;
          outline: none; transition: all 0.15s;
          margin-bottom: 16px;
        }

        .vf-input:focus {
          border-color: #2563eb; background: #fff;
          box-shadow: 0 0 0 3px rgba(37,99,235,0.1);
        }

        .vf-input::placeholder { color: #d1d5db; letter-spacing: 0; }
        .vf-input:disabled { opacity: 0.5; }

        .vf-btn {
          width: 100%; padding: 12px;
          background: #0c1220; border: none;
          color: #fff; border-radius: 8px;
          font-size: 14px; font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer; display: flex;
          align-items: center; justify-content: center; gap: 8px;
          transition: background 0.15s;
        }

        .vf-btn:hover:not(:disabled) { background: #1a2540; }
        .vf-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .vf-spinner {
          width: 14px; height: 14px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff; border-radius: 50%;
          animation: vf-spin 0.6s linear infinite;
        }
        @keyframes vf-spin { to { transform: rotate(360deg); } }

        .vf-hint {
          margin-top: 16px; padding: 12px 14px;
          background: #fffbeb; border: 1px solid #fde68a;
          border-radius: 8px; font-size: 12px; color: #92400e;
          text-align: center; line-height: 1.5;
        }
      `}</style>

      <div className="vf-page">
        <div className="vf-logo">
          <div className="vf-logo-icon">
            <Building2 size={18} color="#fff" />
          </div>
          <span>eGov Portal</span>
        </div>

        <div className="vf-wrap">
          <div className={`vf-icon-wrap ${done ? 'done' : ''}`}>
            {done
              ? <Check size={28} color="#16a34a" />
              : <Mail  size={28} color="#2563eb" />
            }
          </div>

          <h1>{done ? 'Email i verifikuar!' : 'Verifiko emailin'}</h1>
          <p>
            {done
              ? 'Regjistrimi u krye. Po të ridrejtojmë...'
              : 'Kemi dërguar kodin 6-shifror në emailin tuaj.'
            }
          </p>

          <div className="vf-card">
            {error && (
              <div className="vf-error">
                <AlertCircle size={14} />
                <span>{error}</span>
              </div>
            )}

            {done && (
              <div className="vf-success">
                <Check size={14} />
                <span>Regjistrimi u krye me sukses!</span>
              </div>
            )}

            {!done && (
              <form onSubmit={handleVerify}>
                <label className="vf-label">Kodi i verifikimit</label>
                <input
                  type="text"
                  className="vf-input"
                  value={code}
                  placeholder="000000"
                  maxLength={6}
                  onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
                  disabled={loading}
                  autoFocus
                />
                <button
                  type="submit"
                  className="vf-btn"
                  disabled={loading || code.length !== 6}
                >
                  {loading
                    ? <><div className="vf-spinner" /> Duke verifikuar...</>
                    : <><Check size={15} /> Verifiko emailin</>
                  }
                </button>
              </form>
            )}

            {!done && (
              <div className="vf-hint">
                💡 Nëse nuk keni marrë kodin, kontrolloni klasën spam.
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default VerifyEmail