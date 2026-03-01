import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useSignIn } from '@clerk/clerk-react'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from '../components/LanguageSwitcher'
import { Building2, Eye, EyeOff, AlertCircle, Lock, ChevronRight } from 'lucide-react'

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn, isLoaded, setActive } = useSignIn()
  const { t } = useTranslation()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!isLoaded) return
    setLoading(true)
    setError('')
    try {
      const result = await signIn.create({
        identifier: form.email,
        password: form.password,
      })
      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId })
        // ✅ AuthContext handles redirect automatically
      }
    } catch (err) {
      setError(err.errors?.[0]?.message || t('fill_required'))
    } finally {
      setLoading(false)
    }
  }

  // ✅ INLINE STYLES AS OBJECTS
  const styles = {
    loginPage: {
      minHeight: '100vh',
      display: 'flex',
    },
    loginLeft: {
      display: 'none',
      flexDirection: 'column',
      justifyContent: 'space-between',
      width: '52%',
      padding: '48px',
      position: 'relative',
      overflow: 'hidden',
      background: 'linear-gradient(160deg, #0a1628 0%, #0d1f45 50%, #0a1628 100%)',
      '@media (min-width: 1024px)': {
        display: 'flex',
      },
    },
    loginLeftGrid: {
      position: 'absolute',
      inset: 0,
      backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
      backgroundSize: '48px 48px',
      pointerEvents: 'none',
    },
    loginLeftGlow1: {
      position: 'absolute',
      top: '-80px',
      right: '-80px',
      width: '360px',
      height: '360px',
      borderRadius: '50%',
      background: 'radial-gradient(circle, rgba(59,130,246,0.2) 0%, transparent 70%)',
      pointerEvents: 'none',
    },
    loginLeftGlow2: {
      position: 'absolute',
      bottom: '-60px',
      left: '-60px',
      width: '280px',
      height: '280px',
      borderRadius: '50%',
      background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
      pointerEvents: 'none',
    },
    loginLeftLogo: {
      position: 'relative',
      zIndex: 1,
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
    },
    loginLogoIcon: {
      width: '44px',
      height: '44px',
      background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 4px 16px rgba(59,130,246,0.35)',
      color: 'white',
    },
    loginLogoTitle: {
      fontSize: '15px',
      fontWeight: 700,
      color: '#fff',
    },
    loginLogoSub: {
      fontSize: '10px',
      color: 'rgba(255,255,255,0.4)',
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
    },
    loginLeftContent: {
      position: 'relative',
      zIndex: 1,
    },
    loginBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      background: 'rgba(255,255,255,0.08)',
      border: '1px solid rgba(255,255,255,0.12)',
      borderRadius: '20px',
      padding: '5px 14px',
      fontSize: '12px',
      color: 'rgba(255,255,255,0.7)',
      marginBottom: '20px',
    },
    loginLeftTitle: {
      fontSize: '2.4rem',
      fontWeight: 800,
      color: '#fff',
      lineHeight: '1.15',
      letterSpacing: '-0.03em',
      marginBottom: '16px',
    },
    loginLeftDesc: {
      fontSize: '14px',
      color: 'rgba(255,255,255,0.5)',
      lineHeight: '1.7',
      maxWidth: '320px',
    },
    loginChips: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '8px',
      marginTop: '28px',
    },
    loginChip: {
      background: 'rgba(255,255,255,0.07)',
      border: '1px solid rgba(255,255,255,0.12)',
      borderRadius: '10px',
      padding: '7px 16px',
      fontSize: '13px',
      color: 'rgba(255,255,255,0.8)',
      fontWeight: 500,
    },
    loginLeftFooter: {
      position: 'relative',
      zIndex: 1,
      fontSize: '11px',
      color: 'rgba(255,255,255,0.25)',
    },
    loginRight: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      background: '#f8f9fc',
      padding: '32px',
      position: 'relative',
    },
    loginRightHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      marginBottom: '24px',
    },
    loginFormWrap: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      maxWidth: '380px',
      width: '100%',
      margin: '0 auto',
    },
    loginHeading: {
      marginBottom: '28px',
    },
    loginHeadingH1: {
      fontSize: '1.75rem',
      fontWeight: 800,
      color: '#0f172a',
      letterSpacing: '-0.03em',
      marginBottom: '4px',
    },
    loginHeadingP: {
      fontSize: '13px',
      color: '#94a3b8',
    },
    loginCard: {
      background: '#fff',
      border: '1px solid #e8ecf0',
      borderRadius: '18px',
      padding: '28px',
      boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
    },
    loginError: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      background: '#fef2f2',
      border: '1px solid #fecaca',
      color: '#dc2626',
      fontSize: '13px',
      padding: '10px 14px',
      borderRadius: '10px',
      marginBottom: '18px',
    },
    loginForm: {
      display: 'flex',
      flexDirection: 'column',
      gap: '18px',
    },
    formGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
    },
    formGroupLabel: {
      fontSize: '11px',
      fontWeight: 700,
      color: '#64748b',
      textTransform: 'uppercase',
      letterSpacing: '0.06em',
    },
    formGroupInput: {
      background: '#f8fafc',
      border: '1px solid #e2e8f0',
      color: '#0f172a',
      borderRadius: '10px',
      padding: '11px 14px',
      fontSize: '13px',
      outline: 'none',
      transition: 'all 0.2s',
      width: '100%',
      fontFamily: 'inherit',
    },
    inputIconWrap: {
      position: 'relative',
    },
    inputIconWrapInput: {
      paddingRight: '42px',
    },
    inputIconBtn: {
      position: 'absolute',
      right: '12px',
      top: '50%',
      transform: 'translateY(-50%)',
      background: 'none',
      border: 'none',
      color: '#94a3b8',
      padding: '4px',
      display: 'flex',
      alignItems: 'center',
      transition: 'color 0.15s',
      cursor: 'pointer',
    },
    btnPrimary: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '6px',
      background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)',
      color: '#fff',
      border: 'none',
      padding: '13px 20px',
      borderRadius: '11px',
      fontSize: '13px',
      fontWeight: 700,
      boxShadow: '0 4px 14px rgba(59,130,246,0.35)',
      transition: 'all 0.2s',
      marginTop: '4px',
      width: '100%',
      cursor: 'pointer',
      fontFamily: 'inherit',
    },
    btnSpinner: {
      width: '14px',
      height: '14px',
      border: '2px solid rgba(255,255,255,0.3)',
      borderTop: '2px solid #fff',
      borderRadius: '50%',
      animation: 'spin 0.6s linear infinite',
      display: 'inline-block',
    },
    loginRegisterLink: {
      textAlign: 'center',
      fontSize: '13px',
      color: '#94a3b8',
      marginTop: '20px',
    },
    loginRegisterLinkA: {
      color: '#2563eb',
      fontWeight: 700,
      textDecoration: 'none',
    },
    loginSecure: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '5px',
      fontSize: '11px',
      color: '#cbd5e1',
      marginTop: '14px',
    },
  }

  return (
    <>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        input:focus {
          border-color: #3b82f6 !important;
          background: #fff !important;
          box-shadow: 0 0 0 3px rgba(59,130,246,0.1) !important;
        }
        button:hover:not(:disabled) {
          opacity: 0.9;
          transform: translateY(-1px);
        }
        button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        a:hover {
          text-decoration: underline;
        }
      `}</style>

      <div style={styles.loginPage}>
        {/* Left Side */}
        <div style={styles.loginLeft}>
          <div style={styles.loginLeftGrid} />
          <div style={styles.loginLeftGlow1} />
          <div style={styles.loginLeftGlow2} />

          <div style={styles.loginLeftLogo}>
            <div style={styles.loginLogoIcon}>
              <Building2 size={20} />
            </div>
            <div>
              <div style={styles.loginLogoTitle}>eGov Portal</div>
              <div style={styles.loginLogoSub}>Maqedonia e Veriut</div>
            </div>
          </div>

          <div style={styles.loginLeftContent}>
            <div style={styles.loginBadge}>🔒 Portal Qeveritar i Sigurt</div>
            <h2 style={styles.loginLeftTitle}>Shërbime qeveritare në një vend</h2>
            <p style={styles.loginLeftDesc}>Aksesoni të gjitha shërbimet administrative me siguri dhe shpejtësi.</p>
            <div style={styles.loginChips}>
              {['Terminë', 'Gjoba', 'Leje'].map(s => (
                <div key={s} style={styles.loginChip}>{s}</div>
              ))}
            </div>
          </div>

          <div style={styles.loginLeftFooter}>© 2026 eGov Portal — Republika e Maqedonisë</div>
        </div>

        {/* Right Side */}
        <div style={styles.loginRight}>
          <div style={styles.loginRightHeader}>
            <LanguageSwitcher />
          </div>

          <div style={styles.loginFormWrap}>
            <div style={styles.loginHeading}>
              <h1 style={styles.loginHeadingH1}>{t('login')}</h1>
              <p style={styles.loginHeadingP}>{t('login_subtitle')}</p>
            </div>

            <div style={styles.loginCard}>
              {error && (
                <div style={styles.loginError}>
                  <AlertCircle size={15} /> {error}
                </div>
              )}

              <form onSubmit={handleSubmit} style={styles.loginForm}>
                <div style={styles.formGroup}>
                  <label style={styles.formGroupLabel}>{t('email')}</label>
                  <input
                    type="email"
                    value={form.email}
                    placeholder="email@shembull.com"
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    style={styles.formGroupInput}
                    required
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.formGroupLabel}>{t('password')}</label>
                  <div style={styles.inputIconWrap}>
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={form.password}
                      placeholder="••••••••"
                      onChange={e => setForm({ ...form, password: e.target.value })}
                      style={{ ...styles.formGroupInput, ...styles.inputIconWrapInput }}
                      required
                    />
                    <button
                      type="button"
                      style={styles.inputIconBtn}
                      onClick={() => setShowPass(!showPass)}
                    >
                      {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  style={styles.btnPrimary}
                  disabled={loading || !isLoaded}
                >
                  {loading ? (
                    <>
                      <span style={styles.btnSpinner} />
                      {t('loading')}
                    </>
                  ) : (
                    <>
                      {t('login')} <ChevronRight size={16} />
                    </>
                  )}
                </button>
              </form>

              <p style={styles.loginRegisterLink}>
                {t('no_account')} <Link to="/register" style={styles.loginRegisterLinkA}>{t('register')}</Link>
              </p>

              <div style={styles.loginSecure}>
                <Lock size={12} /> {t('security_note')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Login