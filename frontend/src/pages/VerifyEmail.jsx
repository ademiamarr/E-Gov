import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSignUp } from '@clerk/clerk-react'

const VerifyEmail = () => {
  const [code, setCode]       = useState('')
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone]       = useState(false)
  const { signUp, isLoaded }  = useSignUp()
  const navigate              = useNavigate()

  const handleVerify = async (e) => {
    e?.preventDefault()
    if (!isLoaded) { setError('Aplikacioni po ngarkohet, prit...'); return }
    if (code.length !== 6) { setError('Kodi duhet të ketë 6 shifra'); return }
    setLoading(true)
    setError('')
    try {
      const result = await signUp.attemptEmailAddressVerification({ code })
      if (result.status !== 'complete') {
        setError('Kodi nuk është i saktë ose ka skaduar')
        setLoading(false)
        return
      }
      const clerkUserId = result.createdUserId
      const pending = window.__pendingRegister
      if (!pending) {
        setError('Të dhënat e regjistrimit nuk u gjetën. Provoni të regjistroheni përsëri.')
        setLoading(false)
        return
      }
      const formData = new FormData()
      formData.append('clerk_id',    clerkUserId)
      formData.append('first_name',  pending.first_name)
      formData.append('last_name',   pending.last_name)
      formData.append('personal_id', pending.personal_id)
      formData.append('email',       pending.email)
      if (pending.id_photo) formData.append('id_photo', pending.id_photo)

      const res  = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
        method: 'POST', body: formData,
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.message || 'Gabim gjatë regjistrimit')
        setLoading(false)
        return
      }
      delete window.__pendingRegister
      setDone(true)
      setTimeout(() => navigate('/pending', { replace: true }), 1800)
    } catch (err) {
      setError(err.errors?.[0]?.message || err.message || 'Gabim gjatë verifikimit')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }
        body { font-family:'Plus Jakarta Sans',sans-serif; background:#f4f6fb; }

        .vf { min-height:100dvh; display:flex; flex-direction:column; background:#f4f6fb; }

        .vf-top {
          display:flex; align-items:center; gap:10px;
          padding:16px 20px; background:#fff; border-bottom:1px solid #eaecf0;
        }
        .vf-brand { display:flex; align-items:center; gap:8px; }
        .vf-brand-icon {
          width:32px; height:32px; background:#1e3a8a; border-radius:8px;
          display:flex; align-items:center; justify-content:center;
        }
        .vf-brand-name { font-size:14px; font-weight:800; color:#1e3a8a; letter-spacing:-0.02em; }

        .vf-body {
          flex:1; display:flex; flex-direction:column;
          align-items:center; justify-content:center;
          padding:32px 20px;
        }

        .vf-icon {
          width:72px; height:72px; border-radius:50%;
          display:flex; align-items:center; justify-content:center;
          font-size:32px; margin-bottom:20px;
        }
        .vf-icon.email { background:#eff6ff; border:2px solid #bfdbfe; }
        .vf-icon.success { background:#dcfce7; border:2px solid #86efac; }

        .vf-title {
          font-size:24px; font-weight:800; color:#0f1728;
          letter-spacing:-0.03em; text-align:center; margin-bottom:6px;
        }
        .vf-sub {
          font-size:13px; color:#6b7280; text-align:center;
          line-height:1.6; margin-bottom:28px; max-width:280px;
        }

        .vf-card {
          width:100%; max-width:380px;
          background:#fff; border-radius:20px; padding:24px 20px;
          box-shadow:0 4px 24px rgba(0,0,0,0.08);
        }

        .vf-error {
          display:flex; align-items:center; gap:8px;
          padding:11px 13px; background:#fef2f2; border:1.5px solid #fecaca;
          border-radius:10px; color:#dc2626; font-size:13px; font-weight:600;
          margin-bottom:16px;
        }
        .vf-ok {
          display:flex; align-items:center; gap:8px;
          padding:11px 13px; background:#f0fdf4; border:1.5px solid #bbf7d0;
          border-radius:10px; color:#15803d; font-size:13px; font-weight:600;
          margin-bottom:16px;
        }

        .vf-label {
          font-size:11px; font-weight:700; color:#1e3a8a;
          text-transform:uppercase; letter-spacing:0.04em;
          display:block; margin-bottom:8px;
        }

        .vf-input {
          width:100%; padding:16px;
          border:1.5px solid #e5e7eb; border-radius:12px;
          font-size:24px; font-family:'Courier New',monospace;
          letter-spacing:12px; text-align:center;
          color:#0f1728; background:#f7f9fc;
          outline:none; transition:border-color 0.15s, background 0.15s;
          margin-bottom:16px; -webkit-appearance:none;
        }
        .vf-input:focus { border-color:#1e3a8a; background:#fff; }
        .vf-input::placeholder { color:#d1d5db; letter-spacing:0; font-size:16px; }
        .vf-input:disabled { opacity:0.5; }

        .vf-btn {
          width:100%; padding:14px; border:none;
          background:#1e3a8a; color:#fff; border-radius:12px;
          font-size:15px; font-weight:700;
          font-family:'Plus Jakarta Sans',sans-serif;
          cursor:pointer; display:flex; align-items:center;
          justify-content:center; gap:8px;
          transition:transform 0.1s; -webkit-appearance:none;
        }
        .vf-btn:active { transform:scale(0.98); }
        .vf-btn:disabled { opacity:0.5; cursor:not-allowed; }

        .vf-spinner {
          width:16px; height:16px;
          border:2px solid rgba(255,255,255,0.3); border-top-color:#fff;
          border-radius:50%; animation:vfspin 0.6s linear infinite;
        }
        @keyframes vfspin { to { transform:rotate(360deg); } }

        .vf-hint {
          margin-top:14px; padding:11px 13px;
          background:#fffbeb; border:1.5px solid #fde68a;
          border-radius:10px; font-size:12px; color:#92400e;
          text-align:center; line-height:1.5; font-weight:500;
        }
      `}</style>

      <div className="vf">
        <div className="vf-top">
          <div className="vf-brand">
            <div className="vf-brand-icon">
              <svg viewBox="0 0 24 24" fill="none" width={16} height={16}>
                <path d="M3 22V10L12 3L21 10V22H15V16H9V22H3Z" fill="#fff"/>
              </svg>
            </div>
            <span className="vf-brand-name">eGov Portal</span>
          </div>
        </div>

        <div className="vf-body">
          <div className={`vf-icon ${done ? 'success' : 'email'}`}>
            {done ? '✅' : '📧'}
          </div>
          <h1 className="vf-title">{done ? 'Email i verifikuar!' : 'Verifiko emailin'}</h1>
          <p className="vf-sub">
            {done
              ? 'Regjistrimi u krye. Po të ridrejtojmë...'
              : 'Kemi dërguar kodin 6-shifror në emailin tuaj. Kontrolloni kutinë hyrëse.'}
          </p>

          <div className="vf-card">
            {error && (
              <div className="vf-error"><span>⚠</span><span>{error}</span></div>
            )}
            {done && (
              <div className="vf-ok"><span>✓</span><span>Regjistrimi u krye me sukses!</span></div>
            )}
            {!done && (
              <form onSubmit={handleVerify}>
                <label className="vf-label">Kodi i verifikimit</label>
                <input
                  type="text" className="vf-input"
                  value={code} placeholder="000000"
                  maxLength={6} inputMode="numeric"
                  onChange={e => setCode(e.target.value.replace(/\D/g,''))}
                  disabled={loading} autoFocus
                />
                <button
                  type="submit" className="vf-btn"
                  disabled={loading || code.length !== 6}
                >
                  {loading
                    ? <><div className="vf-spinner"/>Duke verifikuar...</>
                    : '✓ Verifiko emailin'
                  }
                </button>
                <div className="vf-hint">
                  💡 Nëse nuk keni marrë kodin, kontrolloni klasën spam.
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default VerifyEmail