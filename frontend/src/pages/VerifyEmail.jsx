import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSignUp } from '@clerk/clerk-react'
import { Building2, AlertCircle, Mail } from 'lucide-react'
import API from '../api/axios'

const VerifyEmail = () => {
  const [code, setCode]     = useState('')
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)
  const { signUp, isLoaded } = useSignUp()
  const navigate = useNavigate()

  const handleVerify = async () => {
    if (!isLoaded || code.length !== 6) return
    setLoading(true)
    setError('')

    try {
      const result = await signUp.attemptEmailAddressVerification({ code })

      if (result.status === 'complete') {
        const pending = window.__pendingRegister

        if (pending?.personal_id) {
          const formData = new FormData()
          formData.append('clerk_id',    result.createdUserId)
          formData.append('first_name',  pending.first_name)
          formData.append('last_name',   pending.last_name)
          formData.append('personal_id', pending.personal_id)
          formData.append('email',       pending.email)
          if (pending.id_photo) {
            formData.append('id_photo', pending.id_photo)
          }

          const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
            method: 'POST',
            body: formData
          })

          const data = await res.json()
          if (!res.ok) { setError(data.message); setLoading(false); return }

          delete window.__pendingRegister
        }

        navigate('/pending')
      }
    } catch (err) {
      setError(err.errors?.[0]?.message || 'Kodi është i gabuar!')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="verify-page">
      <div className="verify-logo">
        <div className="verify-logo-icon"><Building2 size={18} color="#fff" /></div>
        <span>eGov Portal</span>
      </div>

      <div className="verify-wrap">
        <div className="verify-icon-wrap">
          <Mail size={28} color="#3b82f6" />
        </div>
        <h1>Verifiko emailin</h1>
        <p>Kemi dërguar kodin 6-shifror në emailin tuaj. Vendoseni më poshtë.</p>

        <div className="verify-card">
          {error && (
            <div className="verify-error">
              <AlertCircle size={14} /> {error}
            </div>
          )}

          <div className="form-group">
            <label>KODI I VERIFIKIMIT</label>
            <input className="verify-input" type="text" value={code}
              placeholder="000000" maxLength={6}
              onChange={e => setCode(e.target.value.replace(/\D/g,''))} />
          </div>

          <button className="btn-primary" onClick={handleVerify}
            disabled={loading || code.length !== 6}>
            {loading
              ? <><span className="btn-spinner" /> Duke verifikuar...</>
              : 'Verifiko emailin ✓'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default VerifyEmail