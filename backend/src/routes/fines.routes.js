const router = require('express').Router()
const { getMyFines, getAllFines, addFine } = require('../controllers/fines.controller')
const { protect } = require('../middleware/auth.middleware')
const { requireRole } = require('../middleware/role.middleware')

router.use(protect)

router.get('/my', getMyFines)
router.get('/', requireRole('super_admin', 'admin_fines'), getAllFines)
router.post('/', requireRole('super_admin', 'admin_fines'), addFine)

module.exports = router