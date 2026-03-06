import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronDown } from 'lucide-react'

const langs = [
  { code: 'sq', label: 'Shqip',       flag: '🇦🇱', country: 'Albanian' },
  { code: 'mk', label: 'Македонски',  flag: '🇲🇰', country: 'Macedonian' },
  { code: 'en', label: 'English',     flag: '🇬🇧', country: 'English' },
]

const STORAGE_KEY = 'egov_language'

const LanguageSwitcher = () => {
  const { i18n } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const wrapperRef = useRef(null)

  // Restore saved language on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved && saved !== i18n.language && langs.find(l => l.code === saved)) {
      i18n.changeLanguage(saved)
    }
  }, [])

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
          gap: 8px;
          padding: 10px 14px;
          background: #ffffff;
          border: 1.5px solid #e5e7eb;
          border-radius: 9px;
          color: #1f2937;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: 'DM Sans', sans-serif;
          white-space: nowrap;
        }

        .lang-switcher-btn:hover {
          background: #f9fafb;
          border-color: #d1d5db;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
        }

        .lang-switcher-btn.active {
          background: #eff6ff;
          border-color: #3b82f6;
          color: #1e40af;
        }

        .lang-flag {
          font-size: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 20px;
          height: 20px;
        }

        .lang-chevron {
          width: 14px;
          height: 14px;
          transition: transform 0.2s ease;
          flex-shrink: 0;
          color: #6b7280;
        }

        .lang-switcher-btn.active .lang-chevron {
          transform: rotate(180deg);
          color: #3b82f6;
        }

        .lang-dropdown {
          position: absolute;
          top: calc(100% + 6px);
          right: 0;
          background: #ffffff;
          border: 1.5px solid #e5e7eb;
          border-radius: 10px;
          box-shadow: 0 10px 35px rgba(0, 0, 0, 0.12);
          overflow: hidden;
          z-index: 2000;
          min-width: 220px;
          animation: langDropDown 0.15s ease forwards;
        }

        @keyframes langDropDown {
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
          gap: 12px;
          padding: 13px 16px;
          border: none;
          background: transparent;
          color: #374151;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s ease;
          font-family: 'DM Sans', sans-serif;
          width: 100%;
          text-align: left;
          border-bottom: 1px solid #f3f4f6;
        }

        .lang-dropdown-item:last-child {
          border-bottom: none;
        }

        .lang-dropdown-item:hover {
          background: #f9fafb;
          color: #111827;
        }

        .lang-dropdown-item.active {
          background: #eff6ff;
          color: #1e40af;
          font-weight: 600;
        }

        .lang-flag-large {
          font-size: 20px;
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .lang-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .lang-name {
          font-weight: 600;
          font-size: 13px;
          display: block;
        }

        .lang-country {
          font-size: 11px;
          color: #9ca3af;
          display: block;
        }

        .lang-checkmark {
          width: 16px;
          height: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #3b82f6;
          font-size: 13px;
          font-weight: bold;
          flex-shrink: 0;
        }

        /* Mobile responsive */
        @media (max-width: 640px) {
          .lang-switcher-btn {
            padding: 8px 10px;
            font-size: 12px;
          }

          .lang-flag {
            font-size: 14px;
          }

          .lang-dropdown {
            min-width: 200px;
            right: -10px;
          }
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
          <span className="lang-flag">{currentLang.flag}</span>
          <span>{currentLang.label}</span>
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
                <span className="lang-flag-large">{lang.flag}</span>
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

export default LanguageSwitcher;