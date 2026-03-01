import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronDown, Globe } from 'lucide-react'

const langs = [
  { code: 'sq', label: 'Shqip', flag: '🇦🇱', country: 'Albania' },
  { code: 'mk', label: 'Македонски', flag: '🇲🇰', country: 'Македонија' },
  { code: 'en', label: 'English', flag: '🇬🇧', country: 'United Kingdom' },
]

const LanguageSwitcher = () => {
  const { i18n } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const currentLang = langs.find(l => l.code === i18n.language) || langs[0]

  const handleLanguageChange = (code) => {
    i18n.changeLanguage(code)
    setIsOpen(false)
  }

  return (
    <>
      <style>{`
        .lang-switcher-wrapper {
          position: relative;
        }

        .lang-switcher-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 12px;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 8px;
          color: #ffffff;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: inherit;
        }

        .lang-switcher-btn:hover {
          background: rgba(255, 255, 255, 0.12);
          border-color: rgba(255, 255, 255, 0.25);
        }

        .lang-switcher-btn.active {
          background: rgba(59, 130, 246, 0.15);
          border-color: rgba(59, 130, 246, 0.3);
          color: #60a5fa;
        }

        .lang-chevron {
          width: 14px;
          height: 14px;
          transition: transform 0.2s ease;
        }

        .lang-switcher-btn.active .lang-chevron {
          transform: rotate(180deg);
        }

        .lang-dropdown {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          background: #1f2937;
          border: 1px solid #374151;
          border-radius: 10px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
          overflow: hidden;
          z-index: 1000;
          min-width: 180px;
          animation: slideDown 0.15s ease forwards;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .lang-dropdown-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 14px;
          border: none;
          background: transparent;
          color: #d1d5db;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.15s ease;
          font-family: inherit;
          width: 100%;
          text-align: left;
        }

        .lang-dropdown-item:hover {
          background: rgba(255, 255, 255, 0.08);
          color: #f3f4f6;
        }

        .lang-dropdown-item.active {
          background: rgba(59, 130, 246, 0.2);
          color: #60a5fa;
          font-weight: 600;
        }

        .lang-flag {
          font-size: 16px;
          width: 20px;
          text-align: center;
        }

        .lang-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .lang-name {
          font-weight: 500;
        }

        .lang-country {
          font-size: 11px;
          color: #9ca3af;
        }

        .lang-checkmark {
          width: 16px;
          height: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #60a5fa;
          font-weight: bold;
        }
      `}</style>

      <div className="lang-switcher-wrapper">
        <button
          className={`lang-switcher-btn ${isOpen ? 'active' : ''}`}
          onClick={() => setIsOpen(!isOpen)}
        >
          <Globe size={14} />
          <span>{currentLang.flag} {currentLang.label}</span>
          <ChevronDown className="lang-chevron" size={14} />
        </button>

        {isOpen && (
          <div className="lang-dropdown">
            {langs.map((lang) => (
              <button
                key={lang.code}
                className={`lang-dropdown-item ${i18n.language === lang.code ? 'active' : ''}`}
                onClick={() => handleLanguageChange(lang.code)}
              >
                <span className="lang-flag">{lang.flag}</span>
                <div className="lang-info">
                  <span className="lang-name">{lang.label}</span>
                  <span className="lang-country">{lang.country}</span>
                </div>
                {i18n.language === lang.code && (
                  <div className="lang-checkmark">✓</div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  )
}

export default LanguageSwitcher