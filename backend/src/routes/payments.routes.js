const router = require('express').Router()
const { payFine, getMyPayments } = require('../controllers/payments.controller')
const { protect } = require('../middleware/auth.middleware')

router.use(protect)

router.post('/pay', payFine)
router.get('/my', getMyPayments)

module.exports = router