import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ClerkProvider, ClerkLoaded } from '@clerk/react'
import { BrowserRouter } from 'react-router-dom'
import { I18nextProvider } from 'react-i18next'
import i18n from './i18n/index'
import App from './App'
import './index.css'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

console.log('📌 MAIN.JSX - Initializing...')
console.log('📌 PUBLISHABLE_KEY present:', !!PUBLISHABLE_KEY)

if (!PUBLISHABLE_KEY) {
  console.error('❌ VITE_CLERK_PUBLISHABLE_KEY missing in .env!')
  throw new Error('Clerk publishable key not found')
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <ClerkLoaded>
        <BrowserRouter>
          <I18nextProvider i18n={i18n}>
            <App />
          </I18nextProvider>
        </BrowserRouter>
      </ClerkLoaded>
    </ClerkProvider>
  </StrictMode>
)

console.log('✅ App initialized - Ready!')