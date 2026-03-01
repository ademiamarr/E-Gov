import { useTranslation } from 'react-i18next'

const langs = [
  { code: 'sq', label: 'SQ', flag: '🇦🇱' },
  { code: 'mk', label: 'MK', flag: '🇲🇰' },
  { code: 'en', label: 'EN', flag: '🇬🇧' },
]

const LanguageSwitcher = () => {
  const { i18n } = useTranslation()

  const styles = {
    langSwitcher: {
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
    },
    langBtn: {
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      padding: '4px 8px',
      borderRadius: '6px',
      border: '1px solid transparent',
      background: 'transparent',
      color: 'rgba(255,255,255,0.4)',
      fontSize: '11px',
      fontWeight: 600,
      transition: 'all 0.15s',
      fontFamily: 'inherit',
      cursor: 'pointer',
    },
    langBtnActive: {
      background: 'rgba(59,130,246,0.2)',
      borderColor: 'rgba(59,130,246,0.4)',
      color: '#60a5fa',
    },
  }

  return (
    <div style={styles.langSwitcher}>
      {langs.map(({ code, label, flag }) => (
        <button
          key={code}
          style={{
            ...styles.langBtn,
            ...(i18n.language === code ? styles.langBtnActive : {}),
          }}
          onClick={() => i18n.changeLanguage(code)}
        >
          <span>{flag}</span>
          <span>{label}</span>
        </button>
      ))}
    </div>
  )
}

export default LanguageSwitcher