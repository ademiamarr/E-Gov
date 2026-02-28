require('dotenv').config()
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

app.use('/api', routes)

app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'E-Gov Backend running', timestamp: new Date().toISOString() })
})

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route nuk u gjet' })
})

app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`✅ E-Gov Backend running on http://localhost:${PORT}`)
  console.log(`📌 Environment: ${process.env.NODE_ENV || 'development'}`)
})