import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSignUp } from '@clerk/clerk-react'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from '../components/LanguageSwitcher'
import { AlertCircle, Eye, EyeOff, Upload, Lock, ArrowRight, ArrowLeft, Check } from 'lucide-react'

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

  const nextStep = () => {
    setError('')
    if (!form.first_name || !form.last_name || !form.personal_id || !form.email) return setError(t('fill_required'))
    if (!validateEMBG(form.personal_id)) return setError('EMBG i pavlefshëm. Kontrolloni shifrat.')
    setStep(2)
  }

  const handlePhoto = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { setError('Fotoja duhet të jetë më e vogël se 5MB'); return }
    setPhoto(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.password || !form.confirm_password) return setError(t('fill_required'))
    if (form.password.length < 8) return setError('Fjalëkalimi duhet të ketë min. 8 karaktere')
    if (form.password !== form.confirm_password) return setError(t('passwords_no_match'))
    if (!isLoaded) return
    setLoading(true)
    try {
      const su = await signUp.create({ emailAddress: form.email, password: form.password, firstName: form.first_name, lastName: form.last_name })
      window.__pendingRegister = { clerk_id: su.createdUserId, first_name: form.first_name, last_name: form.last_name, personal_id: form.personal_id, email: form.email, id_photo: photo }
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })
      navigate('/verify-email')
    } catch (err) {
      setError(err.errors?.[0]?.message || 'Gabim gjatë regjistrimit')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display&display=swap');
        *, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }

        .reg-root {
          min-height: 100vh;
          display: grid;
          grid-template-columns: 1fr 1fr;
          font-family: 'DM Sans', sans-serif;
          background: #fff;
        }

        /* Left */
        .reg-left {
          background: #0c1220;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 48px 56px;
          position: relative;
          overflow: hidden;
        }

        .reg-left::before {
          content: '';
          position: absolute;
          inset: 0;
          background: repeating-linear-gradient(0deg, transparent, transparent 79px, rgba(255,255,255,.025) 79px, rgba(255,255,255,.025) 80px),
            repeating-linear-gradient(90deg, transparent, transparent 79px, rgba(255,255,255,.025) 79px, rgba(255,255,255,.025) 80px);
          pointer-events: none;
        }

        .reg-left-brand {
          position: relative; z-index: 2;
          display: flex; align-items: center; gap: 12px;
        }

        .reg-left-logo {
          width: 36px; height: 36px;
          background: #fff; border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
        }
        .reg-left-logo svg { width: 20px; height: 20px; }

        .reg-left-name { font-size: 15px; font-weight: 600; color: #fff; letter-spacing: -0.01em; }

        .reg-left-mid { position: relative; z-index: 2; }

        .reg-step-display {
          margin-bottom: 40px;
        }

        .reg-step-label {
          font-size: 11px;
          font-weight: 600;
          color: rgba(255,255,255,0.3);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-bottom: 20px;
        }

        .reg-step-list { display: flex; flex-direction: column; gap: 16px; }

        .reg-step-item {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .reg-step-circle {
          width: 28px; height: 28px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; font-weight: 700;
          flex-shrink: 0;
          transition: all 0.2s;
        }

        .reg-step-circle.done { background: rgba(255,255,255,0.9); color: #0c1220; }
        .reg-step-circle.active { background: #fff; color: #0c1220; box-shadow: 0 0 0 4px rgba(255,255,255,0.15); }
        .reg-step-circle.pending { background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.3); border: 1px solid rgba(255,255,255,0.1); }

        .reg-step-text { font-size: 13px; font-weight: 500; }
        .reg-step-text.active { color: #fff; }
        .reg-step-text.done { color: rgba(255,255,255,0.5); }
        .reg-step-text.pending { color: rgba(255,255,255,0.25); }

        .reg-left-title {
          font-family: 'DM Serif Display', serif;
          font-size: 2.2rem;
          color: #fff;
          line-height: 1.2;
          letter-spacing: -0.02em;
        }

        .reg-left-title em { color: rgba(255,255,255,0.35); font-style: italic; }

        .reg-left-bottom {
          position: relative; z-index: 2;
          font-size: 12px; color: rgba(255,255,255,0.2);
          line-height: 1.6;
          padding-top: 24px;
          border-top: 1px solid rgba(255,255,255,0.06);
        }

        /* Right */
        .reg-right {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 48px 72px;
          background: #fff;
          overflow-y: auto;
        }

        .reg-right-inner {
          width: 100%; max-width: 400px;
        }

        .reg-right-top {
          display: flex; justify-content: space-between; align-items: center;
          margin-bottom: 40px;
        }

        .reg-right-back {
          display: flex; align-items: center; gap: 4px;
          font-size: 13px; color: #8a929e; font-weight: 500;
          background: none; border: none; cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          padding: 0;
        }
        .reg-right-back:hover { color: #0c1220; }

        .reg-heading { font-size: 22px; font-weight: 700; color: #0c1220; letter-spacing: -0.02em; margin-bottom: 4px; }
        .reg-subheading { font-size: 13px; color: #8a929e; margin-bottom: 28px; }

        .reg-error {
          display: flex; align-items: center; gap: 8px;
          padding: 11px 13px;
          background: #fef2f2;
          border: 1px solid #fde8e8;
          border-radius: 8px;
          color: #c0392b;
          font-size: 13px;
          margin-bottom: 18px;
        }

        .reg-form { display: flex; flex-direction: column; gap: 14px; }

        .reg-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

        .rg-group { display: flex; flex-direction: column; gap: 5px; }

        .rg-label {
          font-size: 11px; font-weight: 600; color: #374151;
          letter-spacing: 0.02em; text-transform: uppercase;
        }

        .rg-input {
          width: 100%;
          padding: 10px 12px;
          font-size: 14px;
          font-family: 'DM Sans', sans-serif;
          color: #0c1220;
          background: #f7f8fa;
          border: 1.5px solid #e8eaee;
          border-radius: 8px;
          outline: none;
          transition: border-color 0.15s, background 0.15s;
        }
        .rg-input::placeholder { color: #b0b8c4; }
        .rg-input:focus { background: #fff; border-color: #0c1220; }

        .rg-input-wrap { position: relative; }
        .rg-input-icon {
          position: absolute; left: 12px; top: 50%;
          transform: translateY(-50%); color: #b0b8c4; pointer-events: none;
        }
        .rg-input.has-icon { padding-left: 36px; }
        .rg-eye {
          position: absolute; right: 12px; top: 50%;
          transform: translateY(-50%);
          background: none; border: none; color: #b0b8c4; cursor: pointer; padding: 2px;
          display: flex; align-items: center;
        }
        .rg-eye:hover { color: #6b7280; }

        /* Photo upload */
        .rg-photo-label {
          display: block;
          border: 1.5px dashed #d1d5db;
          border-radius: 8px;
          cursor: pointer;
          overflow: hidden;
          transition: border-color 0.15s;
          background: #f7f8fa;
        }
        .rg-photo-label:hover { border-color: #9ca3af; background: #f0f2f5; }

        .rg-photo-placeholder {
          padding: 24px;
          display: flex; flex-direction: column; align-items: center; gap: 8px;
          color: #9ca3af;
        }
        .rg-photo-text { font-size: 13px; font-weight: 500; color: #6b7280; }
        .rg-photo-subtext { font-size: 11px; color: #b0b8c4; }

        .rg-photo-preview {
          width: 100%; height: 120px; object-fit: cover; display: block;
        }

        /* Submit */
        .rg-submit {
          width: 100%;
          padding: 12px 16px;
          background: #0c1220;
          color: #fff;
          border: none; border-radius: 8px;
          font-size: 14px; font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          letter-spacing: -0.01em;
          transition: background 0.15s;
          margin-top: 4px;
        }
        .rg-submit:hover:not(:disabled) { background: #1a2540; }
        .rg-submit:disabled { opacity: 0.5; cursor: not-allowed; }
        .rg-submit.secondary {
          background: #f7f8fa;
          color: #374151;
          border: 1.5px solid #e8eaee;
        }
        .rg-submit.secondary:hover:not(:disabled) { background: #eef0f4; }

        .rg-spinner {
          width: 14px; height: 14px;
          border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff;
          border-radius: 50%;
          animation: rg-spin 0.6s linear infinite;
        }
        @keyframes rg-spin { to { transform: rotate(360deg); } }

        .rg-footer { margin-top: 22px; text-align: center; font-size: 13px; color: #8a929e; }
        .rg-footer a { color: #0c1220; font-weight: 600; text-decoration: none; }
        .rg-footer a:hover { text-decoration: underline; }

        @media (max-width: 900px) {
          .reg-root { grid-template-columns: 1fr; }
          .reg-left { display: none; }
          .reg-right { padding: 40px 24px; }
        }
        @media (max-width: 480px) {
          .reg-row { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="reg-root">
        {/* Left */}
        <div className="reg-left">
          <div className="reg-left-brand">
            <div className="reg-left-logo">
              <svg viewBox="0 0 24 24" fill="none"><path d="M3 22V10L12 3L21 10V22H15V16H9V22H3Z" fill="#0c1220"/></svg>
            </div>
            <span className="reg-left-name">eGov Portal</span>
          </div>

          <div className="reg-left-mid">
            <div className="reg-step-display">
              <div className="reg-step-label">Hapat e regjistrimit</div>
              <div className="reg-step-list">
                {[
                  { n: 1, label: 'Të dhënat personale' },
                  { n: 2, label: 'Siguria dhe dokumenti' },
                  { n: 3, label: 'Verifikimi i emailit' },
                ].map(({ n, label }) => (
                  <div key={n} className="reg-step-item">
                    <div className={`reg-step-circle ${step > n ? 'done' : step === n ? 'active' : 'pending'}`}>
                      {step > n ? <Check size={12} /> : n}
                    </div>
                    <span className={`reg-step-text ${step > n ? 'done' : step === n ? 'active' : 'pending'}`}>
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <h2 className="reg-left-title">
              Krijoni<br/>
              llogarinë<br/>
              <em>tuaj.</em>
            </h2>
          </div>

          <div className="reg-left-bottom">
            Duke u regjistruar, pranoni kushtet e shërbimit dhe politikën e privatësisë së eGov Portal — Republika e Maqedonisë së Veriut.
          </div>
        </div>

        {/* Right */}
        <div className="reg-right">
          <div className="reg-right-inner">
            <div className="reg-right-top">
              {step === 2 ? (
                <button className="reg-right-back" onClick={() => setStep(1)}>
                  <ArrowLeft size={14} /> Kthehu
                </button>
              ) : <div />}
              <LanguageSwitcher />
            </div>

            <h1 className="reg-heading">
              {step === 1 ? 'Të dhënat personale' : 'Fjalëkalim & Dokument'}
            </h1>
            <p className="reg-subheading">
              {step === 1 ? 'Hapi 1 nga 2 — Informacioni bazë' : 'Hapi 2 nga 2 — Siguria e llogarisë'}
            </p>

            {error && (
              <div className="reg-error">
                <AlertCircle size={14} />
                <span>{error}</span>
              </div>
            )}

            {/* STEP 1 */}
            {step === 1 && (
              <form className="reg-form" onSubmit={e => { e.preventDefault(); nextStep() }}>
                <div className="reg-row">
                  <div className="rg-group">
                    <label className="rg-label">Emri</label>
                    <input className="rg-input" type="text" placeholder="Emri" value={form.first_name} onChange={e => setForm({...form, first_name: e.target.value})} required />
                  </div>
                  <div className="rg-group">
                    <label className="rg-label">Mbiemri</label>
                    <input className="rg-input" type="text" placeholder="Mbiemri" value={form.last_name} onChange={e => setForm({...form, last_name: e.target.value})} required />
                  </div>
                </div>
                <div className="rg-group">
                  <label className="rg-label">EMBG — Numri Personal</label>
                  <input className="rg-input" type="text" placeholder="1234567890123" maxLength={13} value={form.personal_id} onChange={e => setForm({...form, personal_id: e.target.value.replace(/\D/g,'')})} required />
                </div>
                <div className="rg-group">
                  <label className="rg-label">Email</label>
                  <input className="rg-input" type="email" placeholder="email@shembull.mk" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
                </div>
                <button type="submit" className="rg-submit">
                  Vazhdo <ArrowRight size={15} />
                </button>
              </form>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <form className="reg-form" onSubmit={handleSubmit}>
                <div className="rg-group">
                  <label className="rg-label">Fjalëkalim</label>
                  <div className="rg-input-wrap">
                    <input
                      type={showPass ? 'text' : 'password'}
                      className="rg-input"
                      placeholder="Min. 8 karaktere"
                      value={form.password}
                      onChange={e => setForm({...form, password: e.target.value})}
                      style={{ paddingRight: '38px' }}
                      required
                    />
                    <button type="button" className="rg-eye" onClick={() => setShowPass(!showPass)}>
                      {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
                <div className="rg-group">
                  <label className="rg-label">Konfirmo fjalëkalimin</label>
                  <div className="rg-input-wrap">
                    <input
                      type={showPass2 ? 'text' : 'password'}
                      className="rg-input"
                      placeholder="Përsërit fjalëkalimin"
                      value={form.confirm_password}
                      onChange={e => setForm({...form, confirm_password: e.target.value})}
                      style={{ paddingRight: '38px' }}
                      required
                    />
                    <button type="button" className="rg-eye" onClick={() => setShowPass2(!showPass2)}>
                      {showPass2 ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
                <div className="rg-group">
                  <label className="rg-label">Foto e dokumentit të identitetit</label>
                  <label className="rg-photo-label">
                    {photoPreview ? (
                      <img src={photoPreview} className="rg-photo-preview" alt="preview" />
                    ) : (
                      <div className="rg-photo-placeholder">
                        <Upload size={20} />
                        <span className="rg-photo-text">Ngarko foton e ID-së</span>
                        <span className="rg-photo-subtext">JPG, PNG — max 5MB</span>
                      </div>
                    )}
                    <input type="file" accept="image/*" onChange={handlePhoto} hidden />
                  </label>
                </div>
                <button type="submit" className="rg-submit" disabled={loading}>
                  {loading ? <><div className="rg-spinner" /> Duke procesuar...</> : <>Dërgo kërkesën <ArrowRight size={15} /></>}
                </button>
              </form>
            )}

            <p className="rg-footer">
              Keni llogari? <Link to="/login">Kyçuni</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

export default Register