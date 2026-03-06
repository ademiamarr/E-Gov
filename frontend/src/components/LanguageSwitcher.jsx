import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronDown, Globe } from 'lucide-react'

const langs = [
  { code: 'sq', label: 'Shqip',       flag: '🇦🇱', country: 'Shqipëri / Maqedoni' },
  { code: 'mk', label: 'Македонски',  flag: '🇲🇰', country: 'Македонија' },
  { code: 'en', label: 'English',     flag: '🇬🇧', country: 'United Kingdom' },
]

const STORAGE_KEY = 'egov_language'

const LanguageSwitcher = () => {
  const { i18n } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const wrapperRef = useRef(null)

  // On mount: restore saved language
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved && saved !== i18n.language && langs.find(l => l.code === saved)) {
      i18n.changeLanguage(saved)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    if (isOpen) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [isOpen])

  const handleLanguageChange = (code) => {
    i18n.changeLanguage(code)
    localStorage.setItem(STORAGE_KEY, code)
    setIsOpen(false)
  }

  const currentLang = langs.find(l => l.code === i18n.language) || langs[0]

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
          color: #00000000;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: inherit;
          white-space: nowrap;
          border: 1px solid red;
        }

        .lang-switcher-btn:hover {
          background: rgba(255, 255, 255, 0.12);
          border-color: rgba(255, 255, 255, 0.25);
        }

        .lang-switcher-btn.active {
          background: rgba(59, 130, 246, 0.15);
          border-color: rgba(59, 130, 246, 0.3);
          color: black;
        }

        .lang-chevron {
          width: 14px;
          height: 14px;
          transition: transform 0.2s ease;
          flex-shrink: 0;
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
          z-index: 2000;
          min-width: 190px;
          animation: langSlideDown 0.15s ease forwards;
        }

        @keyframes langSlideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .lang-dropdown-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 11px 14px;
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
          width: 22px;
          text-align: center;
          flex-shrink: 0;
        }

        .lang-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 1px;
        }

        .lang-name {
          font-weight: 500;
          font-size: 13px;
        }

        .lang-country {
          font-size: 10px;
          color: #9ca3af;
        }

        .lang-checkmark {
          width: 16px;
          height: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #60a5fa;
          font-size: 14px;
          font-weight: bold;
          flex-shrink: 0;
        }
      `}</style>

      <div className="lang-switcher-wrapper" ref={wrapperRef}>
        <button
          className={`lang-switcher-btn ${isOpen ? 'active' : ''}`}
          onClick={() => setIsOpen(!isOpen)}
          type="button"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <Globe size={14} />
          <span>{currentLang.flag} {currentLang.label}</span>
          <ChevronDown className="lang-chevron" size={14} />
        </button>

        {isOpen && (
          <div className="lang-dropdown" role="listbox">
            {langs.map((lang) => (
              <button
                key={lang.code}
                role="option"
                aria-selected={i18n.language === lang.code}
                className={`lang-dropdown-item ${i18n.language === lang.code ? 'active' : ''}`}
                onClick={() => handleLanguageChange(lang.code)}
                type="button"
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