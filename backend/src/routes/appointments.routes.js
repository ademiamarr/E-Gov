const router  = require('express').Router()
const {
  getMyAppointments, getAllAppointments,
  bookAppointment, updateAppointment, sendReminder
} = require('../controllers/appointments.controller')
const { protect }      = require('../middleware/auth.middleware')
const { requireRole }  = require('../middleware/role.middleware')

router.use(protect)

// Qytetari — rezervo dhe shiko terminet e veta
router.get('/my', getMyAppointments)
router.post('/',  bookAppointment)

// Admin — shiko termine (filtrohet automatikisht sipas rolit)
router.get('/',
  requireRole('super_admin', 'admin_mvr', 'admin_komuna'),
  enforceInstitutionFilter,
  getAllAppointments
)

// Admin — përditëso termin (kontrollo institucionin)
router.put('/:id',
  requireRole('super_admin', 'admin_mvr', 'admin_komuna'),
  enforceInstitutionUpdate,
  updateAppointment
)

// Admin — dërgo kujtesë
router.post('/:id/reminder',
  requireRole('super_admin', 'admin_mvr', 'admin_komuna'),
  sendReminder
)

module.exports = router

// ── Middleware: forcon filtrin sipas rolit ──────────────────
function enforceInstitutionFilter(req, res, next) {
  if      (req.userRole === 'admin_mvr')    req.query.institution = 'MVR'
  else if (req.userRole === 'admin_komuna') req.query.institution = 'Komuna'
  next()
}

// ── Middleware: kontrollo se admini mund ta ndryshojë termin ─
async function enforceInstitutionUpdate(req, res, next) {
  if (req.userRole === 'super_admin') return next()

  try {
    const { supabase } = require('../config/supabase')
    const { data: appt, error } = await supabase
      .from('appointments')
      .select('institution')
      .eq('id', req.params.id)
      .single()

    if (error || !appt) {
      return res.status(404).json({ success: false, message: 'Termini nuk u gjet' })
    }

    const allowed = req.userRole === 'admin_mvr' ? 'MVR' : 'Komuna'
    if (appt.institution !== allowed) {
      return res.status(403).json({ success: false, message: 'Nuk keni leje për këtë termin' })
    }

    next()
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message })
  }
}