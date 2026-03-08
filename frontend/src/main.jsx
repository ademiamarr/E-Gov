import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ClerkProvider } from '@clerk/react'
import { BrowserRouter } from 'react-router-dom'
import { I18nextProvider } from 'react-i18next'
import i18n from './i18n/index'
import App from './App'
import './index.css'

// 🔧 Temporary hardcode para testa
const PUBLISHABLE_KEY = 'pk_test_c3VwZXJiLXB1cC02My5jbGVyay5hY2NvdW50cy5kZXYk'

console.log('🔍 Clerk Key:', PUBLISHABLE_KEY)

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