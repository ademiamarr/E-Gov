const router = require('express').Router()
const { getPendingUsers, getAllUsers, approveUser, rejectUser } = require('../controllers/users.controller')
const { protect }     = require('../middleware/auth.middleware')
const { requireRole } = require('../middleware/role.middleware')

router.use(protect)

router.get('/pending',     requireRole('super_admin', 'admin_users'), getPendingUsers)
router.get('/',            requireRole('super_admin', 'admin_users'), getAllUsers)
router.put('/:id/approve', requireRole('super_admin', 'admin_users'), approveUser)
router.put('/:id/reject',  requireRole('super_admin', 'admin_users'), rejectUser)

module.exports = router