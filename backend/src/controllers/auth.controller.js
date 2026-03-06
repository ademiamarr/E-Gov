const authService = require('../services/auth.service')
const { success, error } = require('../utils/apiResponse')

const register = async (req, res) => {
  try {
    const { clerk_id, first_name, last_name, personal_id, email } = req.body
    const file = req.file

    if (!clerk_id || !email) {
      return error(res, 'Missing required fields', 400)
    }

    const user = await authService.register({
      clerk_id, 
      first_name, 
      last_name, 
      personal_id, 
      email, 
      file
    })

    return success(res, user, 'Regjistrimi u krye', 201)
  } catch (err) {
    console.error('❌ Register error:', err.message)
    return error(res, err.message, err.status || 500)
  }
}

const getMe = async (req, res) => {
  try {
    // req.user është i vendosur në middleware attachRole
    if (!req.user) {
      return error(res, 'User not found', 404)
    }

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
    }, 'User info')
  } catch (err) {
    console.error('❌ getMe error:', err.message)
    return error(res, err.message, 500)
  }
}

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body
    const clerkUserId = req.auth?.userId

    if (!clerkUserId) {
      return error(res, 'Nuk jeni të autorizuar', 401)
    }

    if (!currentPassword || !newPassword) {
      return error(res, 'Të dhënat janë të pakompletuesa', 400)
    }

    if (newPassword.length < 8) {
      return error(res, 'Fjalëkalimi duhet të ketë min. 8 karaktere', 400)
    }

    try {
      const Clerk = require('@clerk/clerk-sdk-node')
      
      await Clerk.users.updateUser(clerkUserId, {
        password: newPassword,
      })

      return success(res, {}, 'Fjalëkalimi u ndryshua me sukses')
    } catch (clerkErr) {
      console.error('❌ Clerk error:', clerkErr.message)
      return error(res, 'Gabim në ndryshimin e fjalëkalimit', 500)
    }
  } catch (err) {
    console.error('❌ changePassword error:', err.message)
    return error(res, err.message, 500)
  }
}

const approveUser = async (req, res) => {
  try {
    const userId = req.params.id
    if (!userId) {
      return error(res, 'User ID required', 400)
    }

    const user = await authService.approveUser(userId)
    return success(res, user, 'Useri u aprovua')
  } catch (err) {
    console.error('❌ approveUser error:', err.message)
    return error(res, err.message, err.status || 500)
  }
}

const rejectUser = async (req, res) => {
  try {
    const userId = req.params.id
    const { reason } = req.body

    if (!userId) {
      return error(res, 'User ID required', 400)
    }

    const user = await authService.rejectUser(userId, reason)
    return success(res, user, 'Useri u refuzua')
  } catch (err) {
    console.error('❌ rejectUser error:', err.message)
    return error(res, err.message, err.status || 500)
  }
}

module.exports = { 
  register, 
  getMe, 
  changePassword, 
  approveUser, 
  rejectUser 
}