const router = require('express').Router()

router.use('/auth', require('./auth.routes'))
router.use('/users', require('./users.routes'))
router.use('/fines', require('./fines.routes'))
router.use('/payments', require('./payments.routes'))
router.use('/appointments', require('./appointments.routes'))

module.exports = router