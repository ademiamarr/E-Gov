import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ClerkProvider } from '@clerk/react'
import { BrowserRouter } from 'react-router-dom'
import { I18nextProvider } from 'react-i18next'
import i18n from './i18n/index'
import App from './App'
import './index.css'

// ✅ GET CLERK KEY FROM .env (NOT HARDCODED!)
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

// ✅ VALIDATE THAT KEY EXISTS
if (!PUBLISHABLE_KEY) {
  console.error('❌ ERROR: VITE_CLERK_PUBLISHABLE_KEY is missing in frontend/.env')
  console.error('Please add: VITE_CLERK_PUBLISHABLE_KEY=pk_test_YOUR_ACTUAL_KEY')
  console.error('Get your key from: https://dashboard.clerk.com → API Keys → Publishable Key')
  throw new Error('Clerk publishable key is not configured. Check frontend/.env file.')
}

console.log('✅ Clerk Key loaded successfully from .env')

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <BrowserRouter>
        <I18nextProvider i18n={i18n}>
          <App />
        </I18nextProvider>
      </BrowserRouter>
    </ClerkProvider>
  </StrictMode>
)