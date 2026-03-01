const authService = require('../services/auth.service')
const { success, error } = require('../utils/apiResponse')

const register = async (req, res) => {
  try {
    const { clerk_id, first_name, last_name, personal_id, email } = req.body
    const file = req.file

    const user = await authService.register({
      clerk_id, first_name, last_name, personal_id, email, file
    })

    return success(res, user, 'Regjistrimi u krye', 201)
  } catch (err) {
    return error(res, err.message, err.status || 500)
  }
}

const getMe = async (req, res) => {
  try {
    // req.user është i kompletë nga attachRole middleware
    // përfshin role, verification_status, etj. nga Supabase
    return success(res, {
      id: req.user.id,
      clerk_id: req.user.clerk_id,
      first_name: req.user.first_name,
      last_name: req.user.last_name,
      email: req.user.email,
      personal_id: req.user.personal_id,
      role: req.user.role,
      verification_status: req.user.verification_status,
      id_photo_url: req.user.id_photo_url,
      created_at: req.user.created_at,
    })
  } catch (err) {
    return error(res, err.message, 500)
  }
}

module.exports = { register, getMe }