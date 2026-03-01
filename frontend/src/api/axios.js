import axios from 'axios'

const API = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
})

let getTokenFn = null

export const setTokenGetter = (fn) => {
  getTokenFn = fn
}

API.interceptors.request.use(async (config) => {
  if (getTokenFn) {
    try {
      // ✅ CALL THE FUNCTION TO GET THE TOKEN
      const token = await getTokenFn()
      
      if (token && typeof token === 'string') {
        config.headers.Authorization = `Bearer ${token}`
        console.log('✅ Token injected into request')
      } else {
        console.warn('⚠️ No valid token received')
      }
    } catch (err) {
      console.error('❌ Token error:', err.message)
      // Don't reject, just continue without token
    }
  }
  return config
}, (error) => {
  return Promise.reject(error)
})

export default API