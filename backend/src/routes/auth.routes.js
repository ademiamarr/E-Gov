const router = require('express').Router()
const { register, getMe } = require('../controllers/auth.controller')
const { protect } = require('../middleware/auth.middleware')
const multer = require('multer')

const upload = multer({ storage: multer.memoryStorage() })

router.post('/register', upload.single('id_photo'), register)
router.get('/me', protect, getMe)

module.exports = router