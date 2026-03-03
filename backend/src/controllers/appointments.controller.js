const appointmentsService = require('../services/appointments.service')
const { success, error } = require('../utils/apiResponse')

const getMyAppointments = async (req, res) => {
  try {
    const appts = await appointmentsService.getMyAppointments(req.user.id)
    return success(res, appts)
  } catch (err) {
    return error(res, err.message, err.status || 500)
  }
}

const getAllAppointments = async (req, res) => {
  try {
    const { institution } = req.query
    const appts = await appointmentsService.getAllAppointments(institution || null)
    return success(res, appts)
  } catch (err) {
    return error(res, err.message, err.status || 500)
  }
}

const bookAppointment = async (req, res) => {
  try {
    const appt = await appointmentsService.bookAppointment({
      user_id: req.user.id,
      user_email: req.user.email,
      user_first_name: req.user.first_name,
      ...req.body
    })
    return success(res, appt, 'Termini u rezervua', 201)
  } catch (err) {
    return error(res, err.message, err.status || 500)
  }
}

const updateAppointment = async (req, res) => {
  try {
    const appt = await appointmentsService.updateAppointment(req.params.id, req.body)
    return success(res, appt, 'Termini u përditësua')
  } catch (err) {
    return error(res, err.message, err.status || 500)
  }
}

// ✅ CANCEL APPOINTMENT
const cancelAppointment = async (req, res) => {
  try {
    const appointmentId = req.params.id
    const userId = req.user.id
    const { reason } = req.body || {}

    console.log(`🗑 Cancel request: appointment=${appointmentId}, user=${userId}`)

    if (!appointmentId) {
      return error(res, 'ID i terminit mungon', 400)
    }

    const appt = await appointmentsService.cancelAppointment(
      appointmentId,
      userId,
      reason || null
    )

    return success(res, appt, 'Termini u anulua')
  } catch (err) {
    console.error('❌ Cancel error:', err)
    return error(res, err.message, err.status || 500)
  }
}

// ✅ RESCHEDULE APPOINTMENT
const rescheduleAppointment = async (req, res) => {
  try {
    const appointmentId = req.params.id
    const userId = req.user.id
    const { new_date, new_time } = req.body || {}

    console.log(`📅 Reschedule request: appointment=${appointmentId}, user=${userId}, date=${new_date}`)

    if (!appointmentId) {
      return error(res, 'ID i terminit mungon', 400)
    }

    if (!new_date) {
      return error(res, 'Data e re është e detyrueshme', 400)
    }

    const appt = await appointmentsService.rescheduleAppointment(
      appointmentId,
      userId,
      new_date,
      new_time || null
    )

    return success(res, appt, 'Termini u riprogramua')
  } catch (err) {
    console.error('❌ Reschedule error:', err)
    return error(res, err.message, err.status || 500)
  }
}

const sendReminder = async (req, res) => {
  try {
    const result = await appointmentsService.sendReminder(req.params.id)
    return success(res, result, 'Kujtesa u dërgua')
  } catch (err) {
    return error(res, err.message, err.status || 500)
  }
}

module.exports = {
  getMyAppointments,
  getAllAppointments,
  bookAppointment,
  updateAppointment,
  cancelAppointment,
  rescheduleAppointment,
  sendReminder
}