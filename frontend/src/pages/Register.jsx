import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSignUp } from '@clerk/clerk-react'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from '../components/LanguageSwitcher'

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
    if (!form.first_name || !form.last_name || !form.personal_id || !form.email)
      return setError(t('fill_required') || 'Plotëso të gjitha fushat')
    if (!validateEMBG(form.personal_id))
      return setError('EMBG i pavlefshëm. Kontrolloni shifrat.')
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
    if (!form.password || !form.confirm_password) return setError('Plotëso të gjitha fushat')
    if (form.password.length < 8) return setError('Fjalëkalimi duhet të ketë min. 8 karaktere')
    if (form.password !== form.confirm_password) return setError('Fjalëkalimet nuk përputhen')
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
      setError(err.errors?.[0]?.message || 'Gabim gjatë regjistrimit')
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

        .rg { min-height:100dvh; display:flex; flex-direction:column; background:#f4f6fb; }

        .rg-top {
          display:flex; align-items:center; justify-content:space-between;
          padding:16px 20px; background:#fff; border-bottom:1px solid #eaecf0;
          position:sticky; top:0; z-index:50;
        }
        .rg-top-left { display:flex; align-items:center; gap:10px; }
        .rg-back {
          width:34px; height:34px; border-radius:9px; border:1.5px solid #eaecf0;
          background:none; cursor:pointer; font-size:16px;
          display:flex; align-items:center; justify-content:center;
          -webkit-tap-highlight-color:transparent;
        }
        .rg-brand { display:flex; align-items:center; gap:8px; }
        .rg-brand-icon {
          width:28px; height:28px; background:#1e3a8a; border-radius:7px;
          display:flex; align-items:center; justify-content:center;
        }
        .rg-brand-name { font-size:14px; font-weight:800; color:#1e3a8a; letter-spacing:-0.02em; }

        /* Progress bar */
        .rg-progress {
          background:#fff; padding:14px 20px 16px;
          border-bottom:1px solid #eaecf0;
        }
        .rg-progress-label {
          font-size:11px; font-weight:700; color:#94a3b8;
          text-transform:uppercase; letter-spacing:0.04em; margin-bottom:8px;
          display:flex; justify-content:space-between; align-items:center;
        }
        .rg-progress-steps { display:flex; align-items:center; gap:0; }
        .rg-step-item { display:flex; align-items:center; flex:1; }
        .rg-step-dot {
          width:26px; height:26px; border-radius:50%;
          display:flex; align-items:center; justify-content:center;
          font-size:11px; font-weight:800; flex-shrink:0; transition:all 0.15s;
        }
        .rg-step-dot.done { background:#1e3a8a; color:#fff; }
        .rg-step-dot.active { background:#1e3a8a; color:#fff; box-shadow:0 0 0 4px #dbeafe; }
        .rg-step-dot.pending { background:#e5e7eb; color:#9ca3af; }
        .rg-step-line { flex:1; height:2px; background:#e5e7eb; margin:0 4px; transition:background 0.2s; }
        .rg-step-line.done { background:#1e3a8a; }
        .rg-step-name {
          font-size:10px; font-weight:600; color:#94a3b8;
          margin-left:6px; white-space:nowrap;
        }
        .rg-step-name.active { color:#1e3a8a; }

        /* Body */
        .rg-body { flex:1; padding:20px 20px 40px; }

        .rg-section-title {
          font-size:18px; font-weight:800; color:#0f1728;
          letter-spacing:-0.02em; margin-bottom:4px;
        }
        .rg-section-sub { font-size:13px; color:#6b7280; margin-bottom:20px; }

        .rg-error {
          display:flex; align-items:center; gap:8px;
          padding:11px 13px; background:#fef2f2; border:1.5px solid #fecaca;
          border-radius:10px; color:#dc2626; font-size:13px; font-weight:600;
          margin-bottom:16px;
        }

        .rg-form { display:flex; flex-direction:column; gap:14px; }
        .rg-row { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
        .rg-group { display:flex; flex-direction:column; gap:5px; }
        .rg-label {
          font-size:11px; font-weight:700; color:#1e3a8a;
          letter-spacing:0.04em; text-transform:uppercase;
        }

        .rg-input-wrap { position:relative; }
        .rg-input {
          width:100%; padding:13px 14px;
          font-size:15px; font-family:'Plus Jakarta Sans',sans-serif;
          color:#0f1728; background:#f7f9fc;
          border:1.5px solid #e5e7eb; border-radius:12px;
          outline:none; transition:border-color 0.15s, background 0.15s;
          -webkit-appearance:none;
        }
        .rg-input::placeholder { color:#c4c9d4; }
        .rg-input:focus { border-color:#1e3a8a; background:#fff; }
        .rg-input-pr { padding-right:46px; }

        .rg-eye {
          position:absolute; right:14px; top:50%; transform:translateY(-50%);
          background:none; border:none; color:#9ca3af; cursor:pointer;
          padding:4px; display:flex; align-items:center; font-size:17px;
          -webkit-tap-highlight-color:transparent;
        }

        /* Photo upload */
        .rg-photo-label {
          display:block; border:1.5px dashed #d1d5db; border-radius:12px;
          cursor:pointer; overflow:hidden; background:#f7f9fc;
          -webkit-tap-highlight-color:transparent;
        }
        .rg-photo-label:active { border-color:#1e3a8a; }
        .rg-photo-placeholder {
          padding:28px 16px; display:flex; flex-direction:column;
          align-items:center; gap:8px; text-align:center;
        }
        .rg-photo-icon { font-size:28px; }
        .rg-photo-text { font-size:14px; font-weight:700; color:#374151; }
        .rg-photo-sub { font-size:11px; color:#9ca3af; }
        .rg-photo-preview { width:100%; height:140px; object-fit:cover; display:block; }

        .rg-submit {
          width:100%; padding:14px; background:#1e3a8a; color:#fff;
          border:none; border-radius:12px; font-size:15px; font-weight:700;
          font-family:'Plus Jakarta Sans',sans-serif; cursor:pointer;
          display:flex; align-items:center; justify-content:center; gap:8px;
          transition:transform 0.1s; -webkit-appearance:none; margin-top:4px;
          letter-spacing:-0.01em;
        }
        .rg-submit:active { transform:scale(0.98); }
        .rg-submit:disabled { opacity:0.55; cursor:not-allowed; }

        .rg-spinner {
          width:16px; height:16px;
          border:2px solid rgba(255,255,255,0.3); border-top-color:#fff;
          border-radius:50%; animation:rgspin 0.6s linear infinite;
        }
        @keyframes rgspin { to { transform:rotate(360deg); } }

        .rg-info {
          background:#eff6ff; border:1.5px solid #bfdbfe; border-radius:10px;
          padding:11px 13px; font-size:12px; font-weight:600; color:#1e40af;
          display:flex; gap:7px; align-items:flex-start; margin-top:2px;
        }

        .rg-footer { margin-top:22px; text-align:center; font-size:14px; color:#6b7280; }
        .rg-footer a { color:#1e3a8a; font-weight:700; text-decoration:none; }
      `}</style>

      <div className="rg">
        {/* Topbar */}
        <div className="rg-top">
          <div className="rg-top-left">
            {step === 2 ? (
              <button className="rg-back" onClick={() => setStep(1)}>←</button>
            ) : null}
            <div className="rg-brand">
              <div className="rg-brand-icon">
                <svg viewBox="0 0 24 24" fill="none" width={16} height={16}>
                  <path d="M3 22V10L12 3L21 10V22H15V16H9V22H3Z" fill="#fff"/>
                </svg>
              </div>
              <span className="rg-brand-name">eGov Portal</span>
            </div>
          </div>
          <LanguageSwitcher />
        </div>

        {/* Progress */}
        <div className="rg-progress">
          <div className="rg-progress-label">
            <span>Regjistrim</span>
            <span style={{ color: '#1e3a8a' }}>Hapi {step} nga 2</span>
          </div>
          <div className="rg-progress-steps">
            {[
              { n:1, label:'Të dhënat' },
              { n:2, label:'Siguria' },
            ].map((s, i) => (
              <div key={s.n} className="rg-step-item">
                <div className={`rg-step-dot ${step > s.n ? 'done' : step === s.n ? 'active' : 'pending'}`}>
                  {step > s.n ? '✓' : s.n}
                </div>
                <span className={`rg-step-name ${step === s.n ? 'active' : ''}`}>{s.label}</span>
                {i < 1 && <div className={`rg-step-line ${step > s.n ? 'done' : ''}`}/>}
              </div>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="rg-body">
          <h2 className="rg-section-title">
            {step === 1 ? 'Të dhënat personale' : 'Fjalëkalim & Dokument'}
          </h2>
          <p className="rg-section-sub">
            {step === 1
              ? 'Plotëso informacionin tuaj bazë për të krijuar llogarinë'
              : 'Vendos fjalëkalimin dhe ngarko foton e dokumentit të ID-së'}
          </p>

          {error && (
            <div className="rg-error">
              <span>⚠</span><span>{error}</span>
            </div>
          )}

          {/* Step 1 */}
          {step === 1 && (
            <form className="rg-form" onSubmit={e => { e.preventDefault(); nextStep() }}>
              <div className="rg-row">
                <div className="rg-group">
                  <label className="rg-label">Emri</label>
                  <input className="rg-input" type="text" placeholder="Emri"
                    value={form.first_name}
                    onChange={e => setForm({...form, first_name: e.target.value})}
                    required autoComplete="given-name"
                  />
                </div>
                <div className="rg-group">
                  <label className="rg-label">Mbiemri</label>
                  <input className="rg-input" type="text" placeholder="Mbiemri"
                    value={form.last_name}
                    onChange={e => setForm({...form, last_name: e.target.value})}
                    required autoComplete="family-name"
                  />
                </div>
              </div>
              <div className="rg-group">
                <label className="rg-label">EMBG — Numri Personal</label>
                <input className="rg-input" type="text" placeholder="1234567890123"
                  maxLength={13} inputMode="numeric"
                  value={form.personal_id}
                  onChange={e => setForm({...form, personal_id: e.target.value.replace(/\D/g,'')})}
                  required
                />
              </div>
              <div className="rg-group">
                <label className="rg-label">Email</label>
                <input className="rg-input" type="email" placeholder="email@shembull.mk"
                  value={form.email}
                  onChange={e => setForm({...form, email: e.target.value})}
                  required autoComplete="email"
                />
              </div>
              <button type="submit" className="rg-submit">Vazhdo →</button>
            </form>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <form className="rg-form" onSubmit={handleSubmit}>
              <div className="rg-group">
                <label className="rg-label">Fjalëkalim</label>
                <div className="rg-input-wrap">
                  <input
                    type={showPass ? 'text' : 'password'}
                    className="rg-input rg-input-pr"
                    placeholder="Min. 8 karaktere"
                    value={form.password}
                    onChange={e => setForm({...form, password: e.target.value})}
                    required autoComplete="new-password"
                  />
                  <button type="button" className="rg-eye" onClick={() => setShowPass(!showPass)}>
                    {showPass ? '🙈' : '👁'}
                  </button>
                </div>
              </div>
              <div className="rg-group">
                <label className="rg-label">Konfirmo fjalëkalimin</label>
                <div className="rg-input-wrap">
                  <input
                    type={showPass2 ? 'text' : 'password'}
                    className="rg-input rg-input-pr"
                    placeholder="Përsërit fjalëkalimin"
                    value={form.confirm_password}
                    onChange={e => setForm({...form, confirm_password: e.target.value})}
                    required autoComplete="new-password"
                  />
                  <button type="button" className="rg-eye" onClick={() => setShowPass2(!showPass2)}>
                    {showPass2 ? '🙈' : '👁'}
                  </button>
                </div>
              </div>
              <div className="rg-group">
                <label className="rg-label">Foto e dokumentit të identitetit</label>
                <label className="rg-photo-label">
                  {photoPreview ? (
                    <img src={photoPreview} className="rg-photo-preview" alt="ID preview"/>
                  ) : (
                    <div className="rg-photo-placeholder">
                      <span className="rg-photo-icon">📄</span>
                      <span className="rg-photo-text">Ngarko foton e ID-së</span>
                      <span className="rg-photo-sub">JPG, PNG — max 5MB</span>
                    </div>
                  )}
                  <input type="file" accept="image/*" onChange={handlePhoto} hidden/>
                </label>
              </div>
              <div className="rg-info">
                ℹ️ Foto do të shqyrtohet nga admini. Llogaria aktivizohet brenda 1-2 ditëve.
              </div>
              <button type="submit" className="rg-submit" disabled={loading}>
                {loading ? <><div className="rg-spinner"/>Duke procesuar...</> : 'Dërgo Kërkesën →'}
              </button>
            </form>
          )}

          <p className="rg-footer">
            Keni llogari? <Link to="/login">Kyçuni</Link>
          </p>
        </div>
      </div>
    </>
  )
}

export default Register