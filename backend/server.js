const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '.env') })
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const routes = require('./src/routes/index')
const errorHandler = require('./src/middleware/errorHandler.middleware')

const app = express()
const PORT = process.env.PORT || 5000

app.use(helmet())
app.use(morgan('dev'))
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// 🔹 API ROUTES
app.use('/api', routes)

// 🔹 HEALTH CHECK
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'E-Gov Backend running', timestamp: new Date().toISOString() })
})

// ✅ SERVE STATIC FRONTEND (production build)
const frontendPath = path.join(__dirname, '../frontend/dist')
app.use(express.static(frontendPath))

// ✅ SPA FALLBACK: Për të gjitha GET requests që nuk janë API, shërbej index.html
app.get('*', (req, res) => {
  // Nëse kërkesa nuk përputhet me asnjë rout, shërbej index.html për React Router
  res.sendFile(path.join(frontendPath, 'index.html'))
})

// 🔹 ERROR HANDLER (middleware i fundit)
app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`✅ E-Gov Backend running on http://localhost:${PORT}`)
  console.log(`📌 Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log(`📁 Frontend served from: ${frontendPath}`)
})