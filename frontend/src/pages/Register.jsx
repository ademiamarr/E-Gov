import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSignUp } from '@clerk/clerk-react'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from '../components/LanguageSwitcher'
import { Building2, AlertCircle, Eye, EyeOff, Upload, ChevronRight, ChevronLeft } from 'lucide-react'
import './Register.css'

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
  const [step, setStep]   = useState(1)
  const [form, setForm]   = useState({ first_name:'', last_name:'', personal_id:'', email:'', password:'', confirm_password:'' })
  const [photo, setPhoto] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [showPass, setShowPass]   = useState(false)
  const [showPass2, setShowPass2] = useState(false)
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)
  const { signUp, isLoaded } = useSignUp()
  const { t } = useTranslation()
  const navigate = useNavigate()

  const nextStep = () => {
    setError('')
    if (!form.first_name || !form.last_name || !form.personal_id || !form.email) {
      return setError(t('fill_required'))
    }
    if (!validateEMBG(form.personal_id)) return setError(t('embg_invalid'))
    setStep(2)
  }

  const handlePhoto = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setPhoto(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async () => {
    setError('')
    if (!form.password || !form.confirm_password) return setError(t('fill_required'))
    if (form.password !== form.confirm_password) return setError(t('passwords_no_match'))
    if (!isLoaded) return
    setLoading(true)

    try {
      const su = await signUp.create({
        emailAddress: form.email,
        password: form.password,
        firstName: form.first_name,
        lastName: form.last_name,
      })

      window.__pendingRegister = {
        clerk_id:    su.createdUserId,
        first_name:  form.first_name,
        last_name:   form.last_name,
        personal_id: form.personal_id,
        email:       form.email,
        id_photo:    photo,
      }

      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })
      navigate('/verify-email')
    } catch (err) {
      setError(err.errors?.[0]?.message || t('fill_required'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="register-page">
      <div className="register-top">
        <div className="register-logo">
          <div className="reg-logo-icon"><Building2 size={16} color="#fff" /></div>
          <span>eGov Portal</span>
        </div>
        <LanguageSwitcher />
      </div>

      <div className="register-wrap">
        <div className="register-header">
          <h1>{t('register')}</h1>
          <p>{t('step')} {step}/2</p>
        </div>

        <div className="register-steps">
          <div className={`reg-step ${step >= 1 ? 'active' : ''}`}>1</div>
          <div className={`reg-step-line ${step >= 2 ? 'active' : ''}`} />
          <div className={`reg-step ${step >= 2 ? 'active' : ''}`}>2</div>
        </div>

        <div className="register-card">
          {error && (
            <div className="reg-error">
              <AlertCircle size={14} /> {error}
            </div>
          )}

          {step === 1 && (
            <div className="reg-fields">
              <div className="reg-row">
                <div className="form-group">
                  <label>{t('first_name')}</label>
                  <input value={form.first_name} placeholder="Emri"
                    onChange={e => setForm({ ...form, first_name: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>{t('last_name')}</label>
                  <input value={form.last_name} placeholder="Mbiemri"
                    onChange={e => setForm({ ...form, last_name: e.target.value })} />
                </div>
              </div>

              <div className="form-group">
                <label>{t('personal_id')}</label>
                <input value={form.personal_id} placeholder="0000000000000" maxLength={13}
                  onChange={e => setForm({ ...form, personal_id: e.target.value.replace(/\D/g,'') })} />
              </div>

              <div className="form-group">
                <label>{t('email')}</label>
                <input type="email" value={form.email} placeholder="email@shembull.com"
                  onChange={e => setForm({ ...form, email: e.target.value })} />
              </div>

              <button className="btn-primary" onClick={nextStep}>
                {t('next')} <ChevronRight size={16} />
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="reg-fields">
              <div className="form-group">
                <label>{t('password')}</label>
                <div className="input-icon-wrap">
                  <input type={showPass ? 'text' : 'password'} value={form.password}
                    placeholder="Min. 8 karaktere"
                    onChange={e => setForm({ ...form, password: e.target.value })} />
                  <button type="button" className="input-icon-btn" onClick={() => setShowPass(!showPass)}>
                    {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label>{t('confirm_password')}</label>
                <div className="input-icon-wrap">
                  <input type={showPass2 ? 'text' : 'password'} value={form.confirm_password}
                    placeholder="••••••••"
                    onChange={e => setForm({ ...form, confirm_password: e.target.value })} />
                  <button type="button" className="input-icon-btn" onClick={() => setShowPass2(!showPass2)}>
                    {showPass2 ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label>{t('upload_photo')}</label>
                <label className="photo-upload">
                  {photoPreview
                    ? <img src={photoPreview} alt="preview" className="photo-preview" />
                    : <><Upload size={20} /><span>Kliko për të ngarkuar</span></>
                  }
                  <input type="file" accept="image/*" onChange={handlePhoto} hidden />
                </label>
              </div>

              <div className="reg-btns">
                <button className="btn-ghost" onClick={() => setStep(1)}>
                  <ChevronLeft size={16} /> {t('back')}
                </button>
                <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
                  {loading ? <><span className="btn-spinner" />{t('loading')}</> : <>{t('register')} <ChevronRight size={16} /></>}
                </button>
              </div>
            </div>
          )}
        </div>

        <p className="reg-login-link">
          {t('have_account')} <Link to="/login">{t('login')}</Link>
        </p>
      </div>
    </div>
  )
}

export default Register