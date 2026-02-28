import { useTranslation } from 'react-i18next'
import './LanguageSwitcher.css'

const langs = [
  { code: 'sq', label: 'SQ', flag: '🇦🇱' },
  { code: 'mk', label: 'MK', flag: '🇲🇰' },
  { code: 'en', label: 'EN', flag: '🇬🇧' },
]

const LanguageSwitcher = () => {
  const { i18n } = useTranslation()

  return (
    <div className="lang-switcher">
      {langs.map(({ code, label, flag }) => (
        <button key={code}
          className={`lang-btn ${i18n.language === code ? 'active' : ''}`}
          onClick={() => i18n.changeLanguage(code)}>
          <span>{flag}</span>
          <span>{label}</span>
        </button>
      ))}
    </div>
  )
}

export default LanguageSwitcher