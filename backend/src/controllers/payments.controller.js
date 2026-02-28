const paymentsService = require('../services/payments.service')
const { success, error } = require('../utils/apiResponse')

const payFine = async (req, res) => {
  try {
    const { fine_id, card_number, card_holder, expiry, cvv } = req.body
    const result = await paymentsService.processMockPayment({
      fine_id, card_number, card_holder, expiry, cvv,
      user: req.user
    })
    return success(res, result, 'Pagesa u krye me sukses')
  } catch (err) {
    return error(res, err.message, err.status || 500)
  }
}

const getMyPayments = async (req, res) => {
  try {
    const payments = await paymentsService.getMyPayments(req.user.id)
    return success(res, payments)
  } catch (err) {
    return error(res, err.message, err.status || 500)
  }
}

module.exports = { payFine, getMyPayments }