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

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body
    const clerkUserId = req.auth?.userId

    if (!clerkUserId) {
      return res.status(401).json({ success: false, message: 'Nuk jeni të autorizuar' })
    }

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Të dhënat janë të pakompletuara' })
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ success: false, message: 'Fjalëkalimi duhet të ketë min. 8 karaktere' })
    }

    // Clerk SDK për ndryshimin e passwordit
    const Clerk = require('@clerk/clerk-sdk-node')
    
    try {
      await Clerk.users.updateUser(clerkUserId, {
        password: newPassword,
      })

      return res.status(200).json({ 
        success: true, 
        message: 'Fjalëkalimi u ndryshua me sukses' 
      })
    } catch (clerkErr) {
      // Kontrollo nëse fjalëkalimi aktual nuk është i saktë
      if (clerkErr.errors?.[0]?.code === 'resource_conflict') {
        return res.status(401).json({ 
          success: false, 
          message: 'Fjalëkalimi aktual nuk është i saktë' 
        })
      }
      throw clerkErr
    }
  } catch (err) {
    console.error('❌ Password change error:', err.message)
    return res.status(500).json({ 
      success: false, 
      message: 'Gabim gjatë ndryshimit të fjalëkalimit' 
    })
  }
}

module.exports = { register, getMe, changePassword }