const router = require('express').Router()
const { register, getMe, changePassword } = require('../controllers/auth.controller')
const { requireAuth, attachRole } = require('../middleware/auth.middleware')
const multer = require('multer')

const upload = multer({ storage: multer.memoryStorage() })

router.post('/register', upload.single('id_photo'), register)
router.get('/me', requireAuth, attachRole, getMe)
router.post('/change-password', requireAuth, attachRole, changePassword)

module.exports = router