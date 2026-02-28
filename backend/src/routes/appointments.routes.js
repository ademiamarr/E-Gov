const router = require('express').Router()
const {
  getMyAppointments, getAllAppointments,
  bookAppointment, updateAppointment, sendReminder
} = require('../controllers/appointments.controller')
const { protect } = require('../middleware/auth.middleware')
const { requireRole } = require('../middleware/role.middleware')

router.use(protect)

router.get('/my', getMyAppointments)
router.post('/', bookAppointment)
router.get('/', requireRole('super_admin', 'admin_appointments'), getAllAppointments)
router.put('/:id', requireRole('super_admin', 'admin_appointments'), updateAppointment)
router.post('/:id/reminder', requireRole('super_admin', 'admin_appointments'), sendReminder)

module.exports = router