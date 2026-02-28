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
    return success(res, {
      id: req.user.id,
      clerk_id: req.user.clerk_id,
      first_name: req.user.first_name,
      last_name: req.user.last_name,
      email: req.user.email,
      role: req.user.role,
      verification_status: req.user.verification_status,
      personal_id: req.user.personal_id,
    })
  } catch (err) {
    return error(res, err.message, 500)
  }
}

module.exports = { register, getMe }