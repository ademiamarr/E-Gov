import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronDown } from 'lucide-react'

const langs = [
  { code: 'sq', label: 'Shqip', flag: '🇦🇱' },
  { code: 'mk', label: 'Македонски', flag: '🇲🇰' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
]

const LanguageSwitcher = () => {
  const { i18n } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)

  const currentLang = langs.find(l => l.code === i18n.language) || langs[0]

  const handleChange = (code) => {
    i18n.changeLanguage(code)
    setIsOpen(false)
  }

  return (
    <div className="lang-switcher">
      <button 
        className="lang-toggle"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="lang-flag">{currentLang.flag}</span>
        <span className="lang-code">{currentLang.code.toUpperCase()}</span>
        <ChevronDown size={16} className={`lang-chevron ${isOpen ? 'open' : ''}`} />
      </button>

      {isOpen && (
        <div className="lang-dropdown">
          {langs.map(({ code, label, flag }) => (
            <button
              key={code}
              className={`lang-option ${i18n.language === code ? 'active' : ''}`}
              onClick={() => handleChange(code)}
            >
              <span className="lang-flag">{flag}</span>
              <span className="lang-label">{label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default LanguageSwitcher