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
    const { reason } = req.body
    const appt = await appointmentsService.cancelAppointment(
      req.params.id,
      req.user.id,
      reason || null
    )
    return success(res, appt, 'Termini u anulua')
  } catch (err) {
    return error(res, err.message, err.status || 500)
  }
}

// ✅ RESCHEDULE APPOINTMENT
const rescheduleAppointment = async (req, res) => {
  try {
    const { new_date, new_time } = req.body
    if (!new_date) {
      return error(res, 'Data e re është e detyrueshme', 400)
    }
    const appt = await appointmentsService.rescheduleAppointment(
      req.params.id,
      req.user.id,
      new_date,
      new_time || null
    )
    return success(res, appt, 'Termini u riprogramua')
  } catch (err) {
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
  cancelAppointment,       // ✅ NEW
  rescheduleAppointment,   // ✅ NEW
  sendReminder 
}