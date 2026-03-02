const router = require('express').Router()
const { getMyFines, getAllFines, addFine } = require('../controllers/fines.controller')
const { protect }     = require('../middleware/auth.middleware')
const { requireRole } = require('../middleware/role.middleware')

router.use(protect)

// Qytetari — gjobat e veta
router.get('/my', getMyFines)

// admin_fines → vetëm lexim | super_admin → lexim + shtim
router.get('/',  requireRole('super_admin', 'admin_fines'), getAllFines)
router.post('/', requireRole('super_admin'), addFine)

module.exports = router