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
  res.json({
    status: 'OK',
    message: 'E-Gov Backend running',
    timestamp: new Date().toISOString()
  })
})

// 🔹 ERROR HANDLER
app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`✅ E-Gov Backend running on port ${PORT}`)
  console.log(`📌 Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log(`🌐 CORS allowed: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`)
})