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
      const token = await getTokenFn()
      if (token) config.headers.Authorization = `Bearer ${token}`
    } catch (err) {
      console.error('Token error:', err)
    }
  }
  return config
})

export default API