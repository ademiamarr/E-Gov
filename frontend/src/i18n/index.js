import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import sq from './locales/sq.json'
import mk from './locales/mk.json'
import en from './locales/en.json'

const STORAGE_KEY = 'egov_language'

// Read saved language from localStorage directly (before detector runs)
const savedLang = localStorage.getItem(STORAGE_KEY)
const supportedLangs = ['sq', 'mk', 'en']
const initialLang = (savedLang && supportedLangs.includes(savedLang)) ? savedLang : 'sq'

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      sq: { translation: sq },
      mk: { translation: mk },
      en: { translation: en },
    },
    lng: initialLang,          // force the saved/default language
    fallbackLng: 'sq',
    interpolation: { escapeValue: false },
    detection: {
      // only use our manual override, not browser/cookie
      order: [],
    },
  })

export default i18n