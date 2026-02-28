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

const sendReminder = async (req, res) => {
  try {
    const result = await appointmentsService.sendReminder(req.params.id)
    return success(res, result, 'Kujtesa u dërgua')
  } catch (err) {
    return error(res, err.message, err.status || 500)
  }
}

module.exports = { getMyAppointments, getAllAppointments, bookAppointment, updateAppointment, sendReminder }