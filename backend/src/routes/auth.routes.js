const router = require('express').Router()
const { register, getMe, changePassword } = require('../controllers/auth.controller')
const { requireAuth, attachRole } = require('../middleware/auth.middleware')
const multer = require('multer')

const upload = multer({ storage: multer.memoryStorage() })

// ✅ PUBLIC ROUTES (no auth required)
router.post('/register', upload.single('id_photo'), register)

// ✅ PROTECTED ROUTES (auth required)
router.get('/me', requireAuth, attachRole, getMe)
router.post('/change-password', requireAuth, attachRole, changePassword)

// ✅ NEW ROUTES - PASSWORD RESET
router.post('/forgot-password', require('../controllers/auth.controller').forgotPassword)
router.post('/reset-password', require('../controllers/auth.controller').resetPassword)
router.post('/verify-email', require('../controllers/auth.controller').verifyEmail)

module.exports = router